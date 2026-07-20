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
  compliance_items: ['OWNER', 'MANAGER'],
  list_tours_admin: ['OWNER', 'MANAGER'],
  create_tour: ['OWNER', 'MANAGER'],
  create_tours_bulk: ['OWNER', 'MANAGER'],
  list_waitlist: ['OWNER', 'MANAGER'],
  mark_waitlist_contacted: ['OWNER', 'MANAGER'],
  create_booking_manual: ['OWNER', 'MANAGER', 'CASHIER'],
  mark_attendance: ['OWNER', 'MANAGER', 'GUIDE'],
  year_summary: ['OWNER', 'MANAGER'],
  delete_tour: ['OWNER', 'MANAGER'],
  record_payment: ['OWNER', 'MANAGER', 'CASHIER'],
  list_payments_for_booking: ['OWNER', 'MANAGER', 'CASHIER'],
  update_booking_details: ['OWNER', 'MANAGER', 'CASHIER'],
}

/**
 * Clones an existing tour row (whatever columns it actually has — production's
 * `tours` table has accumulated both legacy V5 names — next_date, price_standard,
 * max_pax, current_pax, deposit_amount — and newer ones — departure_date,
 * price_aud, max_seats, booked_seats — over time, so we don't assume a fixed
 * schema shape) and applies overrides, writing to BOTH naming conventions for
 * any field the template row actually has, so the new row displays correctly
 * regardless of which columns the live table uses.
 */
