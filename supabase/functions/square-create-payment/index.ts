// Trip2Talk — charge a Square Web Payments SDK card token (AUD deposit).
//
// GET  → public Web Payments config { applicationId, locationId, environment }
// POST → { booking_reference, source_id, buyer_email?, verification_token? }
//
// Secrets (Supabase Edge):
//   SQUARE_ACCESS_TOKEN
//   SQUARE_APPLICATION_ID
//   SQUARE_LOCATION_ID
//   SQUARE_ENVIRONMENT=sandbox   # while testing
//
// Same Square account as the in-person Reader / POS.
// Deploy with verify_jwt OFF (browser sends anon apikey only):
//   npx supabase functions deploy square-create-payment --no-verify-jwt --project-ref bljhnelgmkulxwuhedbi

import { createClient } from 'npm:@supabase/supabase-js@2'
import { markSquarePaid } from '../_shared/squareMarkPaid.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN')
const SQUARE_APPLICATION_ID = Deno.env.get('SQUARE_APPLICATION_ID')
const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID')
const SQUARE_ENV = (Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox').toLowerCase()

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
    source_id?: string
    buyer_email?: string
    verification_token?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const bookingRef =
    typeof body.booking_reference === 'string' ? body.booking_reference.trim().toUpperCase() : ''
  const sourceId = typeof body.source_id === 'string' ? body.source_id.trim() : ''
  if (!bookingRef.startsWith('T2T-') || !sourceId) {
    return json({ error: 'invalid_params' }, 400)
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data: booking, error: bookingError } = await admin
      .from('tour_bookings')
      .select(
        'id, booking_reference, booking_status, amount_paid_aud, email, first_name_en, last_name_en, tour_id',
      )
      .ilike('booking_reference', bookingRef)
      .maybeSingle()
    if (bookingError) throw bookingError
    if (!booking) return json({ error: 'booking_not_found' }, 404)

    if (
      booking.booking_status === 'deposit_paid' ||
      booking.booking_status === 'fully_paid' ||
      booking.booking_status === 'cancelled'
    ) {
      return json({ error: 'booking_not_payable', status: booking.booking_status }, 409)
    }

    const { data: tour, error: tourError } = await admin
      .from('tours')
      .select('id, trip_code, name_en, deposit_aud')
      .eq('id', booking.tour_id)
      .maybeSingle()
    if (tourError) throw tourError
    if (!tour) return json({ error: 'tour_not_found' }, 404)

    const depositAud = Number(tour.deposit_aud ?? 0)
    if (!(depositAud > 0)) return json({ error: 'invalid_deposit' }, 400)
    const amountCents = audToCents(depositAud)

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
      idempotency_key: `t2t-deposit-${bookingRef}`,
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

    await admin.from('tour_bookings').update({ payment_method: 'square' }).eq('id', booking.id)

    if (status === 'COMPLETED' && paymentId) {
      const marked = await markSquarePaid({
        bookingRef,
        amountCents,
        paymentId,
        paymentMethod: 'square',
      })
      if (!marked.ok && marked.error !== 'booking_not_found') {
        console.error('[square-create-payment] markPaid', marked)
      }
    }

    return json({
      payment_id: paymentId || null,
      status,
      amount_aud: depositAud,
      booking_reference: bookingRef,
      environment: SQUARE_ENV === 'production' ? 'production' : 'sandbox',
    })
  } catch (err) {
    console.error('[square-create-payment] failed', err)
    return json({ error: 'server_error' }, 500)
  }
})
