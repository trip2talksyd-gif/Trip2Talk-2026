// Trip2Talk — generate-trip-post Edge Function
//
// POST { trip_id, token } — loads tour, asks Claude for trip_promo copy,
// inserts content_posts draft (or returns a recent draft/approved duplicate).
//
// Secrets: ANTHROPIC_API_KEY (shared with generate-caption).
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY auto-provided.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { TRIP_PROMO_BRAND_VOICE } from './brandVoice.ts'
import { assertAiContentGenerationEnabled } from '../_shared/aiContentEnabled.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const MODEL = 'claude-sonnet-4-6'
/** Match QuickPost drafts — page_id is filled later by Make.com after posting. */
const DRAFT_PAGE_ID: string | null = null

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function stripMarkdownFences(text: string): string {
  let s = text.trim()
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/u, '')
  }
  return s.trim()
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

const ANTHROPIC_TIMEOUT_MS = 50_000

/** Map Anthropic HTTP failures to a JSON body staff can actually read (never leak the API key). */
function anthropicFailure(status: number, errText: string): {
  status: number
  body: Record<string, unknown>
} {
  let anthropicType: string | undefined
  let anthropicMessage: string | undefined
  try {
    const parsed = JSON.parse(errText) as { error?: { type?: string; message?: string } }
    anthropicType = parsed?.error?.type
    anthropicMessage = parsed?.error?.message?.slice(0, 240)
  } catch {
    /* ignore non-JSON upstream body */
  }

  const combined = `${anthropicType ?? ''} ${anthropicMessage ?? ''} ${errText}`.toLowerCase()
  const isCredits =
    status === 400 &&
    (/credit balance is too low/i.test(combined) ||
      /billing/i.test(combined) ||
      /purchase credits/i.test(combined))
  const isAuth = status === 401 || status === 403
  const isRate = status === 429 || /rate.?limit|overloaded/i.test(combined)

  let message = 'สร้างแคปชันไม่สำเร็จ ลองอีกครั้ง'
  let error = 'anthropic_failed'
  let http = 502
  if (isCredits) {
    error = 'anthropic_credits'
    http = 503
    message =
      'เครดิต Anthropic หมด — เติมที่ Plans & Billing แล้วกดสร้าง content อีกครั้ง'
  } else if (isAuth) {
    error = 'anthropic_unauthorized'
    http = 502
    message = 'คีย์ Anthropic ไม่ถูกต้องหรือหมดอายุ — ตรวจ ANTHROPIC_API_KEY ใน Edge Secrets'
  } else if (isRate) {
    error = 'anthropic_rate_limited'
    http = 429
    message = 'Anthropic จำกัดคำขอชั่วคราว — รอสักครู่แล้วลองใหม่'
  } else if (status === 404) {
    error = 'anthropic_model_unavailable'
    http = 502
    message = 'โมเดล AI ไม่พร้อมใช้งาน — ติดต่อเจ้าของระบบ'
  }

  return {
    status: http,
    body: {
      error,
      message,
      anthropic_status: status,
      anthropic_type: anthropicType ?? null,
      anthropic_message: anthropicMessage ?? null,
    },
  }
}

