// Trip2Talk — Square webhook → mark booking deposit paid (idempotent).
//
// Configure in Square Developer Dashboard → Webhooks:
//   Notification URL:
//     https://bljhnelgmkulxwuhedbi.supabase.co/functions/v1/square-webhook
//   Events: payment.updated (and optionally order.updated)
//
// Secrets:
//   SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT
//   SQUARE_WEBHOOK_SIGNATURE_KEY  (from webhook subscription)
//
// Deploy with verify_jwt OFF (Square cannot send a Supabase JWT).

import { createClient } from 'npm:@supabase/supabase-js@2'
import { createHmac } from 'node:crypto'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN')
const SQUARE_ENV = (Deno.env.get('SQUARE_ENVIRONMENT') || 'production').toLowerCase()
const SQUARE_WEBHOOK_SIGNATURE_KEY = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY')

const SQUARE_API_BASE =
  SQUARE_ENV === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com'

const NOTIFICATION_URL =
  Deno.env.get('SQUARE_WEBHOOK_NOTIFICATION_URL') ||
  `${SUPABASE_URL}/functions/v1/square-webhook`

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function verifySquareSignature(body: string, signatureHeader: string | null): boolean {
  if (!SQUARE_WEBHOOK_SIGNATURE_KEY) {
    // Fail closed in production; allow through only if explicitly disabled.
    console.error('[square-webhook] missing SQUARE_WEBHOOK_SIGNATURE_KEY')
    return false
  }
  if (!signatureHeader) return false
  const hmac = createHmac('sha256', SQUARE_WEBHOOK_SIGNATURE_KEY)
  hmac.update(NOTIFICATION_URL + body)
  const expected = hmac.digest('base64')
  return expected === signatureHeader
}

function methodFromPayment(payment: Record<string, unknown>): string {
  const sourceType = String(payment.source_type || '').toUpperCase()
  if (sourceType === 'BUY_NOW_PAY_LATER') return 'afterpay'
  if (sourceType === 'CARD') return 'square'
  return 'square'
}

async function retrievePayment(paymentId: string): Promise<Record<string, unknown> | null> {
  if (!SQUARE_ACCESS_TOKEN) return null
  const res = await fetch(`${SQUARE_API_BASE}/v2/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      'Square-Version': '2025-01-23',
    },
  })
  if (!res.ok) {
    console.error('[square-webhook] retrieve payment failed', res.status, await res.text())
    return null
  }
  const body = await res.json()
  return (body?.payment as Record<string, unknown>) ?? null
}

async function retrieveOrder(orderId: string): Promise<Record<string, unknown> | null> {
  if (!SQUARE_ACCESS_TOKEN) return null
  const res = await fetch(`${SQUARE_API_BASE}/v2/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
      'Square-Version': '2025-01-23',
    },
  })
  if (!res.ok) return null
  const body = await res.json()
  return (body?.order as Record<string, unknown>) ?? null
}

function extractBookingRef(payment: Record<string, unknown>, order: Record<string, unknown> | null): string {
  const note = typeof payment.note === 'string' ? payment.note.trim().toUpperCase() : ''
  if (note.startsWith('T2T-')) return note
  const orderRef =
    order && typeof order.reference_id === 'string' ? order.reference_id.trim().toUpperCase() : ''
  if (orderRef.startsWith('T2T-')) return orderRef
  return note || orderRef
}

