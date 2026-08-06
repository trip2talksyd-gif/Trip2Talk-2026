import { supabase, supabaseConfig } from './supabase'
import { callStaffApi, clearStaffSession, StaffSessionExpiredError } from './supabaseStaff'
import { SeatsFullError } from '../types/errors'
import { deriveDatedTripCode, isSelectableBookableTour } from './tourSelectability'
import type {
  BookingPayment,
  ComplianceItem,
  ContentPost,
  Expense,
  StaffLoginRow,
  StaffOutboundItem,
  StaffRole,
  Tour,
  TourBooking,
  TourStatus,
  WaiverSignature,
  WaitlistEntry,
} from '../types/tour'

/** Featured trip families pinned to the top of home + /trips (by code prefix). */
export const TRIPS_LISTING_PRIORITY_PREFIXES = [
  'TAS-SP',
  'ULU-4D3N',
  'TAS-LH',
  'NZ-',
  'TAS-3D2N',
] as const

/** @deprecated Prefer TRIPS_LISTING_PRIORITY_PREFIXES — kept for older callers. */
export const TRIPS_LISTING_PRIORITY = ['TAS-3D2N', 'ULU-4D3N', 'NZ-6D5N'] as const

export { SeatsFullError } from '../types/errors'

function logSelectColumns(fn: string, table: string, columns: string): void {
  if (import.meta.env.DEV) {
    console.info(`[toursApi] ${fn} → ${table}.select(${columns})`)
  }
}

function logSupabaseError(context: string, error: unknown): void {
  if (error && typeof error === 'object') {
    const e = error as { message?: string; code?: string; details?: string; hint?: string }
    console.error(
      `[toursApi] ${context}: ${e.message ?? String(error)}${e.code ? ` [${e.code}]` : ''}${
        e.details ? ` — ${e.details}` : ''
      }`,
    )
    return
  }
  console.error(`[toursApi] ${context}:`, error)
}

async function releaseSeat(tourId: string, seatsToRelease = 1): Promise<void> {
  try {
    const { error } = await supabase.rpc('release_seat', {
      p_tour_id: tourId,
      p_seats_to_release: seatsToRelease,
    })
    if (error) {
      logSupabaseError(`release_seat rollback failed (tour ${tourId})`, error)
    }
  } catch (err) {
    logSupabaseError(`release_seat rollback failed (tour ${tourId})`, err)
  }
}

/**
 * Live production tours (created from supabase/2026-07-00-base-schema.sql) use
 * next_date / price_standard / max_pax / current_pax / deposit_amount.
 * Newer migrations use departure_date / price_aud / max_seats / booked_seats /
 * deposit_aud — but those migrations were never applied to production.
 * Normalize either shape into the Tour interface the UI expects.
 */
type TourRow = Record<string, unknown>

function num(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function strOrNull(value: unknown): string | null {
  if (value == null) return null
  const s = String(value).trim()
  return s.length ? s : null
}

function parseTourItinerary(value: unknown): Tour['itinerary'] {
  if (!Array.isArray(value) || value.length === 0) return null
  const days: NonNullable<Tour['itinerary']> = []
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue
    const row = raw as Record<string, unknown>
    const day = Number(row.day)
    const title_en = strOrNull(row.title_en) ?? ''
    const title_th = strOrNull(row.title_th) ?? ''
    const description_en = strOrNull(row.description_en) ?? ''
    const description_th = strOrNull(row.description_th) ?? ''
    if (!Number.isFinite(day) || day < 1) continue
    if (!title_en && !title_th && !description_en && !description_th) continue
    days.push({ day, title_en, title_th, description_en, description_th })
  }
  return days.length > 0 ? days.sort((a, b) => a.day - b.day) : null
}

export function normalizeTour(row: TourRow): Tour {
  const departure =
    strOrNull(row.departure_date) ?? strOrNull(row.next_date) ?? null

  const durationLabel = strOrNull(row.duration_label)
  const parsed = parseDurationLabel(durationLabel)
  const days =
    row.duration_days == null ? parsed.days : num(row.duration_days)
  const nights =
    row.duration_nights == null ? parsed.nights : num(row.duration_nights)

  return {
    id: String(row.id ?? ''),
    trip_code: String(row.trip_code ?? ''),
    name_en: String(row.name_en ?? ''),
    name_th: String(row.name_th ?? ''),
    description_en: strOrNull(row.description_en),
    description_th: strOrNull(row.description_th),
    duration_days: days,
    duration_nights: nights,
    trip_type: strOrNull(row.trip_type),
    duration_label: durationLabel,
    departure_date: departure,
    price_aud: num(row.price_aud ?? row.price_standard),
    deposit_aud: num(row.deposit_aud ?? row.deposit_amount, 100),
    max_seats: num(row.max_seats ?? row.max_pax, 6),
    booked_seats: num(row.booked_seats ?? row.current_pax),
    status: String(row.status ?? 'draft'),
    cover_image_url: strOrNull(row.cover_image_url),
    itinerary: parseTourItinerary(row.itinerary),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? row.created_at ?? ''),
  }
}

/** Parse ops labels like 4D3N, 1DAY, 2D1N, NIGHT → days/nights. */
function parseDurationLabel(label: string | null): { days: number | null; nights: number | null } {
  if (!label) return { days: null, nights: null }
  const u = label.toUpperCase().replace(/\s+/g, '')
  if (u === 'NIGHT' || u === 'EVENING') return { days: 1, nights: 0 }
  if (u.includes('1DAY') || u === '1D' || u === 'DAY') return { days: 1, nights: 0 }
  const m = u.match(/^(\d+)D(?:(\d+)N)?/)
  if (m) {
    return {
      days: Number(m[1]),
      nights: m[2] != null ? Number(m[2]) : 0,
    }
  }
  return { days: null, nights: null }
}

