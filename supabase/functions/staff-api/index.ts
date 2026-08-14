// Trip2Talk V5 — staff-api Edge Function
//
// Single authenticated proxy for every staff-only read/write. The browser
// never talks to PostgREST directly for protected tables (tour_bookings
// select/update, expenses, staff_commission_ledger, insurance_alerts,
// compliance_items, waiver_signatures select) — RLS revokes all
// anon/authenticated grants on those tables (see 2026-07-rls-lockdown.sql),
// so this function is the only path in. It validates the session token
// against staff_sessions, checks the role is allowed for the requested
// action, then executes the query with the service-role key (bypasses RLS).
//
// Request: POST { token: string, action: string, params?: object }
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

/** Object path inside the private payment-slips bucket (never a public URL). */
function paymentSlipObjectPath(slipUrl: string | null | undefined): string | null {
  if (typeof slipUrl !== 'string') return null
  const trimmed = slipUrl.trim()
  if (!trimmed) return null
  const marker = '/payment-slips/'
  const idx = trimmed.indexOf(marker)
  const raw = idx >= 0 ? trimmed.slice(idx + marker.length) : trimmed
  const path = decodeURIComponent(raw.split('?')[0] ?? '').replace(/^\/+/, '')
  if (!path || path.includes('..') || path.includes('\\') || path.startsWith('http')) return null
  return path
}

/** 32-byte base64url — not booking_reference, not sequential. */
function randomWaiverToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

type ContentTargetAccount =
  | 'trip2talk_page'
  | 'chapter99_page'
  | 'group_thaiaus'

const VALID_TARGET_ACCOUNTS: ContentTargetAccount[] = [
  'trip2talk_page',
  'chapter99_page',
  'group_thaiaus',
]

const GRAPH_VERSION = Deno.env.get('FB_API_VERSION')?.trim() || 'v20.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

function isManualTargetAccount(account: string | null | undefined): boolean {
  return account === 'group_thaiaus'
}

function resolvePageCredentials(account: ContentTargetAccount): {
  pageId: string
  accessToken: string
} | null {
  if (account === 'trip2talk_page') {
    const pageId =
      Deno.env.get('FACEBOOK_PAGE_ID_TRIP2TALK')?.trim() ||
      Deno.env.get('FB_PAGE_ID_TRIP2TALK')?.trim() ||
      ''
    const accessToken =
      Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN_TRIP2TALK')?.trim() ||
      Deno.env.get('FB_PAGE_ACCESS_TOKEN_TRIP2TALK')?.trim() ||
      ''
    if (!pageId || !accessToken) return null
    return { pageId, accessToken }
  }
  if (account === 'chapter99_page') {
    const pageId =
      Deno.env.get('FACEBOOK_PAGE_ID')?.trim() ||
      Deno.env.get('FB_PAGE_ID')?.trim() ||
      ''
    const accessToken =
      Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN')?.trim() ||
      Deno.env.get('FB_PAGE_ACCESS_TOKEN')?.trim() ||
      ''
    if (!pageId || !accessToken) return null
    return { pageId, accessToken }
  }
  return null
}

/**
 * If the stored secret is a User token, exchange it for the Page token via
 * /me/accounts (required for /{page-id}/photos). Falls back to the stored token.
 */
async function resolvePublishAccessToken(
  pageId: string,
  accessToken: string,
): Promise<{ token: string; source: 'page_secret' | 'exchanged_from_user' }> {
  // Already a Page token when /me identity matches the Page id
  try {
    const meRes = await fetch(
      `${GRAPH_BASE}/me?fields=id&access_token=${encodeURIComponent(accessToken)}`,
    )
    const meJson = (await meRes.json()) as { id?: string; error?: unknown }
    if (meJson.id && meJson.id === pageId) {
      return { token: accessToken, source: 'page_secret' }
    }
  } catch {
    // continue — try exchange
  }

  try {
    const accRes = await fetch(
      `${GRAPH_BASE}/me/accounts?fields=id,access_token&access_token=${encodeURIComponent(accessToken)}`,
    )
    const accJson = (await accRes.json()) as {
      data?: Array<{ id?: string; access_token?: string }>
      error?: { message?: string }
    }
    const match = (accJson.data ?? []).find((p) => p.id === pageId && p.access_token)
    if (match?.access_token) {
      return { token: match.access_token, source: 'exchanged_from_user' }
    }
    if (accJson.error?.message) {
      console.warn('[staff-api] /me/accounts failed', accJson.error.message)
    }
  } catch (err) {
    console.warn('[staff-api] page token exchange failed', err)
  }

  return { token: accessToken, source: 'page_secret' }
}

type GraphErrorBody = {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
    fbtrace_id?: string
  }
}

class FacebookPublishError extends Error {
  readonly fbCode?: number
  readonly fbSubcode?: number
  readonly hint?: string

  constructor(message: string, opts?: { fbCode?: number; fbSubcode?: number; hint?: string }) {
    super(message)
    this.name = 'FacebookPublishError'
    this.fbCode = opts?.fbCode
    this.fbSubcode = opts?.fbSubcode
    this.hint = opts?.hint
  }
}

function formatGraphFailure(
  endpoint: string,
  payload: GraphErrorBody,
  pageId: string,
): FacebookPublishError {
  const err = payload.error
  const fbMsg = err?.message?.trim() || JSON.stringify(payload)
  const code = err?.code
  const sub = err?.error_subcode
  let hint: string | undefined
  // #100 / #33 = object missing or token lacks permission for this Page
  if (code === 100 || sub === 33) {
    hint =
      `Token cannot post to Page ${pageId}. Use a long-lived Page access token ` +
      `(from /me/accounts for this Page), not a short-lived User token. ` +
      `Needs pages_manage_posts + pages_read_engagement.`
  } else if (code === 190) {
    hint = 'Access token expired or invalid — generate a new long-lived Page token.'
  } else if (/url|image|picture|download|fetch/i.test(fbMsg)) {
    hint =
      'Facebook could not fetch the image URL — use a public https image (e.g. content-photos bucket).'
  }
  return new FacebookPublishError(`Facebook rejected the post: ${fbMsg}`, {
    fbCode: code,
    fbSubcode: sub,
    hint,
  })
}

async function graphPostJson(
  url: string,
  body: URLSearchParams,
): Promise<Record<string, unknown>> {
  let res: Response
  try {
    res = await fetch(url, { method: 'POST', body })
  } catch (netErr) {
    throw new FacebookPublishError(
      `Facebook rejected the post: network error calling Graph API (${netErr instanceof Error ? netErr.message : String(netErr)})`,
    )
  }
  let jsonRes: Record<string, unknown>
  try {
    jsonRes = (await res.json()) as Record<string, unknown>
  } catch {
    throw new FacebookPublishError(
      `Facebook rejected the post: non-JSON response (HTTP ${res.status})`,
    )
  }
  return jsonRes
}

