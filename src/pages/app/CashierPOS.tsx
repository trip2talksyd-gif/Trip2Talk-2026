import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createBookingManual,
  fetchPendingBookings,
  fetchToursAdmin,
  recordPayment,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { Tour, TourBooking } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import { useLang } from '../../hooks/useLang'

export default function CashierPOS() {
  const { t } = useLang()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<TourBooking[]>([])
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [tripCode, setTripCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [source, setSource] = useState('facebook')
  const [installmentPlan, setInstallmentPlan] = useState('1')
  const [submitting, setSubmitting] = useState(false)

  // Inline "+ บันทึกการชำระ" flow — which pending booking has its payment
  // entry row open, plus the draft amount/method for it.
  const [payingId, setPayingId] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [payingSubmitting, setPayingSubmitting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([fetchPendingBookings(), fetchToursAdmin()])
      .then(([b, tourList]) => {
        setBookings(b)
        setTours(tourList.filter((x) => x.status.toLowerCase() !== 'cancelled'))
      })
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        setError(t('common.error'))
      })
      .finally(() => setLoading(false))
  }, [t, navigate])

  useEffect(() => {
    load()
  }, [load])

  const isValid = tripCode && firstName.trim() && lastName.trim() && (phone.trim() || email.trim())

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    try {
      const paidAmount = amountPaid ? Number(amountPaid) : 0
      const bookingStatus = paidAmount ? 'deposit_paid' : 'pending_payment'
      const booking = await createBookingManual({
        trip_code: tripCode,
        first_name_en: firstName.trim(),
        last_name_en: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        amount_paid_aud: paidAmount,
        payment_method: paymentMethod,
        booking_status: bookingStatus,
        source,
        payment_plan_installments: Number(installmentPlan),
      })
      toast('เพิ่มการจองสำเร็จ', 'success')
      const tour = tours.find((tr) => tr.trip_code === tripCode)
      setFormOpen(false)
      setTripCode('')
      setFirstName('')
      setLastName('')
      setPhone('')
      setEmail('')
      setAmountPaid('')
      setSource('facebook')
      setInstallmentPlan('1')
      load()
      if (paidAmount > 0) {
        navigate('/app/receipt', {
          state: {
            bookingReference: booking.booking_reference,
            customerName: `${firstName.trim()} ${lastName.trim()}`,
            tripName: tour?.name_en ?? tripCode,
            tripCode,
            departureDate: tour?.departure_date ?? null,
            amountPaid: paidAmount,
            paymentMethod,
            bookingStatus,
            source,
            installmentNo: 1,
            installmentPlan: Number(installmentPlan),
            priceAud: tour?.price_aud ?? null,
            balanceRemaining: tour ? Math.max(0, tour.price_aud - paidAmount) : null,
          },
        })
      }
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      const msg = err instanceof Error ? err.message : ''
      toast(msg.includes('seats_full') ? 'ที่นั่งเต็มแล้ว' : 'เพิ่มการจองไม่สำเร็จ', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const bookableTours = useMemo(
    () => tours.filter((tr) => ['published', 'confirmed', 'active', 'draft'].includes(tr.status.toLowerCase())),
    [tours],
  )

  function openPaymentRow(booking: TourBooking) {
    const tour = tours.find((tr) => tr.trip_code === booking.trip_code)
    const remaining = tour ? Math.max(0, tour.price_aud - booking.amount_paid_aud) : 0
    const plan = booking.payment_plan_installments ?? 1
    const perInstallment = tour && plan > 1 ? Math.min(remaining, tour.price_aud / plan) : remaining
    setPayingId(booking.id)
    setPayAmount(perInstallment > 0 ? String(Math.round(perInstallment * 100) / 100) : '')
    setPayMethod(booking.payment_method ?? 'cash')
  }

  function closePaymentRow() {
    setPayingId(null)
    setPayAmount('')
    setPayMethod('cash')
  }

  async function submitPayment(booking: TourBooking) {
    const amount = Number(payAmount)
    if (!amount || amount <= 0) return
    setPayingSubmitting(true)
    try {
      const result = await recordPayment(booking.id, amount, payMethod)
      toast(t('toast.paymentUpdated'), 'success')
      const tour = tours.find((tr) => tr.trip_code === booking.trip_code)
      closePaymentRow()
      load()
      navigate('/app/receipt', {
        state: {
          bookingReference: booking.booking_reference,
          customerName: `${booking.first_name_en} ${booking.last_name_en}`,
          tripName: tour?.name_en ?? booking.trip_code,
          tripCode: booking.trip_code,
          departureDate: tour?.departure_date ?? null,
          amountPaid: amount,
          paymentMethod: payMethod,
          bookingStatus: result.booking_status,
          source: booking.source ?? null,
          installmentNo: result.installment_no,
          installmentPlan: result.installment_plan,
          priceAud: result.price_aud,
          balanceRemaining: Math.max(0, result.price_aud - result.amount_paid_aud),
        },
      })
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast(t('toast.paymentFailed'), 'error')
    } finally {
      setPayingSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app" className="text-sm text-gold">
          ← PIN
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">Cashier POS</h1>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="block w-full rounded-editorial border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm font-medium text-gold transition-colors hover:bg-gold/15"
        >
          {formOpen ? '− ปิดฟอร์ม' : '+ เพิ่มการจองใหม่ (โทร/Facebook)'}
        </button>

        {formOpen && (
          <form
            onSubmit={handleCreateBooking}
            className="space-y-3 rounded-editorial border border-white/8 bg-surface-card p-4"
          >
            <label className="block">
              <span className="text-xs text-cream-muted">ทริป</span>
              <select
                value={tripCode}
                onChange={(e) => setTripCode(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
              >
                <option value="">— เลือกทริป —</option>
                {bookableTours.map((tr) => (
                  <option key={tr.id} value={tr.trip_code}>
                    {tr.name_en} · {tr.trip_code}
                    {tr.departure_date ? ` · ${tr.departure_date}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-cream-muted">ชื่อ</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                />
              </label>
              <label className="block">
                <span className="text-xs text-cream-muted">นามสกุล</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-cream-muted">เบอร์โทร</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                />
              </label>
              <label className="block">
                <span className="text-xs text-cream-muted">อีเมล</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                />
              </label>
            </div>
            <p className="text-xs text-cream-muted">กรอกอย่างน้อยเบอร์โทรหรืออีเมลอย่างใดอย่างหนึ่ง</p>

            <label className="block">
              <span className="text-xs text-cream-muted">ลูกค้าติดต่อมาทาง</span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
              >
                <option value="facebook">Facebook</option>
                <option value="phone">โทรศัพท์</option>
                <option value="line">LINE</option>
                <option value="walk_in">Walk-in</option>
                <option value="other">อื่นๆ</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-cream-muted">รับเงินแล้ว (AUD)</span>
                <input
                  type="number"
                  min={0}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                />
              </label>
              <label className="block">
                <span className="text-xs text-cream-muted">ช่องทาง</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                >
                  <option value="cash">เงินสด</option>
                  <option value="payid">PayID</option>
                  <option value="bank_transfer">โอนธนาคาร</option>
                  <option value="manual">อื่นๆ</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs text-cream-muted">แบ่งจ่าย (ถ้าลูกค้าขอ)</span>
              <select
                value={installmentPlan}
                onChange={(e) => setInstallmentPlan(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
              >
                <option value="1">จ่ายเต็มจำนวน (ไม่แบ่งงวด)</option>
                <option value="2">แบ่งจ่าย 2 งวด</option>
                <option value="4">แบ่งจ่าย 4 งวด</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-near-black-green disabled:opacity-50"
            >
              {submitting ? 'กำลังบันทึก...' : 'บันทึกการจอง'}
            </button>
          </form>
        )}

        {loading && <ListRowSkeleton count={3} />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && bookings.length === 0 && (
          <p className="text-sm text-cream-muted">No pending bookings</p>
        )}

        {!loading && !error && (
          <ul className="space-y-3">
            {bookings.map((b) => {
              const tour = tours.find((tr) => tr.trip_code === b.trip_code)
              const plan = b.payment_plan_installments ?? 1
              const remaining = tour ? Math.max(0, tour.price_aud - b.amount_paid_aud) : null
              const isPaying = payingId === b.id

              return (
                <li key={b.id} className="rounded-editorial border border-white/8 bg-surface-card p-4">
                  <p className="font-medium text-cream">
                    {b.first_name_en} {b.last_name_en}
                  </p>
                  <p className="text-xs text-cream-muted">
                    {b.trip_code} · {b.email}
                  </p>
                  <p className="mt-1 text-xs text-cream-muted">
                    จ่ายแล้ว {b.amount_paid_aud.toLocaleString()} AUD
                    {tour ? ` / ${tour.price_aud.toLocaleString()} AUD` : ''}
                    {plan > 1 ? ` · แบ่งจ่าย ${plan} งวด` : ''}
                    {remaining !== null && remaining > 0 ? ` · เหลือ ${remaining.toLocaleString()} AUD` : ''}
                  </p>

                  {!isPaying ? (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => openPaymentRow(b)}
                        className="rounded-editorial bg-gold px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gold-dark transition-transform active:scale-95"
                      >
                        + บันทึกการชำระ
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2 rounded-lg border border-gold/30 bg-near-black-green p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className="text-xs text-cream-muted">จำนวนเงิน (AUD)</span>
                          <input
                            type="number"
                            min={0}
                            autoFocus
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-card px-3 py-2 text-sm text-cream"
                          />
                        </label>
                        <label className="block">
                          <span className="text-xs text-cream-muted">ช่องทาง</span>
                          <select
                            value={payMethod}
                            onChange={(e) => setPayMethod(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-white/15 bg-surface-card px-3 py-2 text-sm text-cream"
                          >
                            <option value="cash">เงินสด</option>
                            <option value="payid">PayID</option>
                            <option value="bank_transfer">โอนธนาคาร</option>
                            <option value="manual">อื่นๆ</option>
                          </select>
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tour?.deposit_aud ? (
                          <button
                            type="button"
                            onClick={() => setPayAmount(String(tour.deposit_aud))}
                            className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-cream-muted"
                          >
                            มัดจำ {tour.deposit_aud}
                          </button>
                        ) : null}
                        {remaining ? (
                          <button
                            type="button"
                            onClick={() => setPayAmount(String(remaining))}
                            className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-cream-muted"
                          >
                            จ่ายครบ {remaining}
                          </button>
                        ) : null}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          disabled={!payAmount || Number(payAmount) <= 0 || payingSubmitting}
                          onClick={() => submitPayment(b)}
                          className="flex-1 rounded-lg bg-gold px-3 py-2 text-xs font-bold uppercase tracking-wider text-gold-dark disabled:opacity-50"
                        >
                          {payingSubmitting ? 'กำลังบันทึก...' : 'ยืนยันรับเงิน'}
                        </button>
                        <button
                          type="button"
                          onClick={closePaymentRow}
                          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-cream-muted"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
