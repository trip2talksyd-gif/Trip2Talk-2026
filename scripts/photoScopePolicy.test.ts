import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  DELIVERY,
  PHOTO_DELIVERY_PENDING,
  PHOTO_SCOPE_CARD_CLASS,
  formatPhotoDelivery,
  photoDeliveryLine,
  requiresPhotoScopeAck,
} from '../src/data/photoScopePolicy.ts'

test('photography checkbox is required on every trip', () => {
  assert.equal(requiresPhotoScopeAck(), true)
  const booking = readFileSync(new URL('../src/pages/public/BookingPage.tsx', import.meta.url), 'utf8')
  assert.match(booking, /photo_scope_ack_at/)
  assert.match(booking, /if \(!photoScopeAck\)/)
})

test('delivery days stay hidden until confirmed', () => {
  assert.equal(DELIVERY.confirmed, false)
  assert.equal(photoDeliveryLine('en'), PHOTO_DELIVERY_PENDING.en)
  assert.equal(photoDeliveryLine('th'), PHOTO_DELIVERY_PENDING.th)
  assert.equal(photoDeliveryLine('en').includes('3'), false)
  const shown = formatPhotoDelivery({ highlightsDays: 3, fullAlbumDays: 30, confirmed: true }, 'en')
  assert.match(shown, /3 days/)
  assert.match(shown, /30 days/)
})

test('photo scope card stacks below the md breakpoint', () => {
  assert.match(PHOTO_SCOPE_CARD_CLASS, /grid-cols-1/)
  assert.match(PHOTO_SCOPE_CARD_CLASS, /md:grid-cols-2/)
  assert.equal(PHOTO_SCOPE_CARD_CLASS.startsWith('grid grid-cols-2'), false)
})