function normalizeTours(rows: TourRow[] | null | undefined): Tour[] {
  return (rows ?? []).map(normalizeTour)
}

/** Client-side date sort — avoids .order('departure_date') which 42703's on live DB. */
function sortByDepartureDate(tours: Tour[]): Tour[] {
  return [...tours].sort((a, b) => {
    if (!a.departure_date && !b.departure_date) return 0
    if (!a.departure_date) return 1
    if (!b.departure_date) return -1
    return a.departure_date.localeCompare(b.departure_date)
  })
}

function statusLower(tour: Tour): string {
  return (tour.status ?? '').toLowerCase()
}

export async function fetchFeaturedTours(limit = 3): Promise<Tour[]> {
  logSelectColumns('fetchFeaturedTours', 'tours', '*')
  try {
    // Do not .order('departure_date') — column does not exist on production (uses next_date).
    const { data, error } = await supabase.from('tours').select('*')

    if (error) {
      logSupabaseError('fetchFeaturedTours', error)
      throw error
    }
    const tours = sortByDepartureDate(normalizeTours(data as TourRow[])).filter((t) => {
      const s = statusLower(t)
      return (
        (s === 'confirmed' || s === 'published' || s === 'active') &&
        isSelectableBookableTour(t)
      )
    })
    return sortToursForListing(tours).slice(0, limit)
  } catch (err) {
    if (!(err && typeof err === 'object' && 'code' in err)) {
      logSupabaseError('fetchFeaturedTours', err)
    }
    throw err
  }
}

export async function fetchAllTours(): Promise<Tour[]> {
  logSelectColumns('fetchAllTours', 'tours', '*')
  try {
    const { data, error } = await supabase.from('tours').select('*')

    if (error) {
      logSupabaseError('fetchAllTours', error)
      throw error
    }
    const tours = sortByDepartureDate(normalizeTours(data as TourRow[])).filter((t) => {
      const s = statusLower(t)
      if (s === 'cancelled' || s === 'archived') return false
      // Public catalog: dated bookable instances only (templates stay for CMS resolve).
      return isSelectableBookableTour(t)
    })
    return tours
  } catch (err) {
    if (!(err && typeof err === 'object' && 'code' in err)) {
      logSupabaseError('fetchAllTours', err)
    }
    throw err
  }
}

/** Pin priority trip families first; preserve relative order for the rest. */
export function sortToursForListing(tours: Tour[]): Tour[] {
  function familyRank(code: string): number {
    const u = code.toUpperCase()
    const idx = TRIPS_LISTING_PRIORITY_PREFIXES.findIndex((p) => u.startsWith(p.toUpperCase()))
    return idx >= 0 ? idx : TRIPS_LISTING_PRIORITY_PREFIXES.length
  }
  return tours
    .map((tour, index) => ({ tour, index }))
    .sort((a, b) => {
      const aRank = familyRank(a.tour.trip_code)
      const bRank = familyRank(b.tour.trip_code)
      if (aRank !== bRank) return aRank - bRank
      return a.index - b.index
    })
    .map(({ tour }) => tour)
}

export async function fetchConfirmedTours(): Promise<Tour[]> {
  logSelectColumns('fetchConfirmedTours', 'tours', '*')
  try {
    const { data, error } = await supabase.from('tours').select('*')

    if (error) {
      logSupabaseError('fetchConfirmedTours', error)
      throw error
    }
    return sortByDepartureDate(normalizeTours(data as TourRow[])).filter((t) => {
      const s = statusLower(t)
      return s === 'confirmed' || s === 'published' || s === 'active'
    })
  } catch (err) {
    if (!(err && typeof err === 'object' && 'code' in err)) {
      logSupabaseError('fetchConfirmedTours', err)
    }
    throw err
  }
}

export async function fetchTourByCode(tripCode: string): Promise<Tour | null> {
  logSelectColumns('fetchTourByCode', 'tours', '*')
  try {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('trip_code', tripCode)
      .maybeSingle()

    if (error) {
      logSupabaseError(`fetchTourByCode (${tripCode})`, error)
      throw error
    }
    return data ? normalizeTour(data as TourRow) : null
  } catch (err) {
    if (!(err && typeof err === 'object' && 'code' in err)) {
      logSupabaseError(`fetchTourByCode (${tripCode})`, err)
    }
    throw err
  }
}

export async function fetchBookingsForTour(tourId: string): Promise<TourBooking[]> {
  return callStaffApi<TourBooking[]>('list_bookings_for_tour', { tourId })
}

export async function fetchPendingBookings(): Promise<TourBooking[]> {
  return callStaffApi<TourBooking[]>('list_pending_bookings')
}

export async function updateBookingStatus(
  id: string,
  status: TourBooking['booking_status'],
  amountPaid?: number,
): Promise<void> {
  await callStaffApi('update_booking_status', { id, status, amountPaid })
}

function isFailedToFetchError(err: unknown): boolean {
  if (err instanceof TypeError && /failed to fetch/i.test(err.message)) return true
  if (err && typeof err === 'object' && 'message' in err) {
    return /failed to fetch/i.test(String((err as { message: unknown }).message))
  }
  return false
}

