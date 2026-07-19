import type { Tour, TripType } from '../types/tour'

/** Accordion bucket for all day / evening trips on /trips */
export const ONE_DAY_GROUP = 'One-day trips'

/** Accordion bucket for short overnight NSW trips (e.g. Bermagui, Canola) */
export const OVERNIGHT_GROUP = 'Overnight trips'

const DESTINATION_BY_PREFIX: Record<string, string> = {
  TAS: 'Tasmania',
  ULU: 'Uluru',
  SYD: 'Sydney',
  NZ: 'New Zealand',
  MEL: 'Melbourne',
  BNE: 'Brisbane',
  PER: 'Perth',
  BER: 'NSW Coast',
  CAN: 'NSW Inland',
  KIA: 'NSW Coast',
  PSP: 'NSW Coast',
  LAV: 'NSW Coast',
}

/** Destinations whose overnight trips roll into ทริปค้างคืน */
const OVERNIGHT_BUCKET_DESTINATIONS = new Set([
  'NSW Coast',
  'NSW Inland',
  'Sydney',
  'Australia',
])

const DESTINATION_TH: Record<string, string> = {
  Tasmania: 'แทสเมเนีย',
  Uluru: 'อุลูรู',
  Sydney: 'ซิดนีย์',
  'New Zealand': 'นิวซีแลนด์',
  Melbourne: 'เมลเบิร์น',
  Brisbane: 'บริสเบน',
  Perth: 'เพิร์ธ',
  'NSW Coast': 'ชายฝั่ง NSW',
  'NSW Inland': 'NSW ในแผ่นดิน',
  Australia: 'ออสเตรเลีย',
  [ONE_DAY_GROUP]: 'ทริป วันเดียว',
  [OVERNIGHT_GROUP]: 'ทริปค้างคืน',
}

/** Preferred accordion order on /trips */
const DESTINATION_ORDER = [
  'Tasmania',
  'Uluru',
  'New Zealand',
  'Melbourne',
  ONE_DAY_GROUP,
  OVERNIGHT_GROUP,
  'Sydney',
  'NSW Coast',
  'NSW Inland',
  'Australia',
  'Brisbane',
  'Perth',
] as const

/** Derive a display destination from trip_code prefix (e.g. TAS-LH-3D2N → Tasmania). */
export function tourDestination(tripCode: string): string {
  const prefix = tripCode.split('-')[0]?.toUpperCase() ?? ''
  return DESTINATION_BY_PREFIX[prefix] ?? 'Australia'
}

/**
 * Accordion group key for the trips list —
 * oneday → ทริป วันเดียว; NSW overnight (Bermagui, Canola, …) → ทริปค้างคืน.
 */
export function tourListGroup(tour: Tour): string {
  const type = inferTripType(tour)
  if (type === 'oneday') return ONE_DAY_GROUP

  const dest = tourDestination(tour.trip_code)
  if (type === 'overnight' && OVERNIGHT_BUCKET_DESTINATIONS.has(dest)) {
    return OVERNIGHT_GROUP
  }

  // Explicit codes the client asked to keep under ค้างคืน even if type drifts
  const code = tour.trip_code.toUpperCase()
  if (code === 'BER-3D2N' || code === 'CAN-2D1N') return OVERNIGHT_GROUP

  return dest
}

export function tourDestinationLabel(destinationOrCode: string, lang: 'en' | 'th'): string {
  const dest = destinationOrCode.includes('-')
    ? tourDestination(destinationOrCode)
    : destinationOrCode
  if (lang === 'th') return DESTINATION_TH[dest] ?? dest
  return dest
}

export function destinationSortIndex(destination: string): number {
  const i = DESTINATION_ORDER.indexOf(destination as (typeof DESTINATION_ORDER)[number])
  return i === -1 ? 999 : i
}

export function groupToursByDestination(tours: Tour[]): { destination: string; tours: Tour[] }[] {
  const map = new Map<string, Tour[]>()
  for (const tour of tours) {
    const dest = tourListGroup(tour)
    const list = map.get(dest)
    if (list) list.push(tour)
    else map.set(dest, [tour])
  }
  return [...map.entries()]
    .map(([destination, group]) => ({ destination, tours: group }))
    .sort(
      (a, b) =>
        destinationSortIndex(a.destination) - destinationSortIndex(b.destination) ||
        a.destination.localeCompare(b.destination),
    )
}

export function tourDurationLabel(tour: Tour, lang: 'en' | 'th'): string {
  const days = tour.duration_days
  const nights = tour.duration_nights
  if (days == null) return lang === 'th' ? 'รอประกาศ' : 'TBA'
  if (nights != null && nights > 0) {
    return lang === 'th' ? `${days} วัน ${nights} คืน` : `${days}D ${nights}N`
  }
  if (tour.duration_label?.toUpperCase().includes('NIGHT')) {
    return lang === 'th' ? 'ทริปค่ำ' : 'Evening'
  }
  return lang === 'th' ? `${days} วัน` : `${days} day${days === 1 ? '' : 's'}`
}

export function inferTripType(tour: Tour): TripType {
  const raw = (tour.trip_type ?? '').toLowerCase().trim()
  if (raw === 'oneday' || raw === 'overnight' || raw === 'multiday') {
    return raw
  }
  const label = (tour.duration_label ?? '').toUpperCase()
  if (label.includes('1DAY') || label === 'NIGHT' || label === 'EVENING' || label === 'DAY') {
    return 'oneday'
  }
  const days = tour.duration_days ?? 1
  if (days <= 1) return 'oneday'
  if (days <= 2) return 'overnight'
  return 'multiday'
}

export function isAuroraTrip(tour: Tour): boolean {
  const code = tour.trip_code.toUpperCase()
  return code.includes('LH') || code.includes('AURORA')
}

/** Local Sydney day/evening trips — no flights or accommodation; meetup pickup only. */
export function isSydneyTrip(tripCode: string): boolean {
  return tripCode.toUpperCase().startsWith('SYD')
}
