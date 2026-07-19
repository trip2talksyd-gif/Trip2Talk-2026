// Trip2Talk — public-safe My Trip booking lookup
//
// Guest checkout has no auth. This function is the only path for a customer to
// read their own booking: they must supply BOTH a trip_code or booking_reference
// AND a matching email or phone. Service-role query; returns at most ONE row of
// non-sensitive fields. Never returns a list.
//
// Deploy: Supabase Dashboard → Edge Functions → create "lookup-my-trip"
// Verify JWT with legacy secret: OFF (same as verify-pin — browser sends anon apikey only).
//
// POST { trip_code_or_reference: string, contact: string }
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-provided)

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: { trip_code_or_reference?: unknown; contact?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const refRaw =
    typeof body.trip_code_or_reference === 'string' ? body.trip_code_or_reference.trim() : ''
  const contactRaw = typeof body.contact === 'string' ? body.contact.trim() : ''

  if (!refRaw || !contactRaw) {
    return json({ found: false, error: 'invalid_params' }, 400)
  }

  const refNorm = refRaw.toUpperCase()
  const isEmail = contactRaw.includes('@')
  const emailNorm = isEmail ? contactRaw.toLowerCase() : ''
  const phoneDigits = isEmail ? '' : digitsOnly(contactRaw)

  if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return json({ found: false, error: 'invalid_contact' }, 400)
  }
  if (!isEmail && phoneDigits.length < 8) {
    return json({ found: false, error: 'invalid_contact' }, 400)
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    // Pull candidate rows by reference OR trip_code, then enforce contact match in code.
    // Never return more than one booking to the client.
    const { data: byReference, error: refError } = await admin
      .from('tour_bookings')
      .select(
        'booking_reference, trip_code, booking_status, amount_paid_aud, booked_at, first_name_en, last_name_en, email, phone, tour_id',
      )
      .ilike('booking_reference', refNorm)
      .limit(5)

    if (refError) throw refError

    let candidates = byReference ?? []

    if (candidates.length === 0) {
      const { data: byCode, error: codeError } = await admin
        .from('tour_bookings')
        .select(
          'booking_reference, trip_code, booking_status, amount_paid_aud, booked_at, first_name_en, last_name_en, email, phone, tour_id',
        )
        .ilike('trip_code', refNorm)
        .order('booked_at', { ascending: false })
        .limit(20)

      if (codeError) throw codeError
      candidates = byCode ?? []
    }

    const matched = candidates.filter((row) => {
      if (isEmail) return String(row.email ?? '').toLowerCase() === emailNorm
      return digitsOnly(String(row.phone ?? '')) === phoneDigits
    })

    if (matched.length === 0) {
      // Fixed delay to reduce timing oracle on contact guesses
      await new Promise((r) => setTimeout(r, 120))
      return json({ found: false })
    }

    // Prefer most recent if trip_code matched multiple seats for same contact
    matched.sort(
      (a, b) => new Date(String(b.booked_at)).getTime() - new Date(String(a.booked_at)).getTime(),
    )
    const booking = matched[0]

    const { data: tour, error: tourError } = await admin
      .from('tours')
      .select('*')
      .eq('id', booking.tour_id)
      .maybeSingle()

    if (tourError) throw tourError
    if (!tour) return json({ found: false })

    const t = tour as Record<string, unknown>
    const departure =
      (typeof t.departure_date === 'string' ? t.departure_date : null) ??
      (typeof t.next_date === 'string' ? t.next_date : null)
    const price = Number(t.price_aud ?? t.price_standard) || 0
    const deposit = Number(t.deposit_aud ?? t.deposit_amount) || 0

    return json({
      found: true,
      booking: {
        reference: booking.booking_reference ?? null,
        trip_code: booking.trip_code,
        booking_status: booking.booking_status,
        amount_paid_aud: Number(booking.amount_paid_aud) || 0,
        booked_at: booking.booked_at,
        first_name_en: booking.first_name_en,
        last_name_en: booking.last_name_en,
        name_en: String(t.name_en ?? ''),
        name_th: String(t.name_th ?? ''),
        departure_date: departure,
        price_aud: price,
        deposit_aud: deposit,
      },
    })
  } catch (err) {
    console.error('[lookup-my-trip]', err)
    return json({ error: 'server_error' }, 500)
  }
})
