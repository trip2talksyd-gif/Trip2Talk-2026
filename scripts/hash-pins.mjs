#!/usr/bin/env node
// Generates bcrypt hashes for staff PINs and prints ready-to-paste SQL.
// Usage: node scripts/hash-pins.mjs 1111 4444 9999

import bcrypt from 'bcryptjs'

const pins = process.argv.slice(2)

if (pins.length === 0) {
  console.log('Usage: node scripts/hash-pins.mjs <pin1> <pin2> ...')
  process.exit(1)
}

for (const pin of pins) {
  if (!/^\d{4}$/.test(pin)) {
    console.error(`Skipping "${pin}" — PIN must be exactly 4 digits`)
    continue
  }
  const hash = bcrypt.hashSync(pin, 10)
  console.log(`update public.staff_profiles set pin_hash = '${hash}' where pin_code = '${pin}';`)
}