async function insertWaiverSignatureOnce(
  signature: Omit<WaiverSignature, 'id' | 'created_at'>,
): Promise<void> {
  if (import.meta.env.DEV) {
    console.log('[insertWaiverSignature] before Supabase call', {
      supabaseUrl: supabaseConfig.url,
      anonKeyPresent: supabaseConfig.anonKey.length > 0,
      anonKeyLength: supabaseConfig.anonKey.length,
    })
  }

  try {
    // Prefer return=minimal — no anon SELECT (RLS Option C).
    const { error } = await supabase.from('waiver_signatures').insert(signature)

    if (error) {
      logSupabaseError('insertWaiverSignature', error)
      throw error
    }
  } catch (err) {
    if (!(err && typeof err === 'object' && 'code' in err)) {
      logSupabaseError('insertWaiverSignature', err)
    }
    throw err
  }
}

/** Inserts a waiver signature; retries once after 1s on "Failed to fetch" (paused Supabase wake-up). */
export async function insertWaiverSignature(
  signature: Omit<WaiverSignature, 'id' | 'created_at'>,
): Promise<void> {
  try {
    await insertWaiverSignatureOnce(signature)
  } catch (err) {
    if (!isFailedToFetchError(err)) throw err
    console.warn(
      '[insertWaiverSignature] Failed to fetch — retrying once after 1s (Supabase project may be waking from pause)',
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await insertWaiverSignatureOnce(signature)
  }
}

export type StaffAssistedWaiverInput = {
  trip_code: string
  signed_name: string
  clauses: string[]
  locale: 'en' | 'th'
  authorization_note: string
  evidence_url?: string | null
  booking_id?: string | null
  confirmed_customer_request: true
}

/** PIN-gated: staff records a customer-authorized waiver on their behalf. */
export async function createWaiverStaffAssisted(
  input: StaffAssistedWaiverInput,
): Promise<WaiverSignature> {
  return callStaffApi<WaiverSignature>('create_waiver_staff_assisted', input)
}

export async function listWaiversForTour(tripCode: string): Promise<WaiverSignature[]> {
  return callStaffApi<WaiverSignature[]>('list_waivers_for_tour', { tripCode })
}

/** OWNER-only hard delete of a waiver_signatures row (test/duplicate cleanup). */
export async function deleteWaiverSignature(id: string): Promise<void> {
  await callStaffApi('delete_waiver_signature', { id })
}

/** Evidence screenshot for staff-assisted waiver — same payment-slips bucket pattern. */
export async function uploadWaiverAuthEvidence(file: File, tripCode: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const safeCode = tripCode.replace(/[^a-zA-Z0-9_-]/g, '')
  const path = `waiver-auth/${safeCode}-${Date.now()}.${ext}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('payment-slips')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      logSupabaseError(`uploadWaiverAuthEvidence (${tripCode})`, uploadError)
      throw uploadError
    }

    const { data } = supabase.storage.from('payment-slips').getPublicUrl(path)
    // Prefer public URL when bucket is public; otherwise store the path for staff lookup.
    return data?.publicUrl || path
  } catch (err) {
    if (!(err && typeof err === 'object' && 'code' in err)) {
      logSupabaseError(`uploadWaiverAuthEvidence (${tripCode})`, err)
    }
    throw err
  }
}

export type BookingInsertPayload = Omit<TourBooking, 'id' | 'booked_at' | 'tour_id'>

export type MyTripBookingSummary = {
  reference: string | null
  trip_code: string
  booking_status: string
  amount_paid_aud: number
  booked_at: string
  first_name_en: string
  last_name_en: string
  name_en: string
  name_th: string
  departure_date: string | null
  price_aud: number
  deposit_aud: number
}

export type MyTripLookupResult = {
  found: boolean
  error?: string
  booking?: MyTripBookingSummary
}

export async function lookupMyTrip(params: {
  tripCodeOrReference: string
  contact: string
}): Promise<MyTripLookupResult> {
  try {
    const res = await fetch(`${supabaseConfig.url}/functions/v1/lookup-my-trip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
      body: JSON.stringify({
        trip_code_or_reference: params.tripCodeOrReference.trim(),
        contact: params.contact.trim(),
      }),
    })

    const body = (await res.json()) as MyTripLookupResult & { error?: string }

    if (res.status === 404 || body?.found === false) {
      return { found: false, error: body?.error }
    }

    if (!res.ok) {
      logSupabaseError('lookup-my-trip Edge Function', body)
      throw new Error(body?.error ?? `lookup-my-trip failed: ${res.status}`)
    }

    return body
  } catch (err) {
    logSupabaseError('lookup-my-trip Edge Function', err)
    throw err
  }
}

/**
 * book_seat only atomically increments tours.booked_seats.
 * Returns json { success: boolean, message: text } (also accepts legacy boolean true).
 * It does NOT create a tour_bookings row — guest details are inserted after a successful hold.
 */
function isBookSeatSuccess(rpcResult: unknown): boolean {
  if (rpcResult === true) return true
  if (rpcResult && typeof rpcResult === 'object' && 'success' in rpcResult) {
    return (rpcResult as { success: unknown }).success === true
  }
  return false
}

function bookSeatFailureMessage(rpcResult: unknown, rpcError: { message?: string } | null): string {
  if (rpcResult && typeof rpcResult === 'object' && 'message' in rpcResult) {
    const msg = String((rpcResult as { message?: unknown }).message ?? '').trim()
    if (msg) return msg
  }
  if (rpcError?.message) return rpcError.message
  return 'ที่นั่งเต็มแล้วครับ กรุณาเลือกทริปอื่น'
}

