// Trip2Talk — daily cron ops (Phases G + H)
//
// Triggered once/day by Vercel Cron → /api/cron/daily (Hobby-safe).
// Enqueues staff_outbound_queue rows; does NOT send paid email.
// Auth: Authorization: Bearer <CRON_SECRET> (set in Supabase Edge secrets
// and Vercel env).
//
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET (optional
// if caller is internal only — still recommended).

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''
const SITE = 'https://trip2talk.com.au'
const FB = 'https://www.facebook.com/TriptoTalk'
const MESSENGER = 'https://m.me/TriptoTalk'
const STAFF_GMAIL = 'trip2talksyd@gmail.com'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function gmailUrl(to: string | null, subject: string, body: string): string {
  const p = new URLSearchParams({
    view: 'cm',
    fs: '1',
    authuser: STAFF_GMAIL,
    su: subject,
    body,
  })
  if (to?.trim()) p.set('to', to.trim())
  return `https://mail.google.com/mail/?${p.toString()}`
}

function authorized(req: Request): boolean {
  if (!CRON_SECRET) return true // allow until secret configured (owner should set it)
  const h = req.headers.get('authorization') ?? ''
  const bearer = h.startsWith('Bearer ') ? h.slice(7) : ''
  const q = new URL(req.url).searchParams.get('secret') ?? ''
  return bearer === CRON_SECRET || q === CRON_SECRET
}

/** Confirmed live tour_bookings columns — health/emergency wipe candidates only. */
const HEALTH_RETENTION_FIELDS = [
  'medical_conditions',
  'allergies',
  'emergency_contact_name',
  'emergency_contact_phone',
  'emergency_contact_relationship',
  'medications',
  'dietary_requirements',
  'oshc_provider',
  'oshc_expiry',
  'oshc_membership_number',
  'travel_insurance_provider',
  'travel_insurance_policy_number',
] as const

type HealthRetentionField = (typeof HEALTH_RETENTION_FIELDS)[number]

function isPopulatedHealthValue(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

type EligibleHealthRow = {
  booking_id: string
  booking_reference: string | null
  trip_code: string
  trip_end_date: string
  days_since_end: number
  populated_fields: HealthRetentionField[]
}

/**
 * Shared eligibility for dry-run and live wipe.
 * Trip end = departure_date + max(1, duration_days) - 1 (UTC).
 * Eligible when trip_end_date <= today - 60 AND at least one target field is set.
 * Keep in sync with staff-api `health_retention_dry_run`.
 */
async function findEligibleHealthRetentionRows(
  admin: ReturnType<typeof createClient>,
  todayStr: string,
) {
  const { data: tours, error: tourErr } = await admin
    .from('tours')
    .select('trip_code, departure_date, duration_days')
  if (tourErr) throw tourErr

  const cutoff = ymd(addDays(new Date(todayStr + 'T00:00:00Z'), -60))
  const ended = new Map<string, { trip_end_date: string; days_since_end: number }>()
  for (const t of tours ?? []) {
    const dep = String(t.departure_date || '').slice(0, 10)
    if (!dep) continue
    const days = Math.max(1, Number(t.duration_days ?? 1))
    const tripEnd = ymd(addDays(new Date(dep + 'T00:00:00Z'), days - 1))
    if (tripEnd > cutoff) continue
    const daysSince = Math.round(
      (new Date(todayStr + 'T00:00:00Z').getTime() -
        new Date(tripEnd + 'T00:00:00Z').getTime()) /
        86_400_000,
    )
    ended.set(String(t.trip_code), { trip_end_date: tripEnd, days_since_end: daysSince })
  }

  const codes = [...ended.keys()]
  const rows: EligibleHealthRow[] = []
  let bookingsScanned = 0
  let eligibleAlsoOptedOut = 0
  let eligibleCancelled = 0

  const selectCols = [
    'id',
    'booking_reference',
    'trip_code',
    'cancelled_at',
    'marketing_photo_opt_out',
    ...HEALTH_RETENTION_FIELDS,
  ].join(', ')

  for (let i = 0; i < codes.length; i += 80) {
    const chunk = codes.slice(i, i + 80)
    const { data: bookings, error } = await admin
      .from('tour_bookings')
      .select(selectCols)
      .in('trip_code', chunk)
    if (error) throw error

    for (const b of bookings ?? []) {
      bookingsScanned++
      const meta = ended.get(String(b.trip_code))
      if (!meta) continue
      const populated_fields = HEALTH_RETENTION_FIELDS.filter((field) =>
        isPopulatedHealthValue((b as Record<string, unknown>)[field]),
      )
      if (populated_fields.length === 0) continue
      if (b.marketing_photo_opt_out === true) eligibleAlsoOptedOut++
      if (b.cancelled_at) eligibleCancelled++
      rows.push({
        booking_id: String(b.id),
        booking_reference: (b.booking_reference as string | null) ?? null,
        trip_code: String(b.trip_code),
        trip_end_date: meta.trip_end_date,
        days_since_end: meta.days_since_end,
        populated_fields,
      })
    }
  }

  rows.sort((a, b) => b.days_since_end - a.days_since_end || a.trip_code.localeCompare(b.trip_code))

  return {
    rows,
    endedTripCodes: codes.length,
    bookingsScanned,
    eligibleAlsoOptedOut,
    eligibleCancelled,
  }
}

async function runHealthRetentionDryRun(
  admin: ReturnType<typeof createClient>,
  todayStr: string,
) {
  const found = await findEligibleHealthRetentionRows(admin, todayStr)
  return {
    ok: true,
    dry_run: true,
    destructive: false,
    as_of: todayStr,
    trip_end_formula: 'departure_date + max(1, duration_days) - 1 (UTC calendar days)',
    retention_days: 60,
    target_fields: [...HEALTH_RETENTION_FIELDS],
    excluded_from_this_policy: [
      'passport_number',
      'flight_*',
      'bookings / payments / invoices',
      'marketing_photo_opt_out*',
    ],
    flagged_not_in_wipe_list: [
      'insurance_type',
      'insurance_provider',
      'insurance_policy_number',
      'oshc_risk_acknowledged',
      'other_notes',
      'date_of_birth',
      'safety_info_updated_at',
    ],
    summary: {
      ended_trip_codes: found.endedTripCodes,
      bookings_on_ended_trips: found.bookingsScanned,
      eligible: found.rows.length,
      eligible_also_marketing_opt_out: found.eligibleAlsoOptedOut,
      eligible_cancelled: found.eligibleCancelled,
    },
    rows: found.rows.map(({ booking_id: _id, ...row }) => row),
  }
}

/**
 * Destructive. Calls apply_health_data_wipe only for rows from
 * findEligibleHealthRetentionRows (same as dry-run). One RPC = one transaction.
 */
async function runHealthRetentionLiveWipe(
  admin: ReturnType<typeof createClient>,
  todayStr: string,
) {
  const found = await findEligibleHealthRetentionRows(admin, todayStr)
  const wiped: { booking_reference: string | null; trip_code: string; fields_wiped: string[] }[] = []
  const skipped: string[] = []
  const failures: { booking_reference: string | null; trip_code: string; error: string }[] = []

  for (const row of found.rows) {
    try {
      const { data, error } = await admin.rpc('apply_health_data_wipe', {
        p_booking_id: row.booking_id,
        p_trip_end_date: row.trip_end_date,
      })
      if (error) {
        failures.push({
          booking_reference: row.booking_reference,
          trip_code: row.trip_code,
          error: error.message,
        })
        continue
      }
      const result = data as { ok?: boolean; skipped?: boolean; fields_wiped?: string[]; error?: string } | null
      if (!result?.ok) {
        failures.push({
          booking_reference: row.booking_reference,
          trip_code: row.trip_code,
          error: result?.error ?? 'wipe_failed',
        })
        continue
      }
      if (result.skipped) {
        skipped.push(row.booking_reference ?? row.booking_id)
        continue
      }
      wiped.push({
        booking_reference: row.booking_reference,
        trip_code: row.trip_code,
        fields_wiped: Array.isArray(result.fields_wiped) ? result.fields_wiped : row.populated_fields,
      })
    } catch (err) {
      failures.push({
        booking_reference: row.booking_reference,
        trip_code: row.trip_code,
        error: String(err),
      })
    }
  }

  return {
    ok: failures.length === 0,
    dry_run: false,
    destructive: true,
    as_of: todayStr,
    eligible: found.rows.length,
    wiped: wiped.length,
    skipped: skipped.length,
    failed: failures.length,
    rows_wiped: wiped,
    failures,
  }
}

async function resolveManualTask(req: Request): Promise<string> {
  const fromQuery = new URL(req.url).searchParams.get('task') ?? ''
  if (fromQuery) return fromQuery
  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) return ''
  try {
    const body = (await req.json()) as { task?: unknown }
    return typeof body.task === 'string' ? body.task : ''
  } catch {
    return ''
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST' && req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)
  if (!authorized(req)) return json({ error: 'unauthorized' }, 401)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const task = await resolveManualTask(req)
  if (task === 'health_retention_dry_run') {
    try {
      return json(await runHealthRetentionDryRun(admin, ymd(new Date())))
    } catch (err) {
      console.error('[cron-daily] health_retention_dry_run', err)
      return json({ error: 'server_error', detail: String(err) }, 500)
    }
  }
  if (task === 'health_retention_live_wipe') {
    try {
      return json(await runHealthRetentionLiveWipe(admin, ymd(new Date())))
    } catch (err) {
      console.error('[cron-daily] health_retention_live_wipe', err)
      return json({ error: 'server_error', detail: String(err) }, 500)
    }
  }
  if (task) return json({ error: 'unknown_task' }, 400)

  const today = new Date()
  const todayStr = ymd(today)
  const in7 = ymd(addDays(today, 7))
  const in1 = ymd(addDays(today, 1))
  // Trip end ≈ departure + (duration_days - 1). Review window: 2–3 days after end.
  // We approximate end as departure_date + greatest(0, duration_days-1).
  const reviewTargetStart = ymd(addDays(today, -3))
  const reviewTargetEnd = ymd(addDays(today, -2))

  const stats = {
    reminder_7d: 0,
    reminder_1d: 0,
    review: 0,
    quotes_expired: 0,
    health_retention_wipe: null as Awaited<ReturnType<typeof runHealthRetentionLiveWipe>> | null,
    errors: [] as string[],
  }

  try {
    // Extra-day quotes: unpaid past payment_deadline → expired.
    // Does not modify tour_bookings (original duration stands).
    const { data: expireResult, error: expireErr } = await admin.rpc(
      'expire_pending_extension_quotes',
    )
    if (expireErr) {
      stats.errors.push(`quotes_expire: ${expireErr.message}`)
    } else {
      stats.quotes_expired = Number(
        (expireResult as { expired?: number } | null)?.expired ?? 0,
      )
    }

    // Load published tours with departure dates
    const { data: tours, error: tourErr } = await admin
      .from('tours')
      .select('id, trip_code, name_en, departure_date, duration_days, next_date')
    if (tourErr) throw tourErr

    const toursByCode = new Map<string, Record<string, unknown>>()
    for (const t of tours ?? []) {
      const dep = (t.departure_date || t.next_date || null) as string | null
      if (!dep) continue
      toursByCode.set(String(t.trip_code), { ...t, _dep: String(dep).slice(0, 10) })
    }

    const codes7: string[] = []
    const codes1: string[] = []
    const reviewCandidates: { code: string; name: string; endDate: string }[] = []

    for (const [code, t] of toursByCode) {
      const dep = String(t._dep)
      if (dep === in7) codes7.push(code)
      if (dep === in1) codes1.push(code)

      const days = Math.max(1, Number(t.duration_days ?? 1))
      const end = ymd(addDays(new Date(dep + 'T00:00:00Z'), days - 1))
      if (end >= reviewTargetStart && end <= reviewTargetEnd) {
        reviewCandidates.push({ code, name: String(t.name_en ?? code), endDate: end })
      }
    }

    async function enqueueReminders(
      codes: string[],
      kind: 'trip_reminder_7d' | 'trip_reminder_1d',
      flagCol: 'reminder_7d_sent_at' | 'reminder_1d_sent_at',
    ) {
      if (codes.length === 0) return 0
      const { data: bookings, error } = await admin
        .from('tour_bookings')
        .select('*')
        .in('trip_code', codes)
        .is('cancelled_at', null)
        .neq('booking_status', 'cancelled')
        .is(flagCol, null)
      if (error) throw error

      let n = 0
      const now = new Date().toISOString()
      for (const b of bookings ?? []) {
        const tour = toursByCode.get(String(b.trip_code))
        const tripName = String(tour?.name_en ?? b.trip_code)
        const dep = String(tour?._dep ?? '')
        const days = kind === 'trip_reminder_7d' ? 7 : 1
        const prep = `${SITE}/trips/${b.trip_code}/prep`
        const name = `${b.first_name_en ?? ''} ${b.last_name_en ?? ''}`.trim() || 'Guest'
        const subject =
          days === 7
            ? `Trip2Talk — 7 days until ${tripName}`
            : `Trip2Talk — tomorrow: ${tripName}`
        const bodyEn = [
          `Hi ${name},`,
          '',
          days === 7
            ? `Your trip (${tripName}) is in 7 days (${dep}).`
            : `Reminder: your trip (${tripName}) is tomorrow (${dep})!`,
          '',
          `Trip Prep checklist: ${prep}`,
          '',
          'Trip2Talk team',
        ].join('\n')
        const bodyTh = [
          `สวัสดีคุณ ${name}`,
          '',
          days === 7
            ? `ทริป ${tripName} เหลืออีก 7 วัน (${dep})`
            : `ทริป ${tripName} พรุ่งนี้แล้ว (${dep})!`,
          '',
          `เช็กลิสต์: ${prep}`,
        ].join('\n')

        const { error: insErr } = await admin.from('staff_outbound_queue').insert({
          kind,
          booking_id: b.id,
          trip_code: b.trip_code,
          customer_name: name,
          customer_email: b.email,
          customer_phone: b.phone,
          subject,
          body_en: bodyEn,
          body_th: bodyTh,
          deep_link: prep,
          messenger_url: MESSENGER,
          gmail_url: gmailUrl(b.email, subject, `${bodyEn}\n\n---\n${bodyTh}`),
          status: 'pending',
        })
        if (insErr) {
          stats.errors.push(insErr.message)
          continue
        }
        await admin.from('tour_bookings').update({ [flagCol]: now }).eq('id', b.id)
        n++
      }
      return n
    }

    stats.reminder_7d = await enqueueReminders(codes7, 'trip_reminder_7d', 'reminder_7d_sent_at')
    stats.reminder_1d = await enqueueReminders(codes1, 'trip_reminder_1d', 'reminder_1d_sent_at')

    // Phase H: review request — only after photos_delivered and within 2–3 days post end
    for (const rc of reviewCandidates) {
      const { data: bookings, error } = await admin
        .from('tour_bookings')
        .select('*')
        .eq('trip_code', rc.code)
        .is('cancelled_at', null)
        .neq('booking_status', 'cancelled')
        .eq('photos_delivered', true)
        .is('review_requested_at', null)
      if (error) {
        stats.errors.push(error.message)
        continue
      }

      const now = new Date().toISOString()
      for (const b of bookings ?? []) {
        // photos_delivered_at should be set; require it so we don't fire before marking
        if (!b.photos_delivered_at) continue
        const name = `${b.first_name_en ?? ''} ${b.last_name_en ?? ''}`.trim() || 'Guest'
        const review = `${SITE}/review`
        const subject = `How was ${rc.name}? — Trip2Talk`
        const bodyEn = [
          `Hi ${name},`,
          '',
          `Thanks for joining ${rc.name}!`,
          `Leave a short review on Facebook: ${FB}`,
          `Or open: ${review}`,
          '',
          'Trip2Talk team',
        ].join('\n')
        const bodyTh = [
          `สวัสดีคุณ ${name}`,
          '',
          `ขอบคุณที่ไปทริป ${rc.name}!`,
          `รีวิวบน Facebook: ${FB}`,
          `หรือ: ${review}`,
        ].join('\n')

        const { error: insErr } = await admin.from('staff_outbound_queue').insert({
          kind: 'review_request',
          booking_id: b.id,
          trip_code: b.trip_code,
          customer_name: name,
          customer_email: b.email,
          customer_phone: b.phone,
          subject,
          body_en: bodyEn,
          body_th: bodyTh,
          deep_link: review,
          messenger_url: MESSENGER,
          gmail_url: gmailUrl(b.email, subject, `${bodyEn}\n\n---\n${bodyTh}`),
          status: 'pending',
        })
        if (insErr) {
          stats.errors.push(insErr.message)
          continue
        }
        await admin.from('tour_bookings').update({ review_requested_at: now }).eq('id', b.id)
        stats.review++
      }
    }

    try {
      stats.health_retention_wipe = await runHealthRetentionLiveWipe(admin, todayStr)
      if (stats.health_retention_wipe.failed > 0) {
        stats.errors.push(
          `health_retention_wipe: ${stats.health_retention_wipe.failed} booking(s) failed`,
        )
      }
    } catch (wipeErr) {
      stats.errors.push(`health_retention_wipe: ${String(wipeErr)}`)
    }

    return json({
      ok: true,
      today: todayStr,
      targets: { in7, in1, reviewWindow: [reviewTargetStart, reviewTargetEnd] },
      stats,
    })
  } catch (err) {
    console.error('[cron-daily]', err)
    return json({ error: 'server_error', detail: String(err) }, 500)
  }
})
