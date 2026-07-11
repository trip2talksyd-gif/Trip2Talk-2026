import { supabase, supabaseConfig } from './supabase'
import { callStaffApi } from './supabaseStaff'
import { SeatsFullError } from '../types/errors'
import type {
  BookingInsertReadback,
  ComplianceItem,
  Expense,
  StaffRole,
  Tour,
  TourBooking,
  WaiverSignature,
  WaiverSignatureInsertReadback,
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

export async function fetchFeaturedTours(limit = 3): Promise<Tour[]> {
  logSelectColumns('fetchFeaturedTours', 'tours', '*')
  try {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('status', 'confirmed')
      .order('departure_date', { ascending: true, nullsFirst: false })

    if (error) {
      logSupabaseError('fetchFeaturedTours', error)
      throw error
    }
    return sortToursForListing((data ?? []) as Tour[]).slice(0, limit)
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
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .neq('status', 'cancelled')
      .order('departure_date', { ascending: true, nullsFirst: false })

    if (error) {
      logSupabaseError('fetchAllTours', error)
      throw error
    }
    return (data ?? []) as Tour[]
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
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('status', 'confirmed')
      .order('departure_date', { ascending: true, nullsFirst: false })

    if (error) {
      logSupabaseError('fetchConfirmedTours', error)
      throw error
    }
    return (data ?? []) as Tour[]
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
    return data as Tour | null
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
  staff_id: string
  role: StaffRole
  full_name: string
}

interface VerifyStaffPinRow {
  staff_id: string
  full_name: string
  role: string
}

/** Verifies PIN via DB RPC — never reads staff_profiles directly. */
export async function verifyStaffPin(pin: string): Promise<StaffAuthResult | null> {
  try {
    const { data, error } = await supabase.rpc('verify_staff_pin', { input_pin: pin })

    if (error) {
      logSupabaseError('verify_staff_pin RPC', error)
      throw error
    }

    const rows = (data ?? []) as VerifyStaffPinRow[]
    if (!Array.isArray(rows) || rows.length === 0) return null

    const row = rows[0]
    if (!row?.staff_id) return null

    return {
      staff_id: row.staff_id,
      role: row.role as StaffRole,
      full_name: row.full_name,
    }
  } catch (err) {
    logSupabaseError('verify_staff_pin RPC', err)
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

/** Bookable when confirmed/published, has departure date, and seats remain. */
export function isTourBookable(tour: Tour): boolean {
  const status = (tour.status ?? '').toLowerCase()
  if (status === 'draft' || status === 'cancelled' || status === 'completed') return false
  if (status !== 'confirmed' && status !== 'published') return false
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

export function formatDate(dateStr: string | null, lang: 'en' | 'th'): string {
  if (!dateStr) return lang === 'th' ? 'รอประกาศ' : 'TBA'
  return new Date(dateStr).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
