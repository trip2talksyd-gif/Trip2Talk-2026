import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

export type MarkSquarePaidResult = {
  ok: boolean
  skipped?: boolean
  repaired?: boolean
  error?: string
  booking_status?: string
  amount_paid_aud?: number
}

type ApplyRow = {
  ok?: boolean
  skipped?: boolean
  repaired?: boolean
  error?: string
  booking_status?: string
  amount_paid_aud?: number
}

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
}

function logReconciliation(opts: {
  bookingRef: string
  paymentId: string
  error: string
  source: string
}): void {
  console.error(
    `[square-mark-paid] RECONCILIATION_NEEDED booking_ref=${opts.bookingRef} payment_id=${opts.paymentId} source=${opts.source} error=${opts.error}`,
  )
}

async function recordReconciliationIssue(
  admin: ReturnType<typeof adminClient>,
  opts: {
    bookingRef: string
    paymentId: string
    amountCents: number
    paymentMethod: string
    reason: string
    detail: string
    source: string
    bookingId?: string | null
  },
): Promise<void> {
  logReconciliation({
    bookingRef: opts.bookingRef,
    paymentId: opts.paymentId,
    error: opts.reason,
    source: opts.source,
  })
  const { error } = await admin.from('payment_reconciliation_issues').insert({
    booking_id: opts.bookingId ?? null,
    booking_reference: opts.bookingRef,
    external_payment_id: opts.paymentId,
    amount_cents: opts.amountCents,
    payment_method: opts.paymentMethod,
    reason: opts.reason,
    detail: opts.detail.slice(0, 2000),
    source: opts.source,
  })
  if (error && String(error.code) !== '23505') {
    console.error('[square-mark-paid] failed to insert payment_reconciliation_issues', error)
  }
}

/** Idempotent: records a Square payment and updates booking status in one DB transaction. */
export async function markSquarePaid(opts: {
  bookingRef: string
  amountCents: number
  paymentId: string
  paymentMethod?: string
  source?: string
}): Promise<MarkSquarePaidResult> {
  const admin = adminClient()
  const paymentMethod = opts.paymentMethod || 'square'
  const source = opts.source || 'square-mark-paid'
  const bookingRef = opts.bookingRef.trim().toUpperCase()

  try {
    const { data, error } = await admin.rpc('apply_square_payment', {
      p_booking_ref: bookingRef,
      p_amount_cents: Math.round(opts.amountCents),
      p_payment_id: opts.paymentId,
      p_payment_method: paymentMethod,
    })
    if (error) {
      await recordReconciliationIssue(admin, {
        bookingRef,
        paymentId: opts.paymentId,
        amountCents: opts.amountCents,
        paymentMethod,
        reason: 'mark_paid_failed',
        detail: error.message || String(error.code || 'rpc_error'),
        source,
      })
      return { ok: false, error: error.message || 'apply_square_payment_failed' }
    }

    const row = (data ?? {}) as ApplyRow
    if (!row.ok) {
      const err = row.error || 'apply_square_payment_failed'
      let bookingId: string | null = null
      if (err !== 'booking_not_found') {
        const { data: booking } = await admin
          .from('tour_bookings')
          .select('id')
          .ilike('booking_reference', bookingRef)
          .maybeSingle()
        bookingId = booking?.id ?? null
      }
      await recordReconciliationIssue(admin, {
        bookingRef,
        paymentId: opts.paymentId,
        amountCents: opts.amountCents,
        paymentMethod,
        reason: err === 'booking_not_found' ? 'booking_not_found' : 'mark_paid_failed',
        detail: err,
        source,
        bookingId,
      })
      return { ok: false, error: err }
    }

    if (row.repaired) {
      console.warn(
        `[square-mark-paid] RECONCILIATION_REPAIRED booking_ref=${bookingRef} payment_id=${opts.paymentId} source=${source} status=${row.booking_status ?? ''}`,
      )
    }

    return {
      ok: true,
      skipped: Boolean(row.skipped),
      repaired: Boolean(row.repaired),
      booking_status: row.booking_status,
      amount_paid_aud: row.amount_paid_aud,
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    await recordReconciliationIssue(admin, {
      bookingRef,
      paymentId: opts.paymentId,
      amountCents: opts.amountCents,
      paymentMethod,
      reason: 'mark_paid_failed',
      detail,
      source,
    })
    return { ok: false, error: detail }
  }
}
