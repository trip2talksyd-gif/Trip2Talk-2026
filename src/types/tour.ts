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
  /** Free-text allergies for guides (trip-day quick view). */
  allergies?: string | null
  /** Travel insurance (not OSHC). */
  insurance_provider?: string | null
  insurance_policy_number?: string | null
  /** Catch-all notes: swim/mobility/heights/etc. */
  other_notes?: string | null
  oshc_provider: string | null
  oshc_expiry: string | null
  waiver_signed: boolean
  waiver_signed_at: string | null
  /** Day-of check-in, separate from payment status. null/undefined = not checked yet. */
  attended?: boolean | null
  /** Where this booking came from — 'website' for public bookings, or facebook/phone/line/walk_in/other for staff-entered ones. */
  source?: string | null
  /** Installment plan the customer picked (1 = pay in full, 2 or 4 = split). Informational — payments are still manual PayID transfers recorded one at a time. */
  payment_plan_installments?: number | null
  booking_status: BookingStatus
  amount_paid_aud: number
  payment_method: string | null
  slip_url: string | null
  booking_reference: string | null
  booked_at: string
  /** Soft-cancel timestamp — row is kept for tax/audit; null = active. */
  cancelled_at?: string | null
  /** Staff name or id who cancelled. */
  cancelled_by?: string | null
  /** Optional reason entered at cancel time. */
  cancel_reason?: string | null
}

/** One recorded payment against a booking — lets a booking be paid off in several installments, each with its own receipt. */
export interface BookingPayment {
  id: string
  booking_id: string
  amount_aud: number
  payment_method: string | null
  installment_no: number
  created_at: string
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
  /** Optional — which trip this was spent on. null/empty = general business expense. */
  trip_code?: string | null
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
  /** Staff filled waiver on customer's explicit request */
  filled_by_staff?: boolean
  staff_fill_staff_id?: string | null
  staff_fill_authorized_at?: string | null
  staff_fill_authorization_note?: string | null
  staff_fill_evidence_url?: string | null
  staff_fill_staff_name?: string | null
  booking_id?: string | null
}

/** @deprecated Public inserts no longer return rows (anon SELECT revoked). */
export interface BookingInsertReadback {
  id: string
  trip_code: string
  booked_at: string
}

/** @deprecated Public inserts no longer return rows (anon SELECT revoked). */
export interface WaiverSignatureInsertReadback {
  id: string
  trip_code: string
  signed_at: string
}

export interface WaitlistEntry {
  id: string
  tour_id: string | null
  trip_code: string
  name: string
  phone: string
  email: string | null
  note: string | null
  contacted: boolean
  created_at: string
}

export type ContentPostStatus =
  | 'draft'
  | 'approved'
  | 'approved_pending_manual_post'
  | 'rejected'
  | 'posted'
export type ContentPostType = 'trip_promo' | 'value_content'
export type ContentTargetAccount =
  | 'trip2talk_page'
  | 'chapter99_page'
  | 'group_thaiaus'

/** Draft Facebook/content post awaiting OWNER review. */
export interface ContentPost {
  id: string
  /** Null when post_type = value_content (page-growth, no trip). */
  trip_id: string | null
  post_type: ContentPostType | string
  status: ContentPostStatus | string
  headline_options: string[]
  selected_headline: string | null
  caption_fb: string | null
  caption_ig?: string | null
  caption_line?: string | null
  photo_urls: string[] | null
  page_id?: string | null
  /** Required before review — routes Graph vs manual publish */
  target_account?: ContentTargetAccount | string | null
  group_id?: string | null
  posted_at?: string | null
  facebook_post_id?: string | null
  facebook_post_url?: string | null
  created_at: string
  updated_at?: string | null
  tours: {
    id: string
    trip_code: string
    name_en: string
    name_th: string
    departure_date: string | null
    max_seats: number
    booked_seats: number
  } | null
}
