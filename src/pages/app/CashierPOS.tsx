import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Ban,
  BadgeCheck,
  Check,
  Coins,
  CreditCard,
  FileImage,
  FilePlus2,
  Flag,
  Hash,
  MessageSquare,
  Pencil,
  Receipt,
  RotateCcw,
  Route,
  Wallet,
} from 'lucide-react'
import {
  createBookingManual,
  fetchPendingBookings,
  fetchToursAdmin,
  recordPayment,
  recordInPersonCardPayment,
  cancelBooking,
  isBookingCancelled,
  resolveBookingTravelDate,
  signPaymentSlip,
  flagPendingBooking,
} from '../../lib/toursApi'
import { isSelectableBookableTour } from '../../lib/tourSelectability'
import { isInPersonCardMethod, isSquareGatewayMethod, paymentMethodBadge, remainingTripBalanceAud } from '../../lib/paymentCredit'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { Tour, TourBooking } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import { useLang } from '../../hooks/useLang'
import CancelBookingDialog from '../../components/app/CancelBookingDialog'
import PaymentReconciliationBanner from '../../components/app/PaymentReconciliationBanner'
import CopyWaiverLinkButton from '../../components/app/CopyWaiverLinkButton'
import StaffWaiverRecordButton from '../../components/app/StaffWaiverRecordButton'
import ResetWaiverButton from '../../components/app/ResetWaiverButton'
import EditWaiverButton from '../../components/app/EditWaiverButton'
import BookingExtensionQuotes from '../../components/app/BookingExtensionQuotes'
import MarketingPhotoOptOutCard from '../../components/app/MarketingPhotoOptOutCard'
import StaffActionTile from '../../components/app/StaffActionTile'
import StaffTaskView, { TaskFieldLabel } from '../../components/app/StaffTaskView'
import { staffReceiptPath, type ReceiptData } from './ReceiptPage'
import {
  staffShellClass,
  StaffPageHeader,
  StaffMain,
  StaffCard,
  StaffButton,
  StaffField,
  StaffInput,
  StaffSelect,
  StaffTextarea,
} from '../../components/app/staffUi'

const PAY_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: 'cash', label: 'เงินสด / Cash' },
  { value: 'payid', label: 'PayID' },
  { value: 'bank_transfer', label: 'โอนธนาคาร / Bank' },
  { value: 'square', label: 'Card via Square' },
  { value: 'afterpay', label: 'Afterpay via Square' },
  { value: 'manual', label: 'อื่นๆ / Other' },
]

function cashierMethodLabel(method: string | null | undefined): string {
  const value = (method ?? '').trim().toLowerCase()
  if (value === 'card_in_person') return 'Card (in person) / บัตรหน้างาน'
  return PAY_METHOD_OPTIONS.find((o) => o.value === value)?.label ?? (method || '—')
}

function bookingSubtitle(b: TourBooking): string {
  return [`${b.first_name_en} ${b.last_name_en}`.trim(), b.trip_code, b.booking_reference]
    .filter(Boolean)
    .join(' · ')
}

function amountMatches(current: string, target: number | null | undefined): boolean {
  if (target == null || target <= 0) return false
  const n = Number(current)
  return Number.isFinite(n) && Math.abs(n - target) < 0.005
}

function AmountShortcuts({
  deposit,
  remaining,
  current,
  onPick,
}: {
  deposit?: number | null
  remaining?: number | null
  current: string
  onPick: (n: number) => void
}) {
  const tile =
    'flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border px-2 py-2 text-center text-[12px] font-semibold transition-colors'
  return (
    <div className="grid grid-cols-2 gap-2">
      {deposit && deposit > 0 ? (
        <button
          type="button"
          onClick={() => onPick(deposit)}
          className={`${tile} ${
            amountMatches(current, deposit)
              ? 'border-teal-400 bg-teal-500/15 text-cream'
              : 'border-white/12 bg-white/[0.06] text-cream hover:border-teal-500/40'
          }`}
        >
          <Wallet className="h-4 w-4 shrink-0" aria-hidden />
          <span lang="th">มัดจำ {deposit}</span>
        </button>
      ) : (
        <span />
      )}
      {remaining && remaining > 0 ? (
        <button
          type="button"
          onClick={() => onPick(remaining)}
          className={`${tile} ${
            amountMatches(current, remaining)
              ? 'border-teal-400 bg-teal-500/15 text-cream'
              : 'border-white/12 bg-white/[0.06] text-cream hover:border-teal-500/40'
          }`}
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          <span lang="th">จ่ายครบ {remaining}</span>
        </button>
      ) : (
        <span />
      )}
    </div>
  )
}

