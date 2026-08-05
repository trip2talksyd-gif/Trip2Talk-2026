// Trip2Talk — reset-pin Edge Function
//
// OWNER-only: validates an existing staff_sessions token (same model as
// staff-api), generates a crypto-random 4-digit PIN, stores bcrypt hash only,
// returns plaintext PIN once. Never logs the plaintext PIN.
//
// bcrypt cost matches scripts/hash-pins.mjs (rounds = 10).

import { createClient } from 'npm:@supabase/supabase-js@2'
import bcrypt from 'npm:bcryptjs@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BCRYPT_ROUNDS = 10

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

/** Crypto-safe 0000–9999 (not Math.random). */
function generateFourDigitPin(): string {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return String(buf[0] % 10000).padStart(4, '0')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: { token?: unknown; staff_id?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const staffId = typeof body.staff_id === 'string' ? body.staff_id.trim() : ''
  if (!token || !staffId) return json({ error: 'invalid_request' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  try {
    const { data: session, error: sessionError } = await admin
      .from('staff_sessions')
      .select('role, expires_at, staff_id, full_name')
      .eq('token', token)
      .maybeSingle()

    if (sessionError) {
      console.error('[reset-pin] session lookup failed')
      return json({ error: 'server_error' }, 500)
    }
    if (!session || new Date(session.expires_at) < new Date()) {
      return json({ error: 'session_expired' }, 401)
    }
    if (session.role !== 'OWNER') {
      return json({ error: 'forbidden' }, 403)
    }

    const { data: target, error: targetError } = await admin
      .from('staff_profiles')
      .select('id, full_name, role, active')
      .eq('id', staffId)
      .maybeSingle()

    if (targetError) {
      console.error('[reset-pin] staff lookup failed')
      return json({ error: 'server_error' }, 500)
    }
    if (!target) return json({ error: 'staff_not_found' }, 404)

    const plaintextPin = generateFourDigitPin()
    const pinHash = bcrypt.hashSync(plaintextPin, BCRYPT_ROUNDS)

    const { error: updateError } = await admin
      .from('staff_profiles')
      .update({ pin_hash: pinHash })
      .eq('id', staffId)

    if (updateError) {
      console.error('[reset-pin] pin_hash update failed')
      return json({ error: 'server_error' }, 500)
    }

    // Force re-login with the new PIN (do not log which sessions were cleared).
    const { error: purgeError } = await admin
      .from('staff_sessions')
      .delete()
      .eq('staff_id', staffId)

    if (purgeError) {
      console.warn('[reset-pin] session purge failed (PIN was still updated)')
    }

    // Plaintext returned once — never console.log / store.
    return json({
      staff_id: target.id,
      full_name: target.full_name,
      role: target.role,
      pin: plaintextPin,
    })
  } catch (err) {
    console.error('[reset-pin] unexpected error', err instanceof Error ? err.name : 'unknown')
    return json({ error: 'server_error' }, 500)
  }
})
