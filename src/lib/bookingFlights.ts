export type FlightLeg = 'outbound' | 'return'
export type FlightStatus = 'scheduled' | 'missed' | 'rebooked' | 'cancelled'

export type BookingFlight = {
  id: string
  booking_id: string
  leg: FlightLeg
  booked_by: 'customer' | 'trip2talk'
  airline: string
  flight_no: string
  from_airport: string
  to_airport: string
  depart_at: string
  arrive_at: string
  depart_tz: string
  arrive_tz: string
  pnr?: string | null
  status: FlightStatus
  missed_reason?: 'customer' | 'airline' | 'trip2talk' | 'other' | null
  replaces_flight_id: string | null
  staff_note?: string | null
  created_at: string
  updated_at?: string
  updated_by_staff_id?: string | null
}

export type BookingFlightWrite = {
  booking_id: string
  leg: FlightLeg
  booked_by: 'customer' | 'trip2talk'
  airline: string
  flight_no: string
  from_airport: string
  to_airport: string
  depart_at: string
  arrive_at: string
  depart_tz: string
  arrive_tz: string
  pnr?: string | null
  staff_note?: string | null
}

export type CustomerFlight = {
  id: string
  leg: FlightLeg
  airline: string
  flight_no: string
  from_airport: string
  to_airport: string
  depart_at: string
  arrive_at: string
  depart_tz: string
  arrive_tz: string
  status: FlightStatus
}

const LEGS: FlightLeg[] = ['outbound', 'return']

export function flightsForBooking(rows: BookingFlight[], bookingId: string): BookingFlight[] {
  return rows.filter((row) => row.booking_id === bookingId)
}

export function currentFlight(rows: BookingFlight[], leg: FlightLeg): BookingFlight | null {
  const live = rows
    .filter((row) => row.leg === leg && row.status !== 'missed' && row.status !== 'cancelled')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  return live[live.length - 1] ?? null
}

export function historyFlights(rows: BookingFlight[], leg: FlightLeg, currentId: string | null): BookingFlight[] {
  return rows
    .filter((row) => row.leg === leg && row.id !== currentId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function replacedFlight(rows: BookingFlight[], current: BookingFlight | null): BookingFlight | null {
  if (!current?.replaces_flight_id) return null
  return rows.find((row) => row.id === current.replaces_flight_id) ?? null
}

export function legPairs(rows: BookingFlight[]): { leg: FlightLeg; current: BookingFlight | null; previous: BookingFlight | null }[] {
  return LEGS.map((leg) => {
    const current = currentFlight(rows, leg)
    return { leg, current, previous: replacedFlight(rows, current) }
  }).filter((pair) => pair.current || pair.previous)
}

const AIRPORT_CITY: Record<string, string> = {
  SYD: 'Sydney',
  MEL: 'Melbourne',
  BNE: 'Brisbane',
  OOL: 'Gold Coast',
  CNS: 'Cairns',
  HBA: 'Hobart',
  LST: 'Launceston',
  ADL: 'Adelaide',
  PER: 'Perth',
  DRW: 'Darwin',
  CBR: 'Canberra',
  AKL: 'Auckland',
  ZQN: 'Queenstown',
  CHC: 'Christchurch',
  WLG: 'Wellington',
}

export function airportCity(code: string): string {
  return AIRPORT_CITY[code.toUpperCase()] ?? code.toUpperCase()
}

/** Sun 15 Nov · 06:00 */
export function formatFlightLocal(iso: string, timeZone: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  try {
    const parts = new Intl.DateTimeFormat('en-AU', {
      timeZone: timeZone || 'UTC',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)
    const bag: Record<string, string> = {}
    for (const part of parts) {
      if (part.type !== 'literal') bag[part.type] = part.value
    }
    const hour = String(Number(bag.hour) % 24).padStart(2, '0')
    return `${bag.weekday} ${bag.day} ${bag.month} · ${hour}:${bag.minute}`
  } catch {
    return date.toISOString()
  }
}

export function formatClock(iso: string, timeZone: string): string {
  const date = new Date(iso)
  try {
    const parts = new Intl.DateTimeFormat('en-AU', {
      timeZone: timeZone || 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)
    const bag: Record<string, string> = {}
    for (const part of parts) {
      if (part.type !== 'literal') bag[part.type] = part.value
    }
    return `${String(Number(bag.hour) % 24).padStart(2, '0')}:${bag.minute}`
  } catch {
    return iso
  }
}

/** JQ223 · SYD 06:00 Sydney → ZQN 11:05 Queenstown */
export function flightSheetLine(row: Pick<BookingFlight, 'flight_no' | 'from_airport' | 'to_airport' | 'depart_at' | 'arrive_at' | 'depart_tz' | 'arrive_tz'>): string {
  return `${row.flight_no} · ${row.from_airport} ${formatClock(row.depart_at, row.depart_tz)} ${airportCity(row.from_airport)} → ${row.to_airport} ${formatClock(row.arrive_at, row.arrive_tz)} ${airportCity(row.to_airport)}`
}

/** Wall-clock `YYYY-MM-DDTHH:mm` in an IANA zone → UTC ISO. */
export function zonedLocalToIso(local: string, timeZone: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local)
  if (!match) throw new Error('invalid_local')
  const desired = Date.UTC(+match[1], +match[2] - 1, +match[3], +match[4], +match[5])
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  const asUtc = (ms: number) => {
    const bag: Record<string, string> = {}
    for (const part of fmt.formatToParts(new Date(ms))) {
      if (part.type !== 'literal') bag[part.type] = part.value
    }
    return Date.UTC(+bag.year, +bag.month - 1, +bag.day, Number(bag.hour) % 24, +bag.minute)
  }
  let guess = desired
  for (let i = 0; i < 3; i++) guess -= asUtc(guess) - desired
  return new Date(guess).toISOString()
}

export function isoToZonedLocal(iso: string, timeZone: string): string {
  const date = new Date(iso)
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  const bag: Record<string, string> = {}
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== 'literal') bag[part.type] = part.value
  }
  const hour = String(Number(bag.hour) % 24).padStart(2, '0')
  return `${bag.year}-${bag.month}-${bag.day}T${hour}:${bag.minute}`
}

export function iataCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
}

export function arriveAfterDepart(departIso: string, arriveIso: string): boolean {
  const depart = Date.parse(departIso)
  const arrive = Date.parse(arriveIso)
  return Number.isFinite(depart) && Number.isFinite(arrive) && arrive > depart
}

/** Matches rebook_booking_flight: only scheduled or rebooked rows can be replaced. */
export function canRebookFlight(status: string): boolean {
  return status === 'scheduled' || status === 'rebooked'
}

const CUSTOMER_FLIGHT_KEYS = [
  'id',
  'leg',
  'airline',
  'flight_no',
  'from_airport',
  'to_airport',
  'depart_at',
  'arrive_at',
  'depart_tz',
  'arrive_tz',
  'status',
  'created_at',
] as const

/** Shape lookup-my-trip may return. Drops staff-only columns. */
export function customerFlightPayload(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of CUSTOMER_FLIGHT_KEYS) {
    if (key in row) out[key] = row[key]
  }
  return out
}

export function showNoFlightMessage(loadFailed: boolean, hasFlight: boolean): boolean {
  return !loadFailed && !hasFlight
}

