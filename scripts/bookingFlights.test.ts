import assert from 'node:assert/strict'
import test from 'node:test'
import {
  arriveAfterDepart,
  canRebookFlight,
  currentFlight,
  customerFlightPayload,
  iataCode,
  showNoFlightMessage,
  type BookingFlight,
} from '../src/lib/bookingFlights.ts'
import { MISSED_FLIGHT_POLICY, tripIncludesFlights } from '../src/data/missedFlightPolicy.ts'

function row(partial: Partial<BookingFlight> & Pick<BookingFlight, 'id' | 'status' | 'created_at'>): BookingFlight {
  return {
    booking_id: 'b1',
    leg: 'outbound',
    booked_by: 'customer',
    airline: 'Jetstar',
    flight_no: 'JQ223',
    from_airport: 'SYD',
    to_airport: 'ZQN',
    depart_at: '2026-11-15T06:00:00Z',
    arrive_at: '2026-11-15T11:00:00Z',
    depart_tz: 'Australia/Sydney',
    arrive_tz: 'Pacific/Auckland',
    replaces_flight_id: null,
    ...partial,
  }
}

test('IATA input keeps 3 letters, uppercased', () => {
  assert.equal(iataCode(' syd '), 'SYD')
  assert.equal(iataCode('zqn1'), 'ZQN')
  assert.equal(iataCode('SYDN'), 'SYD')
})

test('arrival must be after departure', () => {
  assert.equal(arriveAfterDepart('2026-11-15T06:00:00Z', '2026-11-15T11:00:00Z'), true)
  assert.equal(arriveAfterDepart('2026-11-15T11:00:00Z', '2026-11-15T06:00:00Z'), false)
  assert.equal(arriveAfterDepart('2026-11-15T06:00:00Z', '2026-11-15T06:00:00Z'), false)
})

test('two rebooks leave only the latest flight current', () => {
  const flights = [
    row({ id: 'a', status: 'missed', created_at: '2026-11-01T00:00:00Z' }),
    row({ id: 'b', status: 'missed', created_at: '2026-11-02T00:00:00Z', replaces_flight_id: 'a' }),
    row({ id: 'c', status: 'rebooked', created_at: '2026-11-03T00:00:00Z', replaces_flight_id: 'b', flight_no: 'JQ999' }),
  ]
  assert.equal(currentFlight(flights, 'outbound')?.id, 'c')
  assert.equal(currentFlight(flights, 'outbound')?.flight_no, 'JQ999')
})

test('rebook of an already-closed flight is rejected', () => {
  assert.equal(canRebookFlight('scheduled'), true)
  assert.equal(canRebookFlight('rebooked'), true)
  assert.equal(canRebookFlight('missed'), false)
  assert.equal(canRebookFlight('cancelled'), false)
})

test('missed-flight checkbox is required only on flight trips', () => {
  assert.equal(tripIncludesFlights('NZ-6D5N-NOV15_20'), true)
  assert.equal(tripIncludesFlights('TAS-SU-JAN22_25'), true)
  assert.equal(tripIncludesFlights('SYD-1DAY-AUG1_1'), false)
  assert.equal(tripIncludesFlights('SYD-MW-WIN'), false)
  assert.equal(tripIncludesFlights('TAS-3D2N', 'oneday'), false)
})

test('customer flight payload has no staff-only fields', () => {
  const payload = customerFlightPayload({
    id: '1',
    leg: 'outbound',
    airline: 'Jetstar',
    flight_no: 'JQ223',
    pnr: 'SECRET',
    staff_note: 'internal',
    missed_reason: 'customer',
    status: 'rebooked',
  })
  assert.equal('pnr' in payload, false)
  assert.equal('staff_note' in payload, false)
  assert.equal('missed_reason' in payload, false)
  assert.equal(payload.flight_no, 'JQ223')
})

test('a failed flight load never shows the empty-flight line', () => {
  assert.equal(showNoFlightMessage(true, false), false)
  assert.equal(showNoFlightMessage(false, false), true)
})

test('missed flight policy keeps the Trip2Talk error sentence', () => {
  assert.ok(MISSED_FLIGHT_POLICY.th.paragraphs.some((line) => line.includes('หากเกิดจากความผิดพลาดของ Trip2Talk')))
  assert.ok(MISSED_FLIGHT_POLICY.en.paragraphs.some((line) => line.includes('If the cause is a Trip2Talk error')))
})
