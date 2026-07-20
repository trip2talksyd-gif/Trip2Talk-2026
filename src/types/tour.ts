export type TripType = 'oneday' | 'overnight' | 'multiday'
export type TourStatus = 'draft' | 'published' | 'confirmed' | 'completed' | 'cancelled'
export type BookingStatus =
  | 'pending_payment'
  | 'deposit_paid'
  | 'fully_paid'
  | 'cancelled'
  | 'no_show'
export type StaffRole = 'OWNER' | 'MANAGER' | 'GUIDE' | 'CASHIER'

export interface Tour {
  id: string
  trip_code: string
  name_en: string
  name_th: string
  description_en: string | null
  description_th: string | null
  duration_days: number | null
  duration_nights: number | null
  /** Legacy / ops column — preferred for oneday|overnight|multiday when present */
  trip_type?: string | null
  duration_label?: string | null
  departure_date: string | null
  price_aud: number
  deposit_aud: number
  max_seats: number
  booked_seats: number
  status: TourStatus | string
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

export interface TourBooking {
  id: string
  tour_id: string
  trip_code: string
  first_name_th: string
  last_name_th: string
  first_name_en: string
  last_name_en: string
  passport_number: string
  email: string
  phone: string
  date_of_birth: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  dietary_requirements: string | null
  medical_conditions: string | null
  oshc_provider: string | null
  oshc_expiry: string | null
  waiver_signed: boolean
  waiver_signed_at: string | null
  booking_status: BookingStatus
  amount_paid_aud: number
  payment_method: string | null
  slip_url: string | null
  booking_reference: string | null
  booked_at: string
}

export interface StaffProfile {
  id: string
  full_name: string
  role: StaffRole
  active: boolean
  created_at: string
}

export interface Expense {
  id: string
  description: string
  amount_aud: number
  gst_amount_aud: number
  ato_category: string
  expense_date: string
  receipt_url: string | null
  created_by: string | null
  created_at: string
}

export interface ComplianceItem {
  id: string
  item_name: string
  due_date: string | null
  status: 'pending' | 'done' | 'overdue'
  notes: string | null
  created_at: string
}

export interface WaiverSignature {
  id: string
  trip_code: string
  signed_name: string
  signed_at: string
  clauses: string[] | Record<string, unknown>
  locale: 'en' | 'th'
  created_at: string
}

/** Anon-safe columns returned after public tour_bookings insert. */
export interface BookingInsertReadback {
  id: string
  trip_code: string
  booked_at: string
}

/** Anon-safe columns returned after public waiver_signatures insert. */
export interface WaiverSignatureInsertReadback {
  id: string
  trip_code: string
  signed_at: string
}
