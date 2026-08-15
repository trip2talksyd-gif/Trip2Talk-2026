const PREFIX = 'trip2talk_waiver_'

export type InsuranceType = 'oshc' | 'travel_insurance' | 'none'

export type WaiverSafetyInfo = {
  emergency_contact_name: string
  emergency_contact_phone: string
  allergies: string
  medical_conditions: string
  other_notes: string
  insurance_type: InsuranceType
  oshc_membership_number: string
  oshc_risk_acknowledged: boolean
  travel_insurance_provider: string
  travel_insurance_policy_number: string
  /** Kept for older sessions before insurance_type existed. */
  insurance_provider?: string
  insurance_policy_number?: string
}

export type WaiverFlightInfo = {
  requested: boolean
  flight_legal_first_name: string
  flight_legal_last_name: string
  flight_date_of_birth: string
  flight_passport_number: string
  flight_nationality: string
  flight_frequent_flyer_number: string
}

export type WaiverSession = {
  tripCode: string
  signedName: string
  signedAt: string
  clauses: string[]
  safety?: WaiverSafetyInfo
  flight?: WaiverFlightInfo
}

export function setWaiverSigned(tripCode: string, payload: WaiverSession): void {
  sessionStorage.setItem(`${PREFIX}${tripCode}`, JSON.stringify(payload))
}

export function isWaiverSigned(tripCode: string): boolean {
  return sessionStorage.getItem(`${PREFIX}${tripCode}`) !== null
}

export function getWaiverSession(tripCode: string): WaiverSession | null {
  const raw = sessionStorage.getItem(`${PREFIX}${tripCode}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as WaiverSession
  } catch {
    return null
  }
}

export function clearWaiverSession(tripCode: string): void {
  sessionStorage.removeItem(`${PREFIX}${tripCode}`)
}

/** Non-sensitive confirmation checklist — never store passport/medical/emergency here. */
const CONFIRM_PREFIX = 'trip2talk_confirm_'

export type ConfirmationSummaryData = {
  bookingReference: string
  tripCode: string
  tripNameEn: string
  tripNameTh: string
  coverImageUrl: string | null
  departureDate: string | null
  durationLabel: string
  waiverSigned: boolean
  safetyInfoOnFile: boolean
  depositPaid: boolean
  /** How the guest chose / paid the deposit — used on confirmation next-steps. */
  paymentMethod?: string | null
  priceAud?: number | null
  depositAud?: number | null
  amountPaidAud?: number | null
  bookingStatus?: string | null
  facebookMessagePending: boolean
  createdAt: string
  /** Email or phone used with lookup-my-trip — not shown on the confirmation card. */
  lookupContact?: string
}

export function setConfirmationSummary(data: ConfirmationSummaryData): void {
  sessionStorage.setItem(`${CONFIRM_PREFIX}${data.bookingReference}`, JSON.stringify(data))
  sessionStorage.setItem(`${CONFIRM_PREFIX}latest`, data.bookingReference)
}

export function getConfirmationSummary(ref?: string): ConfirmationSummaryData | null {
  const key = ref?.trim() || sessionStorage.getItem(`${CONFIRM_PREFIX}latest`)
  if (!key) return null
  const raw = sessionStorage.getItem(`${CONFIRM_PREFIX}${key}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ConfirmationSummaryData
  } catch {
    return null
  }
}

export function patchConfirmationSummary(
  ref: string | undefined,
  patch: Partial<ConfirmationSummaryData>,
): ConfirmationSummaryData | null {
  const current = getConfirmationSummary(ref)
  if (!current) return null
  const next = { ...current, ...patch, bookingReference: current.bookingReference }
  setConfirmationSummary(next)
  return next
}

export function markConfirmationDepositPaid(ref?: string): ConfirmationSummaryData | null {
  return patchConfirmationSummary(ref, { depositPaid: true })
}