export async function insertBooking(
  tourId: string,
  bookingData: BookingInsertPayload,
  seatsRequested = 1,
): Promise<void> {
  let seatReserved = false

  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc('book_seat', {
      p_tour_id: tourId,
      p_seats_requested: seatsRequested,
    })

    if (rpcError || !isBookSeatSuccess(rpcResult)) {
      const message = bookSeatFailureMessage(rpcResult, rpcError)
      logSupabaseError('book_seat RPC', rpcError ?? { message })
      throw new SeatsFullError(message)
    }
    seatReserved = true
  } catch (err) {
    if (err instanceof SeatsFullError) throw err
    logSupabaseError('book_seat RPC', err)
    throw new SeatsFullError('ที่นั่งเต็มแล้วครับ กรุณาเลือกทริปอื่น')
  }

  try {
    // Prefer return=minimal — no anon SELECT (RLS Option C).
    const { error } = await supabase
      .from('tour_bookings')
      .insert({ ...bookingData, tour_id: tourId })

    if (error) {
      logSupabaseError('insertBooking', error)
      if (seatReserved) await releaseSeat(tourId, seatsRequested)
      throw error
    }
  } catch (err) {
    if (!(err && typeof err === 'object' && 'code' in err)) {
      logSupabaseError('insertBooking', err)
      if (seatReserved) await releaseSeat(tourId, seatsRequested)
    }
    throw err
  }
}

export interface StaffAuthResult {
  token: string
  role: StaffRole
  full_name: string
}

/**
 * Verifies PIN via the verify-pin Edge Function (service-role, bcrypt-compares
 * against staff_profiles.pin_hash server-side — the browser never reads
 * staff_profiles directly). On success this mints an opaque session token in
 * staff_sessions, which staff-api validates on every subsequent request.
 * See supabase/functions/verify-pin/index.ts.
 */
