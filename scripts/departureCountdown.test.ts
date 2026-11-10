import assert from 'node:assert/strict'
import test from 'node:test'
import { countdownFinished, countdownParts, sydneyDepartureMs } from '../src/lib/departureCountdown.ts'

test('147 days from 9 Nov 2026 to 5 Apr 2027 Sydney midnight', () => {
  const from = sydneyDepartureMs('2026-11-09')
  const to = sydneyDepartureMs('2027-04-05')
  assert.ok(from != null && to != null)
  assert.equal(countdownParts(to - from)?.days, 147)
  // Nov is AEDT and April is AEST, so the clock span is 147 days plus 1 hour.
  assert.equal(countdownParts(to - from)?.hours, 1)
})

test('countdown finishes at Sydney midnight on the departure date', () => {
  const before = new Date('2026-04-04T12:00:00Z')
  const atMidnight = new Date('2026-04-04T14:00:00Z')
  assert.equal(countdownFinished('2026-04-05', before), false)
  assert.equal(countdownFinished('2026-04-05', atMidnight), true)
  assert.equal(countdownFinished(null, atMidnight), false)
})

test('past or zero is not a countdown', () => {
  assert.equal(countdownParts(0), null)
  assert.equal(countdownParts(-1), null)
})