function goToReceipt(
  navigate: ReturnType<typeof useNavigate>,
  state: ReceiptData,
) {
  const ref = state.bookingReference?.trim()
  if (ref) navigate(staffReceiptPath(ref, state.installmentNo), { state })
  else navigate('/app/receipt', { state })
}

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

  const [slipBusyId, setSlipBusyId] = useState<string | null>(null)
  const [slipViewer, setSlipViewer] = useState<{ url: string; title: string } | null>(null)
  const [flaggingId, setFlaggingId] = useState<string | null>(null)
  const [flagNote, setFlagNote] = useState('Follow up — PayID slip')
  const [flagSubmitting, setFlagSubmitting] = useState(false)
  const [quoteBookingId, setQuoteBookingId] = useState<string | null>(null)
  const [verifyId, setVerifyId] = useState<string | null>(null)
  const [unpaidOnly, setUnpaidOnly] = useState(false)
  const [readerBooking, setReaderBooking] = useState<TourBooking | null>(null)
  const [readerAmount, setReaderAmount] = useState('')
  const [readerReceipt, setReaderReceipt] = useState('')
  const [readerNote, setReaderNote] = useState('')
  const [readerSubmitting, setReaderSubmitting] = useState(false)
  const staffRole = sessionStorage.getItem('staff_role') ?? ''
  const canIssueQuote = staffRole === 'OWNER' || staffRole === 'MANAGER'

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
        goToReceipt(navigate, {
          bookingId: booking.id,
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

  const visibleBookings = useMemo(() => {
    if (!unpaidOnly) return bookings
    return bookings.filter((b) => {
      const status = (b.booking_status ?? '').trim().toLowerCase()
      return status === 'pending_payment' || status === 'pending'
    })
  }, [bookings, unpaidOnly])

  function openPaymentRow(booking: TourBooking) {
    const tour = tours.find((tr) => tr.trip_code === booking.trip_code)
    const remaining = tour
      ? remainingTripBalanceAud({
          priceAud: tour.price_aud,
          depositAud: tour.deposit_aud,
          amountPaidAud: booking.amount_paid_aud,
          paymentMethod: booking.payment_method,
          bookingStatus: booking.booking_status,
        }) ?? 0
      : 0
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
      if (readerBooking?.id === cancelling.id) closeReaderForm()
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

  function bookingHasSlip(booking: TourBooking): boolean {
    return Boolean(booking.slip_url?.trim())
  }

  async function viewSlip(booking: TourBooking) {
    if (!bookingHasSlip(booking)) return
    setSlipBusyId(booking.id)
    try {
      const signed = await signPaymentSlip(booking.id)
      if (signed.is_image) {
        setSlipViewer({
          url: signed.url,
          title: `${booking.first_name_en} ${booking.last_name_en}`.trim(),
        })
      } else {
        window.open(signed.url, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Could not open slip', 'error')
    } finally {
      setSlipBusyId(null)
    }
  }

  async function verifyPayId(booking: TourBooking) {
    const tour = tours.find((tr) => tr.trip_code === booking.trip_code)
    const deposit = Number(tour?.deposit_aud ?? 0)
    if (!(deposit > 0)) {
      openPaymentRow(booking)
      setPayMethod('payid')
      return
    }
    setVerifyId(booking.id)
    try {
      const result = await recordPayment(booking.id, deposit, 'payid')
      toast(t('toast.paymentUpdated'), 'success')
      load()
      goToReceipt(navigate, {
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        customerName: `${booking.first_name_en} ${booking.last_name_en}`,
        customerEmail: booking.email || null,
        tripName: tour?.name_en ?? booking.trip_code,
        tripCode: booking.trip_code,
        departureDate: resolveBookingTravelDate(booking, tour?.departure_date),
        amountPaid: deposit,
        paymentMethod: 'payid',
        bookingStatus: result.booking_status,
        source: booking.source ?? null,
        installmentNo: result.installment_no,
        installmentPlan: result.installment_plan,
        priceAud: result.price_aud,
        balanceRemaining: Math.max(0, result.price_aud - result.amount_paid_aud),
      })
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast(t('toast.paymentFailed'), 'error')
    } finally {
      setVerifyId(null)
    }
  }

  function expectedReaderAmount(booking: TourBooking): string {
    const tour = tours.find((tr) => tr.trip_code === booking.trip_code)
    const paid = Number(booking.amount_paid_aud ?? 0)
    const deposit = Number(tour?.deposit_aud ?? 0)
    const remaining = tour
      ? remainingTripBalanceAud({
          priceAud: tour.price_aud,
          depositAud: tour.deposit_aud,
          amountPaidAud: booking.amount_paid_aud,
          paymentMethod: booking.payment_method,
          bookingStatus: booking.booking_status,
        })
      : null
    const prefill =
      paid <= 0 && deposit > 0 ? deposit : remaining != null && remaining > 0 ? remaining : 0
    return prefill > 0 ? String(Math.round(prefill * 100) / 100) : ''
  }

  function openReaderForm(booking: TourBooking) {
    setReaderBooking(booking)
    setReaderAmount(expectedReaderAmount(booking))
    setReaderReceipt('')
    setReaderNote('')
  }

  function closeReaderForm() {
    setReaderBooking(null)
    setReaderAmount('')
    setReaderReceipt('')
    setReaderNote('')
  }

  async function submitReaderPayment() {
    if (!readerBooking) return
    const amount = Number(readerAmount)
    const receipt = readerReceipt.trim()
    if (!amount || amount <= 0 || receipt.length < 2) return
    setReaderSubmitting(true)
    try {
      const result = await recordInPersonCardPayment({
        bookingId: readerBooking.id,
        amount,
        squareReceiptRef: receipt,
        note: readerNote.trim() || undefined,
      })
      toast(
        result.skipped ? 'Already recorded for this Square receipt' : t('toast.paymentUpdated'),
        result.skipped ? 'info' : 'success',
      )
      const tour = tours.find((tr) => tr.trip_code === readerBooking.trip_code)
      const booking = readerBooking
      closeReaderForm()
      load()
      goToReceipt(navigate, {
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        customerName: `${booking.first_name_en} ${booking.last_name_en}`,
        customerEmail: booking.email || null,
        tripName: tour?.name_en ?? booking.trip_code,
        tripCode: booking.trip_code,
        departureDate: resolveBookingTravelDate(booking, tour?.departure_date),
        amountPaid: amount,
        paymentMethod: 'card_in_person',
        bookingStatus: result.booking_status,
        source: booking.source ?? null,
        installmentNo: result.installment_no,
        installmentPlan: result.installment_plan,
        priceAud: result.price_aud,
        balanceRemaining: Math.max(0, result.price_aud - result.amount_paid_aud),
      })
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast(t('toast.paymentFailed'), 'error')
    } finally {
      setReaderSubmitting(false)
    }
  }

  async function submitFlag(booking: TourBooking) {
    const note = flagNote.trim()
    if (!note) return
    setFlagSubmitting(true)
    try {
      await flagPendingBooking(booking.id, note)
      toast('Flagged for follow-up', 'success')
      setFlaggingId(null)
      load()
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Could not save flag — apply staff_follow_up_note migration if missing', 'error')
    } finally {
      setFlagSubmitting(false)
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
      goToReceipt(navigate, {
        bookingId: booking.id,
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

  const payingBooking = payingId ? bookings.find((row) => row.id === payingId) ?? null : null
  const payingTour = payingBooking
    ? tours.find((tr) => tr.trip_code === payingBooking.trip_code)
    : undefined
  const payingRemaining = payingBooking && payingTour
    ? remainingTripBalanceAud({
        priceAud: payingTour.price_aud,
        depositAud: payingTour.deposit_aud,
        amountPaidAud: payingBooking.amount_paid_aud,
        paymentMethod: payingBooking.payment_method,
        bookingStatus: payingBooking.booking_status,
      })
    : null
  const flaggingBooking = flaggingId ? bookings.find((row) => row.id === flaggingId) ?? null : null
  const quoteBooking = quoteBookingId
    ? bookings.find((row) => row.id === quoteBookingId) ?? null
    : null
  const quoteTour = quoteBooking
    ? tours.find((tr) => tr.trip_code === quoteBooking.trip_code)
    : undefined
  const readerTour = readerBooking
    ? tours.find((tr) => tr.trip_code === readerBooking.trip_code)
    : undefined
  const readerRemaining = readerBooking && readerTour
    ? remainingTripBalanceAud({
        priceAud: readerTour.price_aud,
        depositAud: readerTour.deposit_aud,
        amountPaidAud: readerBooking.amount_paid_aud,
        paymentMethod: readerBooking.payment_method,
        bookingStatus: readerBooking.booking_status,
      })
    : null

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
        <PaymentReconciliationBanner />
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
                    {PAY_METHOD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
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

        {!loading && !error && (
          <label className="flex items-center gap-2 text-xs text-cream-muted">
            <input
              type="checkbox"
              checked={unpaidOnly}
              onChange={(e) => setUnpaidOnly(e.target.checked)}
              className="accent-teal-500"
            />
            Unpaid only / เฉพาะรอชำระ
          </label>
        )}

        {!loading && !error && visibleBookings.length === 0 && (
          <p className="text-sm text-cream-muted">No bookings in this list</p>
        )}

        {!loading && !error && (
          <ul className="space-y-3">
            {visibleBookings.map((b) => {
              const tour = tours.find((tr) => tr.trip_code === b.trip_code)
              const plan = b.payment_plan_installments ?? 1
              const remaining = tour
                ? remainingTripBalanceAud({
                    priceAud: tour.price_aud,
                    depositAud: tour.deposit_aud,
                    amountPaidAud: b.amount_paid_aud,
                    paymentMethod: b.payment_method,
                    bookingStatus: b.booking_status,
                  })
                : null
              const cardPaid = isSquareGatewayMethod(b.payment_method)
              const inPersonCard = isInPersonCardMethod(b.payment_method)
              const cancelled = isBookingCancelled(b)
              const status = (b.booking_status ?? '').trim().toLowerCase()
              const canRecordReader =
                !cancelled && status !== 'fully_paid' && status !== 'paid'

              return (
                <li key={b.id}>
                  <StaffCard
                    className={cancelled ? 'border-white/5 bg-surface-card/40 opacity-60' : ''}
                  >
                    <p className="font-medium text-cream">
                      {b.first_name_en} {b.last_name_en}
                      <span className="ml-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-400">
                        {paymentMethodBadge(b.payment_method)}
                      </span>
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
                    <p className="mt-1.5 text-[11px] text-cream-muted">
                      <span>ช่องทาง {cashierMethodLabel(b.payment_method)}</span>
                      {cardPaid ? (
                        <span className="mt-0.5 block text-teal-500/90">
                          {b.payment_method === 'afterpay'
                            ? 'Afterpay via Square — no PayID slip'
                            : 'Card via Square (online) — no PayID slip'}
                        </span>
                      ) : inPersonCard ? (
                        <span className="mt-0.5 block text-teal-500/90">
                          Card (in person) via Square Reader
                        </span>
                      ) : bookingHasSlip(b) ? (
                        <span className="mt-0.5 block">PayID slip on file</span>
                      ) : (
                        <span className="mt-0.5 block text-amber-200/90">No slip uploaded</span>
                      )}
                      {b.staff_follow_up_note ? (
                        <span className="mt-0.5 block text-amber-200/90">
                          Flagged: {b.staff_follow_up_note}
                        </span>
                      ) : null}
                    </p>

                    {cancelled ? null : (
                      <>
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <CopyWaiverLinkButton
                            bookingId={b.id}
                            layout="tile"
                            onSessionExpired={() => navigate('/app')}
                          />
                          <StaffWaiverRecordButton
                            bookingId={b.id}
                            tripName={tour?.name_en}
                            layout="tile"
                            onSessionExpired={() => navigate('/app')}
                          />
                          <StaffActionTile
                            icon={Receipt}
                            label="Receipt"
                            labelTh="ใบเสร็จ"
                            disabled={!b.booking_reference}
                            onClick={() => {
                              if (!b.booking_reference) {
                                toast('ยังไม่มีรหัสใบเสร็จ', 'error')
                                return
                              }
                              navigate(staffReceiptPath(b.booking_reference))
                            }}
                          />
                          <StaffActionTile
                            icon={Flag}
                            label="Flag"
                            labelTh="ติดตาม"
                            onClick={() => {
                              setFlaggingId(b.id)
                              setFlagNote(b.staff_follow_up_note?.trim() || 'Follow up — PayID slip')
                            }}
                          />
                          <StaffActionTile
                            icon={CreditCard}
                            label="Card pay"
                            labelTh="รับบัตร"
                            disabled={!canRecordReader}
                            onClick={() => openReaderForm(b)}
                          />
                          {b.waiver_signed ? (
                            <ResetWaiverButton
                              bookingId={b.id}
                              layout="tile"
                              subtitle={bookingSubtitle(b)}
                              onSessionExpired={() => navigate('/app')}
                              onReset={() =>
                                setBookings((prev) =>
                                  prev.map((row) =>
                                    row.id === b.id
                                      ? { ...row, waiver_signed: false, waiver_signed_at: null }
                                      : row,
                                  ),
                                )
                              }
                            />
                          ) : (
                            <StaffActionTile
                              icon={RotateCcw}
                              label="Reset waiver"
                              labelTh="รีเซ็ต"
                              disabled
                              onClick={() => undefined}
                            />
                          )}
                          <StaffActionTile
                            icon={Ban}
                            label="Cancel"
                            labelTh="ยกเลิก"
                            danger
                            onClick={() => setCancelling(b)}
                          />
                          <StaffActionTile
                            icon={FilePlus2}
                            label="Extra quote"
                            labelTh="ต่อทริป"
                            onClick={() => setQuoteBookingId(b.id)}
                          />
                        </div>
                        <StaffButton
                          onClick={() => openPaymentRow(b)}
                          className="mt-2 flex min-h-14 w-full items-center justify-center gap-2 text-[17px] font-bold"
                        >
                          + บันทึกการชำระ
                        </StaffButton>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {b.waiver_signed ? (
                            <EditWaiverButton
                              bookingId={b.id}
                              layout="tile"
                              onSessionExpired={() => navigate('/app')}
                            />
                          ) : (
                            <StaffActionTile
                              icon={Pencil}
                              label="Edit waiver"
                              labelTh="แก้ไข"
                              disabled
                              onClick={() => undefined}
                            />
                          )}
                          <StaffActionTile
                            icon={FileImage}
                            label="View slip"
                            labelTh="ดูสลิป"
                            disabled={!bookingHasSlip(b) || slipBusyId === b.id}
                            busy={slipBusyId === b.id}
                            onClick={() => void viewSlip(b)}
                          />
                          <StaffActionTile
                            icon={BadgeCheck}
                            label="Verify PayID"
                            labelTh="ยืนยัน"
                            disabled={cardPaid || inPersonCard || verifyId === b.id}
                            busy={verifyId === b.id}
                            onClick={() => void verifyPayId(b)}
                          />
                        </div>
                      </>
                    )}

                    <div className="mt-3 border-t border-white/10 pt-3">
                      <MarketingPhotoOptOutCard
                        booking={b}
                        onUpdated={(next) =>
                          setBookings((prev) =>
                            prev.map((row) => (row.id === next.id ? { ...row, ...next } : row)),
                          )
                        }
                        onSessionExpired={() => navigate('/app')}
                        toast={toast}
                      />
                    </div>
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
      {payingBooking ? (
        <StaffTaskView
          icon={Coins}
          title="Record payment"
          titleTh="บันทึกการชำระ"
          subtitle={bookingSubtitle(payingBooking)}
          onClose={closePaymentRow}
          closeDisabled={payingSubmitting}
        >
          <label className="block">
            <TaskFieldLabel icon={Coins}>Amount (AUD) / จำนวนเงิน</TaskFieldLabel>
            <StaffInput
              type="number"
              min={0}
              autoFocus
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="!mt-0 h-14 text-center text-[22px] font-bold"
            />
          </label>
          <div className="mt-2">
            <AmountShortcuts
              deposit={payingTour?.deposit_aud}
              remaining={payingRemaining}
              current={payAmount}
              onPick={(n) => setPayAmount(String(n))}
            />
          </div>
          <label className="mt-4 block">
            <TaskFieldLabel icon={Route}>Payment method / ช่องทาง</TaskFieldLabel>
            <StaffSelect
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="!mt-0 h-[52px] text-base"
            >
              {PAY_METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </StaffSelect>
          </label>
          <StaffButton
            disabled={!payAmount || Number(payAmount) <= 0 || payingSubmitting}
            onClick={() => submitPayment(payingBooking)}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 text-[17px] font-bold"
          >
            <Check className="h-5 w-5" />
            {payingSubmitting ? 'กำลังบันทึก...' : 'ยืนยันรับเงิน'}
          </StaffButton>
        </StaffTaskView>
      ) : null}
      {flaggingBooking ? (
        <StaffTaskView
          icon={Flag}
          title="Flag for follow-up"
          titleTh="ติดตามลูกค้า"
          subtitle={bookingSubtitle(flaggingBooking)}
          onClose={() => setFlaggingId(null)}
          closeDisabled={flagSubmitting}
        >
          <label className="block">
            <TaskFieldLabel icon={MessageSquare}>Follow-up note / หมายเหตุ</TaskFieldLabel>
            <StaffInput
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              maxLength={500}
              className="!mt-0 min-h-14 text-base"
            />
          </label>
          <p className="mt-2 text-sm text-cream-muted">Booking stays pending.</p>
          <StaffButton
            type="button"
            disabled={!flagNote.trim() || flagSubmitting}
            onClick={() => void submitFlag(flaggingBooking)}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 text-[17px] font-bold"
          >
            <Check className="h-5 w-5" />
            {flagSubmitting ? 'Saving…' : 'Save flag'}
          </StaffButton>
        </StaffTaskView>
      ) : null}
      {quoteBooking ? (
        <StaffTaskView
          icon={FilePlus2}
          title="Extra stay quote"
          titleTh="ใบเสนอราคาต่อทริป"
          subtitle={bookingSubtitle(quoteBooking)}
          onClose={() => setQuoteBookingId(null)}
        >
          <BookingExtensionQuotes
            bookingId={quoteBooking.id}
            travelDate={quoteBooking.travel_date}
            tourDepartureDate={quoteTour?.departure_date}
            extraDaysPaid={quoteBooking.extra_days_paid}
            durationDays={quoteTour?.duration_days}
            canIssue={canIssueQuote}
            canMarkPaid
            onSessionExpired={() => navigate('/app')}
            onChanged={load}
          />
        </StaffTaskView>
      ) : null}
      {readerBooking && (
        <StaffTaskView
          icon={CreditCard}
          title="Record card payment"
          titleTh="บันทึกการรับบัตรหน้างาน"
          subtitle={bookingSubtitle(readerBooking)}
          onClose={() => !readerSubmitting && closeReaderForm()}
          closeDisabled={readerSubmitting}
        >
          <p className="text-sm leading-relaxed text-amber-200/90">
            Charge the card in the Square Point of Sale app first, then copy the receipt number
            here. This does not talk to Square.
            <span className="mt-1 block font-thai" lang="th">
              รูดบัตรในแอป Square POS ก่อน แล้วคัดลอกเลขใบเสร็จมาใส่ — ระบบไม่ดึงข้อมูลจาก Square อัตโนมัติ
            </span>
          </p>
          <label className="mt-4 block">
            <TaskFieldLabel icon={Coins}>Amount (AUD) / ยอดที่รับ</TaskFieldLabel>
            <StaffInput
              type="number"
              min={0}
              step="0.01"
              autoFocus
              value={readerAmount}
              onChange={(e) => setReaderAmount(e.target.value)}
              className="!mt-0 h-14 text-center text-[22px] font-bold"
            />
          </label>
          <div className="mt-2">
            <AmountShortcuts
              deposit={readerTour?.deposit_aud}
              remaining={readerRemaining}
              current={readerAmount}
              onPick={(n) => setReaderAmount(String(n))}
            />
          </div>
          <label className="mt-4 block">
            <TaskFieldLabel icon={Hash}>Square receipt / เลขใบเสร็จ</TaskFieldLabel>
            <StaffInput
              value={readerReceipt}
              onChange={(e) => setReaderReceipt(e.target.value)}
              placeholder="From Square POS receipt screen"
              className="!mt-0 h-[52px] text-base"
            />
          </label>
          <label className="mt-4 block">
            <TaskFieldLabel icon={MessageSquare}>Note (optional) / หมายเหตุ</TaskFieldLabel>
            <StaffTextarea
              rows={2}
              value={readerNote}
              onChange={(e) => setReaderNote(e.target.value)}
              className="!mt-0 text-base"
            />
          </label>
          <StaffButton
            type="button"
            disabled={
              readerSubmitting ||
              !readerAmount ||
              Number(readerAmount) <= 0 ||
              readerReceipt.trim().length < 2
            }
            onClick={() => void submitReaderPayment()}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 text-[17px] font-bold"
          >
            <Check className="h-5 w-5" />
            {readerSubmitting ? 'Saving…' : 'Save payment'}
          </StaffButton>
        </StaffTaskView>
      )}
      {slipViewer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Payment slip"
          onClick={() => setSlipViewer(null)}
        >
          <div
            className="max-h-[90vh] max-w-lg overflow-auto rounded-2xl border border-white/15 bg-near-black-green p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-sm font-medium text-cream">{slipViewer.title}</p>
            <img
              src={slipViewer.url}
              alt="PayID payment slip"
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
            <StaffButton
              type="button"
              variant="secondary"
              className="mt-3 w-full text-xs"
              onClick={() => setSlipViewer(null)}
            >
              Close
            </StaffButton>
          </div>
        </div>
      )}
    </div>
  )
}