/** Official Graph Page publish — /photos (album) → /feed. Never used for groups. */
async function publishToFacebookPage(opts: {
  pageId: string
  accessToken: string
  message: string
  imageUrls: string[]
}): Promise<{ facebook_post_id: string; facebook_post_url: string }> {
  const mock = Deno.env.get('MOCK_FACEBOOK') === 'true'
  if (mock) {
    const id = `mock_fb_${opts.pageId}_${Date.now()}`
    return {
      facebook_post_id: id,
      facebook_post_url: `https://www.facebook.com/${opts.pageId}/posts/mock`,
    }
  }

  const images = opts.imageUrls.filter((u) => /^https?:\/\//i.test(u))
  if (images.length === 0) {
    throw new FacebookPublishError(
      'Facebook rejected the post: Graph publish requires public https image URLs',
      { hint: 'Select or upload at least one real photo URL before approving.' },
    )
  }

  // Preflight: confirm token can see this Page (catches User-token / wrong-page early)
  const resolved = await resolvePublishAccessToken(opts.pageId, opts.accessToken)
  const accessToken = resolved.token
  if (resolved.source === 'exchanged_from_user') {
    console.log('[staff-api] Using Page token exchanged from User token via /me/accounts')
  }

  try {
    const probeUrl =
      `${GRAPH_BASE}/${opts.pageId}?fields=id,name&access_token=${encodeURIComponent(accessToken)}`
    const probeRes = await fetch(probeUrl)
    const probeJson = (await probeRes.json()) as GraphErrorBody & { id?: string; name?: string }
    if (probeJson.error || !probeJson.id) {
      throw formatGraphFailure(`GET /${opts.pageId}`, probeJson, opts.pageId)
    }
  } catch (err) {
    if (err instanceof FacebookPublishError) throw err
    throw new FacebookPublishError(
      `Facebook rejected the post: could not verify Page access (${err instanceof Error ? err.message : String(err)})`,
    )
  }

  // Single photo — published photo endpoint
  if (images.length === 1) {
    const body = new URLSearchParams()
    body.set('url', images[0])
    body.set('caption', opts.message)
    body.set('published', 'true')
    body.set('access_token', accessToken)
    const jsonRes = await graphPostJson(`${GRAPH_BASE}/${opts.pageId}/photos`, body)
    if (!jsonRes.id && !jsonRes.post_id) {
      throw formatGraphFailure('/photos', jsonRes as GraphErrorBody, opts.pageId)
    }
    const postId = String(jsonRes.post_id || jsonRes.id)
    return {
      facebook_post_id: postId,
      facebook_post_url: `https://www.facebook.com/${opts.pageId}/posts/${postId}`,
    }
  }

  // Multi-photo album via unpublished uploads + /feed attached_media
  const mediaFbids: string[] = []
  for (const url of images) {
    const body = new URLSearchParams()
    body.set('url', url)
    body.set('published', 'false')
    body.set('access_token', accessToken)
    const uploadJson = await graphPostJson(`${GRAPH_BASE}/${opts.pageId}/photos`, body)
    if (!uploadJson.id) {
      throw formatGraphFailure('/photos (upload)', uploadJson as GraphErrorBody, opts.pageId)
    }
    mediaFbids.push(String(uploadJson.id))
  }

  const feedBody = new URLSearchParams()
  feedBody.set('message', opts.message)
  feedBody.set(
    'attached_media',
    JSON.stringify(mediaFbids.map((media_fbid) => ({ media_fbid }))),
  )
  feedBody.set('access_token', accessToken)
  const postJson = await graphPostJson(`${GRAPH_BASE}/${opts.pageId}/feed`, feedBody)
  if (!postJson.id) {
    throw formatGraphFailure('/feed', postJson as GraphErrorBody, opts.pageId)
  }
  return {
    facebook_post_id: String(postJson.id),
    facebook_post_url: `https://www.facebook.com/${postJson.id}`,
  }
}

const CONTENT_POST_SELECT =
  'id, trip_id, post_type, status, headline_options, selected_headline, caption_fb, caption_ig, caption_line, photo_urls, page_id, target_account, group_id, posted_at, facebook_post_id, facebook_post_url, created_at, updated_at, tours:trip_id (id, trip_code, name_en, name_th, departure_date, max_seats, booked_seats, cover_image_url)'


type Role = 'OWNER' | 'MANAGER' | 'GUIDE' | 'CASHIER'

const ACTION_ROLES: Record<string, Role[]> = {
  list_pending_bookings: ['OWNER', 'MANAGER', 'CASHIER'],
  update_booking_status: ['OWNER', 'MANAGER', 'CASHIER'],
  list_bookings_for_tour: ['OWNER', 'MANAGER', 'GUIDE'],
  bookings_this_month: ['OWNER', 'MANAGER'],
  expenses_this_month: ['OWNER', 'MANAGER'],
  insert_expense: ['OWNER', 'MANAGER'],
  insurance_alerts: ['OWNER', 'MANAGER', 'GUIDE', 'CASHIER'],
  compliance_items: ['OWNER', 'MANAGER'],
  list_tours_admin: ['OWNER', 'MANAGER'],
  create_tour: ['OWNER', 'MANAGER'],
  create_tours_bulk: ['OWNER', 'MANAGER'],
  list_waitlist: ['OWNER', 'MANAGER'],
  mark_waitlist_contacted: ['OWNER', 'MANAGER'],
  create_booking_manual: ['OWNER', 'MANAGER', 'CASHIER'],
  mark_attendance: ['OWNER', 'MANAGER', 'GUIDE'],
  year_summary: ['OWNER', 'MANAGER'],
  delete_tour: ['OWNER'],
  update_tour_status: ['OWNER', 'MANAGER'],
  archive_tour: ['OWNER'],
  unarchive_tour: ['OWNER'],
  update_tour_itinerary: ['OWNER', 'MANAGER'],
  update_tour_max_seats: ['OWNER'],
  record_payment: ['OWNER', 'MANAGER', 'CASHIER'],
  sign_payment_slip: ['OWNER', 'MANAGER', 'CASHIER'],
  flag_pending_booking: ['OWNER', 'MANAGER', 'CASHIER'],
  list_payment_reconciliation_issues: ['OWNER', 'MANAGER', 'CASHIER'],
  resolve_payment_reconciliation_issue: ['OWNER', 'MANAGER', 'CASHIER'],
  retry_payment_reconciliation_issue: ['OWNER', 'MANAGER', 'CASHIER'],
  list_payments_for_booking: ['OWNER', 'MANAGER', 'CASHIER'],
  search_customer_payments: ['OWNER', 'MANAGER', 'CASHIER'],
  add_pending_installment: ['OWNER', 'MANAGER', 'CASHIER'],
  update_installment: ['OWNER', 'MANAGER', 'CASHIER'],
  delete_payment_installment: ['OWNER', 'MANAGER'],
  installment_income_summary: ['OWNER'],
  update_booking_details: ['OWNER', 'MANAGER', 'CASHIER'],
  cancel_booking: ['OWNER', 'MANAGER', 'CASHIER'],
  create_waiver_staff_assisted: ['OWNER', 'MANAGER', 'GUIDE', 'CASHIER'],
  list_waivers_for_tour: ['OWNER', 'MANAGER', 'GUIDE', 'CASHIER'],
  issue_waiver_link: ['OWNER', 'MANAGER', 'GUIDE', 'CASHIER'],
  get_waiver_record: ['OWNER', 'MANAGER', 'GUIDE', 'CASHIER'],
  delete_waiver_signature: ['OWNER'],
  list_outbound_queue: ['OWNER', 'MANAGER', 'GUIDE', 'CASHIER'],
  complete_outbound: ['OWNER', 'MANAGER', 'GUIDE', 'CASHIER'],
  list_photos_pending: ['OWNER', 'MANAGER', 'GUIDE'],
  mark_photos_delivered: ['OWNER', 'MANAGER', 'GUIDE'],
  customer_loyalty: ['OWNER', 'MANAGER', 'CASHIER'],
  list_recent_logins: ['OWNER'],
  list_staff_profiles: ['OWNER'],
  owner_ops_metrics: ['OWNER'],
  list_draft_content_posts: ['OWNER'],
  list_manual_pending_content_posts: ['OWNER'],
  update_content_post: ['OWNER'],
  mark_content_post_posted: ['OWNER'],
  insert_content_post: ['OWNER'],
  probe_facebook_page_creds: ['OWNER'],
  list_photo_spots_admin: ['OWNER', 'MANAGER'],
  upsert_photo_spot: ['OWNER', 'MANAGER'],
  delete_photo_spot: ['OWNER', 'MANAGER'],
  get_app_settings: ['OWNER', 'MANAGER'],
  set_ai_content_generation: ['OWNER'],
}

/**
 * Clones an existing tour row (whatever columns it actually has — production's
 * `tours` table has accumulated both legacy V5 names — next_date, price_standard,
 * max_pax, current_pax, deposit_amount — and newer ones — departure_date,
 * price_aud, max_seats, booked_seats — over time, so we don't assume a fixed
 * schema shape) and applies overrides, writing to BOTH naming conventions for
 * any field the template row actually has, so the new row displays correctly
 * regardless of which columns the live table uses.
 */
function buildTourInsert(
  template: Record<string, unknown>,
  overrides: {
    trip_code: string
    name_en?: string
    name_th?: string
    departure_date: string
    price_aud?: number
    deposit_aud?: number
    max_seats?: number
    status?: string
  },
): Record<string, unknown> {
  const row: Record<string, unknown> = { ...template }
  delete row.id
  delete row.created_at
  delete row.updated_at

  row.trip_code = overrides.trip_code
  if (overrides.name_en) row.name_en = overrides.name_en
  if (overrides.name_th) row.name_th = overrides.name_th
  if (overrides.status) row.status = overrides.status

  // Reset seat count for the new date regardless of naming.
  if ('booked_seats' in row) row.booked_seats = 0
  if ('current_pax' in row) row.current_pax = 0

  if ('departure_date' in row || !('next_date' in template)) row.departure_date = overrides.departure_date
  if ('next_date' in row) row.next_date = overrides.departure_date

  if (overrides.price_aud !== undefined) {
    if ('price_aud' in row || !('price_standard' in template)) row.price_aud = overrides.price_aud
    if ('price_standard' in row) row.price_standard = overrides.price_aud
  }
  if (overrides.deposit_aud !== undefined) {
    if ('deposit_aud' in row || !('deposit_amount' in template)) row.deposit_aud = overrides.deposit_aud
    if ('deposit_amount' in row) row.deposit_amount = overrides.deposit_aud
  }
  if (overrides.max_seats !== undefined) {
    if ('max_seats' in row || !('max_pax' in template)) row.max_seats = overrides.max_seats
    if ('max_pax' in row) row.max_pax = overrides.max_seats
  }

  return row
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: { token?: string; action?: string; params?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const { token, action, params = {} } = body
  if (!token || !action) return json({ error: 'invalid_request' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: session, error: sessionError } = await admin
    .from('staff_sessions')
    .select('role, expires_at, full_name, staff_id')
    .eq('token', token)
    .maybeSingle()

  if (sessionError) {
    console.error('[staff-api] session lookup failed', sessionError)
    return json({ error: 'server_error' }, 500)
  }
  if (!session || new Date(session.expires_at) < new Date()) {
    return json({ error: 'session_expired' }, 401)
  }

  const allowedRoles = ACTION_ROLES[action]
  if (!allowedRoles) return json({ error: 'unknown_action' }, 400)
  if (!allowedRoles.includes(session.role as Role)) return json({ error: 'forbidden' }, 403)

  try {
    switch (action) {
      case 'list_pending_bookings': {
        // Public + cashier flows use lowercase statuses (pending_payment), not PENDING.
        const { data, error } = await admin
          .from('tour_bookings')
          .select('*')
          .in('booking_status', ['pending_payment', 'PENDING'])
          .order('booked_at', { ascending: false })
        if (error) throw error
        return json({ data })
      }

      case 'sign_payment_slip': {
        const { bookingId } = params as { bookingId?: string }
        if (!bookingId) return json({ error: 'invalid_params' }, 400)
        const { data: booking, error: bookingError } = await admin
          .from('tour_bookings')
          .select('id, slip_url')
          .eq('id', bookingId)
          .maybeSingle()
        if (bookingError) throw bookingError
        if (!booking) return json({ error: 'booking_not_found' }, 404)
        const objectPath = paymentSlipObjectPath(booking.slip_url)
        if (!objectPath) return json({ error: 'no_slip' }, 404)
        const { data: signed, error: signError } = await admin.storage
          .from('payment-slips')
          .createSignedUrl(objectPath, 180)
        if (signError || !signed?.signedUrl) {
          console.error('[staff-api] sign_payment_slip', signError)
          return json({ error: 'sign_failed' }, 502)
        }
        const lower = objectPath.toLowerCase()
        const isImage = /\.(jpe?g|png|gif|webp|heic)$/i.test(lower)
        return json({
          data: {
            url: signed.signedUrl,
            expires_in: 180,
            is_image: isImage,
          },
        })
      }

      case 'flag_pending_booking': {
        const { bookingId, note } = params as { bookingId?: string; note?: string }
        if (!bookingId) return json({ error: 'invalid_params' }, 400)
        const text = typeof note === 'string' ? note.trim() : ''
        if (!text) return json({ error: 'invalid_params' }, 400)
        const { data, error } = await admin
          .from('tour_bookings')
          .update({ staff_follow_up_note: text.slice(0, 500) })
          .eq('id', bookingId)
          .in('booking_status', ['pending_payment', 'PENDING'])
          .select('id, staff_follow_up_note, booking_status')
          .maybeSingle()
        if (error) throw error
        if (!data) return json({ error: 'booking_not_found' }, 404)
        return json({ data })
      }

      case 'list_payment_reconciliation_issues': {
        const { data, error } = await admin
          .from('payment_reconciliation_issues')
          .select('*')
          .is('resolved_at', null)
          .order('created_at', { ascending: false })
          .limit(50)
        if (error) throw error
        return json({ data })
      }

      case 'resolve_payment_reconciliation_issue': {
        const { id, note } = params as { id?: string; note?: string }
        if (!id) return json({ error: 'invalid_params' }, 400)
        const { error } = await admin
          .from('payment_reconciliation_issues')
          .update({
            resolved_at: new Date().toISOString(),
            resolve_note: typeof note === 'string' && note.trim() ? note.trim() : 'staff_ack',
          })
          .eq('id', id)
          .is('resolved_at', null)
        if (error) throw error
        return json({ ok: true })
      }

      case 'retry_payment_reconciliation_issue': {
        const { id } = params as { id?: string }
        if (!id) return json({ error: 'invalid_params' }, 400)
        const { data: issue, error: issueError } = await admin
          .from('payment_reconciliation_issues')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (issueError) throw issueError
        if (!issue) return json({ error: 'not_found' }, 404)
        if (issue.resolved_at) return json({ error: 'already_resolved' }, 409)
        const cents = Number(issue.amount_cents ?? 0)
        if (!(cents > 0) || !issue.external_payment_id || !issue.booking_reference) {
          return json({ error: 'insufficient_issue_data' }, 400)
        }
        const { data: rpcResult, error: rpcError } = await admin.rpc('apply_square_payment', {
          p_booking_ref: issue.booking_reference,
          p_amount_cents: Math.round(cents),
          p_payment_id: issue.external_payment_id,
          p_payment_method: issue.payment_method || 'square',
        })
        if (rpcError) throw rpcError
        const row = (rpcResult ?? {}) as { ok?: boolean; error?: string }
        if (!row.ok) {
          return json({ error: row.error || 'retry_failed', data: rpcResult }, 422)
        }
        return json({ data: rpcResult })
      }

      case 'update_booking_status': {
        const { id, status, amountPaid } = params as {
          id: string
          status: string
          amountPaid?: number
        }
        if (!id || !status) return json({ error: 'invalid_params' }, 400)
        const payload: Record<string, unknown> = { booking_status: status }
        if (amountPaid !== undefined) payload.amount_paid_aud = amountPaid
        const { error } = await admin.from('tour_bookings').update(payload).eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'list_bookings_for_tour': {
        const { tourId } = params as { tourId: string }
        if (!tourId) return json({ error: 'invalid_params' }, 400)
        const { data, error } = await admin
          .from('tour_bookings')
          .select('*')
          .eq('tour_id', tourId)
          .order('booked_at', { ascending: false })
        if (error) throw error
        return json({ data })
      }

      case 'bookings_this_month': {
        const start = new Date()
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        const { data, error } = await admin
          .from('tour_bookings')
          .select('*')
          .gte('booked_at', start.toISOString())
        if (error) throw error
        return json({ data })
      }

      case 'expenses_this_month': {
        const start = new Date()
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        const { data, error } = await admin
          .from('expenses')
          .select('*')
          .gte('created_at', start.toISOString())
        if (error) throw error
        return json({ data })
      }

      case 'insert_expense': {
        const expense = params as Record<string, unknown>
        const { data, error } = await admin.from('expenses').insert(expense).select().single()
        if (error) throw error
        return json({ data })
      }

      case 'insurance_alerts': {
        const { data, error } = await admin
          .from('insurance_alerts')
          .select('*')
          .eq('is_active', true)
          .order('expiry_date', { ascending: true })
        if (error) throw error
        return json({ data })
      }

      case 'compliance_items': {
        const { data, error } = await admin
          .from('compliance_items')
          .select('*')
          .order('due_date', { ascending: true })
        if (error) throw error
        return json({ data })
      }

      case 'list_tours_admin': {
        const { data, error } = await admin.from('tours').select('*')
        if (error) throw error
        return json({ data })
      }

      case 'create_tour': {
        const { templateTripCode, trip_code, name_en, name_th, departure_date, price_aud, deposit_aud, max_seats, status } =
          params as {
            templateTripCode?: string
            trip_code: string
            name_en?: string
            name_th?: string
            departure_date: string
            price_aud?: number
            deposit_aud?: number
            max_seats?: number
            status?: string
          }
        if (!trip_code || !departure_date) return json({ error: 'invalid_params' }, 400)

        const { data: existing } = await admin
          .from('tours')
          .select('id')
          .eq('trip_code', trip_code)
          .maybeSingle()
        if (existing) return json({ error: 'duplicate_trip_code' }, 409)

        let template: Record<string, unknown> | null = null
        if (templateTripCode) {
          const { data: templateRow, error: templateError } = await admin
            .from('tours')
            .select('*')
            .eq('trip_code', templateTripCode)
            .maybeSingle()
          if (templateError) throw templateError
          template = templateRow
        }
        if (!template) return json({ error: 'template_not_found' }, 404)

        const insertRow = buildTourInsert(template, {
          trip_code,
          name_en,
          name_th,
          departure_date,
          price_aud,
          deposit_aud,
          max_seats,
          status,
        })

        const { data, error } = await admin.from('tours').insert(insertRow).select().single()
        if (error) throw error
        return json({ data })
      }

      case 'create_tours_bulk': {
        const { templateTripCode, entries } = params as {
          templateTripCode?: string
          entries: {
            trip_code: string
            name_en?: string
            name_th?: string
            departure_date: string
            price_aud?: number
            deposit_aud?: number
            max_seats?: number
            status?: string
          }[]
        }
        if (!templateTripCode || !Array.isArray(entries) || entries.length === 0) {
          return json({ error: 'invalid_params' }, 400)
        }

        const { data: templateRow, error: templateError } = await admin
          .from('tours')
          .select('*')
          .eq('trip_code', templateTripCode)
          .maybeSingle()
        if (templateError) throw templateError
        if (!templateRow) return json({ error: 'template_not_found' }, 404)

        const { data: existingRows, error: existingError } = await admin
          .from('tours')
          .select('trip_code')
          .in(
            'trip_code',
            entries.map((e) => e.trip_code),
          )
        if (existingError) throw existingError
        const existingCodes = new Set((existingRows ?? []).map((r) => r.trip_code as string))

        const toInsert = entries
          .filter((e) => !existingCodes.has(e.trip_code))
          .map((e) => buildTourInsert(templateRow, e))

        const skipped = entries.filter((e) => existingCodes.has(e.trip_code)).map((e) => e.trip_code)

        if (toInsert.length === 0) {
          return json({ data: [], skipped })
        }

        const { data, error } = await admin.from('tours').insert(toInsert).select()
        if (error) throw error
        return json({ data, skipped })
      }

      case 'list_waitlist': {
        const { data, error } = await admin
          .from('waitlist_entries')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return json({ data })
      }

      case 'mark_waitlist_contacted': {
        const { id, contacted } = params as { id: string; contacted: boolean }
        if (!id) return json({ error: 'invalid_params' }, 400)
        const { error } = await admin
          .from('waitlist_entries')
          .update({ contacted: contacted !== false })
          .eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'create_booking_manual': {
        const b = params as Record<string, unknown>
        const tripCode = b.trip_code as string | undefined
        if (!tripCode) return json({ error: 'invalid_params' }, 400)

        const { data: tour, error: tourError } = await admin
          .from('tours')
          .select('*')
          .eq('trip_code', tripCode)
          .maybeSingle()
        if (tourError) throw tourError
        if (!tour) return json({ error: 'tour_not_found' }, 404)

        // Block booking against itinerary templates / month shells (no day window).
        const dep =
          (typeof tour.departure_date === 'string' && tour.departure_date) ||
          (typeof tour.next_date === 'string' && tour.next_date) ||
          null
        if (!dep) return json({ error: 'tour_not_bookable_no_date' }, 400)
        const codeU = String(tripCode).trim().toUpperCase()
        const cmsTemplates = new Set([
          'ULU-4D3N',
          'MEL-4D3N',
          'TAS-3D2N',
          'TAS-LH-4D3N',
          'TAS-SU-4D3N',
          'BER-3D2N',
          'CAN-2D1N',
          'TAS-SP-3D2N',
          'NZ-10D9N',
          'NZ-6D5N',
        ])
        const months = new Set([
          'JAN',
          'FEB',
          'MAR',
          'APR',
          'MAY',
          'JUN',
          'JUL',
          'AUG',
          'SEP',
          'OCT',
          'NOV',
          'DEC',
        ])
        const lastSeg = codeU.split('-').pop() ?? ''
        if (cmsTemplates.has(codeU) || months.has(lastSeg) || /-(1DAY|1D)$/.test(codeU)) {
          return json({ error: 'tour_is_template_not_bookable' }, 400)
        }

        // Same seat-hold RPC the public booking flow uses, so staff-entered
        // bookings (phone/Facebook customers) can't oversell a trip either.
        const { data: rpcResult, error: rpcError } = await admin.rpc('book_seat', {
          p_tour_id: tour.id,
          p_seats_requested: 1,
        })
        const rpcOk =
          rpcResult === true ||
          (rpcResult && typeof rpcResult === 'object' && (rpcResult as { success?: unknown }).success === true)
        if (rpcError || !rpcOk) {
          return json({ error: 'seats_full' }, 409)
        }

        const bookingRef = `T2T-STAFF-${tripCode}-${Date.now().toString(36).toUpperCase()}`

        const { data, error } = await admin
          .from('tour_bookings')
          .insert({
            tour_id: tour.id,
            trip_code: tripCode,
            first_name_th: '',
            last_name_th: '',
            first_name_en: b.first_name_en ?? '',
            last_name_en: b.last_name_en ?? '',
            passport_number: b.passport_number || 'PENDING',
            date_of_birth: b.date_of_birth ?? null,
            email: b.email ?? '',
            phone: b.phone ?? '',
            emergency_contact_name: b.emergency_contact_name ?? null,
            emergency_contact_phone: b.emergency_contact_phone ?? null,
            dietary_requirements: b.dietary_requirements ?? null,
            medical_conditions: b.medical_conditions ?? null,
            oshc_provider: null,
            oshc_expiry: null,
            waiver_signed: false,
            waiver_signed_at: null,
            booking_status: b.booking_status ?? 'pending_payment',
            amount_paid_aud: b.amount_paid_aud ?? 0,
            payment_method: b.payment_method ?? 'manual',
            source: b.source ?? 'facebook',
            payment_plan_installments: b.payment_plan_installments ?? 1,
            slip_url: null,
            booking_reference: bookingRef,
          })
          .select()
          .single()

        if (error) {
          await admin.rpc('release_seat', { p_tour_id: tour.id, p_seats_to_release: 1 })
          throw error
        }

        // Keep the payments ledger consistent with amount_paid_aud so
        // "installment X of Y" displays correctly even for the first
        // payment taken at the moment the booking is created.
        const initialAmount = Number(b.amount_paid_aud ?? 0)
        if (initialAmount > 0 && data) {
          await admin.from('booking_payments').insert({
            booking_id: data.id,
            amount_aud: initialAmount,
            payment_method: b.payment_method ?? 'manual',
            installment_no: 1,
          })
        }

        return json({ data })
      }

      case 'create_waiver_staff_assisted': {
        // Staff fills waiver on customer's explicit request — same clause
        // acknowledgment as public flow; audit fields record authorization.
        const p = params as {
          trip_code?: string
          signed_name?: string
          clauses?: string[]
          locale?: string
          authorization_note?: string
          evidence_url?: string | null
          booking_id?: string | null
          confirmed_customer_request?: boolean
        }
        const tripCode = (p.trip_code ?? '').trim()
        const signedName = (p.signed_name ?? '').trim()
        const note = (p.authorization_note ?? '').trim()
        const clauses = Array.isArray(p.clauses) ? p.clauses.filter((c) => typeof c === 'string') : []

        if (!tripCode || signedName.length < 3 || clauses.length === 0 || note.length < 8) {
          return json({ error: 'invalid_params' }, 400)
        }
        if (p.confirmed_customer_request !== true) {
          return json({ error: 'confirmation_required' }, 400)
        }

        const staffId =
          typeof session.staff_id === 'string' && session.staff_id ? session.staff_id : null
        const staffName =
          (typeof session.full_name === 'string' && session.full_name.trim()) || 'Staff'
        const authorizedAt = new Date().toISOString()
        const evidence =
          typeof p.evidence_url === 'string' && p.evidence_url.trim()
            ? p.evidence_url.trim()
            : null
        const bookingId =
          typeof p.booking_id === 'string' && p.booking_id.trim() ? p.booking_id.trim() : null

        if (bookingId) {
          const { data: booking, error: bookingErr } = await admin
            .from('tour_bookings')
            .select('id, trip_code')
            .eq('id', bookingId)
            .maybeSingle()
          if (bookingErr) throw bookingErr
          if (!booking) return json({ error: 'booking_not_found' }, 404)
          if (String(booking.trip_code) !== tripCode) {
            return json({ error: 'booking_trip_mismatch' }, 400)
          }
        }

        const { data, error } = await admin
          .from('waiver_signatures')
          .insert({
            trip_code: tripCode,
            signed_name: signedName,
            signed_at: authorizedAt,
            clauses,
            locale: p.locale === 'th' ? 'th' : 'en',
            filled_by_staff: true,
            staff_fill_staff_id: staffId,
            staff_fill_authorized_at: authorizedAt,
            staff_fill_authorization_note: note,
            staff_fill_evidence_url: evidence,
            staff_fill_staff_name: staffName,
            booking_id: bookingId,
          })
          .select('*')
          .single()
        if (error) throw error

        if (bookingId) {
          const { error: updErr } = await admin
            .from('tour_bookings')
            .update({
              waiver_signed: true,
              waiver_signed_at: authorizedAt,
            })
            .eq('id', bookingId)
          if (updErr) throw updErr
        }

        return json({ data })
      }

      case 'issue_waiver_link': {
        const { bookingId } = params as { bookingId?: string }
        if (!bookingId) return json({ error: 'invalid_params' }, 400)
        const { data: booking, error: bookingErr } = await admin
          .from('tour_bookings')
          .select('id, waiver_token, cancelled_at')
          .eq('id', bookingId)
          .maybeSingle()
        if (bookingErr) throw bookingErr
        if (!booking) return json({ error: 'booking_not_found' }, 404)
        if (booking.cancelled_at) return json({ error: 'booking_cancelled' }, 409)

        let token =
          typeof booking.waiver_token === 'string' && booking.waiver_token.trim()
            ? booking.waiver_token.trim()
            : ''
        if (!token) {
          for (let attempt = 0; attempt < 4 && !token; attempt++) {
            const next = randomWaiverToken()
            const { data: updated, error: updErr } = await admin
              .from('tour_bookings')
              .update({ waiver_token: next })
              .eq('id', bookingId)
              .is('waiver_token', null)
              .select('waiver_token')
              .maybeSingle()
            if (updErr) {
              if (updErr.code !== '23505') throw updErr
              continue
            }
            if (typeof updated?.waiver_token === 'string' && updated.waiver_token) {
              token = updated.waiver_token
              break
            }
          }
          if (!token) {
            const { data: again, error: againErr } = await admin
              .from('tour_bookings')
              .select('waiver_token')
              .eq('id', bookingId)
              .maybeSingle()
            if (againErr) throw againErr
            token = typeof again?.waiver_token === 'string' ? again.waiver_token : ''
          }
        }
        if (!token) return json({ error: 'token_failed' }, 500)
        return json({ data: { token, path: `/waiver/${token}` } })
      }

      case 'get_waiver_record': {
        const { bookingId } = params as { bookingId?: string }
        if (!bookingId) return json({ error: 'invalid_params' }, 400)
        const { data: booking, error: bookingErr } = await admin
          .from('tour_bookings')
          .select(
            'id, trip_code, booking_reference, first_name_en, last_name_en, waiver_signed, waiver_signed_at',
          )
          .eq('id', bookingId)
          .maybeSingle()
        if (bookingErr) throw bookingErr
        if (!booking) return json({ error: 'booking_not_found' }, 404)
        const { data: waiver, error: wErr } = await admin
          .from('waiver_signatures')
          .select('*')
          .eq('booking_id', bookingId)
          .order('signed_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (wErr) throw wErr
        return json({
          data: {
            booking,
            waiver: waiver ?? null,
          },
        })
      }

      case 'list_waivers_for_tour': {
        const { tripCode } = params as { tripCode?: string }
        if (!tripCode) return json({ error: 'invalid_params' }, 400)
        const { data, error } = await admin
          .from('waiver_signatures')
          .select('*')
          .eq('trip_code', tripCode)
          .order('signed_at', { ascending: false })
        if (error) throw error
        return json({ data })
      }

      case 'delete_waiver_signature': {
        // OWNER hard-delete for mistaken/test staff-assisted (or any) waiver
        // rows. No other tables FK → waiver_signatures. If linked to a booking,
        // clear booking.waiver_signed* only when no other signature remains for
        // that booking (avoid stranding a valid customer self-sign).
        const { id } = params as { id?: string }
        if (!id) return json({ error: 'invalid_params' }, 400)

        const { data: existing, error: existingErr } = await admin
          .from('waiver_signatures')
          .select('id, booking_id, staff_fill_evidence_url')
          .eq('id', id)
          .maybeSingle()
        if (existingErr) throw existingErr
        if (!existing) return json({ error: 'not_found' }, 404)

        const bookingId =
          typeof existing.booking_id === 'string' && existing.booking_id
            ? existing.booking_id
            : null

        const { error: delErr } = await admin.from('waiver_signatures').delete().eq('id', id)
        if (delErr) throw delErr

        if (bookingId) {
          const { data: remaining, error: remErr } = await admin
            .from('waiver_signatures')
            .select('id')
            .eq('booking_id', bookingId)
            .limit(1)
          if (remErr) throw remErr
          if (!remaining || remaining.length === 0) {
            const { error: clrErr } = await admin
              .from('tour_bookings')
              .update({ waiver_signed: false, waiver_signed_at: null })
              .eq('id', bookingId)
            if (clrErr) throw clrErr
          }
        }

        // Best-effort: remove staff evidence from payment-slips if path is ours.
        const evidence =
          typeof existing.staff_fill_evidence_url === 'string'
            ? existing.staff_fill_evidence_url
            : ''
        const marker = '/payment-slips/'
        const idx = evidence.indexOf(marker)
        let objectPath = ''
        if (idx >= 0) {
          objectPath = evidence.slice(idx + marker.length).split('?')[0]
        } else if (evidence.startsWith('waiver-auth/')) {
          objectPath = evidence
        }
        if (objectPath.startsWith('waiver-auth/')) {
          try {
            await admin.storage.from('payment-slips').remove([objectPath])
          } catch {
            // ignore storage cleanup failures
          }
        }

        return json({ ok: true })
      }

      case 'list_outbound_queue': {
        const { status } = params as { status?: string }
        let q = admin
          .from('staff_outbound_queue')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
        if (status === 'pending' || status === 'done' || status === 'skipped') {
          q = q.eq('status', status)
        }
        const { data, error } = await q
        if (error) throw error
        return json({ data })
      }

      case 'complete_outbound': {
        const { id, status } = params as { id?: string; status?: string }
        if (!id) return json({ error: 'invalid_params' }, 400)
        const next = status === 'skipped' ? 'skipped' : 'done'
        const staffName =
          (typeof session.full_name === 'string' && session.full_name.trim()) || 'Staff'
        const { data, error } = await admin
          .from('staff_outbound_queue')
          .update({
            status: next,
            completed_at: new Date().toISOString(),
            completed_by: staffName,
          })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'list_photos_pending': {
        // Ended trips with highlight and/or full album still outstanding.
        const today = new Date().toISOString().slice(0, 10)
        const { data: tours, error: tErr } = await admin
          .from('tours')
          // Production tours use departure_date (next_date was a legacy V5 column).
          .select('id, trip_code, name_en, departure_date, duration_days')
        if (tErr) throw tErr

        const endedCodes: string[] = []
        const tourMeta = new Map<string, Record<string, unknown>>()
        for (const t of tours ?? []) {
          const dep = String(t.departure_date || '').slice(0, 10)
          if (!dep || dep > today) continue
          const days = Math.max(1, Number(t.duration_days ?? 1))
          const end = new Date(dep + 'T00:00:00Z')
          end.setUTCDate(end.getUTCDate() + days - 1)
          const endStr = end.toISOString().slice(0, 10)
          if (endStr <= today) {
            endedCodes.push(String(t.trip_code))
            tourMeta.set(String(t.trip_code), { ...t, end_date: endStr })
          }
        }

        if (endedCodes.length === 0) return json({ data: [] })

        const { data: bookings, error } = await admin
          .from('tour_bookings')
          .select(
            'id, trip_code, first_name_en, last_name_en, email, phone, photos_delivered, photos_delivered_at, highlight_photos_delivered, highlight_photos_delivered_at, full_photos_delivered, full_photos_delivered_at, gallery_link, booking_status, cancelled_at',
          )
          .in('trip_code', endedCodes)
          .is('cancelled_at', null)
          .neq('booking_status', 'cancelled')
          .or('highlight_photos_delivered.eq.false,full_photos_delivered.eq.false')
        if (error) throw error

        return json({
          data: (bookings ?? []).map((b: Record<string, unknown>) => ({
            ...b,
            tour: tourMeta.get(String(b.trip_code)) ?? null,
          })),
        })
      }

      case 'mark_photos_delivered': {
        const { bookingId, galleryLink, tripCode, allOnTrip, stage } = params as {
          bookingId?: string
          galleryLink?: string
          tripCode?: string
          allOnTrip?: boolean
          stage?: 'highlight' | 'full'
        }
        const now = new Date().toISOString()
        const which = stage === 'highlight' ? 'highlight' : 'full'
        const payload: Record<string, unknown> = {}
        if (which === 'highlight') {
          payload.highlight_photos_delivered = true
          payload.highlight_photos_delivered_at = now
        } else {
          payload.full_photos_delivered = true
          payload.full_photos_delivered_at = now
          // Keep legacy flag for Phase H review cron (fires after full delivery).
          payload.photos_delivered = true
          payload.photos_delivered_at = now
        }
        if (typeof galleryLink === 'string' && galleryLink.trim()) {
          payload.gallery_link = galleryLink.trim()
        }

        if (allOnTrip && tripCode) {
          const { data, error } = await admin
            .from('tour_bookings')
            .update(payload)
            .eq('trip_code', tripCode)
            .is('cancelled_at', null)
            .neq('booking_status', 'cancelled')
            .select('id')
          if (error) throw error
          return json({ data: { updated: data?.length ?? 0 } })
        }

        if (!bookingId) return json({ error: 'invalid_params' }, 400)
        const { data, error } = await admin
          .from('tour_bookings')
          .update(payload)
          .eq('id', bookingId)
          .select()
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'customer_loyalty': {
        const { email, phone } = params as { email?: string; phone?: string }
        const e = (email ?? '').trim().toLowerCase()
        const p = (phone ?? '').trim()
        if (!e && !p) return json({ error: 'invalid_params' }, 400)

        let q = admin.from('tour_bookings').select('*').is('cancelled_at', null)
        if (e && p) {
          q = q.or(`email.ilike.${e},phone.eq.${p}`)
        } else if (e) {
          q = q.ilike('email', e)
        } else {
          q = q.eq('phone', p)
        }
        const { data, error } = await q.order('booked_at', { ascending: false })
        if (error) throw error

        const bookings = (data ?? []).filter(
          (b: { booking_status?: string }) => b.booking_status !== 'cancelled',
        )
        const trips = new Set(bookings.map((b: { trip_code: string }) => b.trip_code))
        const spend = bookings.reduce(
          (s: number, b: { amount_paid_aud?: number }) => s + Number(b.amount_paid_aud ?? 0),
          0,
        )
        return json({
          data: {
            trips_count: trips.size,
            bookings_count: bookings.length,
            total_spend_aud: spend,
            bookings,
          },
        })
      }

      case 'list_recent_logins': {
        const { data, error } = await admin
          .from('staff_sessions')
          .select('token, staff_id, role, full_name, created_at, expires_at, ip_address, user_agent')
          .order('created_at', { ascending: false })
          .limit(40)
        if (error) throw error
        // Never return raw token to UI — mask
        return json({
          data: (data ?? []).map((s: Record<string, unknown>) => ({
            staff_id: s.staff_id,
            role: s.role,
            full_name: s.full_name,
            created_at: s.created_at,
            expires_at: s.expires_at,
            ip_address: s.ip_address ?? null,
            user_agent: s.user_agent ?? null,
          })),
        })
      }

      case 'list_staff_profiles': {
        // OWNER-only roster for PIN reset UI — never return pin_hash.
        const { data, error } = await admin
          .from('staff_profiles')
          .select('id, full_name, role, active, created_at')
          .order('full_name', { ascending: true })
        if (error) throw error
        return json({ data: data ?? [] })
      }

      case 'owner_ops_metrics': {
        // Profit per trip (paid installments − trip expenses) + repeat customer rate
        const { data: payments, error: pErr } = await admin
          .from('booking_payments')
          .select('amount_aud, status, booking_id, tour_bookings!inner(trip_code, email, phone, cancelled_at, booking_status)')
          .eq('status', 'paid')
        if (pErr) throw pErr

        const { data: expenses, error: eErr } = await admin.from('expenses').select('*')
        if (eErr) throw eErr

        const revenueByTrip = new Map<string, number>()
        for (const row of payments ?? []) {
          const tb = row.tour_bookings as {
            trip_code?: string
            cancelled_at?: string | null
            booking_status?: string
          } | null
          if (!tb || tb.cancelled_at || tb.booking_status === 'cancelled') continue
          const code = String(tb.trip_code ?? 'unknown')
          revenueByTrip.set(code, (revenueByTrip.get(code) ?? 0) + Number(row.amount_aud ?? 0))
        }

        const expenseByTrip = new Map<string, number>()
        let expensesHaveTripLink = false
        for (const ex of expenses ?? []) {
          const code = (ex.trip_code as string | null)?.trim()
          if (code) {
            expensesHaveTripLink = true
            expenseByTrip.set(code, (expenseByTrip.get(code) ?? 0) + Number(ex.amount_aud ?? 0))
          }
        }

        const profit_per_trip = [...revenueByTrip.entries()].map(([trip_code, revenue_aud]) => {
          const expense_aud = expenseByTrip.get(trip_code) ?? 0
          return {
            trip_code,
            revenue_aud,
            expense_aud,
            profit_aud: revenue_aud - expense_aud,
          }
        }).sort((a, b) => b.profit_aud - a.profit_aud)

        // Repeat customer rate: bookings whose email/phone appeared on an earlier booking
        const { data: allBookings, error: bErr } = await admin
          .from('tour_bookings')
          .select('id, email, phone, booked_at, cancelled_at, booking_status')
          .order('booked_at', { ascending: true })
        if (bErr) throw bErr

        const seen = new Set<string>()
        let active = 0
        let repeats = 0
        for (const b of allBookings ?? []) {
          if (b.cancelled_at || b.booking_status === 'cancelled') continue
          active++
          const keys: string[] = []
          if (b.email?.trim()) keys.push(`e:${String(b.email).trim().toLowerCase()}`)
          if (b.phone?.trim()) keys.push(`p:${String(b.phone).trim()}`)
          const isRepeat = keys.some((k) => seen.has(k))
          if (isRepeat) repeats++
          for (const k of keys) seen.add(k)
        }

        return json({
          data: {
            profit_per_trip,
            expenses_linked_to_trips: expensesHaveTripLink,
            repeat_customer_rate:
              active > 0 ? Math.round((repeats / active) * 1000) / 10 : 0,
            repeat_bookings: repeats,
            active_bookings: active,
          },
        })
      }

      case 'mark_attendance': {
        const { id, attended } = params as { id: string; attended: boolean | null }
        if (!id) return json({ error: 'invalid_params' }, 400)
        const { error } = await admin.from('tour_bookings').update({ attended }).eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'record_payment': {
        // Records one installment against a booking (append-only ledger) and
        // bumps the booking's running total + status. Supports customers who
        // split the trip price into 2-4 payments — each call here is one of
        // those payments, and each gets its own tax invoice on the frontend.
        const { bookingId, amount, paymentMethod } = params as {
          bookingId: string
          amount: number
          paymentMethod?: string
        }
        if (!bookingId || !amount || amount <= 0) return json({ error: 'invalid_params' }, 400)

        const { data: booking, error: bookingError } = await admin
          .from('tour_bookings')
          .select('*')
          .eq('id', bookingId)
          .maybeSingle()
        if (bookingError) throw bookingError
        if (!booking) return json({ error: 'booking_not_found' }, 404)

        const { data: tour } = await admin
          .from('tours')
          .select('*')
          .eq('id', booking.tour_id)
          .maybeSingle()
        const priceAud = tour ? Number(tour.price_aud ?? 0) : 0

        const { count, error: countError } = await admin
          .from('booking_payments')
          .select('id', { count: 'exact', head: true })
          .eq('booking_id', bookingId)
        if (countError) throw countError
        const installmentNo = (count ?? 0) + 1
        const paidAt = new Date().toISOString()
        const staffId =
          typeof session.staff_id === 'string' && session.staff_id ? session.staff_id : null
        const invoiceNo = `T2T-INV-${booking.booking_reference ?? bookingId.slice(0, 8)}-${installmentNo}`
        const label =
          installmentNo === 1
            ? 'Deposit'
            : `Installment ${installmentNo}${booking.payment_plan_installments ? `/${booking.payment_plan_installments}` : ''}`

        const { data: payment, error: paymentError } = await admin
          .from('booking_payments')
          .insert({
            booking_id: bookingId,
            amount_aud: amount,
            payment_method: paymentMethod ?? 'manual',
            installment_no: installmentNo,
            label,
            status: 'paid',
            paid_at: paidAt,
            receipt_invoice_number: invoiceNo,
            recorded_by_staff_id: staffId,
          })
          .select()
          .single()
        if (paymentError) throw paymentError

        const newTotal = Number(booking.amount_paid_aud ?? 0) + Number(amount)
        const newStatus = priceAud > 0 && newTotal >= priceAud ? 'fully_paid' : 'deposit_paid'

        const { error: updateError } = await admin
          .from('tour_bookings')
          .update({ amount_paid_aud: newTotal, booking_status: newStatus })
          .eq('id', bookingId)
        if (updateError) throw updateError

        return json({
          data: {
            payment,
            amount_paid_aud: newTotal,
            booking_status: newStatus,
            price_aud: priceAud,
            installment_no: installmentNo,
            installment_plan: booking.payment_plan_installments ?? null,
            receipt_invoice_number: invoiceNo,
          },
        })
      }

      case 'search_customer_payments': {
        // Find bookings by customer name; return each with payment history.
        const { query } = params as { query?: string }
        const q = (query ?? '').trim()
        if (q.length < 2) return json({ error: 'invalid_params' }, 400)

        const { data: bookings, error } = await admin
          .from('tour_bookings')
          .select('*')
          .or(
            `first_name_en.ilike.%${q}%,last_name_en.ilike.%${q}%,booking_reference.ilike.%${q}%,phone.ilike.%${q}%`,
          )
          .order('booked_at', { ascending: false })
          .limit(40)
        if (error) throw error

        const ids = (bookings ?? []).map((b: { id: string }) => b.id)
        let payments: Record<string, unknown>[] = []
        if (ids.length > 0) {
          const { data: pays, error: payErr } = await admin
            .from('booking_payments')
            .select('*')
            .in('booking_id', ids)
            .order('installment_no', { ascending: true })
          if (payErr) throw payErr
          payments = pays ?? []
        }

        const byBooking = new Map<string, Record<string, unknown>[]>()
        for (const p of payments) {
          const bid = String(p.booking_id)
          const list = byBooking.get(bid) ?? []
          list.push(p)
          byBooking.set(bid, list)
        }

        return json({
          data: (bookings ?? []).map((b: Record<string, unknown>) => ({
            booking: b,
            payments: byBooking.get(String(b.id)) ?? [],
          })),
        })
      }

      case 'add_pending_installment': {
        const { bookingId, amount, label, dueDate } = params as {
          bookingId?: string
          amount?: number
          label?: string
          dueDate?: string | null
        }
        if (!bookingId || !amount || amount <= 0) return json({ error: 'invalid_params' }, 400)

        const { count, error: countError } = await admin
          .from('booking_payments')
          .select('id', { count: 'exact', head: true })
          .eq('booking_id', bookingId)
        if (countError) throw countError
        const installmentNo = (count ?? 0) + 1

        const { data, error } = await admin
          .from('booking_payments')
          .insert({
            booking_id: bookingId,
            amount_aud: amount,
            payment_method: null,
            installment_no: installmentNo,
            label: (label ?? '').trim() || (installmentNo === 1 ? 'Deposit' : `Installment ${installmentNo}`),
            status: 'pending',
            due_date: dueDate || null,
            paid_at: null,
          })
          .select()
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'update_installment': {
        const p = params as {
          paymentId?: string
          amount?: number
          label?: string
          status?: string
          dueDate?: string | null
          paymentMethod?: string | null
          markPaid?: boolean
        }
        if (!p.paymentId) return json({ error: 'invalid_params' }, 400)

        const { data: existing, error: fetchErr } = await admin
          .from('booking_payments')
          .select('*')
          .eq('id', p.paymentId)
          .maybeSingle()
        if (fetchErr) throw fetchErr
        if (!existing) return json({ error: 'not_found' }, 404)

        const payload: Record<string, unknown> = {}
        if (p.amount !== undefined && p.amount > 0) payload.amount_aud = p.amount
        if (p.label !== undefined) payload.label = p.label.trim()
        if (p.dueDate !== undefined) payload.due_date = p.dueDate
        if (p.paymentMethod !== undefined) payload.payment_method = p.paymentMethod
        if (p.status && ['pending', 'paid', 'overdue'].includes(p.status)) {
          payload.status = p.status
        }

        const markingPaid =
          p.markPaid === true || p.status === 'paid'
        if (markingPaid && existing.status !== 'paid') {
          const paidAt = new Date().toISOString()
          const staffId =
            typeof session.staff_id === 'string' && session.staff_id ? session.staff_id : null
          payload.status = 'paid'
          payload.paid_at = paidAt
          payload.recorded_by_staff_id = staffId
          if (!existing.receipt_invoice_number) {
            payload.receipt_invoice_number = `T2T-INV-${existing.booking_id.slice(0, 8)}-${existing.installment_no}`
          }
          if (p.paymentMethod) payload.payment_method = p.paymentMethod
          else if (!existing.payment_method) payload.payment_method = 'manual'
        }

        const { data: updated, error: updErr } = await admin
          .from('booking_payments')
          .update(payload)
          .eq('id', p.paymentId)
          .select()
          .single()
        if (updErr) throw updErr

        // Recalc booking paid total from paid installments when status flips
        if (markingPaid || p.amount !== undefined) {
          const { data: allPays, error: sumErr } = await admin
            .from('booking_payments')
            .select('amount_aud, status')
            .eq('booking_id', existing.booking_id)
          if (sumErr) throw sumErr
          const paidTotal = (allPays ?? [])
            .filter((row: { status?: string }) => row.status === 'paid')
            .reduce((s: number, row: { amount_aud: number }) => s + Number(row.amount_aud ?? 0), 0)

          const { data: booking } = await admin
            .from('tour_bookings')
            .select('id, tour_id, amount_paid_aud')
            .eq('id', existing.booking_id)
            .maybeSingle()
          let priceAud = 0
          if (booking?.tour_id) {
            const { data: tour } = await admin
              .from('tours')
              .select('price_aud')
              .eq('id', booking.tour_id)
              .maybeSingle()
            priceAud = tour ? Number(tour.price_aud ?? 0) : 0
          }
          const newStatus =
            priceAud > 0 && paidTotal >= priceAud ? 'fully_paid' : paidTotal > 0 ? 'deposit_paid' : 'pending_payment'
          await admin
            .from('tour_bookings')
            .update({ amount_paid_aud: paidTotal, booking_status: newStatus })
            .eq('id', existing.booking_id)
        }

        return json({ data: updated })
      }

      case 'delete_payment_installment': {
        // OWNER/MANAGER only — hard-delete installment row for corrections/reprints.
        // Does NOT delete any generated invoice PDF/file (receipt is client-side;
        // receipt_invoice_number is only a string on this row).
        const { paymentId } = params as { paymentId?: string }
        if (!paymentId) return json({ error: 'invalid_params' }, 400)

        const { data: existing, error: fetchErr } = await admin
          .from('booking_payments')
          .select('*')
          .eq('id', paymentId)
          .maybeSingle()
        if (fetchErr) throw fetchErr
        if (!existing) return json({ error: 'not_found' }, 404)

        const bookingId = String(existing.booking_id)
        const amountAud = Number(existing.amount_aud ?? 0)
        const installmentNo = Number(existing.installment_no ?? 0)
        const receiptNo =
          typeof existing.receipt_invoice_number === 'string'
            ? existing.receipt_invoice_number
            : null

        const { error: delErr } = await admin
          .from('booking_payments')
          .delete()
          .eq('id', paymentId)
        if (delErr) throw delErr

        // Recalc booking paid total from remaining paid installments
        const { data: allPays, error: sumErr } = await admin
          .from('booking_payments')
          .select('amount_aud, status')
          .eq('booking_id', bookingId)
        if (sumErr) throw sumErr
        const paidTotal = (allPays ?? [])
          .filter((row: { status?: string }) => row.status === 'paid')
          .reduce((s: number, row: { amount_aud: number }) => s + Number(row.amount_aud ?? 0), 0)

        const { data: booking } = await admin
          .from('tour_bookings')
          .select('id, tour_id, amount_paid_aud, booking_status')
          .eq('id', bookingId)
          .maybeSingle()
        let priceAud = 0
        if (booking?.tour_id) {
          const { data: tour } = await admin
            .from('tours')
            .select('price_aud')
            .eq('id', booking.tour_id)
            .maybeSingle()
          priceAud = tour ? Number(tour.price_aud ?? 0) : 0
        }
        const newStatus =
          paidTotal <= 0
            ? 'pending_payment'
            : priceAud > 0 && paidTotal >= priceAud
              ? 'fully_paid'
              : 'deposit_paid'

        const { data: updatedBooking, error: bookErr } = await admin
          .from('tour_bookings')
          .update({ amount_paid_aud: paidTotal, booking_status: newStatus })
          .eq('id', bookingId)
          .select('*')
          .single()
        if (bookErr) throw bookErr

        const staffId =
          typeof session.staff_id === 'string' && session.staff_id ? session.staff_id : null
        const { error: auditErr } = await admin.from('staff_financial_audit').insert({
          staff_id: staffId,
          staff_role: session.role ?? null,
          staff_name: session.full_name ?? null,
          action: 'delete_payment_installment',
          entity_type: 'booking_payment',
          entity_id: paymentId,
          booking_id: bookingId,
          amount_aud: amountAud,
          installment_no: installmentNo,
          receipt_invoice_number: receiptNo,
          detail: {
            label: existing.label ?? null,
            status: existing.status ?? null,
            paid_at: existing.paid_at ?? null,
            payment_method: existing.payment_method ?? null,
          },
        })
        if (auditErr) {
          // Deletion already committed — surface audit failure in logs but still return success
          console.error('[delete_payment_installment] audit insert failed', auditErr)
        }

        const { data: payments, error: listErr } = await admin
          .from('booking_payments')
          .select('*')
          .eq('booking_id', bookingId)
          .order('installment_no', { ascending: true })
        if (listErr) throw listErr

        return json({
          data: {
            deleted_id: paymentId,
            booking: updatedBooking,
            payments: payments ?? [],
          },
        })
      }

      case 'installment_income_summary': {
        // Owner-only income from paid installments — AU tax year 1 Jul–30 Jun.
        const { mode, year, month, tripCode } = params as {
          mode?: 'month' | 'trip' | 'tax_year'
          year?: number
          month?: number
          tripCode?: string
        }
        const y = Number(year) || new Date().getFullYear()
        let startIso: string
        let endIso: string
        if (mode === 'tax_year') {
          // AU tax year ending 30 Jun of `year` → 1 Jul (year-1) to 30 Jun year
          startIso = `${y - 1}-07-01T00:00:00.000Z`
          endIso = `${y}-07-01T00:00:00.000Z`
        } else if (mode === 'month' && month) {
          const m = String(month).padStart(2, '0')
          startIso = `${y}-${m}-01T00:00:00.000Z`
          const nextM = month === 12 ? 1 : month + 1
          const nextY = month === 12 ? y + 1 : y
          endIso = `${nextY}-${String(nextM).padStart(2, '0')}-01T00:00:00.000Z`
        } else {
          startIso = `${y}-01-01T00:00:00.000Z`
          endIso = `${y + 1}-01-01T00:00:00.000Z`
        }

        let q = admin
          .from('booking_payments')
          .select('*, tour_bookings!inner(trip_code, first_name_en, last_name_en, booking_reference)')
          .eq('status', 'paid')
          .gte('paid_at', startIso)
          .lt('paid_at', endIso)

        if (mode === 'trip' && tripCode) {
          q = q.eq('tour_bookings.trip_code', tripCode)
        }

        const { data, error } = await q.order('paid_at', { ascending: false })
        if (error) throw error

        const rows = data ?? []
        const total = rows.reduce(
          (s: number, r: { amount_aud?: number }) => s + Number(r.amount_aud ?? 0),
          0,
        )
        const byTrip = new Map<string, number>()
        for (const r of rows as Array<{ amount_aud?: number; tour_bookings?: { trip_code?: string } }>) {
          const code = r.tour_bookings?.trip_code ?? 'unknown'
          byTrip.set(code, (byTrip.get(code) ?? 0) + Number(r.amount_aud ?? 0))
        }

        // Expenses in the same period (by expense_date) for profit-per-trip that
        // matches Total paid income / By trip — not all-time owner_ops_metrics.
        const { data: expenses, error: expErr } = await admin
          .from('expenses')
          .select('amount_aud, trip_code, expense_date')
          .gte('expense_date', startIso.slice(0, 10))
          .lt('expense_date', endIso.slice(0, 10))
        if (expErr) throw expErr

        const expenseByTrip = new Map<string, number>()
        let expensesHaveTripLink = false
        for (const ex of expenses ?? []) {
          const code = (ex.trip_code as string | null)?.trim()
          if (code) {
            expensesHaveTripLink = true
            expenseByTrip.set(code, (expenseByTrip.get(code) ?? 0) + Number(ex.amount_aud ?? 0))
          }
        }

        const tripCodes = new Set([...byTrip.keys(), ...expenseByTrip.keys()])
        const profit_per_trip = [...tripCodes]
          .map((trip_code) => {
            const revenue_aud = byTrip.get(trip_code) ?? 0
            const expense_aud = expenseByTrip.get(trip_code) ?? 0
            return {
              trip_code,
              revenue_aud,
              expense_aud,
              profit_aud: revenue_aud - expense_aud,
            }
          })
          .sort((a, b) => b.profit_aud - a.profit_aud)

        return json({
          data: {
            total_aud: total,
            count: rows.length,
            by_trip: [...byTrip.entries()].map(([trip_code, amount_aud]) => ({
              trip_code,
              amount_aud,
            })),
            profit_per_trip,
            expenses_linked_to_trips: expensesHaveTripLink,
            payments: rows,
            range: { start: startIso, end: endIso, mode: mode ?? 'year', year: y, month },
          },
        })
      }

      case 'update_booking_details': {
        // Fixes typos entered at booking time (name/phone/email) — does NOT
        // touch payment amounts, status, or seat counts. Staff use this when
        // a customer's name was misspelled so the tax invoice/receipt can be
        // reissued correctly. Also supports travel_date override for invoices.
        const { id, first_name_en, last_name_en, phone, email, travel_date } = params as {
          id: string
          first_name_en?: string
          last_name_en?: string
          phone?: string
          email?: string
          travel_date?: string | null
        }
        if (!id) return json({ error: 'invalid_params' }, 400)

        const { data: existing, error: existingErr } = await admin
          .from('tour_bookings')
          .select('id, travel_date, first_name_en, last_name_en, phone, email, trip_code')
          .eq('id', id)
          .maybeSingle()
        if (existingErr) throw existingErr
        if (!existing) return json({ error: 'not_found' }, 404)

        const payload: Record<string, unknown> = {}
        if (first_name_en !== undefined) payload.first_name_en = first_name_en.trim()
        if (last_name_en !== undefined) payload.last_name_en = last_name_en.trim()
        if (phone !== undefined) payload.phone = phone.trim()
        if (email !== undefined) payload.email = email.trim()
        if (travel_date !== undefined) {
          if (travel_date === null || travel_date === '') {
            payload.travel_date = null
          } else {
            const d = String(travel_date).trim().slice(0, 10)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
              return json({ error: 'invalid_travel_date' }, 400)
            }
            payload.travel_date = d
          }
        }

        if (Object.keys(payload).length === 0) return json({ error: 'invalid_params' }, 400)

        const { data, error } = await admin
          .from('tour_bookings')
          .update(payload)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error

        if (travel_date !== undefined) {
          const oldVal =
            existing.travel_date != null ? String(existing.travel_date).slice(0, 10) : null
          const newVal =
            data.travel_date != null ? String(data.travel_date).slice(0, 10) : null
          if (oldVal !== newVal) {
            const staffId =
              typeof session.staff_id === 'string' && session.staff_id ? session.staff_id : null
            const { error: auditErr } = await admin.from('staff_financial_audit').insert({
              staff_id: staffId,
              staff_role: session.role ?? null,
              staff_name: session.full_name ?? null,
              action: 'update_booking_travel_date',
              entity_type: 'tour_booking',
              entity_id: id,
              booking_id: id,
              detail: {
                trip_code: existing.trip_code ?? null,
                old_travel_date: oldVal,
                new_travel_date: newVal,
              },
            })
            if (auditErr) {
              console.error('[update_booking_details] travel_date audit failed', auditErr)
            }
          }
        }

        return json({ data })
      }

      case 'cancel_booking': {
        // Soft-cancel only — never deletes the row. Sets cancelled_at / by /
        // reason, flips booking_status to cancelled, and releases one seat so
        // the trip inventory stays accurate. Idempotent if already cancelled.
        const { id, reason } = params as { id: string; reason?: string }
        if (!id) return json({ error: 'invalid_params' }, 400)

        const { data: booking, error: bookingError } = await admin
          .from('tour_bookings')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (bookingError) throw bookingError
        if (!booking) return json({ error: 'booking_not_found' }, 404)

        if (booking.cancelled_at || booking.booking_status === 'cancelled') {
          return json({ data: booking })
        }

        const cancelledBy =
          (typeof session.full_name === 'string' && session.full_name.trim()) ||
          (typeof session.staff_id === 'string' && session.staff_id) ||
          'staff'
        const cancelReason =
          typeof reason === 'string' && reason.trim() ? reason.trim().slice(0, 500) : null

        const { data, error } = await admin
          .from('tour_bookings')
          .update({
            cancelled_at: new Date().toISOString(),
            cancelled_by: cancelledBy,
            cancel_reason: cancelReason,
            booking_status: 'cancelled',
          })
          .eq('id', id)
          .is('cancelled_at', null)
          .select()
          .maybeSingle()
        if (error) throw error

        // If a concurrent cancel won the race, re-fetch and return that row.
        const cancelled = data ?? booking
        if (data && booking.tour_id) {
          await admin.rpc('release_seat', {
            p_tour_id: booking.tour_id,
            p_seats_to_release: 1,
          })
        }

        if (!data) {
          const { data: again } = await admin.from('tour_bookings').select('*').eq('id', id).maybeSingle()
          return json({ data: again ?? cancelled })
        }

        // Phase I — notify next waitlist person (FIFO) via outbound queue
        try {
          const tripCode = String(booking.trip_code ?? '')
          if (tripCode) {
            const { data: nextWait } = await admin
              .from('waitlist_entries')
              .select('*')
              .eq('trip_code', tripCode)
              .eq('contacted', false)
              .is('notified_at', null)
              .order('created_at', { ascending: true })
              .limit(1)
              .maybeSingle()

            if (nextWait) {
              const SITE = 'https://trip2talk.com.au'
              const tripUrl = `${SITE}/trips/${encodeURIComponent(tripCode)}`
              const subject = `A seat opened — ${tripCode} — Trip2Talk`
              const bodyEn = [
                `Hi ${nextWait.name},`,
                '',
                `Good news — a seat opened on ${tripCode}.`,
                `Book soon: ${tripUrl}`,
                '',
                'Trip2Talk team',
              ].join('\n')
              const bodyTh = [
                `สวัสดีคุณ ${nextWait.name}`,
                '',
                `มีที่ว่างในทริป ${tripCode} แล้ว`,
                `จองด่วน: ${tripUrl}`,
              ].join('\n')
              const gmailParams = new URLSearchParams({
                view: 'cm',
                fs: '1',
                authuser: 'trip2talksyd@gmail.com',
                su: subject,
                body: `${bodyEn}\n\n---\n${bodyTh}`,
              })
              if (nextWait.email) gmailParams.set('to', nextWait.email)

              await admin.from('staff_outbound_queue').insert({
                kind: 'waitlist_spot',
                waitlist_id: nextWait.id,
                trip_code: tripCode,
                customer_name: nextWait.name,
                customer_email: nextWait.email,
                customer_phone: nextWait.phone,
                subject,
                body_en: bodyEn,
                body_th: bodyTh,
                deep_link: tripUrl,
                messenger_url: 'https://m.me/TriptoTalk',
                gmail_url: `https://mail.google.com/mail/?${gmailParams.toString()}`,
                status: 'pending',
              })
              await admin
                .from('waitlist_entries')
                .update({ notified_at: new Date().toISOString() })
                .eq('id', nextWait.id)
            }
          }
        } catch (waitErr) {
          console.error('[cancel_booking] waitlist notify failed', waitErr)
        }

        return json({ data })
      }

      case 'list_payments_for_booking': {
        const { bookingId } = params as { bookingId: string }
        if (!bookingId) return json({ error: 'invalid_params' }, 400)
        const { data, error } = await admin
          .from('booking_payments')
          .select('*')
          .eq('booking_id', bookingId)
          .order('installment_no', { ascending: true })
        if (error) throw error
        return json({ data })
      }

      case 'delete_tour': {
        // Permanent delete — OWNER only, and only for trips that never had a
        // real booking (test/example rows). Anything with bookings must be
        // archived instead so tax/audit history stays intact.
        const { id } = params as { id: string }
        if (!id) return json({ error: 'invalid_params' }, 400)

        const { data: bookingRows, error: bookingError } = await admin
          .from('tour_bookings')
          .select('id')
          .eq('tour_id', id)
          .limit(1)
        if (bookingError) throw bookingError
        if (bookingRows && bookingRows.length > 0) {
          return json({ error: 'has_bookings' }, 409)
        }

        const { error } = await admin.from('tours').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'archive_tour': {
        // Soft-hide — OWNER only. Keeps the row + bookings; removes from
        // public listings and default staff "Upcoming" lists.
        const { id } = params as { id: string }
        if (!id) return json({ error: 'invalid_params' }, 400)

        const { data, error } = await admin
          .from('tours')
          .update({ status: 'archived' })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'unarchive_tour': {
        // Restore archived trip to a live listing status (default confirmed).
        const { id, status } = params as { id: string; status?: string }
        if (!id) return json({ error: 'invalid_params' }, 400)
        const next = status && ['draft', 'published', 'confirmed', 'completed'].includes(status)
          ? status
          : 'confirmed'

        const { data: existing, error: existingError } = await admin
          .from('tours')
          .select('id, status')
          .eq('id', id)
          .maybeSingle()
        if (existingError) throw existingError
        if (!existing) return json({ error: 'not_found' }, 404)
        if (String(existing.status).toLowerCase() !== 'archived') {
          return json({ error: 'not_archived' }, 409)
        }

        const { data, error } = await admin
          .from('tours')
          .update({ status: next })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'update_tour_status': {
        // Soft-cancel/restore — keeps the row (and any bookings) intact for
        // accounting/tax records, unlike delete_tour. Used when a trip can't
        // run (weather, not enough people, etc.) so it should disappear from
        // public listings and staff dropdowns without losing its history.
        // Prefer archive_tour / unarchive_tour for OWNER housekeeping archives.
        const { id, status } = params as { id: string; status: string }
        if (!id || !status) return json({ error: 'invalid_params' }, 400)
        const allowed = ['draft', 'published', 'confirmed', 'completed', 'cancelled', 'archived']
        if (!allowed.includes(status)) return json({ error: 'invalid_status' }, 400)
        if (status === 'archived' && session.role !== 'OWNER') {
          return json({ error: 'forbidden' }, 403)
        }

        const { data, error } = await admin
          .from('tours')
          .update({ status })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'update_tour_itinerary': {
        const { id, itinerary } = params as { id: string; itinerary: unknown }
        if (!id) return json({ error: 'invalid_params' }, 400)

        let cleaned: Record<string, unknown>[] | null = null
        if (itinerary != null) {
          if (!Array.isArray(itinerary)) return json({ error: 'invalid_itinerary' }, 400)
          cleaned = []
          for (const raw of itinerary) {
            if (!raw || typeof raw !== 'object') continue
            const row = raw as Record<string, unknown>
            const day = Number(row.day)
            if (!Number.isFinite(day) || day < 1) continue
            cleaned.push({
              day,
              title_en: String(row.title_en ?? '').trim(),
              title_th: String(row.title_th ?? '').trim(),
              description_en: String(row.description_en ?? '').trim(),
              description_th: String(row.description_th ?? '').trim(),
            })
          }
          cleaned.sort((a, b) => Number(a.day) - Number(b.day))
          if (cleaned.length === 0) cleaned = null
        }

        const { data, error } = await admin
          .from('tours')
          .update({ itinerary: cleaned })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'update_tour_max_seats': {
        // OWNER-only capacity override after publish (e.g. one extra seat).
        // Always writes trip_capacity_changes — refuse the save if the audit insert fails.
        const { id, max_seats, reason } = params as {
          id?: string
          max_seats?: unknown
          reason?: unknown
        }
        if (!id) return json({ error: 'invalid_params' }, 400)

        const note = typeof reason === 'string' ? reason.trim() : ''
        if (note.length < 8) {
          return json(
            {
              error: 'reason_required',
              detail:
                'Reason is required (at least 8 characters) / ต้องระบุเหตุผลอย่างน้อย 8 ตัวอักษร',
            },
            400,
          )
        }
        if (note.length > 400) {
          return json(
            { error: 'reason_too_long', detail: 'Reason must be 400 characters or fewer' },
            400,
          )
        }

        const next = Number(max_seats)
        if (!Number.isInteger(next) || next < 1 || next > 99) {
          return json(
            {
              error: 'invalid_max_seats',
              detail: 'max_seats must be a whole number between 1 and 99 / ที่นั่งต้องเป็นจำนวนเต็ม 1–99',
            },
            400,
          )
        }

        const { data: existing, error: existingError } = await admin
          .from('tours')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (existingError) throw existingError
        if (!existing) return json({ error: 'not_found' }, 404)

        const booked = Number(existing.booked_seats ?? existing.current_pax ?? 0)
        const oldMax = Number(existing.max_seats ?? existing.max_pax ?? 0)
        if (next < booked) {
          return json(
            {
              error: 'below_booked_seats',
              detail: `Cannot set max_seats below booked_seats (${booked}) / ลดที่นั่งต่ำกว่าจำนวนที่จองแล้วไม่ได้ (${booked})`,
            },
            409,
          )
        }

        if (next === oldMax) {
          return json({ data: existing })
        }

        const patch: Record<string, unknown> = { max_seats: next }
        if ('max_pax' in existing) patch.max_pax = next

        const { data, error } = await admin
          .from('tours')
          .update(patch)
          .eq('id', id)
          .select()
          .single()
        if (error) {
          const msg = `${error.code ?? ''} ${error.message ?? ''}`
          if (error.code === '23514' || /booked_seats_within_limit/i.test(msg)) {
            return json(
              {
                error: 'below_booked_seats',
                detail: `Cannot set max_seats below booked_seats (${booked}) / ลดที่นั่งต่ำกว่าจำนวนที่จองแล้วไม่ได้ (${booked})`,
              },
              409,
            )
          }
          throw error
        }

        const staffId =
          typeof session.staff_id === 'string' && session.staff_id ? session.staff_id : null
        const { error: auditErr } = await admin.from('trip_capacity_changes').insert({
          tour_id: id,
          old_max_seats: oldMax,
          new_max_seats: next,
          reason: note,
          changed_by: staffId,
          changed_by_name:
            typeof session.full_name === 'string' && session.full_name.trim()
              ? session.full_name.trim()
              : null,
          changed_by_role: session.role ?? null,
        })
        if (auditErr) {
          console.error('[update_tour_max_seats] audit insert failed', auditErr)
          const revert: Record<string, unknown> = { max_seats: oldMax }
          if ('max_pax' in existing) revert.max_pax = oldMax
          await admin.from('tours').update(revert).eq('id', id)
          return json(
            {
              error: 'audit_failed',
              detail: 'Seat change was not saved because the audit log failed',
            },
            500,
          )
        }

        return json({ data })
      }

      case 'get_app_settings': {
        const { data, error } = await admin
          .from('app_settings')
          .select('ai_content_generation_enabled')
          .eq('id', 'default')
          .maybeSingle()
        if (error) throw error
        return json({
          data: {
            ai_content_generation_enabled: data?.ai_content_generation_enabled !== false,
          },
        })
      }

      case 'set_ai_content_generation': {
        const { enabled } = params as { enabled?: unknown }
        if (typeof enabled !== 'boolean') return json({ error: 'invalid_params' }, 400)
        const staffId =
          typeof session.staff_id === 'string' && session.staff_id ? session.staff_id : null
        const { data, error } = await admin
          .from('app_settings')
          .upsert(
            {
              id: 'default',
              ai_content_generation_enabled: enabled,
              updated_at: new Date().toISOString(),
              updated_by: staffId,
            },
            { onConflict: 'id' },
          )
          .select('ai_content_generation_enabled')
          .single()
        if (error) throw error
        return json({
          data: {
            ai_content_generation_enabled: data.ai_content_generation_enabled !== false,
          },
        })
      }

      case 'year_summary': {
        // Default AU tax year: year = ending 30 Jun → range 1 Jul (year-1) .. 30 Jun year.
        // mode: 'calendar' keeps Jan–Dec for legacy callers.
        const { year, mode } = params as { year: number; mode?: 'calendar' | 'tax_year' }
        const y = Number(year) || new Date().getFullYear()
        const useTaxYear = mode !== 'calendar'
        const start = useTaxYear
          ? `${y - 1}-07-01T00:00:00.000Z`
          : `${y}-01-01T00:00:00.000Z`
        const end = useTaxYear
          ? `${y}-07-01T00:00:00.000Z`
          : `${y + 1}-01-01T00:00:00.000Z`
        const expenseStart = start.slice(0, 10)
        const expenseEnd = end.slice(0, 10)

        const [bookingsRes, expensesRes] = await Promise.all([
          admin
            .from('tour_bookings')
            .select('*')
            .gte('booked_at', start)
            .lt('booked_at', end),
          admin
            .from('expenses')
            .select('*')
            .gte('expense_date', expenseStart)
            .lt('expense_date', expenseEnd),
        ])
        if (bookingsRes.error) throw bookingsRes.error
        if (expensesRes.error) throw expensesRes.error

        return json({
          data: {
            bookings: bookingsRes.data,
            expenses: expensesRes.data,
            range: { start, end, mode: useTaxYear ? 'tax_year' : 'calendar', year: y },
          },
        })
      }

      case 'list_draft_content_posts': {
        const { data, error } = await admin
          .from('content_posts')
          .select(CONTENT_POST_SELECT)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
        if (error) throw error
        return json({ data })
      }

      case 'list_manual_pending_content_posts': {
        const { data, error } = await admin
          .from('content_posts')
          .select(CONTENT_POST_SELECT)
          .eq('status', 'approved_pending_manual_post')
          .order('updated_at', { ascending: false })
        if (error) throw error
        return json({ data })
      }

      case 'update_content_post': {
        // Approve routing by target_account:
        //   trip2talk_page / chapter99_page → Graph /feed|photos auto-publish → posted
        //   group_thaiaus → approved_pending_manual_post (NO Graph)
        const {
          id,
          status,
          selected_headline,
          caption_fb,
          photo_urls,
        } = params as {
          id: string
          status: string
          selected_headline?: string
          caption_fb?: string
          photo_urls?: string[]
        }
        if (!id || !status) return json({ error: 'invalid_params' }, 400)
        if (
          status !== 'approved' &&
          status !== 'approved_pending_manual_post' &&
          status !== 'rejected'
        ) {
          return json({ error: 'invalid_status' }, 400)
        }

        const { data: existing, error: existingErr } = await admin
          .from('content_posts')
          .select('id, status, target_account, group_id')
          .eq('id', id)
          .eq('status', 'draft')
          .maybeSingle()
        if (existingErr) throw existingErr
        if (!existing) return json({ error: 'not_found' }, 404)

        if (status === 'rejected') {
          const { data, error } = await admin
            .from('content_posts')
            .update({ status: 'rejected' })
            .eq('id', id)
            .eq('status', 'draft')
            .select('id, status, target_account')
            .maybeSingle()
          if (error) throw error
          if (!data) return json({ error: 'not_found' }, 404)
          return json({ data })
        }

        if (!existing.target_account) {
          return json({ error: 'target_account_required' }, 400)
        }
        if (!selected_headline || typeof selected_headline !== 'string') {
          return json({ error: 'invalid_params' }, 400)
        }
        if (typeof caption_fb !== 'string') {
          return json({ error: 'invalid_params' }, 400)
        }
        if (!Array.isArray(photo_urls) || photo_urls.length < 1 || photo_urls.length > 4) {
          return json({ error: 'invalid_params' }, 400)
        }
        const badPhoto = photo_urls.find(
          (u) =>
            typeof u !== 'string' ||
            !/^https?:\/\//i.test(u.trim()) ||
            /placehold\.co|via\.placeholder\.com|dummyimage\.com|picsum\.photos/i.test(u),
        )
        if (badPhoto) {
          return json(
            {
              error: 'invalid_photo_urls',
              hint: 'photo_urls must be real https image URLs (placeholders not allowed)',
            },
            400,
          )
        }

        const account = existing.target_account as ContentTargetAccount
        const message = [selected_headline.trim(), caption_fb.trim()]
          .filter(Boolean)
          .join('\n\n')

        // Manual destinations — never call Graph
        if (isManualTargetAccount(account)) {
          const { data, error } = await admin
            .from('content_posts')
            .update({
              status: 'approved_pending_manual_post',
              selected_headline,
              caption_fb,
              photo_urls,
              group_id:
                account === 'group_thaiaus'
                  ? existing.group_id || '1631889741218502'
                  : existing.group_id,
            })
            .eq('id', id)
            .eq('status', 'draft')
            .select('id, status, target_account, group_id')
            .maybeSingle()
          if (error) throw error
          if (!data) return json({ error: 'not_found' }, 404)
          return json({ data })
        }

        // Page auto-publish via Graph
        const creds = resolvePageCredentials(account)
        if (!creds) {
          return json(
            {
              error: 'meta_credentials_missing',
              hint:
                account === 'trip2talk_page'
                  ? 'Set FACEBOOK_PAGE_ID_TRIP2TALK + FACEBOOK_PAGE_ACCESS_TOKEN_TRIP2TALK'
                  : 'Set FACEBOOK_PAGE_ID + FACEBOOK_PAGE_ACCESS_TOKEN',
            },
            503,
          )
        }

        let graph: { facebook_post_id: string; facebook_post_url: string }
        try {
          graph = await publishToFacebookPage({
            pageId: creds.pageId,
            accessToken: creds.accessToken,
            message,
            imageUrls: photo_urls,
          })
        } catch (graphErr) {
          console.error('[staff-api] Graph publish failed', graphErr)
          const detail =
            graphErr instanceof Error ? graphErr.message : String(graphErr)
          const hint =
            graphErr instanceof FacebookPublishError ? graphErr.hint : undefined
          // 422 (not 502): Facebook rejected the post — avoid looking like a gateway crash
          return json(
            {
              error: 'graph_publish_failed',
              detail,
              hint: hint ?? null,
              message: hint ? `${detail} (${hint})` : detail,
            },
            422,
          )
        }

        const { data, error } = await admin
          .from('content_posts')
          .update({
            status: 'posted',
            selected_headline,
            caption_fb,
            photo_urls,
            facebook_post_id: graph.facebook_post_id,
            facebook_post_url: graph.facebook_post_url,
            posted_at: new Date().toISOString(),
            page_id: creds.pageId,
          })
          .eq('id', id)
          .eq('status', 'draft')
          .select(
            'id, status, target_account, facebook_post_id, facebook_post_url, posted_at',
          )
          .maybeSingle()
        if (error) throw error
        if (!data) return json({ error: 'not_found' }, 404)
        return json({ data })
      }

      case 'mark_content_post_posted': {
        const { id } = params as { id: string }
        if (!id) return json({ error: 'invalid_params' }, 400)

        const { data, error } = await admin
          .from('content_posts')
          .update({
            status: 'posted',
            posted_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('status', 'approved_pending_manual_post')
          .select('id, status, posted_at, target_account')
          .maybeSingle()
        if (error) throw error
        if (!data) return json({ error: 'not_found' }, 404)
        return json({ data })
      }

      case 'insert_content_post': {
        const {
          post_type,
          trip_id,
          photo_urls,
          headline_options,
          caption_fb,
          status,
          target_account,
          group_id,
        } = params as {
          post_type?: string
          trip_id?: string | null
          photo_urls?: string[]
          headline_options?: string[]
          caption_fb?: string
          status?: string
          target_account?: string
          group_id?: string | null
        }
        const postType = post_type ?? 'value_content'
        if (postType !== 'value_content' && postType !== 'trip_promo') {
          return json({ error: 'invalid_post_type' }, 400)
        }
        if (!target_account || !VALID_TARGET_ACCOUNTS.includes(target_account as ContentTargetAccount)) {
          return json({ error: 'target_account_required' }, 400)
        }
        if (!Array.isArray(photo_urls) || photo_urls.length < 1) {
          return json({ error: 'invalid_params' }, 400)
        }
        if (!Array.isArray(headline_options) || headline_options.length < 1) {
          return json({ error: 'invalid_params' }, 400)
        }
        if (typeof caption_fb !== 'string') {
          return json({ error: 'invalid_params' }, 400)
        }

        const account = target_account as ContentTargetAccount
        const row: Record<string, unknown> = {
          post_type: postType,
          trip_id: postType === 'value_content' ? null : trip_id ?? null,
          photo_urls,
          headline_options,
          caption_fb,
          status: status ?? 'draft',
          target_account: account,
          group_id:
            account === 'group_thaiaus'
              ? group_id || '1631889741218502'
              : group_id ?? null,
        }
        if (postType === 'trip_promo' && !row.trip_id) {
          return json({ error: 'trip_id_required' }, 400)
        }

        const { data, error } = await admin
          .from('content_posts')
          .insert(row)
          .select('id, post_type, status, target_account, created_at')
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'probe_facebook_page_creds': {
        // OWNER diagnostics — never returns the raw token.
        const account = ((params as { account?: string }).account ||
          'trip2talk_page') as ContentTargetAccount
        if (!VALID_TARGET_ACCOUNTS.includes(account) || isManualTargetAccount(account)) {
          return json({ error: 'invalid_params' }, 400)
        }
        const creds = resolvePageCredentials(account)
        if (!creds) {
          return json(
            {
              error: 'meta_credentials_missing',
              account,
              page_id_set: false,
              token_set: false,
            },
            503,
          )
        }
        const tokenTail = creds.accessToken.slice(-6)
        const meRes = await fetch(
          `${GRAPH_BASE}/me?fields=id,name&access_token=${encodeURIComponent(creds.accessToken)}`,
        )
        const meJson = (await meRes.json()) as {
          id?: string
          name?: string
          error?: { message?: string; code?: number; error_subcode?: number }
        }
        const pageRes = await fetch(
          `${GRAPH_BASE}/${creds.pageId}?fields=id,name&access_token=${encodeURIComponent(creds.accessToken)}`,
        )
        const pageJson = (await pageRes.json()) as {
          id?: string
          name?: string
          error?: { message?: string; code?: number; error_subcode?: number }
        }
        const accountsRes = await fetch(
          `${GRAPH_BASE}/me/accounts?fields=id,name,access_token,tasks&access_token=${encodeURIComponent(creds.accessToken)}`,
        )
        const accountsJson = (await accountsRes.json()) as {
          data?: Array<{ id?: string; name?: string; tasks?: string[]; access_token?: string }>
          error?: { message?: string; code?: number }
        }
        const pages = (accountsJson.data ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          tasks: p.tasks ?? [],
          has_page_token: Boolean(p.access_token),
          is_configured_page: p.id === creds.pageId,
        }))
        const configured = pages.find((p) => p.is_configured_page)
        const looksLikeUserToken = Boolean(meJson.id && meJson.id !== creds.pageId)
        return json({
          data: {
            account,
            configured_page_id: creds.pageId,
            token_tail: tokenTail,
            token_length: creds.accessToken.length,
            looks_like_user_token: looksLikeUserToken,
            me: meJson.error
              ? { ok: false, error: meJson.error.message, code: meJson.error.code }
              : { ok: true, id: meJson.id, name: meJson.name },
            page: pageJson.error
              ? {
                  ok: false,
                  error: pageJson.error.message,
                  code: pageJson.error.code,
                  error_subcode: pageJson.error.error_subcode,
                }
              : { ok: true, id: pageJson.id, name: pageJson.name },
            managed_pages: pages,
            accounts_error: accountsJson.error?.message ?? null,
            configured_page_tasks: configured?.tasks ?? null,
            can_publish: Boolean(
              pageJson.id &&
                !pageJson.error &&
                (!looksLikeUserToken ||
                  configured?.tasks?.some((t) =>
                    ['CREATE_CONTENT', 'MANAGE', 'MODERATE'].includes(t),
                  )),
            ),
            hint: looksLikeUserToken
              ? 'Secret looks like a User token. Paste the Page access_token from Graph /me/accounts for this Page into FACEBOOK_PAGE_ACCESS_TOKEN_TRIP2TALK.'
              : null,
          },
        })
      }

      case 'list_photo_spots_admin': {
        const { data, error } = await admin
          .from('photo_spots')
          .select('*')
          .order('sort_order', { ascending: true })
          .order('title_en', { ascending: true })
        if (error) throw error
        return json({ data: data ?? [] })
      }

      case 'upsert_photo_spot': {
        const spot = params as Record<string, unknown>
        const titleEn = typeof spot.title_en === 'string' ? spot.title_en.trim() : ''
        const titleTh = typeof spot.title_th === 'string' ? spot.title_th.trim() : ''
        const locationEn =
          typeof spot.location_en === 'string' ? spot.location_en.trim() : ''
        const locationTh =
          typeof spot.location_th === 'string' ? spot.location_th.trim() : ''
        const categories = Array.isArray(spot.categories)
          ? spot.categories.map((c) => String(c).trim()).filter(Boolean)
          : []
        const lat =
          spot.latitude == null || spot.latitude === ''
            ? null
            : Number(spot.latitude)
        const lng =
          spot.longitude == null || spot.longitude === ''
            ? null
            : Number(spot.longitude)

        if (!titleEn || !titleTh) return json({ error: 'name_required' }, 400)
        if (!locationEn || !locationTh) return json({ error: 'location_required' }, 400)
        if (categories.length < 1) return json({ error: 'category_required' }, 400)
        if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
          return json({ error: 'coordinates_required' }, 400)
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return json({ error: 'coordinates_invalid' }, 400)
        }

        const gallery = Array.isArray(spot.gallery_image_urls)
          ? spot.gallery_image_urls
              .map((u) => String(u).trim())
              .filter(Boolean)
              .slice(0, 4)
          : []
        const hero =
          typeof spot.hero_image_url === 'string' && spot.hero_image_url.trim()
            ? spot.hero_image_url.trim()
            : null
        const thumb =
          typeof spot.thumbnail_url === 'string' && spot.thumbnail_url.trim()
            ? spot.thumbnail_url.trim()
            : hero

        let slug =
          typeof spot.slug === 'string' && spot.slug.trim()
            ? spot.slug
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            : titleEn
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
        if (!slug) slug = `spot-${Date.now()}`

        const drone =
          spot.drone_allowed === 'allowed' ||
          spot.drone_allowed === 'restricted' ||
          spot.drone_allowed === 'prohibited'
            ? spot.drone_allowed
            : 'restricted'

        const tripCode =
          typeof spot.related_trip_code === 'string' && spot.related_trip_code.trim()
            ? spot.related_trip_code.trim()
            : null

        const row: Record<string, unknown> = {
          slug,
          title_en: titleEn,
          title_th: titleTh,
          location_en: locationEn,
          location_th: locationTh,
          description_en:
            typeof spot.description_en === 'string' ? spot.description_en.trim() || null : null,
          description_th:
            typeof spot.description_th === 'string' ? spot.description_th.trim() || null : null,
          categories,
          latitude: lat,
          longitude: lng,
          google_maps_url: `https://maps.google.com/?q=${lat},${lng}`,
          best_time: typeof spot.best_time === 'string' ? spot.best_time.trim() || null : null,
          best_season:
            typeof spot.best_season === 'string' ? spot.best_season.trim() || null : null,
          drive_time_from_sydney:
            typeof spot.drive_time_from_sydney === 'string'
              ? spot.drive_time_from_sydney.trim() || null
              : null,
          best_time_morning:
            typeof spot.best_time_morning === 'string'
              ? spot.best_time_morning.trim() || null
              : null,
          best_time_evening:
            typeof spot.best_time_evening === 'string'
              ? spot.best_time_evening.trim() || null
              : null,
          best_time_night:
            typeof spot.best_time_night === 'string'
              ? spot.best_time_night.trim() || null
              : null,
          access_private_car:
            typeof spot.access_private_car === 'string' ? spot.access_private_car : '',
          access_public_transport:
            typeof spot.access_public_transport === 'string'
              ? spot.access_public_transport.trim() || null
              : null,
          gear_landscape:
            typeof spot.gear_landscape === 'string' ? spot.gear_landscape.trim() || null : null,
          gear_portrait:
            typeof spot.gear_portrait === 'string' ? spot.gear_portrait.trim() || null : null,
          camera_settings:
            spot.camera_settings && typeof spot.camera_settings === 'object'
              ? spot.camera_settings
              : {},
          tips_en: typeof spot.tips_en === 'string' ? spot.tips_en.trim() || null : null,
          tips_th: typeof spot.tips_th === 'string' ? spot.tips_th.trim() || null : null,
          warnings_en:
            typeof spot.warnings_en === 'string' ? spot.warnings_en.trim() || null : null,
          warnings_th:
            typeof spot.warnings_th === 'string' ? spot.warnings_th.trim() || null : null,
          drone_allowed: drone,
          drone_notes:
            typeof spot.drone_notes === 'string' ? spot.drone_notes.trim() || null : null,
          related_trip_code: tripCode,
          linked_trip_code: tripCode,
          hero_image_url: hero,
          thumbnail_url: thumb,
          gallery_image_urls: gallery,
          is_featured: spot.is_featured === true,
          sort_order:
            spot.sort_order == null || spot.sort_order === ''
              ? 100
              : Number(spot.sort_order) || 100,
          review_notes:
            typeof spot.review_notes === 'string' ? spot.review_notes.trim() || null : null,
        }

        const id =
          typeof spot.id === 'string' && spot.id.trim() ? spot.id.trim() : null

        if (id) {
          const { data, error } = await admin
            .from('photo_spots')
            .update(row)
            .eq('id', id)
            .select('*')
            .maybeSingle()
          if (error) throw error
          if (!data) return json({ error: 'not_found' }, 404)
          return json({ data })
        }

        // Ensure unique slug for creates
        const { data: slugHit } = await admin
          .from('photo_spots')
          .select('id')
          .eq('slug', slug)
          .maybeSingle()
        if (slugHit) {
          row.slug = `${slug}-${Date.now().toString(36)}`
        }

        const { data, error } = await admin
          .from('photo_spots')
          .insert(row)
          .select('*')
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'delete_photo_spot': {
        const { id } = params as { id?: string }
        if (!id) return json({ error: 'invalid_params' }, 400)
        const { error } = await admin.from('photo_spots').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      default:
        return json({ error: 'unknown_action' }, 400)
    }
  } catch (err) {
    console.error(`[staff-api] action "${action}" failed`, err)
    return json({ error: 'server_error' }, 500)
  }
})
