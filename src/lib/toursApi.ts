import { supabase, supabaseConfig } from './supabase'
import { callStaffApi } from './supabaseStaff'
import { SeatsFullError } from '../types/errors'
import type {
  BookingInsertReadback,
  BookingPayment,
  ComplianceItem,
  Expense,
  StaffRole,
  Tour,
  TourBooking,
  WaiverSignature,
  WaiverSignatureInsertReadback,
  WaitlistEntry,
} from '../types/tour'

/** Featured trip codes pinned to the top of home + /trips (in this order). */
export const TRIPS_LISTING_PRIORITY = ['TAS-3D2N', 'ULU-4D3N', 'NZ-6D5N'] as const

/** Anon column grant — must match migration grant + insertBooking() .select(). */
export const TOUR_BOOKINGS_ANON_SELECT_GRANT = 'id, trip_code, booked_at'

/** Anon column grant — must match migration grant + insertWaiverSignature() .select(). */
export const WAIVER_SIGNATURES_ANON_SELECT_GRANT = 'id, trip_code, signed_at'

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
      return s === 'confirmed' || s === 'published' || s === 'active'
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
    const tours = sortByDepartureDate(normalizeTours(data as TourRow[])).filter(
      (t) => statusLower(t) !== 'cancelled',
    )
    return tours
  } catch (err) {
    if (!(err && typeof err === 'object' && 'code' in err)) {
      logSupabaseError('fetchAllTours', err)
    }
    throw err
  }
}

/** Pin priority trips first; preserve Supabase order for the rest. */
export function sortToursForListing(tours: Tour[]): Tour[] {
  const priorityRank = new Map(
    TRIPS_LISTING_PRIORITY.map((code, index) => [code.toUpperCase(), index]),
  )
  return tours
    .map((tour, index) => ({ tour, index }))
    .sort((a, b) => {
      const aCode = a.tour.trip_code.toUpperCase()
      const bCode = b.tour.trip_code.toUpperCase()
      const aRank = priorityRank.get(aCode) ?? TRIPS_LISTING_PRIORITY.length + a.index
      const bRank = priorityRank.get(bCode) ?? TRIPS_LISTING_PRIORITY.length + b.index
      return aRank - bRank
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
): Promise<WaiverSignatureInsertReadback> {
  logSelectColumns(
    'insertWaiverSignature (readback after insert)',
    'waiver_signatures',
    WAIVER_SIGNATURES_ANON_SELECT_GRANT,
  )

  console.log('[insertWaiverSignature] before Supabase call', {
    supabaseUrl: supabaseConfig.url,
    anonKeyPresent: supabaseConfig.anonKey.length > 0,
    anonKeyLength: supabaseConfig.anonKey.length,
  })

  try {
    const { data, error } = await supabase
      .from('waiver_signatures')
      .insert(signature)
      .select(WAIVER_SIGNATURES_ANON_SELECT_GRANT)
      .single()

    if (error) {
      logSupabaseError('insertWaiverSignature', error)
      throw error
    }
    return data as WaiverSignatureInsertReadback
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
): Promise<WaiverSignatureInsertReadback> {
  try {
    return await insertWaiverSignatureOnce(signature)
  } catch (err) {
    if (!isFailedToFetchError(err)) throw err
    console.warn(
      '[insertWaiverSignature] Failed to fetch — retrying once after 1s (Supabase project may be waking from pause)',
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return await insertWaiverSignatureOnce(signature)
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
): Promise<BookingInsertReadback> {
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

  logSelectColumns(
    'insertBooking (readback after insert)',
    'tour_bookings',
    TOUR_BOOKINGS_ANON_SELECT_GRANT,
  )

  try {
    const { data, error } = await supabase
      .from('tour_bookings')
      .insert({ ...bookingData, tour_id: tourId })
      .select(TOUR_BOOKINGS_ANON_SELECT_GRANT)
      .single()

    if (error) {
      logSupabaseError('insertBooking', error)
      if (seatReserved) await releaseSeat(tourId, seatsRequested)
      throw error
    }
    return data as BookingInsertReadback
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

const MONTH_ABBRS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
]

/**
 * Derives a new trip_code for a cloned departure date. If the template's code
 * already ends in a month abbreviation (e.g. "TAS-LH-4D3N-JUL"), swaps it for
 * the new date's month; otherwise appends one. Keeps codes readable and avoids
 * relying on the person to invent a unique suffix by hand.
 */
export function deriveTripCodeForDate(baseTripCode: string, isoDate: string): string {
  const d = new Date(isoDate)
  const abbr = MONTH_ABBRS[d.getMonth()] ?? 'TBA'
  const parts = baseTripCode.split('-')
  const last = parts[parts.length - 1]?.toUpperCase()
  if (last && MONTH_ABBRS.includes(last)) {
    parts[parts.length - 1] = abbr
  } else {
    parts.push(abbr)
  }
  return parts.join('-')
}

/** Adds `months` calendar months to an ISO date string, returning ISO (yyyy-mm-dd). */
export function addMonthsIso(isoDate: string, months: number): string {
  const d = new Date(isoDate)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export type UnbookableReason = 'draft' | 'no_date' | 'cancelled' | 'completed' | 'full' | null

/** Why a tour can't be booked right now — lets the UI offer a waitlist specifically when full. */
export function getUnbookableReason(tour: Tour): UnbookableReason {
  const status = (tour.status ?? '').toLowerCase()
  if (status === 'cancelled') return 'cancelled'
  if (status === 'completed') return 'completed'
  if (status !== 'confirmed' && status !== 'published' && status !== 'active') return 'draft'
  if (!tour.departure_date) return 'no_date'
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

/** Fixes a typo'd name/phone/email on an existing booking. Does not touch
 * payment amounts, status, or seat counts. Pass only the fields to change. */
export async function updateBookingDetails(
  id: string,
  fields: { first_name_en?: string; last_name_en?: string; phone?: string; email?: string },
): Promise<TourBooking> {
  return callStaffApi<TourBooking>('update_booking_details', { id, ...fields })
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

export function seatsRemaining(tour: Tour): number {
  return Math.max(0, tour.max_seats - tour.booked_seats)
}

/** Bookable when confirmed/published/active, has departure date, and seats remain. */
export function isTourBookable(tour: Tour): boolean {
  const status = (tour.status ?? '').toLowerCase()
  if (status === 'draft' || status === 'cancelled' || status === 'completed' || status === 'planning') {
    return false
  }
  if (
    status !== 'confirmed' &&
    status !== 'published' &&
    status !== 'active'
  ) {
    return false
  }
  if (!tour.departure_date) return false
  if (tour.max_seats <= 0) return false
  return tour.booked_seats < tour.max_seats
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
