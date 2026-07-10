import type { Tour, TripType } from '../types/tour'

const DESTINATION_BY_PREFIX: Record<string, string> = {
  TAS: 'Tasmania',
  ULU: 'Uluru',
  SYD: 'Sydney',
  NZ: 'New Zealand',
  MEL: 'Melbourne',
  BNE: 'Brisbane',
  PER: 'Perth',
}

/** Derive a display destination from trip_code prefix (e.g. TAS-LH-3D2N → Tasmania). */
export function tourDestination(tripCode: string): string {
  const prefix = tripCode.split('-')[0]?.toUpperCase() ?? ''
  return DESTINATION_BY_PREFIX[prefix] ?? 'Australia'
}

export function tourDurationLabel(tour: Tour, lang: 'en' | 'th'): string {
  const days = tour.duration_days
  const nights = tour.duration_nights
  if (days == null) return lang === 'th' ? 'รอประกาศ' : 'TBA'
  if (nights != null && nights > 0) {
    return lang === 'th' ? `${days} วัน ${nights} คืน` : `${days}D ${nights}N`
  }
  return lang === 'th' ? `${days} วัน` : `${days} day${days === 1 ? '' : 's'}`
}

export function inferTripType(tour: Tour): TripType {
  const days = tour.duration_days ?? 1
  if (days <= 1) return 'oneday'
  if (days <= 2) return 'overnight'
  return 'multiday'
}

export function isAuroraTrip(tour: Tour): boolean {
  const code = tour.trip_code.toUpperCase()
  return code.includes('LH') || code.includes('AURORA')
}
