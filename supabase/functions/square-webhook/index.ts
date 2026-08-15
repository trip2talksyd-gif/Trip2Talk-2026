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

import { createHmac } from 'node:crypto'
import { markSquarePaid } from '../_shared/squareMarkPaid.ts'
import {
  applyExtensionQuotePayment,
  extractExtensionQuoteId,
} from '../_shared/applyExtensionQuote.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN')
const _squareEnvRaw = (Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox').toLowerCase()
const SQUARE_ENV = _squareEnvRaw === 'production' ? 'production' : 'sandbox'
console.log(`[square-webhook] SQUARE_ENVIRONMENT=${SQUARE_ENV}`)
const SQUARE_WEBHOOK_SIGNATURE_KEY = Deno.env.get('SQUARE_WEBHOOK_SIGNATURE_KEY')

const SQUARE_API_BASE =
  SQUARE_ENV === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'

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
    const paymentRef =
      typeof payment.reference_id === 'string' ? payment.reference_id : ''
    const orderRef =
      order && typeof order.reference_id === 'string' ? order.reference_id : ''
    const note = typeof payment.note === 'string' ? payment.note : ''
    const quoteId = extractExtensionQuoteId({
      note,
      referenceId: paymentRef || orderRef,
    })
    if (quoteId) {
      const result = await applyExtensionQuotePayment({
        quoteId,
        amountCents,
        paymentId: String(payment.id),
        paymentMethod: methodFromPayment(payment),
        source: 'square-webhook',
      })
      if (!result.ok) {
        console.error(
          `[square-webhook] RECONCILIATION_NEEDED quote_id=${quoteId} payment_id=${payment.id} error=${result.error ?? 'mark_paid_failed'}`,
        )
        return json({ ok: false, ...result, quote_id: quoteId }, 500)
      }
      return json({ ok: result.ok, ...result, quote_id: quoteId })
    }

    const bookingRef = extractBookingRef(payment, order)
    if (!bookingRef.startsWith('T2T-')) {
      console.error('[square-webhook] missing booking ref', { paymentId, orderId })
      return json({ ok: false, error: 'missing_booking_ref' }, 200)
    }

    const result = await markSquarePaid({
      bookingRef,
      amountCents,
      paymentId: String(payment.id),
      paymentMethod: methodFromPayment(payment),
      source: 'square-webhook',
    })
    if (!result.ok) {
      console.error(
        `[square-webhook] RECONCILIATION_NEEDED booking_ref=${bookingRef} payment_id=${payment.id} error=${result.error ?? 'mark_paid_failed'}`,
      )
      return json({ ok: false, ...result, booking_reference: bookingRef }, 500)
    }

    return json({ ok: result.ok, ...result, booking_reference: bookingRef })
  } catch (err) {
    console.error('[square-webhook] failed', err)
    return json({ error: 'server_error' }, 500)
  }
})