export async function verifyStaffPin(pin: string): Promise<StaffAuthResult | null> {
  try {
    const res = await fetch(`${supabaseConfig.url}/functions/v1/verify-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
      body: JSON.stringify({ pin }),
    })

    if (res.status === 401 || res.status === 400) return null

    const body = await res.json()
    if (!res.ok || !body?.token) {
      logSupabaseError('verify-pin Edge Function', body)
      throw new Error(body?.error ?? `verify-pin failed: ${res.status}`)
    }

    return {
      token: body.token as string,
      role: body.role as StaffRole,
      full_name: body.full_name as string,
    }
  } catch (err) {
    logSupabaseError('verify-pin Edge Function', err)
    throw err
  }
}

export async function fetchExpensesThisMonth(): Promise<Expense[]> {
  return callStaffApi<Expense[]>('expenses_this_month')
}

export async function fetchBookingsThisMonth(): Promise<TourBooking[]> {
  return callStaffApi<TourBooking[]>('bookings_this_month')
}

export async function fetchComplianceItems(): Promise<ComplianceItem[]> {
  return callStaffApi<ComplianceItem[]>('compliance_items')
}

// ---------------------------------------------------------------------------
// Trip Manager (staff): schedule new dated departures from an existing trip.
// ---------------------------------------------------------------------------

/** All tours regardless of status (draft included) — staff-only, for the Trip Manager. */
export async function fetchToursAdmin(): Promise<Tour[]> {
  const rows = await callStaffApi<TourRow[]>('list_tours_admin')
  return sortByDepartureDate(normalizeTours(rows))
}

export type NewTripDateInput = {
  templateTripCode: string
  trip_code: string
  name_en?: string
  name_th?: string
  departure_date: string
  price_aud?: number
  deposit_aud?: number
  max_seats?: number
  status?: string
}

export async function createTour(input: NewTripDateInput): Promise<Tour> {
  const row = await callStaffApi<TourRow>('create_tour', input)
  return normalizeTour(row)
}

export async function createToursBulk(
  templateTripCode: string,
  entries: Omit<NewTripDateInput, 'templateTripCode'>[],
): Promise<{ data: Tour[]; skipped: string[] }> {
  const result = await callStaffApi<{ data: TourRow[]; skipped: string[] }>('create_tours_bulk', {
    templateTripCode,
    entries,
  })
  return { data: normalizeTours(result.data), skipped: result.skipped ?? [] }
}

/**
 * Derives a new trip_code for a cloned departure date.
 * Prefer day-window suffixes (SEP26_29) so clones are selectable in booking UIs.
 * Pass durationDays when known (from template tour).
 */
export function deriveTripCodeForDate(
  baseTripCode: string,
  isoDate: string,
  durationDays?: number | null,
): string {
  return deriveDatedTripCode(baseTripCode, isoDate, durationDays ?? 1)
}

/** Adds `months` calendar months to an ISO date string, returning ISO (yyyy-mm-dd). */
export function addMonthsIso(isoDate: string, months: number): string {
  const d = new Date(isoDate)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export type UnbookableReason =
  | 'draft'
  | 'no_date'
  | 'template'
  | 'cancelled'
  | 'completed'
  | 'full'
  | null

/** Why a tour can't be booked right now — lets the UI offer a waitlist specifically when full. */
export function getUnbookableReason(tour: Tour): UnbookableReason {
  const status = (tour.status ?? '').toLowerCase()
  if (status === 'cancelled') return 'cancelled'
  if (status === 'completed') return 'completed'
  if (status !== 'confirmed' && status !== 'published' && status !== 'active') return 'draft'
  if (!tour.departure_date) return 'no_date'
  if (!isSelectableBookableTour(tour)) return 'template'
  if (tour.max_seats <= 0 || tour.booked_seats >= tour.max_seats) return 'full'
  return null
}

// ---------------------------------------------------------------------------
// Waitlist
// ---------------------------------------------------------------------------

export async function insertWaitlistEntry(
  entry: Omit<WaitlistEntry, 'id' | 'created_at' | 'contacted'>,
): Promise<void> {
  const { error } = await supabase.from('waitlist_entries').insert(entry)
  if (error) {
    logSupabaseError('insertWaitlistEntry', error)
    throw error
  }
}

/** Staff-only — every waitlist entry across all trips. */
export async function fetchWaitlist(): Promise<WaitlistEntry[]> {
  return callStaffApi<WaitlistEntry[]>('list_waitlist')
}

export async function markWaitlistContacted(id: string, contacted = true): Promise<void> {
  await callStaffApi('mark_waitlist_contacted', { id, contacted })
}

// ---------------------------------------------------------------------------
// Staff-assisted booking, attendance, and year-end tax summary
// ---------------------------------------------------------------------------

export type ManualBookingInput = {
  trip_code: string
  first_name_en: string
  last_name_en: string
  email?: string
  phone?: string
  passport_number?: string
  date_of_birth?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  dietary_requirements?: string
  medical_conditions?: string
  booking_status?: string
  amount_paid_aud?: number
  payment_method?: string
  source?: string
  payment_plan_installments?: number
}

/** Staff-entered booking for a phone/Facebook customer — holds a real seat via the same RPC the public flow uses. */
export async function createBookingManual(input: ManualBookingInput): Promise<TourBooking> {
  return callStaffApi<TourBooking>('create_booking_manual', input)
}

export async function markAttendance(id: string, attended: boolean | null): Promise<void> {
  await callStaffApi('mark_attendance', { id, attended })
}

/** Permanently deletes a tour — staff-api refuses (throws with "has_bookings")
 * if any tour_bookings reference it, so this only succeeds for trips that
 * never had a real booking (test/example rows). */
export async function deleteTour(id: string): Promise<void> {
  await callStaffApi('delete_tour', { id })
}

export type RecordPaymentResult = {
  payment: BookingPayment
  amount_paid_aud: number
  booking_status: string
  price_aud: number
  installment_no: number
  installment_plan: number | null
}

/** Records one installment payment against a booking — bumps the running
 * total and auto-flips status to fully_paid once it reaches the trip price. */
export async function recordPayment(
  bookingId: string,
  amount: number,
  paymentMethod?: string,
): Promise<RecordPaymentResult> {
  return callStaffApi<RecordPaymentResult>('record_payment', { bookingId, amount, paymentMethod })
}

export async function fetchPaymentsForBooking(bookingId: string): Promise<BookingPayment[]> {
  return callStaffApi<BookingPayment[]>('list_payments_for_booking', { bookingId })
}

export type CustomerPaymentSearchRow = {
  booking: TourBooking
  payments: BookingPayment[]
}

export async function searchCustomerPayments(query: string): Promise<CustomerPaymentSearchRow[]> {
  return callStaffApi<CustomerPaymentSearchRow[]>('search_customer_payments', { query })
}

export async function addPendingInstallment(
  bookingId: string,
  amount: number,
  label?: string,
  dueDate?: string | null,
): Promise<BookingPayment> {
  return callStaffApi<BookingPayment>('add_pending_installment', {
    bookingId,
    amount,
    label,
    dueDate,
  })
}

export async function updateInstallment(params: {
  paymentId: string
  amount?: number
  label?: string
  status?: 'pending' | 'paid' | 'overdue'
  dueDate?: string | null
  paymentMethod?: string | null
  markPaid?: boolean
}): Promise<BookingPayment> {
  return callStaffApi<BookingPayment>('update_installment', params)
}

export type InstallmentIncomeSummary = {
  total_aud: number
  count: number
  by_trip: { trip_code: string; amount_aud: number }[]
  /** Same period as total_aud / by_trip (paid installments − trip expenses). */
  profit_per_trip?: {
    trip_code: string
    revenue_aud: number
    expense_aud: number
    profit_aud: number
  }[]
  expenses_linked_to_trips?: boolean
  payments: BookingPayment[]
  range: {
    start: string
    end: string
    mode: string
    year: number
    month?: number
  }
}

export async function fetchInstallmentIncomeSummary(params: {
  mode?: 'month' | 'trip' | 'tax_year'
  year?: number
  month?: number
  tripCode?: string
}): Promise<InstallmentIncomeSummary> {
  return callStaffApi<InstallmentIncomeSummary>('installment_income_summary', params)
}

export async function fetchOutboundQueue(
  status: 'pending' | 'done' | 'skipped' | 'all' = 'pending',
): Promise<StaffOutboundItem[]> {
  return callStaffApi<StaffOutboundItem[]>('list_outbound_queue', {
    status: status === 'all' ? undefined : status,
  })
}

export async function completeOutbound(
  id: string,
  status: 'done' | 'skipped' = 'done',
): Promise<StaffOutboundItem> {
  return callStaffApi<StaffOutboundItem>('complete_outbound', { id, status })
}

export type PhotosPendingRow = TourBooking & {
  tour?: {
    trip_code?: string
    name_en?: string
    end_date?: string
    departure_date?: string
    duration_days?: number
  } | null
}

export type PhotoDeliveryStage = 'highlight' | 'full'

export async function fetchPhotosPending(): Promise<PhotosPendingRow[]> {
  return callStaffApi<PhotosPendingRow[]>('list_photos_pending')
}

export async function markPhotosDelivered(params: {
  bookingId?: string
  tripCode?: string
  galleryLink?: string
  allOnTrip?: boolean
  /** highlight = 3-day SLA; full = 30-day hard deadline (+ syncs legacy photos_delivered). */
  stage?: PhotoDeliveryStage
}): Promise<unknown> {
  return callStaffApi('mark_photos_delivered', params)
}

export type CustomerLoyalty = {
  trips_count: number
  bookings_count: number
  total_spend_aud: number
  bookings: TourBooking[]
}

export async function fetchCustomerLoyalty(params: {
  email?: string
  phone?: string
}): Promise<CustomerLoyalty> {
  return callStaffApi<CustomerLoyalty>('customer_loyalty', params)
}

export async function fetchRecentLogins(): Promise<StaffLoginRow[]> {
  return callStaffApi<StaffLoginRow[]>('list_recent_logins')
}

export type StaffProfileRow = {
  id: string
  full_name: string
  role: StaffRole | string
  active: boolean
  created_at: string
}

/** OWNER-only staff roster (no pin_hash). */
export async function listStaffProfiles(): Promise<StaffProfileRow[]> {
  return callStaffApi<StaffProfileRow[]>('list_staff_profiles')
}

/**
 * OWNER-only PIN reset via reset-pin Edge Function.
 * Returns plaintext PIN once — caller must not log it.
 */
export async function resetStaffPin(staffId: string): Promise<{
  staff_id: string
  full_name: string
  role: string
  pin: string
}> {
  const token = sessionStorage.getItem('staff_token')
  if (!token) throw new StaffSessionExpiredError()

  const res = await fetch(`${supabaseConfig.url}/functions/v1/reset-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
    },
    body: JSON.stringify({ token, staff_id: staffId }),
  })

  if (res.status === 401) {
    clearStaffSession()
    throw new StaffSessionExpiredError()
  }

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (res.status === 403) throw new Error('Only OWNER can reset staff PINs')
  if (res.status === 404) throw new Error('Staff member not found')
  if (!res.ok || typeof body.pin !== 'string') {
    throw new Error(typeof body.error === 'string' ? body.error : `reset-pin failed: ${res.status}`)
  }

  return {
    staff_id: String(body.staff_id ?? staffId),
    full_name: String(body.full_name ?? ''),
    role: String(body.role ?? ''),
    pin: body.pin,
  }
}

