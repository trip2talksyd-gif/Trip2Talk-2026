// Trip2Talk — create Square hosted Payment Link (card + Afterpay).
//
// POST JSON:
//   { booking_reference, buyer_email?, buyer_phone?, redirect_base?, amount_kind? }
// amount_kind: 'deposit' | 'full' — Afterpay/Clearpay only, NO 2% card surcharge.
// Card Web Payments SDK charges (with surcharge) go through square-create-payment.
//
// Looks up the booking + tour deposit with service role, creates a Quick Pay /
// order payment link, returns { url, order_id, payment_link_id }.
//
// Secrets (Supabase Edge):
//   SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID
//   SQUARE_ENVIRONMENT = sandbox | production (missing/invalid → sandbox)
// Optional: SQUARE_APPLICATION_ID (not required for Payment Links)
//
// Deploy with verify_jwt OFF (browser sends anon apikey only).

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN')
const SQUARE_LOCATION_ID = Deno.env.get('SQUARE_LOCATION_ID')
const _squareEnvRaw = (Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox').toLowerCase()
const SQUARE_ENV = _squareEnvRaw === 'production' ? 'production' : 'sandbox'
console.log(`[square-create-checkout] SQUARE_ENVIRONMENT=${SQUARE_ENV}`)

const SQUARE_API_BASE =
  SQUARE_ENV === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com'

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
    quote_token?: string
    buyer_email?: string
    buyer_phone?: string
    redirect_base?: string
    amount_kind?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const quoteToken = typeof body.quote_token === 'string' ? body.quote_token.trim() : ''
  const TOKEN_RE = /^[A-Za-z0-9_-]{40,64}$/

  const redirectBase =
    typeof body.redirect_base === 'string' && /^https?:\/\//i.test(body.redirect_base.trim())
      ? body.redirect_base.trim().replace(/\/$/, '')
      : 'https://www.trip2talk.com.au'

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    if (quoteToken) {
      if (!TOKEN_RE.test(quoteToken)) return json({ error: 'invalid_params' }, 400)
      const { data: quote, error: quoteErr } = await admin
        .from('trip_extension_quotes')
        .select('id, booking_id, extra_days, price_difference_aud, status, payment_deadline')
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
        .select(
          'id, booking_reference, email, phone, first_name_en, last_name_en, cancelled_at, trip_code, tour_id',
        )
        .eq('id', quote.booking_id)
        .maybeSingle()
      if (bookingError) throw bookingError
      if (!booking || booking.cancelled_at) return json({ error: 'booking_not_payable' }, 409)

      const amountAud = Number(quote.price_difference_aud ?? 0)
      if (!(amountAud > 0)) return json({ error: 'invalid_amount' }, 400)
      const amountCents = audToCents(amountAud)
      const bookingRef =
        typeof booking.booking_reference === 'string' ? booking.booking_reference : ''

      const email =
        (typeof body.buyer_email === 'string' && body.buyer_email.trim()) ||
        (typeof booking.email === 'string' ? booking.email : '') ||
        undefined
      const phone = toE164Au(
        (typeof body.buyer_phone === 'string' && body.buyer_phone.trim()) ||
          (typeof booking.phone === 'string' ? booking.phone : '') ||
          undefined,
      )

      const redirectUrl = `${redirectBase}/quote/${encodeURIComponent(quoteToken)}?paid=1`
      const quoteIdNoDash = String(quote.id).replace(/-/g, '')
      const lineName = `Trip2Talk extra days ×${quote.extra_days} — ${booking.trip_code}`

      const squareBody = {
        idempotency_key: crypto.randomUUID(),
        description: `Extra-day quote T2T-EXT-${quote.id}`,
        payment_note: `T2T-EXT-${quote.id}`,
        order: {
          location_id: SQUARE_LOCATION_ID,
          reference_id: `EXT-${quoteIdNoDash}`.slice(0, 40),
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
        console.error('[square-create-checkout] quote Square error', squareRes.status, squareJson)
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

      return json({
        url,
        payment_link_id: link?.id ?? null,
        order_id: link?.order_id ?? squareJson?.related_resources?.orders?.[0]?.id ?? null,
        amount_aud: amountAud,
        booking_reference: bookingRef,
        quote_id: quote.id,
        environment: SQUARE_ENV,
      })
    }

    const bookingRef =
      typeof body.booking_reference === 'string' ? body.booking_reference.trim().toUpperCase() : ''
    if (!bookingRef) return json({ error: 'booking_reference_required' }, 400)

    const { data: booking, error: bookingError } = await admin
      .from('tour_bookings')
      .select(
        'id, booking_reference, booking_status, amount_paid_aud, email, phone, first_name_en, last_name_en, tour_id, payment_plan_installments',
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
    const amountCents = amountKind === 'full' ? remainingCents : depositCents
    if (!(amountCents >= 1)) {
      return json({ error: amountKind === 'full' ? 'nothing_owing' : 'invalid_deposit' }, 400)
    }
    const amountAud = amountCents / 100

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
    const lineName =
      amountKind === 'full'
        ? `Trip2Talk balance — ${tour.trip_code}`
        : `Trip2Talk deposit — ${tour.trip_code}`

    const squareBody = {
      idempotency_key: idempotencyKey,
      description: amountKind === 'full' ? `Balance for ${bookingRef}` : `Deposit for ${bookingRef}`,
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
          apple_pay: false,
          google_pay: false,
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
      .update({ payment_method: 'afterpay' })
      .eq('id', booking.id)

    return json({
      url,
      payment_link_id: link?.id ?? null,
      order_id: link?.order_id ?? squareJson?.related_resources?.orders?.[0]?.id ?? null,
      amount_aud: amountAud,
      booking_reference: bookingRef,
      environment: SQUARE_ENV,
    })
  } catch (err) {
    console.error('[square-create-checkout] failed', err)
    return json({ error: 'server_error' }, 500)
  }
})
