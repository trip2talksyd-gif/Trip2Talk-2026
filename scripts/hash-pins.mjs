#!/usr/bin/env node
// One PIN from a hidden prompt. Prints a bcrypt hash and an UPDATE. Never prints the PIN.

import readline from 'node:readline'
import bcrypt from 'bcryptjs'

const prompt = 'PIN: '
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

// Mute echoed keystrokes. The prompt itself still prints.
rl._writeToOutput = function writeMuted(stringToWrite) {
  if (stringToWrite.startsWith(prompt)) rl.output.write(stringToWrite)
}

const pin = await new Promise((resolve) => {
  rl.question(prompt, (answer) => {
    rl.output.write('\n')
    rl.close()
    resolve(answer)
  })
})

if (!/^\d{4}$/.test(pin)) {
  console.error('PIN must be exactly 4 digits')
  process.exit(1)
}

const hash = bcrypt.hashSync(pin, 10)
console.log(hash)
console.log(`update public.staff_profiles set pin_hash = '${hash}' where id = '<OWNER_ID>';`)