export type OwnerOpsMetrics = {
  profit_per_trip: {
    trip_code: string
    revenue_aud: number
    expense_aud: number
    profit_aud: number
  }[]
  expenses_linked_to_trips: boolean
  repeat_customer_rate: number
  repeat_bookings: number
  active_bookings: number
}

export async function fetchOwnerOpsMetrics(): Promise<OwnerOpsMetrics> {
  return callStaffApi<OwnerOpsMetrics>('owner_ops_metrics')
}

/** Fixes a typo'd name/phone/email on an existing booking. Does not touch
 * payment amounts, status, or seat counts. Pass only the fields to change. */
export async function updateBookingDetails(
  id: string,
  fields: { first_name_en?: string; last_name_en?: string; phone?: string; email?: string },
): Promise<TourBooking> {
  return callStaffApi<TourBooking>('update_booking_details', { id, ...fields })
}

/** Soft-cancels a booking (keeps the row). Sets cancelled_at / cancelled_by /
 * cancel_reason and booking_status=cancelled; staff-api also releases one seat. */
export async function cancelBooking(id: string, reason?: string): Promise<TourBooking> {
  return callStaffApi<TourBooking>('cancel_booking', {
    id,
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  })
}

/** True when soft-cancelled via cancelled_at or legacy booking_status. */
export function isBookingCancelled(b: Pick<TourBooking, 'cancelled_at' | 'booking_status'>): boolean {
  return Boolean(b.cancelled_at) || b.booking_status === 'cancelled'
}

/** Soft-cancels or restores a tour by flipping its status — unlike
 * deleteTour(), this keeps the row (and any bookings) intact for
 * accounting/tax records, just hides it from public listings and staff
 * dropdowns. Pass 'published' to undo an accidental cancel.
 * Prefer archiveTour() for OWNER housekeeping (status=archived). */
export async function updateTourStatus(id: string, status: TourStatus): Promise<Tour> {
  const row = await callStaffApi<TourRow>('update_tour_status', { id, status })
  return normalizeTours([row])[0]
}

/** OWNER-only soft archive — hides trip from Upcoming / public lists, keeps history. */
export async function archiveTour(id: string): Promise<Tour> {
  const row = await callStaffApi<TourRow>('archive_tour', { id })
  return normalizeTours([row])[0]
}

/** OWNER-only restore from archived → confirmed (or optional status). */
export async function unarchiveTour(
  id: string,
  status: 'draft' | 'published' | 'confirmed' | 'completed' = 'confirmed',
): Promise<Tour> {
  const row = await callStaffApi<TourRow>('unarchive_tour', { id, status })
  return normalizeTours([row])[0]
}

/** Save / clear day-by-day itinerary override on a tour row (null clears → CMS fallback). */
export async function updateTourItinerary(
  id: string,
  itinerary: Tour['itinerary'],
): Promise<Tour> {
  const row = await callStaffApi<TourRow>('update_tour_itinerary', {
    id,
    itinerary: itinerary && itinerary.length > 0 ? itinerary : null,
  })
  return normalizeTours([row])[0]
}

export type YearSummary = {
  bookings: TourBooking[]
  expenses: Expense[]
}

export async function fetchYearSummary(year: number): Promise<YearSummary> {
  return callStaffApi<YearSummary>('year_summary', { year })
}

