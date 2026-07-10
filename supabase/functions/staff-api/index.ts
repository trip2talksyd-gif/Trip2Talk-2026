// Trip2Talk V5 — staff-api Edge Function
//
// Single authenticated proxy for every staff-only read/write. The browser
// never talks to PostgREST directly for protected tables (tour_bookings
// select/update, expenses, staff_commission_ledger, insurance_alerts,
// compliance_items, waiver_signatures select) — RLS revokes all
// anon/authenticated grants on those tables (see 2026-07-rls-lockdown.sql),
// so this function is the only path in. It validates the session token
// against staff_sessions, checks the role is allowed for the requested
// action, then executes the query with the service-role key (bypasses RLS).
//
// Request: POST { token: string, action: string, params?: object }
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-provided)

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

type Role = 'OWNER' | 'MANAGER' | 'GUIDE' | 'CASHIER'

const ACTION_ROLES: Record<string, Role[]> = {
  list_pending_bookings: ['OWNER', 'MANAGER', 'CASHIER'],
  update_booking_status: ['OWNER', 'MANAGER', 'CASHIER'],
  list_bookings_for_tour: ['OWNER', 'MANAGER', 'GUIDE'],
  bookings_this_month: ['OWNER', 'MANAGER'],
  expenses_this_month: ['OWNER', 'MANAGER'],
  insert_expense: ['OWNER', 'MANAGER'],
  insurance_alerts: ['OWNER', 'MANAGER', 'GUIDE', 'CASHIER'],
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let body: { token?: string; action?: string; params?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_request' }, 400)
  }

  const { token, action, params = {} } = body
  if (!token || !action) return json({ error: 'invalid_request' }, 400)

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: session, error: sessionError } = await admin
    .from('staff_sessions')
    .select('role, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (sessionError) {
    console.error('[staff-api] session lookup failed', sessionError)
    return json({ error: 'server_error' }, 500)
  }
  if (!session || new Date(session.expires_at) < new Date()) {
    return json({ error: 'session_expired' }, 401)
  }

  const allowedRoles = ACTION_ROLES[action]
  if (!allowedRoles) return json({ error: 'unknown_action' }, 400)
  if (!allowedRoles.includes(session.role as Role)) return json({ error: 'forbidden' }, 403)

  try {
    switch (action) {
      case 'list_pending_bookings': {
        const { data, error } = await admin
          .from('tour_bookings')
          .select('*')
          .eq('booking_status', 'PENDING')
          .order('booked_at', { ascending: false })
        if (error) throw error
        return json({ data })
      }

      case 'update_booking_status': {
        const { id, status, amountPaid } = params as {
          id: string
          status: string
          amountPaid?: number
        }
        if (!id || !status) return json({ error: 'invalid_params' }, 400)
        const payload: Record<string, unknown> = { booking_status: status }
        if (amountPaid !== undefined) payload.amount_paid_aud = amountPaid
        const { error } = await admin.from('tour_bookings').update(payload).eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'list_bookings_for_tour': {
        const { tourId } = params as { tourId: string }
        if (!tourId) return json({ error: 'invalid_params' }, 400)
        const { data, error } = await admin
          .from('tour_bookings')
          .select('*')
          .eq('tour_id', tourId)
          .order('booked_at', { ascending: false })
        if (error) throw error
        return json({ data })
      }

      case 'bookings_this_month': {
        const start = new Date()
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        const { data, error } = await admin
          .from('tour_bookings')
          .select('*')
          .gte('booked_at', start.toISOString())
        if (error) throw error
        return json({ data })
      }

      case 'expenses_this_month': {
        const start = new Date()
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        const { data, error } = await admin
          .from('expenses')
          .select('*')
          .gte('created_at', start.toISOString())
        if (error) throw error
        return json({ data })
      }

      case 'insert_expense': {
        const expense = params as Record<string, unknown>
        const { data, error } = await admin.from('expenses').insert(expense).select().single()
        if (error) throw error
        return json({ data })
      }

      case 'insurance_alerts': {
        const { data, error } = await admin
          .from('insurance_alerts')
          .select('*')
          .eq('is_active', true)
          .order('expiry_date', { ascending: true })
        if (error) throw error
        return json({ data })
      }

      default:
        return json({ error: 'unknown_action' }, 400)
    }
  } catch (err) {
    console.error(`[staff-api] action "${action}" failed`, err)
    return json({ error: 'server_error' }, 500)
  }
})