async function assertOwnerToken(
  admin: ReturnType<typeof createClient>,
  token: string | undefined,
): Promise<boolean> {
  if (!token || typeof token !== 'string') return false
  const { data, error } = await admin
    .from('staff_sessions')
    .select('role, expires_at')
    .eq('token', token)
    .maybeSingle()
  if (error || !data) return false
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return false
  return data.role === 'OWNER'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed', message: 'รองรับเฉพาะ POST' }, 405)
  }

  if (!ANTHROPIC_API_KEY) {
    return json({ error: 'missing_anthropic_api_key', message: 'ระบบยังไม่ได้ตั้งค่า API key' }, 500)
  }

  let body: { trip_id?: string; token?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request', message: 'ข้อมูลไม่ถูกต้อง' }, 400)
  }

  const tripId = body.trip_id
  if (typeof tripId !== 'string' || !tripId.trim()) {
    return json({ error: 'invalid_trip_id', message: 'ไม่พบรหัสทริป' }, 400)
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  try {
    const ok = await assertOwnerToken(admin, body.token)
    if (!ok) {
      return json({ error: 'unauthorized', message: 'เซสชันหมดอายุ กรุณาใส่ PIN ใหม่' }, 401)
    }

    const gate = await assertAiContentGenerationEnabled(admin)
    if (!gate.ok) {
      return json({ error: gate.error, message: gate.message }, 403)
    }

    const { data: tour, error: tourError } = await admin
      .from('tours')
      .select('*')
      .eq('id', tripId.trim())
      .maybeSingle()

    if (tourError) {
      console.error('[generate-trip-post] tour fetch failed', tourError)
      return json({ error: 'tour_fetch_failed', message: 'โหลดข้อมูลทริปไม่สำเร็จ' }, 500)
    }
    if (!tour) {
      return json({ error: 'tour_not_found', message: 'ไม่พบทริปนี้' }, 404)
    }

    const maxSeats = num(tour.max_seats ?? tour.max_pax, 0)
    const bookedSeats = num(tour.booked_seats ?? tour.current_pax, 0)
    const seatsAvailable = Math.max(0, maxSeats - bookedSeats)
    if (seatsAvailable <= 0) {
      return json({ error: 'sold_out', message: 'ทริปนี้ที่นั่งเต็มแล้ว' }, 400)
    }

    const departureDate =
      str(tour.departure_date) ?? str(tour.next_date) ?? null
    const nameEn = str(tour.name_en) ?? ''
    const nameTh = str(tour.name_th) ?? ''
    const description =
      str(tour.description_th) ?? str(tour.description_en) ?? null
    const tripCode = str(tour.trip_code) ?? ''
    const priceAud = tour.price_aud ?? tour.price_standard ?? null
    const depositAud = tour.deposit_aud ?? tour.deposit_amount ?? null

    // Avoid duplicate drafts/approved posts for the same trip within 7 days
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: existing, error: existingError } = await admin
      .from('content_posts')
      .select('*')
      .eq('trip_id', tripId.trim())
      .in('status', ['draft', 'approved'])
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingError) {
      console.error('[generate-trip-post] duplicate check failed', existingError)
      return json({ error: 'duplicate_check_failed', message: 'ตรวจสอบโพสต์เดิมไม่สำเร็จ' }, 500)
    }
    if (existing) {
      return json({ data: existing, reused: true })
    }

    const tripPayload = {
      trip_code: tripCode,
      name_en: nameEn,
      name_th: nameTh,
      departure_date: departureDate,
      seats_available: seatsAvailable,
      max_seats: maxSeats,
      booked_seats: bookedSeats,
      price_aud: priceAud,
      deposit_aud: depositAud,
      description,
    }

    const userPrompt = `Create trip_promo social copy for this Trip2Talk trip.
Use ONLY these facts (do not invent seats/dates/prices):
${JSON.stringify(tripPayload, null, 2)}

Return JSON with headline_options (3-5 Thai strings), caption_fb, caption_ig, caption_line.`

    let anthropicRes: Response
    try {
      anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1600,
          system: TRIP_PROMO_BRAND_VOICE,
          messages: [{ role: 'user', content: userPrompt }],
        }),
        signal: AbortSignal.timeout(ANTHROPIC_TIMEOUT_MS),
      })
    } catch (err) {
      const timedOut =
        (err instanceof DOMException && err.name === 'TimeoutError') ||
        (err instanceof Error && /timeout|abort/i.test(err.name + err.message))
      console.error('[generate-trip-post] Anthropic fetch failed', timedOut ? 'timeout' : err)
      return json(
        {
          error: timedOut ? 'anthropic_timeout' : 'anthropic_unreachable',
          message: timedOut
            ? 'AI ใช้เวลานานเกินไป — ลองอีกครั้ง'
            : 'ติดต่อ Anthropic ไม่สำเร็จ — ตรวจเน็ต/สถานะ API แล้วลองใหม่',
        },
        timedOut ? 504 : 502,
      )
    }

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text()
      console.error('[generate-trip-post] Anthropic error', anthropicRes.status, errText)
      const failure = anthropicFailure(anthropicRes.status, errText)
      return json(failure.body, failure.status)
    }

    const anthropicBody = await anthropicRes.json()
    const textBlock = (anthropicBody.content ?? []).find(
      (b: { type?: string; text?: string }) => b.type === 'text' && typeof b.text === 'string',
    )
    if (!textBlock?.text) {
      return json({ error: 'empty_model_response', message: 'AI ไม่ได้ตอบกลับมา' }, 502)
    }

    let parsed: {
      headline_options?: unknown
      caption_fb?: unknown
      caption_ig?: unknown
      caption_line?: unknown
    }
    try {
      parsed = JSON.parse(stripMarkdownFences(textBlock.text))
    } catch (err) {
      console.error('[generate-trip-post] JSON parse failed', textBlock.text, err)
      return json({ error: 'invalid_model_json', message: 'รูปแบบคำตอบจาก AI ไม่ถูกต้อง' }, 502)
    }

    const headline_options = Array.isArray(parsed.headline_options)
      ? parsed.headline_options.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      : []
    const caption_fb = typeof parsed.caption_fb === 'string' ? parsed.caption_fb.trim() : ''
    const caption_ig = typeof parsed.caption_ig === 'string' ? parsed.caption_ig.trim() : ''
    const caption_line = typeof parsed.caption_line === 'string' ? parsed.caption_line.trim() : ''

    if (headline_options.length < 3 || !caption_fb || !caption_ig || !caption_line) {
      return json({ error: 'incomplete_model_json', message: 'AI สร้างเนื้อหาไม่ครบ ลองอีกครั้ง' }, 502)
    }

    const row = {
      trip_id: tripId.trim(),
      post_type: 'trip_promo',
      status: 'draft',
      headline_options,
      caption_fb,
      caption_ig,
      caption_line,
      photo_urls: [] as string[],
      page_id: DRAFT_PAGE_ID,
    }

    const { data: inserted, error: insertError } = await admin
      .from('content_posts')
      .insert(row)
      .select('*')
      .single()

    if (insertError) {
      console.error('[generate-trip-post] insert failed', insertError)
      return json({ error: 'insert_failed', message: 'บันทึกร่างไม่สำเร็จ ลองอีกครั้ง' }, 500)
    }

    return json({ data: inserted, reused: false })
  } catch (err) {
    const detail = err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200)
    console.error('[generate-trip-post] failed', detail)
    return json(
      { error: 'server_error', message: 'เกิดข้อผิดพลาด ลองอีกครั้ง', detail },
      500,
    )
  }
})