/** Per-trip revenue / cost / profit rollup from a year's bookings + expenses. */
export type TripFinancialRow = {
  trip_code: string
  revenue_aud: number
  expense_aud: number
  profit_aud: number
  bookings_count: number
}

export function summarizeByTrip(summary: YearSummary): TripFinancialRow[] {
  const rows = new Map<string, TripFinancialRow>()

  function ensure(tripCode: string): TripFinancialRow {
    let row = rows.get(tripCode)
    if (!row) {
      row = { trip_code: tripCode, revenue_aud: 0, expense_aud: 0, profit_aud: 0, bookings_count: 0 }
      rows.set(tripCode, row)
    }
    return row
  }

  for (const b of summary.bookings) {
    if (isBookingCancelled(b)) continue
    const row = ensure(b.trip_code)
    row.revenue_aud += b.amount_paid_aud ?? 0
    row.bookings_count += 1
  }
  for (const e of summary.expenses) {
    const row = ensure(e.trip_code || '(General / non-trip)')
    row.expense_aud += e.amount_aud ?? 0
  }
  for (const row of rows.values()) {
    row.profit_aud = row.revenue_aud - row.expense_aud
  }

  return [...rows.values()].sort((a, b) => a.trip_code.localeCompare(b.trip_code))
}

/** Builds a downloadable CSV Blob URL from year summary rows — caller revokes the URL after use.
 * Revenue is GST-inclusive (matches the tax invoices issued at booking time), so the GST/ex-GST
 * columns are back-calculated here (revenue / 11) for the accountant's BAS at tax time. */
export function tripFinancialsToCsv(rows: TripFinancialRow[]): string {
  const header =
    'Trip Code,Bookings,Revenue inc. GST (AUD),GST (AUD),Revenue ex. GST (AUD),Expenses (AUD),Profit (AUD)'
  const lines = rows.map((r) => {
    const gst = r.revenue_aud / 11
    const exGst = r.revenue_aud - gst
    return [
      r.trip_code,
      r.bookings_count,
      r.revenue_aud.toFixed(2),
      gst.toFixed(2),
      exGst.toFixed(2),
      r.expense_aud.toFixed(2),
      r.profit_aud.toFixed(2),
    ].join(',')
  })
  const totalRevenue = rows.reduce((s, r) => s + r.revenue_aud, 0)
  const totalGst = totalRevenue / 11
  const totalExpense = rows.reduce((s, r) => s + r.expense_aud, 0)
  const totalProfit = rows.reduce((s, r) => s + r.profit_aud, 0)
  const totalBookings = rows.reduce((s, r) => s + r.bookings_count, 0)
  const totalLine = [
    'TOTAL',
    totalBookings,
    totalRevenue.toFixed(2),
    totalGst.toFixed(2),
    (totalRevenue - totalGst).toFixed(2),
    totalExpense.toFixed(2),
    totalProfit.toFixed(2),
  ].join(',')
  return [header, ...lines, totalLine].join('\n')
}

export async function insertExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
  return callStaffApi<Expense>('insert_expense', expense)
}

export async function uploadPaymentSlip(file: File, bookingRef: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${bookingRef}-${Date.now()}.${ext}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('payment-slips')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      logSupabaseError(`uploadPaymentSlip (${bookingRef})`, uploadError)
      throw uploadError
    }

    return path
  } catch (err) {
    if (!(err && typeof err === 'object' && 'code' in err)) {
      logSupabaseError(`uploadPaymentSlip (${bookingRef})`, err)
    }
    throw err
  }
}

// ---------------------------------------------------------------------------
// Content Review (OWNER): draft Facebook posts → approve / reject
// ---------------------------------------------------------------------------

function normalizeHeadlineOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === 'string')
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string')
    } catch {
      /* plain string — treat as single option */
      return raw.trim() ? [raw] : []
    }
  }
  return []
}

function mapContentPostRow(row: Record<string, unknown>): ContentPost {
  const tourJoin = row.tours
  const tours =
    tourJoin && typeof tourJoin === 'object' && !Array.isArray(tourJoin)
      ? (tourJoin as ContentPost['tours'])
      : Array.isArray(tourJoin) && tourJoin[0]
        ? (tourJoin[0] as ContentPost['tours'])
        : null

  return {
    id: String(row.id),
    trip_id: row.trip_id != null ? String(row.trip_id) : null,
    post_type: String(row.post_type ?? (row.trip_id ? 'trip_promo' : 'value_content')),
    status: String(row.status ?? 'draft'),
    headline_options: normalizeHeadlineOptions(row.headline_options),
    selected_headline: (row.selected_headline as string | null) ?? null,
    caption_fb: (row.caption_fb as string | null) ?? null,
    caption_ig: (row.caption_ig as string | null) ?? null,
    caption_line: (row.caption_line as string | null) ?? null,
    photo_urls: Array.isArray(row.photo_urls)
      ? (row.photo_urls as string[])
      : null,
    page_id: (row.page_id as string | null) ?? null,
    target_account: (row.target_account as string | null) ?? null,
    group_id: (row.group_id as string | null) ?? null,
    posted_at: (row.posted_at as string | null) ?? null,
    facebook_post_id: (row.facebook_post_id as string | null) ?? null,
    facebook_post_url: (row.facebook_post_url as string | null) ?? null,
    created_at: String(row.created_at ?? ''),
    updated_at: (row.updated_at as string | null) ?? null,
    tours,
  }
}

export async function fetchDraftContentPosts(): Promise<ContentPost[]> {
  const rows = await callStaffApi<Record<string, unknown>[]>('list_draft_content_posts')
  return (rows ?? []).map(mapContentPostRow)
}

