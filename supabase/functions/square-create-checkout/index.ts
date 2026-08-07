// Trip2Talk — create Square hosted Payment Link (card + Afterpay).
//
// POST JSON:
//   { booking_reference, buyer_email?, buyer_phone?, redirect_base? }
//
// Looks up the booking + tour deposit with service role, creates a Quick Pay /
// order payment link, returns { url, order_id, payment_link_id }.
//
// Secrets (Supabase Edge):
//   SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID
//   SQUARE_ENVIRONMENT = sandbox | production (default production)
// Optional: SQUARE_APPLICATION_ID (not required for Payment Links)
//
// Deploy with verify_jwt OFF (browser sends anon apikey only).

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN')
const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID')
const SQUARE_ENV = (Deno.env.get('SQUARE_ENVIRONMENT') || 'production').toLowerCase()

const SQUARE_API_BASE =
  SQUARE_ENV === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function toE164Au(phone: string | null | undefined): string | undefined {
  if (!phone) return undefined
  const d = phone.replace(/\D/g, '')
  if (d.startsWith('61') && d.length >= 11) return `+${d}`
  if (d.startsWith('0') && d.length === 10) return `+61${d.slice(1)}`
  if (d.length >= 9) return `+61${d}`
  return undefined
}

function audToCents(aud: number): number {
  return Math.round(Number(aud) * 100)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
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
    buyer_email?: string
    buyer_phone?: string
    redirect_base?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const bookingRef =
    typeof body.booking_reference === 'string' ? body.booking_reference.trim().toUpperCase() : ''
  if (!bookingRef) return json({ error: 'booking_reference_required' }, 400)

  const redirectBase =
    typeof body.redirect_base === 'string' && /^https?:\/\//i.test(body.redirect_base.trim())
      ? body.redirect_base.trim().replace(/\/$/, '')
      : 'https://www.trip2talk.com.au'

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data: booking, error: bookingError } = await admin
      .from('tour_bookings')
      .select(
        'id, booking_reference, booking_status, amount_paid_aud, email, phone, first_name_en, last_name_en, tour_id, payment_plan_installments',
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
      .select('id, trip_code, name_en, deposit_aud, price_aud')
      .eq('id', booking.tour_id)
      .maybeSingle()
    if (tourError) throw tourError
    if (!tour) return json({ error: 'tour_not_found' }, 404)

    const depositAud = Number(tour.deposit_aud ?? 0)
    if (!(depositAud > 0)) return json({ error: 'invalid_deposit' }, 400)
    const amountCents = audToCents(depositAud)

    const email =
      (typeof body.buyer_email === 'string' && body.buyer_email.trim()) ||
      (typeof booking.email === 'string' ? booking.email : '') ||
      undefined
    const phone = toE164Au(
      (typeof body.buyer_phone === 'string' && body.buyer_phone.trim()) ||
        (typeof booking.phone === 'string' ? booking.phone : '') ||
        undefined,
    )

    const redirectUrl =
      `${redirectBase}/booking/confirmation?ref=${encodeURIComponent(bookingRef)}&square=1`

    const idempotencyKey = crypto.randomUUID()
    const lineName = `Trip2Talk deposit — ${tour.trip_code}`

    const squareBody = {
      idempotency_key: idempotencyKey,
      description: `Deposit for ${bookingRef}`,
      payment_note: bookingRef,
      order: {
        location_id: SQUARE_LOCATION_ID,
        reference_id: bookingRef.slice(0, 40),
        line_items: [
          {
            name: lineName,
            quantity: '1',
            item_type: 'ITEM',
            base_price_money: {
              amount: amountCents,
              currency: 'AUD',
            },
          },
        ],
      },
      checkout_options: {
        ask_for_shipping_address: false,
        redirect_url: redirectUrl,
        merchant_support_email: 'trip2talksyd@gmail.com',
        accepted_payment_methods: {
          apple_pay: true,
          google_pay: true,
          cash_app_pay: false,
          afterpay_clearpay: true,
        },
      },
      pre_populated_data: {
        ...(email ? { buyer_email: email } : {}),
        ...(phone ? { buyer_phone_number: phone } : {}),
      },
    }

    const squareRes = await fetch(`${SQUARE_API_BASE}/v2/online-checkout/payment-links`, {
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
      console.error('[square-create-checkout] Square error', squareRes.status, squareJson)
      const detail =
        Array.isArray(squareJson?.errors) && squareJson.errors[0]?.detail
          ? String(squareJson.errors[0].detail)
          : 'square_create_failed'
      return json({ error: 'square_create_failed', message: detail }, 502)
    }

    const link = squareJson?.payment_link
    const url = typeof link?.url === 'string' ? link.url : null
    if (!url) {
      return json({ error: 'square_missing_url', body: squareJson }, 502)
    }

    // Soft-tag booking so staff can see Square was requested.
    await admin
      .from('tour_bookings')
      .update({ payment_method: 'square' })
      .eq('id', booking.id)

    return json({
      url,
      payment_link_id: link?.id ?? null,
      order_id: link?.order_id ?? squareJson?.related_resources?.orders?.[0]?.id ?? null,
      amount_aud: depositAud,
      booking_reference: bookingRef,
      environment: SQUARE_ENV,
    })
  } catch (err) {
    console.error('[square-create-checkout] failed', err)
    return json({ error: 'server_error' }, 500)
  }
})
