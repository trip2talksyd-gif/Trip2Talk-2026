import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createBookingManual,
  fetchPendingBookings,
  fetchToursAdmin,
  recordPayment,
  cancelBooking,
  isBookingCancelled,
  resolveBookingTravelDate,
} from '../../lib/toursApi'
import { isSelectableBookableTour } from '../../lib/tourSelectability'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { Tour, TourBooking } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import { useLang } from '../../hooks/useLang'
import CancelBookingDialog from '../../components/app/CancelBookingDialog'
import {
  staffShellClass,
  StaffPageHeader,
  StaffMain,
  StaffCard,
  StaffButton,
  StaffField,
  StaffInput,
  StaffSelect,
} from '../../components/app/staffUi'

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

  const [cancelling, setCancelling] = useState<TourBooking | null>(null)
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

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
            customerEmail: email.trim() || null,
            tripName: tour?.name_en ?? tripCode,
            tripCode,
            departureDate: resolveBookingTravelDate(
              { travel_date: booking.travel_date, trip_code: tripCode },
              tour?.departure_date,
            ),
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
    () =>
      tours.filter(
        (tr) =>
          ['published', 'confirmed', 'active', 'draft'].includes(tr.status.toLowerCase()) &&
          isSelectableBookableTour(tr),
      ),
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

  async function confirmCancel(reason: string) {
    if (!cancelling) return
    setCancelSubmitting(true)
    try {
      await cancelBooking(cancelling.id, reason)
      setBookings((prev) => prev.filter((b) => b.id !== cancelling.id))
      setCancelling(null)
      if (payingId === cancelling.id) closePaymentRow()
      toast('ยกเลิกการจองแล้ว', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('ยกเลิกไม่สำเร็จ', 'error')
    } finally {
      setCancelSubmitting(false)
    }
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
          customerEmail: booking.email || null,
          tripName: tour?.name_en ?? booking.trip_code,
          tripCode: booking.trip_code,
          departureDate: resolveBookingTravelDate(booking, tour?.departure_date),
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
    <div className={staffShellClass}>
      <StaffPageHeader backTo="/app" backLabel="← PIN" title="Cashier POS">
        <Link
          to="/app/waiver-assist"
          className="text-xs font-medium text-amber-200/90 underline"
        >
          Waiver assist / กรอกแทนลูกค้า →
        </Link>
        <Link
          to="/app/payments"
          className="text-xs font-medium text-teal-500/90 underline"
        >
          Customer payments / งวดชำระ →
        </Link>
      </StaffPageHeader>

      <StaffMain>
        <StaffButton
          variant="secondary"
          onClick={() => setFormOpen((v) => !v)}
          className="w-full"
        >
          {formOpen ? '− ปิดฟอร์ม' : '+ เพิ่มการจองใหม่ (โทร/Facebook)'}
        </StaffButton>

        {formOpen && (
          <StaffCard>
            <form onSubmit={handleCreateBooking} className="space-y-3">
              <StaffField label="ทริป">
                <StaffSelect
                  value={tripCode}
                  onChange={(e) => setTripCode(e.target.value)}
                  required
                >
                  <option value="">— เลือกทริป —</option>
                  {bookableTours.map((tr) => (
                    <option key={tr.id} value={tr.trip_code}>
                      {tr.name_en} · {tr.trip_code}
                      {tr.departure_date ? ` · ${tr.departure_date}` : ''}
                    </option>
                  ))}
                </StaffSelect>
              </StaffField>

              <div className="grid grid-cols-2 gap-3">
                <StaffField label="ชื่อ">
                  <StaffInput
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </StaffField>
                <StaffField label="นามสกุล">
                  <StaffInput
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </StaffField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StaffField label="เบอร์โทร">
                  <StaffInput
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </StaffField>
                <StaffField label="อีเมล">
                  <StaffInput
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </StaffField>
              </div>
              <p className="text-xs text-cream-muted">กรอกอย่างน้อยเบอร์โทรหรืออีเมลอย่างใดอย่างหนึ่ง</p>

              <StaffField label="ลูกค้าติดต่อมาทาง">
                <StaffSelect
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="facebook">Facebook</option>
                  <option value="phone">โทรศัพท์</option>
                  <option value="line">LINE</option>
                  <option value="walk_in">Walk-in</option>
                  <option value="other">อื่นๆ</option>
                </StaffSelect>
              </StaffField>

              <div className="grid grid-cols-2 gap-3">
                <StaffField label="รับเงินแล้ว (AUD)">
                  <StaffInput
                    type="number"
                    min={0}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </StaffField>
                <StaffField label="ช่องทาง">
                  <StaffSelect
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">เงินสด</option>
                    <option value="payid">PayID</option>
                    <option value="bank_transfer">โอนธนาคาร</option>
                    <option value="manual">อื่นๆ</option>
                  </StaffSelect>
                </StaffField>
              </div>

              <StaffField label="แบ่งจ่าย (ถ้าลูกค้าขอ)">
                <StaffSelect
                  value={installmentPlan}
                  onChange={(e) => setInstallmentPlan(e.target.value)}
                >
                  <option value="1">จ่ายเต็มจำนวน (ไม่แบ่งงวด)</option>
                  <option value="2">แบ่งจ่าย 2 งวด</option>
                  <option value="4">แบ่งจ่าย 4 งวด</option>
                </StaffSelect>
              </StaffField>

              <StaffButton type="submit" disabled={!isValid || submitting}>
                {submitting ? 'กำลังบันทึก...' : 'บันทึกการจอง'}
              </StaffButton>
            </form>
          </StaffCard>
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
              const cancelled = isBookingCancelled(b)

              return (
                <li key={b.id}>
                  <StaffCard
                    className={cancelled ? 'border-white/5 bg-surface-card/40 opacity-60' : ''}
                  >
                    <p className="font-medium text-cream">
                      {b.first_name_en} {b.last_name_en}
                      {cancelled && (
                        <span className="ml-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream-muted">
                          Cancelled
                        </span>
                      )}
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

                    {cancelled ? null : !isPaying ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StaffButton
                          onClick={() => openPaymentRow(b)}
                          className="w-auto px-3 py-1.5 text-xs uppercase tracking-wider"
                        >
                          + บันทึกการชำระ
                        </StaffButton>
                        <StaffButton
                          variant="danger"
                          onClick={() => setCancelling(b)}
                          className="px-3 py-1.5 text-xs uppercase tracking-wider"
                        >
                          Cancel booking
                        </StaffButton>
                      </div>
                    ) : (
                      <StaffCard className="mt-3 border-teal-500/30 bg-near-black-green p-3" padding={false}>
                        <div className="space-y-2 p-3">
                          <div className="grid grid-cols-2 gap-2">
                            <StaffField label="จำนวนเงิน (AUD)">
                              <StaffInput
                                type="number"
                                min={0}
                                autoFocus
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                              />
                            </StaffField>
                            <StaffField label="ช่องทาง">
                              <StaffSelect
                                value={payMethod}
                                onChange={(e) => setPayMethod(e.target.value)}
                              >
                                <option value="cash">เงินสด</option>
                                <option value="payid">PayID</option>
                                <option value="bank_transfer">โอนธนาคาร</option>
                                <option value="manual">อื่นๆ</option>
                              </StaffSelect>
                            </StaffField>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {tour?.deposit_aud ? (
                              <StaffButton
                                type="button"
                                variant="ghost"
                                onClick={() => setPayAmount(String(tour.deposit_aud))}
                                className="px-2.5 py-1 text-[11px]"
                              >
                                มัดจำ {tour.deposit_aud}
                              </StaffButton>
                            ) : null}
                            {remaining ? (
                              <StaffButton
                                type="button"
                                variant="ghost"
                                onClick={() => setPayAmount(String(remaining))}
                                className="px-2.5 py-1 text-[11px]"
                              >
                                จ่ายครบ {remaining}
                              </StaffButton>
                            ) : null}
                          </div>
                          <div className="flex gap-2 pt-1">
                            <StaffButton
                              disabled={!payAmount || Number(payAmount) <= 0 || payingSubmitting}
                              onClick={() => submitPayment(b)}
                              className="flex-1 text-xs uppercase tracking-wider"
                            >
                              {payingSubmitting ? 'กำลังบันทึก...' : 'ยืนยันรับเงิน'}
                            </StaffButton>
                            <StaffButton
                              variant="secondary"
                              onClick={closePaymentRow}
                              className="text-xs"
                            >
                              ยกเลิก
                            </StaffButton>
                          </div>
                        </div>
                      </StaffCard>
                    )}
                  </StaffCard>
                </li>
              )
            })}
          </ul>
        )}
      </StaffMain>

      {cancelling && (
        <CancelBookingDialog
          booking={cancelling}
          submitting={cancelSubmitting}
          onConfirm={confirmCancel}
          onClose={() => !cancelSubmitting && setCancelling(null)}
        />
      )}
    </div>
  )
}
