// Trip2Talk — public group check-in (one shareable link per trip)
//
// POST { action: 'info', trip_code }
//   -> { trip_code, name_en, name_th, departure_date } for an open trip.
// POST { action: 'submit', trip_code, ...form }
//   -> inserts one trip_checkins row. Write-only: nothing a customer submits
//      is ever returned, so the shared link cannot leak other guests' details.
//
// Abuse limits: submissions are rate-limited per hashed client IP
// (MAX_PER_IP_PER_HOUR), invalid trip codes get a fixed delay, and a
// honeypot field silently drops bots.
//
// Verify JWT: OFF (browser sends anon apikey only), same as public-waiver.
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-provided)

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/** Must match WAIVER_CLAUSES.en ids in src/data/risks.ts (same as public-waiver). */
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

const TRIP_CODE_RE = /^[A-Za-z0-9_-]{3,64}$/
const MAX_PER_IP_PER_HOUR = 6
/** Accept check-ins until this many days after the trip ends. */
const GRACE_DAYS_AFTER_END = 1

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

async function notFoundDelay(): Promise<Response> {
  await new Promise((r) => setTimeout(r, 300))
  return json({ error: 'not_found' }, 404)
}

function str(v: unknown, max = 500): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function tripEndDate(departure: string, durationDays: unknown): string {
  const days = Math.max(1, Number(durationDays ?? 1) || 1)
  const d = new Date(departure.slice(0, 10) + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days - 1)
  return ymd(d)
}

async function hashIp(req: Request): Promise<string | null> {
  const raw =
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    ''
  if (!raw) return null
  // Salted so stored hashes cannot be reversed with a plain IP lookup table.
  const data = new TextEncoder().encode(`${SERVICE_ROLE_KEY.slice(-16)}:${raw}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
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

  const action = str(body.action, 20)
  const tripCode = str(body.trip_code, 64)
  if ((action !== 'info' && action !== 'submit') || !TRIP_CODE_RE.test(tripCode)) {
    return json({ error: 'invalid_request' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  try {
    const { data: tour, error: tourErr } = await admin
      .from('tours')
      .select('trip_code, name_en, name_th, departure_date, duration_days, status')
      .eq('trip_code', tripCode)
      .maybeSingle()

    if (tourErr) {
      console.error('[public-trip-checkin] tour lookup failed')
      return json({ error: 'server_error' }, 500)
    }
    const status = String(tour?.status ?? '').toLowerCase()
    if (!tour || !tour.departure_date || status === 'archived' || status === 'cancelled') {
      return await notFoundDelay()
    }

    const endDate = tripEndDate(String(tour.departure_date), tour.duration_days)
    const closeAfter = new Date(endDate + 'T00:00:00Z')
    closeAfter.setUTCDate(closeAfter.getUTCDate() + GRACE_DAYS_AFTER_END)
    if (ymd(new Date()) > ymd(closeAfter)) return json({ error: 'trip_closed' }, 410)

    if (action === 'info') {
      return json({
        trip_code: tour.trip_code,
        name_en: tour.name_en ?? null,
        name_th: tour.name_th ?? null,
        departure_date: String(tour.departure_date).slice(0, 10),
      })
    }

    // Honeypot: real users never see or fill this field.
    if (str(body.website, 200)) return json({ status: 'completed' })

    const ipHash = await hashIp(req)
    if (ipHash) {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { count, error: countErr } = await admin
        .from('trip_checkins')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', since)
      if (countErr) {
        console.error('[public-trip-checkin] rate count failed')
        return json({ error: 'server_error' }, 500)
      }
      if ((count ?? 0) >= MAX_PER_IP_PER_HOUR) return json({ error: 'rate_limited' }, 429)
    }

    const fullName = str(body.full_name, 120)
    const phone = str(body.phone, 40)
    const email = str(body.email, 160)
    const emergencyName = str(body.emergency_contact_name, 120)
    const emergencyPhone = str(body.emergency_contact_phone, 40)
    const signedName = str(body.signed_name, 120)
    const locale = str(body.locale, 2) === 'th' ? 'th' : 'en'
    const clauses = Array.isArray(body.clauses)
      ? body.clauses.filter((c): c is string => typeof c === 'string').slice(0, 30)
      : []
    const missing = REQUIRED_CLAUSE_IDS.filter((id) => !clauses.includes(id))

    if (
      fullName.length < 2 ||
      phone.replace(/\D/g, '').length < 8 ||
      emergencyName.length < 2 ||
      emergencyPhone.replace(/\D/g, '').length < 8
    ) {
      return json({ error: 'invalid_contact' }, 400)
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'invalid_contact' }, 400)
    }
    if (signedName.length < 3 || missing.length > 0) {
      return json({ error: 'invalid_waiver' }, 400)
    }

    const { error: insertErr } = await admin.from('trip_checkins').insert({
      trip_code: tour.trip_code,
      trip_end_date: endDate,
      full_name: fullName,
      phone,
      email: email || null,
      emergency_contact_name: emergencyName,
      emergency_contact_phone: emergencyPhone,
      emergency_contact_relationship: str(body.emergency_contact_relationship, 60) || null,
      allergies: str(body.allergies, 500) || null,
      medical_conditions: str(body.medical_conditions, 500) || null,
      dietary_requirements: str(body.dietary_requirements, 300) || null,
      other_notes: str(body.other_notes, 500) || null,
      waiver_signed_name: signedName,
      waiver_clauses: clauses,
      locale,
      ip_hash: ipHash,
    })
    if (insertErr) {
      console.error('[public-trip-checkin] insert failed')
      return json({ error: 'server_error' }, 500)
    }

    return json({ status: 'completed' })
  } catch (err) {
    console.error('[public-trip-checkin] unexpected', err instanceof Error ? err.name : 'unknown')
    return json({ error: 'server_error' }, 500)
  }
})
