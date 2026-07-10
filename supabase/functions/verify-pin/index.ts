// Trip2Talk V5 — verify-pin Edge Function
//
// Checks a staff PIN against a bcrypt hash (service-role key, server-side —
// the browser never sees pin_hash) and, on success, mints an opaque random
// session token stored in staff_sessions. This does NOT sign a Supabase-
// recognized JWT — the project's real JWT secret turned out to be
// unretrievable (masked permanently in Vercel), so staff auth is validated
// entirely inside Edge Functions (staff-api) rather than via PostgREST/RLS
// reading auth.jwt(). See supabase/2026-07-staff-sessions.sql.
//
// Required secrets (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
// auto-provided by the platform — nothing else to configure):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'npm:@supabase/supabase-js@2'
import bcrypt from 'npm:bcryptjs@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let pin: unknown
  try {
    ;({ pin } = await req.json())
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return json({ error: 'invalid_pin' }, 400)
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data: staffList, error } = await admin
      .from('staff_profiles')
      .select('id, pin_hash, full_name, role')

    if (error) throw error

    const match = (staffList ?? []).find(
      (s) => typeof s.pin_hash === 'string' && s.pin_hash.length > 0 && bcrypt.compareSync(pin, s.pin_hash),
    )

    if (!match) {
      // Small fixed delay so failed lookups don't reveal timing info about hash comparisons.
      await new Promise((resolve) => setTimeout(resolve, 150))
      return json({ error: 'invalid_pin' }, 401)
    }

    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString()
    const { data: session, error: sessionError } = await admin
      .from('staff_sessions')
      .insert({
        staff_id: match.id,
        role: match.role,
        full_name: match.full_name,
        expires_at: expiresAt,
      })
      .select('token')
      .single()

    if (sessionError) throw sessionError

    return json({ token: session.token, role: match.role, full_name: match.full_name })
  } catch (err) {
    console.error('[verify-pin] error', err)
    return json({ error: 'server_error' }, 500)
  }
})
