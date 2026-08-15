// Trip2Talk — charge a Square Web Payments SDK card token (AUD deposit).
//
// GET  → public Web Payments config { applicationId, locationId, environment }
// POST → { booking_reference, source_id, buyer_email?, verification_token?, amount_kind? }
// Booking card charges: amount_kind is 'deposit' | 'full'. Server computes base from
// the tour, adds a 2% card surcharge, and records amount_paid_aud from Square's response.
//
// Secrets (Supabase Edge):
//   SQUARE_ACCESS_TOKEN
//   SQUARE_APPLICATION_ID
//   SQUARE_LOCATION_ID
//   SQUARE_ENVIRONMENT=sandbox | production
//   Missing/invalid secret → sandbox (fail-safe; never default to live charges)
//
// Same Square account as the in-person Reader / POS.
// Deploy with verify_jwt OFF (browser sends anon apikey only):
//   npx supabase functions deploy square-create-payment --no-verify-jwt --project-ref bljhnelgmkulxwuhedbi

import { createClient } from 'npm:@supabase/supabase-js@2'
import { markSquarePaid } from '../_shared/squareMarkPaid.ts'
import { applyExtensionQuotePayment } from '../_shared/applyExtensionQuote.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN')
const SQUARE_APPLICATION_ID = Deno.env.get('SQUARE_APPLICATION_ID')
const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID')
const _squareEnvRaw = (Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox').toLowerCase()
const SQUARE_ENV = _squareEnvRaw === 'production' ? 'production' : 'sandbox'
console.log(`[square-create-payment] SQUARE_ENVIRONMENT=${SQUARE_ENV}`)

const SQUARE_API_BASE =
  SQUARE_ENV === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function audToCents(aud: number): number {
  return Math.round(Number(aud) * 100)
}

/** 2% Square card surcharge — computed server-side. Never taken from the client total. */
const CARD_SURCHARGE_RATE = 0.02

function withCardSurchargeCents(baseCents: number): number {
  return Math.round(baseCents * (1 + CARD_SURCHARGE_RATE))
}

/** Confirmed charge amount from Square's payment object — never from the client body. */
function squareConfirmedCents(payment: Record<string, unknown> | undefined): number | null {
  const money = payment?.amount_money
  if (!money || typeof money !== 'object') return null
  const amount = (money as { amount?: unknown }).amount
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null
  const cents = Math.round(amount)
  return cents >= 1 ? cents : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  if (req.method === 'GET') {
    if (!SQUARE_APPLICATION_ID || !SQUARE_LOCATION_ID) {
      return json(
        {
          error: 'square_not_configured',
          message: 'SQUARE_APPLICATION_ID / SQUARE_LOCATION_ID missing in Edge secrets',
        },
        503,
      )
    }
    return json({
      applicationId: SQUARE_APPLICATION_ID,
      locationId: SQUARE_LOCATION_ID,
      environment: SQUARE_ENV === 'production' ? 'production' : 'sandbox',
    })
  }

  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
    return json(
      {
        error: 'square_not_configured',
        message: 'SQUARE_ACCESS_TOKEN / SQUARE_LOCATION_ID missing in Edge secrets',
      },
      503,
    )
  }

  let body: {
    booking_reference?: string
    quote_token?: string
    source_id?: string
    buyer_email?: string
    verification_token?: string
    amount_kind?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const quoteToken = typeof body.quote_token === 'string' ? body.quote_token.trim() : ''
  const sourceId = typeof body.source_id === 'string' ? body.source_id.trim() : ''
  if (!sourceId) return json({ error: 'invalid_params' }, 400)

  const TOKEN_RE = /^[A-Za-z0-9_-]{40,64}$/

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    if (quoteToken) {
      if (!TOKEN_RE.test(quoteToken)) return json({ error: 'invalid_params' }, 400)
      const { data: quote, error: quoteErr } = await admin
        .from('trip_extension_quotes')
        .select(
          'id, booking_id, extra_days, price_difference_aud, status, payment_deadline, quote_token',
        )
        .eq('quote_token', quoteToken)
        .maybeSingle()
      if (quoteErr) throw quoteErr
      if (!quote) return json({ error: 'quote_not_found' }, 404)
      if (quote.status !== 'pending') {
        return json({ error: 'quote_not_payable', status: quote.status }, 409)
      }

      const sydneyToday = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Australia/Sydney',
      }).format(new Date())
      const deadline = String(quote.payment_deadline ?? '').slice(0, 10)
      if (deadline && deadline < sydneyToday) {
        await admin.rpc('expire_pending_extension_quotes')
        return json({ error: 'quote_expired' }, 409)
      }

      const { data: booking, error: bookingError } = await admin
        .from('tour_bookings')
        .select('id, booking_reference, email, first_name_en, last_name_en, cancelled_at')
        .eq('id', quote.booking_id)
        .maybeSingle()
      if (bookingError) throw bookingError
      if (!booking || booking.cancelled_at) {
        return json({ error: 'booking_not_payable' }, 409)
      }

      const amountAud = Number(quote.price_difference_aud ?? 0)
      if (!(amountAud > 0)) return json({ error: 'invalid_amount' }, 400)
      const amountCents = audToCents(amountAud)
      const bookingRef =
        typeof booking.booking_reference === 'string' ? booking.booking_reference : ''

      const email =
        (typeof body.buyer_email === 'string' && body.buyer_email.trim()) ||
        (typeof booking.email === 'string' ? booking.email.trim() : '') ||
        undefined

      const verificationToken =
        typeof body.verification_token === 'string' && body.verification_token.trim()
          ? body.verification_token.trim()
          : undefined

      const quoteIdNoDash = String(quote.id).replace(/-/g, '')
      const squareBody: Record<string, unknown> = {
        source_id: sourceId,
        idempotency_key: `t2t-ext-${quote.id}`,
        amount_money: {
          amount: amountCents,
          currency: 'AUD',
        },
        location_id: SQUARE_LOCATION_ID,
        reference_id: `EXT-${quoteIdNoDash}`.slice(0, 40),
        note: `T2T-EXT-${quote.id}`,
        autocomplete: true,
      }
      if (email) squareBody.buyer_email_address = email
      if (verificationToken) squareBody.verification_token = verificationToken

      const squareRes = await fetch(`${SQUARE_API_BASE}/v2/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
          'Square-Version': '2025-01-23',
        },
        body: JSON.stringify(squareBody),
      })
      const squareJson = await squareRes.json().catch(() => ({}))
      if (!squareRes.ok) {
        console.error('[square-create-payment] quote Square error', squareRes.status, squareJson)
        const detail =
          Array.isArray(squareJson?.errors) && squareJson.errors[0]?.detail
            ? String(squareJson.errors[0].detail)
            : 'square_create_failed'
        return json({ error: 'square_create_failed', message: detail }, 502)
      }

      const payment = squareJson?.payment as Record<string, unknown> | undefined
      const paymentId = typeof payment?.id === 'string' ? payment.id : ''
      const status = typeof payment?.status === 'string' ? payment.status : ''
      const confirmedCents = squareConfirmedCents(payment)

      let bookingSynced = false
      if (status === 'COMPLETED' && paymentId) {
        if (!confirmedCents) {
          console.error(
            `[square-create-payment] RECONCILIATION_NEEDED quote_id=${quote.id} payment_id=${paymentId} error=missing_square_amount`,
          )
        }
        const marked = await applyExtensionQuotePayment({
          quoteId: quote.id,
          amountCents: confirmedCents ?? amountCents,
          paymentId,
          paymentMethod: 'square',
          source: 'square-create-payment',
        })
        bookingSynced = Boolean(marked.ok)
        if (!marked.ok) {
          console.error(
            `[square-create-payment] RECONCILIATION_NEEDED quote_id=${quote.id} payment_id=${paymentId} error=${marked.error ?? 'mark_paid_failed'}`,
          )
        }
      }

      return json({
        payment_id: paymentId || null,
        status,
        amount_aud: amountAud,
        booking_reference: bookingRef,
        quote_id: quote.id,
        booking_synced: bookingSynced,
        environment: SQUARE_ENV === 'production' ? 'production' : 'sandbox',
      })
    }

    const bookingRef =
      typeof body.booking_reference === 'string' ? body.booking_reference.trim().toUpperCase() : ''
    if (!bookingRef.startsWith('T2T-')) {
      return json({ error: 'invalid_params' }, 400)
    }
    const { data: booking, error: bookingError } = await admin
      .from('tour_bookings')
      .select(
        'id, booking_reference, booking_status, amount_paid_aud, email, first_name_en, last_name_en, tour_id',
      )
      .ilike('booking_reference', bookingRef)
      .maybeSingle()
    if (bookingError) throw bookingError
    if (!booking) return json({ error: 'booking_not_found' }, 404)

    if (booking.booking_status === 'fully_paid' || booking.booking_status === 'cancelled') {
      return json({ error: 'booking_not_payable', status: booking.booking_status }, 409)
    }

    const { data: tour, error: tourError } = await admin
      .from('tours')
      .select('id, trip_code, name_en, deposit_aud, price_aud')
      .eq('id', booking.tour_id)
      .maybeSingle()
    if (tourError) throw tourError
    if (!tour) return json({ error: 'tour_not_found' }, 404)

    const depositAud = Number(tour.deposit_aud ?? 0)
    if (!(depositAud > 0)) return json({ error: 'invalid_deposit' }, 400)
    const depositCents = audToCents(depositAud)
    const priceAud = Number(tour.price_aud ?? 0)
    const alreadyPaidAud = Number(booking.amount_paid_aud ?? 0)
    const remainingCents = Math.max(0, audToCents(priceAud) - audToCents(alreadyPaidAud))

    const amountKind = body.amount_kind === 'full' ? 'full' : 'deposit'
    const baseCents = amountKind === 'full' ? remainingCents : depositCents
    if (!(baseCents >= 1)) {
      return json({ error: amountKind === 'full' ? 'nothing_owing' : 'invalid_deposit' }, 400)
    }
    const amountCents = withCardSurchargeCents(baseCents)

    const email =
      (typeof body.buyer_email === 'string' && body.buyer_email.trim()) ||
      (typeof booking.email === 'string' ? booking.email.trim() : '') ||
      undefined

    const verificationToken =
      typeof body.verification_token === 'string' && body.verification_token.trim()
        ? body.verification_token.trim()
        : undefined

    const squareBody: Record<string, unknown> = {
      source_id: sourceId,
      idempotency_key: `t2t-card-${bookingRef}-${amountCents}`,
      amount_money: {
        amount: amountCents,
        currency: 'AUD',
      },
      location_id: SQUARE_LOCATION_ID,
      reference_id: bookingRef.slice(0, 40),
      note: bookingRef,
      autocomplete: true,
    }
    if (email) squareBody.buyer_email_address = email
    if (verificationToken) squareBody.verification_token = verificationToken

    const squareRes = await fetch(`${SQUARE_API_BASE}/v2/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2025-01-23',
      },
      body: JSON.stringify(squareBody),
    })
    const squareJson = await squareRes.json().catch(() => ({}))
    if (!squareRes.ok) {
      console.error('[square-create-payment] Square error', squareRes.status, squareJson)
      const detail =
        Array.isArray(squareJson?.errors) && squareJson.errors[0]?.detail
          ? String(squareJson.errors[0].detail)
          : 'square_create_failed'
      return json({ error: 'square_create_failed', message: detail }, 502)
    }

    const payment = squareJson?.payment as Record<string, unknown> | undefined
    const paymentId = typeof payment?.id === 'string' ? payment.id : ''
    const status = typeof payment?.status === 'string' ? payment.status : ''
    const confirmedCents = squareConfirmedCents(payment)

    await admin.from('tour_bookings').update({ payment_method: 'square' }).eq('id', booking.id)

    let bookingSynced = false
    if (status === 'COMPLETED' && paymentId) {
      if (!confirmedCents) {
        console.error(
          `[square-create-payment] RECONCILIATION_NEEDED booking_ref=${bookingRef} payment_id=${paymentId} error=missing_square_amount`,
        )
      } else {
        const marked = await markSquarePaid({
          bookingRef,
          amountCents: confirmedCents,
          paymentId,
          paymentMethod: 'square',
          source: 'square-create-payment',
        })
        bookingSynced = Boolean(marked.ok)
        if (!marked.ok) {
          console.error(
            `[square-create-payment] RECONCILIATION_NEEDED booking_ref=${bookingRef} payment_id=${paymentId} error=${marked.error ?? 'mark_paid_failed'}`,
          )
        }
      }
    }

    return json({
      payment_id: paymentId || null,
      status,
      amount_aud: confirmedCents != null ? confirmedCents / 100 : null,
      booking_reference: bookingRef,
      booking_synced: bookingSynced,
      environment: SQUARE_ENV === 'production' ? 'production' : 'sandbox',
    })
  } catch (err) {
    console.error('[square-create-payment] failed', err)
    return json({ error: 'server_error' }, 500)
  }
})