function buildTourInsert(
  template: Record<string, unknown>,
  overrides: {
    trip_code: string
    name_en?: string
    name_th?: string
    departure_date: string
    price_aud?: number
    deposit_aud?: number
    max_seats?: number
    status?: string
  },
): Record<string, unknown> {
  const row: Record<string, unknown> = { ...template }
  delete row.id
  delete row.created_at
  delete row.updated_at

  row.trip_code = overrides.trip_code
  if (overrides.name_en) row.name_en = overrides.name_en
  if (overrides.name_th) row.name_th = overrides.name_th
  if (overrides.status) row.status = overrides.status

  // Reset seat count for the new date regardless of naming.
  if ('booked_seats' in row) row.booked_seats = 0
  if ('current_pax' in row) row.current_pax = 0

  if ('departure_date' in row || !('next_date' in template)) row.departure_date = overrides.departure_date
  if ('next_date' in row) row.next_date = overrides.departure_date

  if (overrides.price_aud !== undefined) {
    if ('price_aud' in row || !('price_standard' in template)) row.price_aud = overrides.price_aud
    if ('price_standard' in row) row.price_standard = overrides.price_aud
  }
  if (overrides.deposit_aud !== undefined) {
    if ('deposit_aud' in row || !('deposit_amount' in template)) row.deposit_aud = overrides.deposit_aud
    if ('deposit_amount' in row) row.deposit_amount = overrides.deposit_aud
  }
  if (overrides.max_seats !== undefined) {
    if ('max_seats' in row || !('max_pax' in template)) row.max_seats = overrides.max_seats
    if ('max_pax' in row) row.max_pax = overrides.max_seats
  }

  return row
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
        // Public + cashier flows use lowercase statuses (pending_payment), not PENDING.
        const { data, error } = await admin
          .from('tour_bookings')
          .select('*')
          .in('booking_status', ['pending_payment', 'PENDING'])
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

      case 'compliance_items': {
        const { data, error } = await admin
          .from('compliance_items')
          .select('*')
          .order('due_date', { ascending: true })
        if (error) throw error
        return json({ data })
      }

      case 'list_tours_admin': {
        const { data, error } = await admin.from('tours').select('*')
        if (error) throw error
        return json({ data })
      }

      case 'create_tour': {
        const { templateTripCode, trip_code, name_en, name_th, departure_date, price_aud, deposit_aud, max_seats, status } =
          params as {
            templateTripCode?: string
            trip_code: string
            name_en?: string
            name_th?: string
            departure_date: string
            price_aud?: number
            deposit_aud?: number
            max_seats?: number
            status?: string
          }
        if (!trip_code || !departure_date) return json({ error: 'invalid_params' }, 400)

        const { data: existing } = await admin
          .from('tours')
          .select('id')
          .eq('trip_code', trip_code)
          .maybeSingle()
        if (existing) return json({ error: 'duplicate_trip_code' }, 409)

        let template: Record<string, unknown> | null = null
        if (templateTripCode) {
          const { data: templateRow, error: templateError } = await admin
            .from('tours')
            .select('*')
            .eq('trip_code', templateTripCode)
            .maybeSingle()
          if (templateError) throw templateError
          template = templateRow
        }
        if (!template) return json({ error: 'template_not_found' }, 404)

        const insertRow = buildTourInsert(template, {
          trip_code,
          name_en,
          name_th,
          departure_date,
          price_aud,
          deposit_aud,
          max_seats,
          status,
        })

        const { data, error } = await admin.from('tours').insert(insertRow).select().single()
        if (error) throw error
        return json({ data })
      }

      case 'create_tours_bulk': {
        const { templateTripCode, entries } = params as {
          templateTripCode?: string
          entries: {
            trip_code: string
            name_en?: string
            name_th?: string
            departure_date: string
            price_aud?: number
            deposit_aud?: number
            max_seats?: number
            status?: string
          }[]
        }
        if (!templateTripCode || !Array.isArray(entries) || entries.length === 0) {
          return json({ error: 'invalid_params' }, 400)
        }

        const { data: templateRow, error: templateError } = await admin
          .from('tours')
          .select('*')
          .eq('trip_code', templateTripCode)
          .maybeSingle()
        if (templateError) throw templateError
        if (!templateRow) return json({ error: 'template_not_found' }, 404)

        const { data: existingRows, error: existingError } = await admin
          .from('tours')
          .select('trip_code')
          .in(
            'trip_code',
            entries.map((e) => e.trip_code),
          )
        if (existingError) throw existingError
        const existingCodes = new Set((existingRows ?? []).map((r) => r.trip_code as string))

        const toInsert = entries
          .filter((e) => !existingCodes.has(e.trip_code))
          .map((e) => buildTourInsert(templateRow, e))

        const skipped = entries.filter((e) => existingCodes.has(e.trip_code)).map((e) => e.trip_code)

        if (toInsert.length === 0) {
          return json({ data: [], skipped })
        }

        const { data, error } = await admin.from('tours').insert(toInsert).select()
        if (error) throw error
        return json({ data, skipped })
      }

      case 'list_waitlist': {
        const { data, error } = await admin
          .from('waitlist_entries')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return json({ data })
      }

      case 'mark_waitlist_contacted': {
        const { id, contacted } = params as { id: string; contacted: boolean }
        if (!id) return json({ error: 'invalid_params' }, 400)
        const { error } = await admin
          .from('waitlist_entries')
          .update({ contacted: contacted !== false })
          .eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'create_booking_manual': {
        const b = params as Record<string, unknown>
        const tripCode = b.trip_code as string | undefined
        if (!tripCode) return json({ error: 'invalid_params' }, 400)

        const { data: tour, error: tourError } = await admin
          .from('tours')
          .select('*')
          .eq('trip_code', tripCode)
          .maybeSingle()
        if (tourError) throw tourError
        if (!tour) return json({ error: 'tour_not_found' }, 404)

        // Same seat-hold RPC the public booking flow uses, so staff-entered
        // bookings (phone/Facebook customers) can't oversell a trip either.
        const { data: rpcResult, error: rpcError } = await admin.rpc('book_seat', {
          p_tour_id: tour.id,
          p_seats_requested: 1,
        })
        const rpcOk =
          rpcResult === true ||
          (rpcResult && typeof rpcResult === 'object' && (rpcResult as { success?: unknown }).success === true)
        if (rpcError || !rpcOk) {
          return json({ error: 'seats_full' }, 409)
        }

        const bookingRef = `T2T-STAFF-${tripCode}-${Date.now().toString(36).toUpperCase()}`

        const { data, error } = await admin
          .from('tour_bookings')
          .insert({
            tour_id: tour.id,
            trip_code: tripCode,
            first_name_th: '',
            last_name_th: '',
            first_name_en: b.first_name_en ?? '',
            last_name_en: b.last_name_en ?? '',
            passport_number: b.passport_number || 'PENDING',
            date_of_birth: b.date_of_birth ?? null,
            email: b.email ?? '',
            phone: b.phone ?? '',
            emergency_contact_name: b.emergency_contact_name ?? null,
            emergency_contact_phone: b.emergency_contact_phone ?? null,
            dietary_requirements: b.dietary_requirements ?? null,
            medical_conditions: b.medical_conditions ?? null,
            oshc_provider: null,
            oshc_expiry: null,
            waiver_signed: false,
            waiver_signed_at: null,
            booking_status: b.booking_status ?? 'pending_payment',
            amount_paid_aud: b.amount_paid_aud ?? 0,
            payment_method: b.payment_method ?? 'manual',
            source: b.source ?? 'facebook',
            payment_plan_installments: b.payment_plan_installments ?? 1,
            slip_url: null,
            booking_reference: bookingRef,
          })
          .select()
          .single()

        if (error) {
          await admin.rpc('release_seat', { p_tour_id: tour.id, p_seats_to_release: 1 })
          throw error
        }

        // Keep the payments ledger consistent with amount_paid_aud so
        // "installment X of Y" displays correctly even for the first
        // payment taken at the moment the booking is created.
        const initialAmount = Number(b.amount_paid_aud ?? 0)
        if (initialAmount > 0 && data) {
          await admin.from('booking_payments').insert({
            booking_id: data.id,
            amount_aud: initialAmount,
            payment_method: b.payment_method ?? 'manual',
            installment_no: 1,
          })
        }

        return json({ data })
      }

      case 'mark_attendance': {
        const { id, attended } = params as { id: string; attended: boolean | null }
        if (!id) return json({ error: 'invalid_params' }, 400)
        const { error } = await admin.from('tour_bookings').update({ attended }).eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'record_payment': {
        // Records one installment against a booking (append-only ledger) and
        // bumps the booking's running total + status. Supports customers who
        // split the trip price into 2-4 payments — each call here is one of
        // those payments, and each gets its own tax invoice on the frontend.
        const { bookingId, amount, paymentMethod } = params as {
          bookingId: string
          amount: number
          paymentMethod?: string
        }
        if (!bookingId || !amount || amount <= 0) return json({ error: 'invalid_params' }, 400)

        const { data: booking, error: bookingError } = await admin
          .from('tour_bookings')
          .select('*')
          .eq('id', bookingId)
          .maybeSingle()
        if (bookingError) throw bookingError
        if (!booking) return json({ error: 'booking_not_found' }, 404)

        const { data: tour } = await admin
          .from('tours')
          .select('*')
          .eq('id', booking.tour_id)
          .maybeSingle()
        const priceAud = tour ? Number(tour.price_aud ?? tour.price_standard ?? 0) : 0

        const { count, error: countError } = await admin
          .from('booking_payments')
          .select('id', { count: 'exact', head: true })
          .eq('booking_id', bookingId)
        if (countError) throw countError
        const installmentNo = (count ?? 0) + 1

        const { data: payment, error: paymentError } = await admin
          .from('booking_payments')
          .insert({
            booking_id: bookingId,
            amount_aud: amount,
            payment_method: paymentMethod ?? 'manual',
            installment_no: installmentNo,
          })
          .select()
          .single()
        if (paymentError) throw paymentError

        const newTotal = Number(booking.amount_paid_aud ?? 0) + Number(amount)
        const newStatus = priceAud > 0 && newTotal >= priceAud ? 'fully_paid' : 'deposit_paid'

        const { error: updateError } = await admin
          .from('tour_bookings')
          .update({ amount_paid_aud: newTotal, booking_status: newStatus })
          .eq('id', bookingId)
        if (updateError) throw updateError

        return json({
          data: {
            payment,
            amount_paid_aud: newTotal,
            booking_status: newStatus,
            price_aud: priceAud,
            installment_no: installmentNo,
            installment_plan: booking.payment_plan_installments ?? null,
          },
        })
      }

      case 'update_booking_details': {
        // Fixes typos entered at booking time (name/phone/email) — does NOT
        // touch payment amounts, status, or seat counts. Staff use this when
        // a customer's name was misspelled so the tax invoice/receipt can be
        // reissued correctly.
        const { id, first_name_en, last_name_en, phone, email } = params as {
          id: string
          first_name_en?: string
          last_name_en?: string
          phone?: string
          email?: string
        }
        if (!id) return json({ error: 'invalid_params' }, 400)

        const payload: Record<string, unknown> = {}
        if (first_name_en !== undefined) payload.first_name_en = first_name_en.trim()
        if (last_name_en !== undefined) payload.last_name_en = last_name_en.trim()
        if (phone !== undefined) payload.phone = phone.trim()
        if (email !== undefined) payload.email = email.trim()

        if (Object.keys(payload).length === 0) return json({ error: 'invalid_params' }, 400)

        const { data, error } = await admin
          .from('tour_bookings')
          .update(payload)
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return json({ data })
      }

      case 'list_payments_for_booking': {
        const { bookingId } = params as { bookingId: string }
        if (!bookingId) return json({ error: 'invalid_params' }, 400)
        const { data, error } = await admin
          .from('booking_payments')
          .select('*')
          .eq('booking_id', bookingId)
          .order('installment_no', { ascending: true })
        if (error) throw error
        return json({ data })
      }

      case 'delete_tour': {
        // Permanent delete — only for trips that never had a real booking
        // (test/example rows). Anything with bookings must be kept for tax
        // records, so we refuse rather than cascade-delete.
        const { id } = params as { id: string }
        if (!id) return json({ error: 'invalid_params' }, 400)

        const { data: bookingRows, error: bookingError } = await admin
          .from('tour_bookings')
          .select('id')
          .eq('tour_id', id)
          .limit(1)
        if (bookingError) throw bookingError
        if (bookingRows && bookingRows.length > 0) {
          return json({ error: 'has_bookings' }, 409)
        }

        const { error } = await admin.from('tours').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'year_summary': {
        const { year } = params as { year: number }
        const y = Number(year) || new Date().getFullYear()
        const start = `${y}-01-01T00:00:00.000Z`
        const end = `${y + 1}-01-01T00:00:00.000Z`

        const [bookingsRes, expensesRes] = await Promise.all([
          admin
            .from('tour_bookings')
            .select('*')
            .gte('booked_at', start)
            .lt('booked_at', end),
          admin
            .from('expenses')
            .select('*')
            .gte('expense_date', `${y}-01-01`)
            .lt('expense_date', `${y + 1}-01-01`),
        ])
        if (bookingsRes.error) throw bookingsRes.error
        if (expensesRes.error) throw expensesRes.error

        return json({ data: { bookings: bookingsRes.data, expenses: expensesRes.data } })
      }

      default:
        return json({ error: 'unknown_action' }, 400)
    }
  } catch (err) {
    console.error(`[staff-api] action "${action}" failed`, err)
    return json({ error: 'server_error' }, 500)
  }
})
