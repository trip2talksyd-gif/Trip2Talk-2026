import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

/** Idempotent: records a Square payment and updates booking status. Service-role only. */
export async function markSquarePaid(opts: {
  bookingRef: string
  amountCents: number
  paymentId: string
  paymentMethod?: string
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const paymentMethod = opts.paymentMethod || 'square'

  const { data: existingExt } = await admin
    .from('booking_payments')
    .select('id')
    .eq('external_payment_id', opts.paymentId)
    .maybeSingle()
  if (existingExt?.id) return { ok: true, skipped: true }

  const { data: booking, error: bookingError } = await admin
    .from('tour_bookings')
    .select('id, booking_reference, amount_paid_aud, booking_status, payment_plan_installments, tour_id')
    .ilike('booking_reference', opts.bookingRef)
    .maybeSingle()
  if (bookingError) throw bookingError
  if (!booking) return { ok: false, error: 'booking_not_found' }

  const { data: tour } = await admin
    .from('tours')
    .select('price_aud')
    .eq('id', booking.tour_id)
    .maybeSingle()
  const priceAud = tour ? Number(tour.price_aud ?? 0) : 0

  const amountAud = Math.round(opts.amountCents) / 100
  if (!(amountAud > 0)) return { ok: false, error: 'invalid_amount' }

  const { count } = await admin
    .from('booking_payments')
    .select('id', { count: 'exact', head: true })
    .eq('booking_id', booking.id)
  const installmentNo = (count ?? 0) + 1
  const paidAt = new Date().toISOString()
  const invoiceNo = `T2T-INV-${booking.booking_reference ?? booking.id.slice(0, 8)}-${installmentNo}`
  const label =
    installmentNo === 1
      ? 'Deposit'
      : `Installment ${installmentNo}${
          booking.payment_plan_installments ? `/${booking.payment_plan_installments}` : ''
        }`

  const { error: insertError } = await admin.from('booking_payments').insert({
    booking_id: booking.id,
    amount_aud: amountAud,
    payment_method: paymentMethod,
    installment_no: installmentNo,
    label,
    status: 'paid',
    paid_at: paidAt,
    receipt_invoice_number: invoiceNo,
    external_payment_id: opts.paymentId,
    recorded_by_staff_id: null,
  })
  if (insertError) {
    if (String(insertError.code) === '23505') return { ok: true, skipped: true }
    throw insertError
  }

  const newTotal = Number(booking.amount_paid_aud ?? 0) + amountAud
  const newStatus = priceAud > 0 && newTotal >= priceAud ? 'fully_paid' : 'deposit_paid'

  const { error: updateError } = await admin
    .from('tour_bookings')
    .update({
      amount_paid_aud: newTotal,
      booking_status: newStatus,
      payment_method: paymentMethod,
    })
    .eq('id', booking.id)
  if (updateError) throw updateError

  return { ok: true }
}
