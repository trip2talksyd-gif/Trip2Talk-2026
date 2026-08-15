// Trip2Talk — customer self-serve waiver by opaque booking token
//
// POST { action: 'lookup' | 'submit', token, ... }
// Token authorizes access to that one booking's waiver only — no PIN/login.
// Verify JWT: OFF (browser sends anon apikey only), same as lookup-my-trip.
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-provided)

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/** Must match WAIVER_CLAUSES.en ids in src/data/risks.ts */
const REQUIRED_CLAUSE_IDS = [
  'liability',
  'oshc',
  'medical',
  'photo',
  'aurora',
  'photo_delivery',
  'package_duration',
  'extra_day_confirmation',
  'no_on_trip_extension',
] as const

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
  if (!TOKEN_RE.test(token) || (action !== 'lookup' && action !== 'submit')) {
    return json({ error: 'invalid_request' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  try {
    const { data: booking, error: bookingErr } = await admin
      .from('tour_bookings')
      .select(
        'id, trip_code, booking_reference, first_name_en, last_name_en, waiver_signed, waiver_signed_at, cancelled_at',
      )
      .eq('waiver_token', token)
      .maybeSingle()

    if (bookingErr) {
      console.error('[public-waiver] booking lookup failed')
      return json({ error: 'server_error' }, 500)
    }
    if (!booking) return await notFoundDelay()
    if (booking.cancelled_at) return json({ error: 'booking_cancelled' }, 410)

    const { data: existing } = await admin
      .from('waiver_signatures')
      .select(
        'id, signed_name, signed_at, clauses, locale, filled_by_staff, staff_fill_authorization_note, staff_fill_staff_name, staff_fill_authorized_at',
      )
      .eq('booking_id', booking.id)
      .order('signed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const completed = Boolean(booking.waiver_signed) || Boolean(existing)

    if (action === 'lookup') {
      return json({
        status: completed ? 'completed' : 'open',
        trip_code: booking.trip_code,
        booking_reference: booking.booking_reference,
        first_name_en: booking.first_name_en,
        last_name_en: booking.last_name_en,
        signed_name: existing?.signed_name ?? null,
        signed_at: existing?.signed_at ?? booking.waiver_signed_at ?? null,
        clauses: existing?.clauses ?? null,
        locale: existing?.locale ?? null,
        filled_by_staff: existing?.filled_by_staff ?? false,
      })
    }

    if (completed) return json({ error: 'already_submitted' }, 409)

    const signedName = str(body.signed_name, 120)
    const locale = str(body.locale, 2) === 'th' ? 'th' : 'en'
    const clauses = Array.isArray(body.clauses)
      ? body.clauses.filter((c): c is string => typeof c === 'string')
      : []
    const missing = REQUIRED_CLAUSE_IDS.filter((id) => !clauses.includes(id))
    if (signedName.length < 3 || missing.length > 0) {
      return json({ error: 'invalid_waiver' }, 400)
    }

    const safety = (body.safety && typeof body.safety === 'object' ? body.safety : {}) as Record<
      string,
      unknown
    >
    const flight = (body.flight && typeof body.flight === 'object' ? body.flight : {}) as Record<
      string,
      unknown
    >
    const insuranceType = str(safety.insurance_type, 32)
    const oshcRisk = Boolean(safety.oshc_risk_acknowledged)
    if (insuranceType === 'oshc' && !oshcRisk) {
      return json({ error: 'oshc_risk_required' }, 400)
    }

    const signedAt = new Date().toISOString()

    const { error: insertErr } = await admin.from('waiver_signatures').insert({
      trip_code: booking.trip_code,
      signed_name: signedName,
      signed_at: signedAt,
      clauses,
      locale,
      filled_by_staff: false,
      booking_id: booking.id,
    })
    if (insertErr) {
      console.error('[public-waiver] insert failed')
      return json({ error: 'server_error' }, 500)
    }

    const flightRequested = Boolean(flight.requested)
    const bookingPatch: Record<string, unknown> = {
      waiver_signed: true,
      waiver_signed_at: signedAt,
      emergency_contact_name: str(safety.emergency_contact_name, 120) || null,
      emergency_contact_phone: str(safety.emergency_contact_phone, 40) || null,
      allergies: str(safety.allergies, 500) || null,
      medical_conditions: str(safety.medical_conditions, 500) || null,
      other_notes: str(safety.other_notes, 500) || null,
      insurance_type: insuranceType || 'oshc',
      oshc_membership_number: str(safety.oshc_membership_number, 80) || null,
      oshc_risk_acknowledged: insuranceType === 'oshc' ? oshcRisk : false,
      travel_insurance_provider: str(safety.travel_insurance_provider, 120) || null,
      travel_insurance_policy_number: str(safety.travel_insurance_policy_number, 80) || null,
      flight_booking_requested: flightRequested,
    }
    if (flightRequested) {
      bookingPatch.flight_legal_first_name = str(flight.flight_legal_first_name, 80) || null
      bookingPatch.flight_legal_last_name = str(flight.flight_legal_last_name, 80) || null
      bookingPatch.flight_date_of_birth = str(flight.flight_date_of_birth, 20) || null
      bookingPatch.flight_passport_number = str(flight.flight_passport_number, 40) || null
      bookingPatch.flight_nationality = str(flight.flight_nationality, 80) || null
      bookingPatch.flight_frequent_flyer_number = str(flight.flight_frequent_flyer_number, 40) || null
    }

    const { error: updErr } = await admin.from('tour_bookings').update(bookingPatch).eq('id', booking.id)
    if (updErr) {
      console.error('[public-waiver] booking update failed')
      return json({ error: 'server_error' }, 500)
    }

    return json({
      status: 'completed',
      signed_at: signedAt,
      booking_reference: booking.booking_reference,
    })
  } catch (err) {
    console.error('[public-waiver] unexpected', err instanceof Error ? err.name : 'unknown')
    return json({ error: 'server_error' }, 500)
  }
})
