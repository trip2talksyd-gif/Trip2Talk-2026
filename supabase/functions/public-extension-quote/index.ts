// Trip2Talk — customer self-serve extra-day quotation by opaque token
//
// POST { action: 'lookup', token }
// Token authorizes read of that one quote only — no PIN/login.
// Verify JWT: OFF (browser sends anon apikey only), same as public-waiver.
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-provided)

import { createClient } from 'npm:@supabase/supabase-js@2'
import { expirePendingExtensionQuotes } from '../_shared/applyExtensionQuote.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const TOKEN_RE = /^[A-Za-z0-9_-]{40,64}$/

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

async function notFoundDelay(): Promise<Response> {
  await new Promise((r) => setTimeout(r, 150))
  return json({ error: 'not_found' }, 404)
}

function str(v: unknown, max = 500): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

function sydneyYmd(d = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney' }).format(d)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const token = str(body.token, 80)
  const action = str(body.action, 20)
  if (!TOKEN_RE.test(token) || action !== 'lookup') {
    return json({ error: 'invalid_request' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  try {
    await expirePendingExtensionQuotes()

    const { data: quote, error: quoteErr } = await admin
      .from('trip_extension_quotes')
      .select(
        'id, booking_id, extra_days, price_difference_aud, quote_note, status, payment_deadline, paid_at, payment_method',
      )
      .eq('quote_token', token)
      .maybeSingle()

    if (quoteErr) {
      console.error('[public-extension-quote] lookup failed')
      return json({ error: 'server_error' }, 500)
    }
    if (!quote) return await notFoundDelay()

    const { data: booking, error: bookingErr } = await admin
      .from('tour_bookings')
      .select(
        'id, trip_code, booking_reference, first_name_en, last_name_en, cancelled_at, extra_days_paid, tour_id',
      )
      .eq('id', quote.booking_id)
      .maybeSingle()

    if (bookingErr || !booking) {
      console.error('[public-extension-quote] booking lookup failed')
      return json({ error: 'server_error' }, 500)
    }
    if (booking.cancelled_at) return json({ error: 'booking_cancelled' }, 410)

    const { data: tour } = await admin
      .from('tours')
      .select('name_en, name_th, duration_days, departure_date')
      .eq('id', booking.tour_id)
      .maybeSingle()

    const today = sydneyYmd()
    const deadline = String(quote.payment_deadline ?? '').slice(0, 10)
    const payable = quote.status === 'pending' && deadline >= today

    return json({
      status: quote.status,
      extra_days: quote.extra_days,
      price_difference_aud: Number(quote.price_difference_aud),
      quote_note: quote.quote_note,
      payment_deadline: deadline,
      paid_at: quote.paid_at,
      payment_method: quote.payment_method,
      payable,
      trip_code: booking.trip_code,
      trip_name_en: tour?.name_en ?? null,
      trip_name_th: tour?.name_th ?? null,
      duration_days: tour?.duration_days ?? null,
      extra_days_paid: booking.extra_days_paid ?? 0,
      booking_reference: booking.booking_reference,
      first_name_en: booking.first_name_en,
      last_name_en: booking.last_name_en,
    })
  } catch (err) {
    console.error('[public-extension-quote]', err)
    return json({ error: 'server_error' }, 500)
  }
})