async function markPaid(opts: {
  bookingRef: string
  amountCents: number
  paymentId: string
  paymentMethod: string
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  // Idempotent: already recorded this Square payment?
  const { data: existingExt } = await admin
    .from('booking_payments')
    .select('id')
    .eq('external_payment_id', opts.paymentId)
    .maybeSingle()
  if (existingExt?.id) return { ok: true, skipped: true }

  const { data: booking, error: bookingError } = await admin
    .from('tour_bookings')
    .select('id, booking_reference, amount_paid_aud, booking_status, payment_plan_installments, tour_id')
    .ilike('booking_reference', opts.bookingRef)
    .maybeSingle()
  if (bookingError) throw bookingError
  if (!booking) return { ok: false, error: 'booking_not_found' }

  const { data: tour } = await admin
    .from('tours')
    .select('price_aud')
    .eq('id', booking.tour_id)
    .maybeSingle()
  const priceAud = tour ? Number(tour.price_aud ?? 0) : 0

  const amountAud = Math.round(opts.amountCents) / 100
  if (!(amountAud > 0)) return { ok: false, error: 'invalid_amount' }

  const { count } = await admin
    .from('booking_payments')
    .select('id', { count: 'exact', head: true })
    .eq('booking_id', booking.id)
  const installmentNo = (count ?? 0) + 1
  const paidAt = new Date().toISOString()
  const invoiceNo = `T2T-INV-${booking.booking_reference ?? booking.id.slice(0, 8)}-${installmentNo}`
  const label =
    installmentNo === 1
      ? 'Deposit'
      : `Installment ${installmentNo}${
          booking.payment_plan_installments ? `/${booking.payment_plan_installments}` : ''
        }`

  const { error: insertError } = await admin.from('booking_payments').insert({
    booking_id: booking.id,
    amount_aud: amountAud,
    payment_method: opts.paymentMethod,
    installment_no: installmentNo,
    label,
    status: 'paid',
    paid_at: paidAt,
    receipt_invoice_number: invoiceNo,
    external_payment_id: opts.paymentId,
    recorded_by_staff_id: null,
  })
  if (insertError) {
    // Unique violation → concurrent webhook
    if (String(insertError.code) === '23505') return { ok: true, skipped: true }
    throw insertError
  }

  const newTotal = Number(booking.amount_paid_aud ?? 0) + amountAud
  const newStatus = priceAud > 0 && newTotal >= priceAud ? 'fully_paid' : 'deposit_paid'

  const { error: updateError } = await admin
    .from('tour_bookings')
    .update({
      amount_paid_aud: newTotal,
      booking_status: newStatus,
      payment_method: opts.paymentMethod,
    })
    .eq('id', booking.id)
  if (updateError) throw updateError

  return { ok: true }
}

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    return json({ ok: true, service: 'square-webhook' })
  }
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const rawBody = await req.text()
  const signature = req.headers.get('x-square-hmacsha256-signature')
  if (!verifySquareSignature(rawBody, signature)) {
    return json({ error: 'invalid_signature' }, 401)
  }

  let event: {
    type?: string
    data?: { type?: string; id?: string; object?: { payment?: Record<string, unknown> } }
  }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const type = event.type || ''
  // payment.updated is the primary completion signal for Payment Links.
  if (type !== 'payment.updated' && type !== 'payment.created') {
    return json({ ok: true, ignored: type })
  }

  try {
    let payment = event.data?.object?.payment
    const paymentId =
      (payment && typeof payment.id === 'string' && payment.id) ||
      (typeof event.data?.id === 'string' ? event.data.id : '')

    if ((!payment || payment.status !== 'COMPLETED') && paymentId) {
      payment = (await retrievePayment(paymentId)) ?? payment
    }
    if (!payment || typeof payment !== 'object') {
      return json({ ok: true, skipped: 'no_payment' })
    }
    if (String(payment.status) !== 'COMPLETED') {
      return json({ ok: true, skipped: 'not_completed', status: payment.status })
    }

    const amountMoney = payment.amount_money as { amount?: number; currency?: string } | undefined
    const amountCents = Number(amountMoney?.amount ?? 0)
    const currency = String(amountMoney?.currency || '')
    if (currency && currency !== 'AUD') {
      console.error('[square-webhook] unexpected currency', currency)
    }

    const orderId = typeof payment.order_id === 'string' ? payment.order_id : ''
    const order = orderId ? await retrieveOrder(orderId) : null
    const bookingRef = extractBookingRef(payment, order)
    if (!bookingRef.startsWith('T2T-')) {
      console.error('[square-webhook] missing booking ref', { paymentId, orderId })
      return json({ ok: false, error: 'missing_booking_ref' }, 200)
    }

    const result = await markPaid({
      bookingRef,
      amountCents,
      paymentId: String(payment.id),
      paymentMethod: methodFromPayment(payment),
    })

    return json({ ok: result.ok, ...result, booking_reference: bookingRef })
  } catch (err) {
    console.error('[square-webhook] failed', err)
    return json({ error: 'server_error' }, 500)
  }
})