export async function fetchManualPendingContentPosts(): Promise<ContentPost[]> {
  const rows = await callStaffApi<Record<string, unknown>[]>(
    'list_manual_pending_content_posts',
  )
  return (rows ?? []).map(mapContentPostRow)
}

export async function rejectContentPost(id: string): Promise<void> {
  await callStaffApi('update_content_post', { id, status: 'rejected' })
}

export async function approveContentPost(
  id: string,
  payload: {
    selected_headline: string
    caption_fb: string
    photo_urls: string[]
  },
): Promise<{
  status: string
  target_account?: string
  facebook_post_id?: string
  facebook_post_url?: string
}> {
  return callStaffApi('update_content_post', {
    id,
    status: 'approved',
    selected_headline: payload.selected_headline,
    caption_fb: payload.caption_fb,
    photo_urls: payload.photo_urls,
  })
}

export async function markContentPostPosted(id: string): Promise<void> {
  await callStaffApi('mark_content_post_posted', { id })
}

export async function insertContentPostDraft(input: {
  post_type: 'value_content' | 'trip_promo'
  trip_id?: string | null
  photo_urls: string[]
  headline_options: string[]
  caption_fb: string
  /** Required — routes Graph vs manual on approve */
  target_account: NonNullable<ContentPost['target_account']>
  group_id?: string | null
}): Promise<{ id: string }> {
  if (!input.target_account) {
    throw new Error('target_account is required')
  }
  return callStaffApi<{ id: string }>('insert_content_post', {
    ...input,
    status: 'draft',
  })
}

/** Upload to public content-photos/{uuid}/… and return the public URL. */
export async function uploadContentPhoto(file: File): Promise<string> {
  const uuid = crypto.randomUUID()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${uuid}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('content-photos').upload(path, file, {
    upsert: false,
    contentType: file.type || `image/${ext}`,
  })
  if (error) {
    logSupabaseError('uploadContentPhoto', error)
    throw error
  }

  const { data } = supabase.storage.from('content-photos').getPublicUrl(path)
  return data.publicUrl
}

export type GenerateCaptionResult = {
  headline_options: string[]
  caption_fb: string
}

/** Calls generate-caption Edge Function (OWNER session token required). */
export async function generateCaption(
  imageUrl: string,
  postType: 'value_content' | 'trip_promo' = 'value_content',
): Promise<GenerateCaptionResult> {
  const token = sessionStorage.getItem('staff_token')
  if (!token) throw new StaffSessionExpiredError()

  const res = await fetch(`${supabaseConfig.url}/functions/v1/generate-caption`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
    },
    body: JSON.stringify({
      token,
      image_url: imageUrl,
      post_type: postType,
    }),
  })

  if (res.status === 401) {
    throw new StaffSessionExpiredError()
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `generate-caption failed: ${res.status}`)
  }

  const body = (await res.json()) as GenerateCaptionResult
  if (!Array.isArray(body.headline_options) || typeof body.caption_fb !== 'string') {
    throw new Error('generate-caption returned incomplete data')
  }
  return body
}

export type GenerateTripPostResult = {
  data: ContentPost
  reused: boolean
}

/** Calls generate-trip-post Edge Function — creates a trip_promo draft for a tour. */
export async function generateTripPost(tripId: string): Promise<GenerateTripPostResult> {
  const token = sessionStorage.getItem('staff_token')
  if (!token) throw new StaffSessionExpiredError()

  const res = await fetch(`${supabaseConfig.url}/functions/v1/generate-trip-post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
    },
    body: JSON.stringify({ token, trip_id: tripId }),
  })

  if (res.status === 401) {
    throw new StaffSessionExpiredError()
  }

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const thai =
      typeof body?.message === 'string' && body.message.trim()
        ? body.message
        : 'สร้างโพสต์ไม่สำเร็จ ลองอีกครั้ง'
    throw new Error(thai)
  }

  if (!body?.data?.id) {
    throw new Error('สร้างโพสต์ไม่สำเร็จ ลองอีกครั้ง')
  }

  return {
    data: body.data as ContentPost,
    reused: Boolean(body.reused),
  }
}

/** Public URLs for images under trip-photos/{tripId}/ (bucket is publicly readable). */
export async function listTripPhotoUrls(tripId: string): Promise<string[]> {
  if (!tripId) return []
  try {
    const { data, error } = await supabase.storage.from('trip-photos').list(tripId, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (error) {
      logSupabaseError(`listTripPhotoUrls (${tripId})`, error)
      return []
    }
    const files = (data ?? []).filter(
      (f) => f.name && !f.name.startsWith('.') && /\.(jpe?g|png|webp|gif)$/i.test(f.name),
    )
    return files.map((f) => {
      const { data: pub } = supabase.storage.from('trip-photos').getPublicUrl(`${tripId}/${f.name}`)
      return pub.publicUrl
    })
  } catch (err) {
    logSupabaseError(`listTripPhotoUrls (${tripId})`, err)
    return []
  }
}

export function seatsRemaining(tour: Tour): number {
  return Math.max(0, tour.max_seats - tour.booked_seats)
}

/** Bookable when confirmed/published/active, has departure date, and seats remain. */
export function isTourBookable(tour: Tour): boolean {
  return getUnbookableReason(tour) === null
}

export function formatAud(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Always English day–month–year (en-AU) so staff/guests can read dates consistently. */
export function formatDate(dateStr: string | null, lang: 'en' | 'th' = 'en'): string {
  if (!dateStr) return lang === 'th' ? 'รอประกาศ' : 'TBA'
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
