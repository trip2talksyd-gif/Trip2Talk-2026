import { listItineraryTemplateCodes } from '../data/itineraries'

const MONTH_ABBRS = [
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
] as const

/** Day-window instance: SEP26_29, OCT11_13, JUL4_7 */
const DAY_RANGE_SUFFIX_RE = /^[A-Z]{3}\d{1,2}_\d{1,2}$/

/** Seasonal instance suffix that is not a calendar month (WIN/SPR/SUM/AUT). */
const SEASON_SUFFIXES = new Set(['WIN', 'SPR', 'SUM', 'AUT', 'WINTER', 'SPRING', 'SUMMER', 'AUTUMN'])

/**
 * Exact CMS itinerary keys (resolveTemplateTripCode TARGETS) — content shells,
 * not meant for direct booking.
 */
export function isCmsItineraryTemplateCode(tripCode: string): boolean {
  const code = tripCode.trim().toUpperCase()
  if (!code) return false
  return listItineraryTemplateCodes().some((k) => k.toUpperCase() === code)
}

/** Month-only clone shell: ULU-4D3N-SEP, NZ-6D5N-NOV — no day window. */
export function isMonthOnlyTripCode(tripCode: string): boolean {
  const parts = tripCode.trim().toUpperCase().split('-').filter(Boolean)
  const last = parts[parts.length - 1]
  return Boolean(last && (MONTH_ABBRS as readonly string[]).includes(last))
}

/** Generic one-day product SKU without a dated instance suffix. */
export function isGenericOneDaySku(tripCode: string): boolean {
  return /-(1DAY|1D)$/i.test(tripCode.trim())
}

export function isDayRangeTripCode(tripCode: string): boolean {
  const parts = tripCode.trim().toUpperCase().split('-').filter(Boolean)
  const last = parts[parts.length - 1]
  return Boolean(last && DAY_RANGE_SUFFIX_RE.test(last))
}

export function isSeasonInstanceTripCode(tripCode: string): boolean {
  const parts = tripCode.trim().toUpperCase().split('-').filter(Boolean)
  const last = parts[parts.length - 1]
  return Boolean(last && SEASON_SUFFIXES.has(last))
}

/**
 * Tours staff/customers may pick in booking / waiver / cashier selectors.
 * Templates stay in DB for itinerary resolution + Trip Manager cloning.
 */
export function isSelectableBookableTour(tour: {
  trip_code: string
  departure_date: string | null | undefined
}): boolean {
  if (!tour.departure_date) return false
  const code = tour.trip_code
  if (isCmsItineraryTemplateCode(code)) return false
  if (isMonthOnlyTripCode(code)) return false
  if (isGenericOneDaySku(code)) return false
  // Prefer explicit day-range or season instances; anything else with a date
  // that survived the filters above (rare custom codes) stays selectable.
  return true
}

/** Strip month / day-range / season suffix so Trip Manager can re-derive. */
export function stripDateSuffixFromTripCode(tripCode: string): string {
  const parts = tripCode.trim().split('-').filter(Boolean)
  if (parts.length < 2) return tripCode.trim()
  const last = parts[parts.length - 1]?.toUpperCase() ?? ''
  if (
    (MONTH_ABBRS as readonly string[]).includes(last) ||
    DAY_RANGE_SUFFIX_RE.test(last) ||
    SEASON_SUFFIXES.has(last)
  ) {
    parts.pop()
  }
  return parts.join('-')
}

/**
 * Build a dated bookable instance code from a template + departure date.
 * Uses day-window form (SEP26_29) so new clones appear in selectors.
 */
export function deriveDatedTripCode(
  baseTripCode: string,
  isoDate: string,
  durationDays: number | null | undefined = 1,
): string {
  const base = stripDateSuffixFromTripCode(baseTripCode)
  const start = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)
  const days = Math.max(1, Number(durationDays) || 1)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + (days - 1))
  const abbr = MONTH_ABBRS[start.getUTCMonth()] ?? 'TBA'
  const d1 = start.getUTCDate()
  const d2 = end.getUTCDate()
  const sameMonth = start.getUTCMonth() === end.getUTCMonth()
  const suffix = sameMonth
    ? `${abbr}${d1}_${d2}`
    : `${abbr}${d1}_${MONTH_ABBRS[end.getUTCMonth()]}${d2}`
  return `${base}-${suffix}`
}
