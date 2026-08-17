import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import {
  addPendingInstallment,
  deletePaymentInstallment,
  fetchCustomerLoyalty,
  fetchPaymentsForBooking,
  fetchTourByCode,
  formatAud,
  formatTravelDateLabel,
  recordPayment,
  resolveBookingTravelDate,
  searchCustomerPayments,
  updateBookingDetails,
  updateInstallment,
  type CustomerLoyalty,
  type CustomerPaymentSearchRow,
} from '../../lib/toursApi'
import { parseTravelDateFromTripCode } from '../../lib/tourSelectability'
import { paymentMethodLabelEn } from '../../lib/paymentCredit'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import { useLang } from '../../hooks/useLang'
import type { BookingPayment, TourBooking } from '../../types/tour'
import { staffReceiptPath } from './ReceiptPage'
import {
  staffShellClass,
  StaffPageHeader,
  StaffMain,
  StaffCard,
  StaffButton,
  StaffField,
  StaffInput,
} from '../../components/app/staffUi'
import BookingExtensionQuotes from '../../components/app/BookingExtensionQuotes'
import MarketingPhotoOptOutCard from '../../components/app/MarketingPhotoOptOutCard'

const CAN_DELETE_INSTALLMENT = new Set(['OWNER', 'MANAGER'])

function progressLabel(booking: TourBooking, payments: BookingPayment[]): string {
  const paid = payments.filter((p) => p.status === 'paid' || (!p.status && p.paid_at))
  const plan = booking.payment_plan_installments ?? Math.max(payments.length, 1)
  const paidAmt = paid.reduce((s, p) => s + Number(p.amount_aud ?? 0), 0)
  const totalHint = booking.amount_paid_aud
  return `${paid.length} of ${plan} paid · ${formatAud(paidAmt)}${
    totalHint && totalHint !== paidAmt ? ` (booking total ${formatAud(totalHint)})` : ''
  }`
}

export default function StaffPaymentsPage() {
  const { tt } = useLang()
  const { toast } = useToast()
  const navigate = useNavigate()
  const staffRole = sessionStorage.getItem('staff_role') ?? ''
  const canDeleteInstallment = CAN_DELETE_INSTALLMENT.has(staffRole)

  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<CustomerPaymentSearchRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [addAmount, setAddAmount] = useState('')
  const [addLabel, setAddLabel] = useState('')
  const [addDue, setAddDue] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{
    booking: TourBooking
    payment: BookingPayment
  } | null>(null)

  const title = tt('staff.payments.title')
  const searchBi = tt('staff.payments.search')

  const runSearch = useCallback(async () => {
    const q = query.trim()
    if (q.length < 2) {
      setRows([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await searchCustomerPayments(q)
      setRows(data)
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }, [query, navigate])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void runSearch()
    }, 350)
    return () => window.clearTimeout(t)
  }, [runSearch])

  // Refetch-on-focus fallback (Realtime deferred — acceptable per phase scope)
  useEffect(() => {
    function onFocus() {
      if (query.trim().length >= 2) void runSearch()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [query, runSearch])

  async function refreshRow(bookingId: string) {
    const payments = await fetchPaymentsForBooking(bookingId)
    setRows((prev) =>
      prev.map((r) => (r.booking.id === bookingId ? { ...r, payments } : r)),
    )
  }

  async function handleAddPending(bookingId: string) {
    const amount = Number(addAmount)
    if (!amount || amount <= 0) return
    setBusyId(bookingId)
    try {
      await addPendingInstallment(bookingId, amount, addLabel || undefined, addDue || null)
      setAddAmount('')
      setAddLabel('')
      setAddDue('')
      await refreshRow(bookingId)
      toast('Installment added', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Could not add installment', 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function openInvoice(booking: TourBooking, payment: BookingPayment) {
    let tripName = booking.trip_code
    let tourDeparture: string | null = null
    try {
      const tour = await fetchTourByCode(booking.trip_code)
      tripName = tour?.name_en ?? booking.trip_code
      tourDeparture = tour?.departure_date ?? null
    } catch {
      /* receipt still works */
    }
    navigate(staffReceiptPath(booking.booking_reference ?? '', payment.installment_no), {
      state: {
        bookingId: booking.id,
        bookingReference: booking.booking_reference,
        customerName: `${booking.first_name_en} ${booking.last_name_en}`,
        customerEmail: booking.email,
        tripName,
        tripCode: booking.trip_code,
        departureDate: resolveBookingTravelDate(booking, tourDeparture),
        amountPaid: Number(payment.amount_aud),
        paymentMethod: payment.payment_method ?? 'payid',
        bookingStatus: booking.booking_status,
        installmentNo: payment.installment_no,
        installmentPlan: booking.payment_plan_installments,
        priceAud: null,
        balanceRemaining: null,
      },
    })
  }

  async function handleMarkPaid(booking: TourBooking, payment: BookingPayment) {
    setBusyId(payment.id)
    try {
      if (payment.status === 'pending' || payment.status === 'overdue') {
        await updateInstallment({
          paymentId: payment.id,
          markPaid: true,
          paymentMethod: 'payid',
        })
      } else {
        // Legacy row without pending status — record as new paid via record_payment path
        await recordPayment(booking.id, Number(payment.amount_aud), 'payid')
      }
      await refreshRow(booking.id)
      let departureDate: string | null = null
      let tripName = booking.trip_code
      try {
        const tour = await fetchTourByCode(booking.trip_code)
        departureDate = resolveBookingTravelDate(booking, tour?.departure_date ?? null)
        tripName = tour?.name_en ?? booking.trip_code
      } catch {
        departureDate = resolveBookingTravelDate(booking, null)
      }
      // Hand off to tax invoice page for this installment
      navigate(staffReceiptPath(booking.booking_reference ?? '', payment.installment_no), {
        state: {
          bookingId: booking.id,
          bookingReference: booking.booking_reference,
          customerName: `${booking.first_name_en} ${booking.last_name_en}`,
          customerEmail: booking.email,
          tripName,
          tripCode: booking.trip_code,
          departureDate,
          amountPaid: Number(payment.amount_aud),
          paymentMethod: 'payid',
          bookingStatus: booking.booking_status,
          installmentNo: payment.installment_no,
          installmentPlan: booking.payment_plan_installments,
          priceAud: null,
          balanceRemaining: null,
        },
      })
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Could not mark paid', 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || !canDeleteInstallment) return
    const { booking, payment } = pendingDelete
    setBusyId(payment.id)
    try {
      const result = await deletePaymentInstallment(payment.id)
      setRows((prev) =>
        prev.map((r) =>
          r.booking.id === booking.id
            ? { booking: result.booking, payments: result.payments }
            : r,
        ),
      )
      setPendingDelete(null)
      toast('Installment deleted / ลบงวดแล้ว', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Could not delete installment', 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/cashier"
        backLabel="← Cashier"
        title={title.en}
        subtitle={<span className="font-thai text-sm font-medium">{title.th}</span>}
      />

      <StaffMain>
        <StaffField
          label={
            <>
              {searchBi.en}
              <span className="mt-0.5 block font-thai">{searchBi.th}</span>
            </>
          }
        >
          <StaffInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name / phone / booking ref"
          />
        </StaffField>

        {loading && <ListRowSkeleton />}
        {error && !loading && <PageError message={error} onRetry={runSearch} dark />}

        {!loading && rows.length === 0 && query.trim().length >= 2 && (
          <p className="text-sm text-cream-muted">No matches</p>
        )}

        <ul className="space-y-3">
          {rows.map(({ booking, payments }) => {
            const open = expandedId === booking.id
            return (
              <li key={booking.id}>
                <StaffCard>
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setExpandedId(open ? null : booking.id)}
                  >
                    <p className="text-sm font-semibold text-cream">
                      {booking.first_name_en} {booking.last_name_en}
                    </p>
                    <p className="text-[11px] text-cream-muted">
                      {booking.trip_code} · {booking.booking_reference ?? booking.id.slice(0, 8)} ·{' '}
                      {booking.booking_status}
                    </p>
                    <p className="mt-1 text-[11px] text-teal-500">{progressLabel(booking, payments)}</p>
                    <p className="mt-0.5 text-[10px] text-cream-muted">
                      Travel Date:{' '}
                      {formatTravelDateLabel(resolveBookingTravelDate(booking, null)) ?? '—'}
                    </p>
                  </button>

                  {open && (
                    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                      <LoyaltyBlock booking={booking} />
                      <MarketingPhotoOptOutCard
                        booking={booking}
                        onUpdated={(next) => {
                          setRows((prev) =>
                            prev.map((r) =>
                              r.booking.id === booking.id ? { ...r, booking: next } : r,
                            ),
                          )
                        }}
                        onSessionExpired={() => navigate('/app')}
                        toast={toast}
                      />
                      <TravelDateEditor
                        booking={booking}
                        busy={busyId === booking.id}
                        onBusy={(v) => setBusyId(v ? booking.id : null)}
                        onUpdated={(next) => {
                          setRows((prev) =>
                            prev.map((r) =>
                              r.booking.id === booking.id ? { ...r, booking: next } : r,
                            ),
                          )
                        }}
                        onSessionExpired={() => navigate('/app')}
                        toast={toast}
                      />
                      <BookingExtensionQuotes
                        bookingId={booking.id}
                        travelDate={booking.travel_date}
                        extraDaysPaid={booking.extra_days_paid}
                        canIssue={CAN_DELETE_INSTALLMENT.has(staffRole)}
                        canMarkPaid
                        onSessionExpired={() => navigate('/app')}
                        onChanged={() => {
                          void runSearch()
                        }}
                      />
                      {booking.referred_by_booking_id && (
                        <p className="text-[10px] text-cream-muted">
                          Referred by booking: {booking.referred_by_booking_id.slice(0, 8)}…
                        </p>
                      )}
                      {payments.length === 0 && (
                        <p className="text-xs text-cream-muted">No installments yet</p>
                      )}
                      {payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-near-black-green/50 px-2.5 py-2 text-[11px]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-cream">
                              #{p.installment_no} {p.label ?? 'Payment'} · {formatAud(p.amount_aud)}
                            </p>
                            <p className="text-cream-muted">
                              {paymentMethodLabelEn(p.payment_method)} · {p.status ?? 'paid'}
                              {p.due_date ? ` · due ${p.due_date}` : ''}
                              {p.receipt_invoice_number ? ` · ${p.receipt_invoice_number}` : ''}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {(p.status === 'pending' || p.status === 'overdue') && (
                              <StaffButton
                                disabled={busyId === p.id}
                                onClick={() => void handleMarkPaid(booking, p)}
                                className="w-auto px-2.5 py-1 text-[10px] uppercase"
                              >
                                Mark paid
                              </StaffButton>
                            )}
                            {(p.status === 'paid' || (!p.status && p.paid_at)) && (
                              <StaffButton
                                variant="secondary"
                                disabled={busyId === p.id}
                                onClick={() => void openInvoice(booking, p)}
                                className="w-auto px-2.5 py-1 text-[10px] uppercase"
                              >
                                Invoice
                              </StaffButton>
                            )}
                            {canDeleteInstallment && (
                              <button
                                type="button"
                                title="Delete installment / ลบงวด"
                                aria-label={`Delete installment #${p.installment_no}`}
                                disabled={busyId === p.id}
                                onClick={() => setPendingDelete({ booking, payment: p })}
                                className="rounded-lg p-1.5 text-cream-muted transition-colors hover:bg-coral/15 hover:text-coral disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      <StaffCard className="grid gap-2 p-2 sm:grid-cols-3" padding={false}>
                        <StaffInput
                          type="number"
                          min={1}
                          step={0.01}
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          placeholder="Amount AUD"
                          className="text-xs"
                        />
                        <StaffInput
                          value={addLabel}
                          onChange={(e) => setAddLabel(e.target.value)}
                          placeholder="Label (Deposit / Installment 2)"
                          className="text-xs"
                        />
                        <StaffInput
                          type="date"
                          value={addDue}
                          onChange={(e) => setAddDue(e.target.value)}
                          className="text-xs"
                        />
                        <StaffButton
                          variant="secondary"
                          disabled={busyId === booking.id || !addAmount}
                          onClick={() => void handleAddPending(booking.id)}
                          className="sm:col-span-3 text-xs"
                        >
                          + Add installment / เพิ่มงวด
                        </StaffButton>
                      </StaffCard>
                    </div>
                  )}
                </StaffCard>
              </li>
            )
          })}
        </ul>
      </StaffMain>

      {pendingDelete && (
        <div
          className="staff-shell fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 text-cream sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-installment-title"
          onClick={() => (busyId ? undefined : setPendingDelete(null))}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-near-black-green p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-installment-title" className="font-serif text-lg text-cream">
              Delete installment #{pendingDelete.payment.installment_no} —{' '}
              {formatAud(pendingDelete.payment.amount_aud)}?
            </h2>
            <p className="mt-1 font-thai text-sm text-cream-muted">ยืนยันลบงวดชำระนี้?</p>
            <p className="mt-2 text-xs text-cream-muted">
              This cannot be undone. Invoice number stays in the audit log only — PDF files are not
              auto-deleted.
              <span className="mt-1 block font-thai">
                ลบแล้วกู้คืนไม่ได้ · เลขใบเสร็จเก็บใน audit · ไม่ลบไฟล์ PDF อัตโนมัติ
              </span>
            </p>
            <p className="mt-2 text-[11px] text-cream-muted">
              {pendingDelete.payment.label ?? 'Payment'}
              {pendingDelete.payment.receipt_invoice_number
                ? ` · ${pendingDelete.payment.receipt_invoice_number}`
                : ''}
            </p>
            <div className="mt-4 flex gap-2">
              <StaffButton
                type="button"
                variant="danger"
                disabled={busyId === pendingDelete.payment.id}
                onClick={() => void handleConfirmDelete()}
                className="min-h-11 flex-1 bg-coral px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-coral/90"
              >
                {busyId === pendingDelete.payment.id ? 'Deleting…' : 'Delete / ลบ'}
              </StaffButton>
              <StaffButton
                type="button"
                variant="secondary"
                disabled={busyId === pendingDelete.payment.id}
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </StaffButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TravelDateEditor({
  booking,
  busy,
  onBusy,
  onUpdated,
  onSessionExpired,
  toast,
}: {
  booking: TourBooking
  busy: boolean
  onBusy: (v: boolean) => void
  onUpdated: (b: TourBooking) => void
  onSessionExpired: () => void
  toast: (msg: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [tourDeparture, setTourDeparture] = useState<string | null>(null)
  const derived =
    tourDeparture ||
    parseTravelDateFromTripCode(booking.trip_code) ||
    ''
  const initial =
    booking.travel_date?.slice(0, 10) || derived || ''
  const [value, setValue] = useState(initial)
  const dirty = (value || '') !== (booking.travel_date?.slice(0, 10) || '')

  useEffect(() => {
    let cancelled = false
    fetchTourByCode(booking.trip_code)
      .then((t) => {
        if (!cancelled) setTourDeparture(t?.departure_date?.slice(0, 10) ?? null)
      })
      .catch(() => {
        if (!cancelled) setTourDeparture(null)
      })
    return () => {
      cancelled = true
    }
  }, [booking.trip_code])

  useEffect(() => {
    setValue(booking.travel_date?.slice(0, 10) || derived || '')
  }, [booking.id, booking.travel_date, derived])

  async function save() {
    onBusy(true)
    try {
      const next = await updateBookingDetails(booking.id, {
        travel_date: value.trim() ? value.trim().slice(0, 10) : null,
      })
      onUpdated(next)
      toast('Travel date saved / บันทึกวันเดินทางแล้ว', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired()
        return
      }
      toast('Could not save travel date', 'error')
    } finally {
      onBusy(false)
    }
  }

  const preview = formatTravelDateLabel(value || derived) ?? '—'

  return (
    <div className="rounded-lg border border-white/10 bg-near-black-green/40 px-2.5 py-2">
      <p className="text-[11px] font-semibold text-cream">
        Travel Date / วันเดินทาง
        <span className="ml-2 font-normal text-cream-muted">→ {preview}</span>
      </p>
      <p className="mt-0.5 text-[10px] text-cream-muted">
        Manual override for invoices. Prefills from tour or trip-code when possible.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <StaffInput
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="max-w-[11rem] text-xs"
          disabled={busy}
        />
        <StaffButton
          variant="secondary"
          disabled={busy || !dirty}
          onClick={() => void save()}
          className="w-auto px-2.5 py-1 text-[10px] uppercase"
        >
          Save date
        </StaffButton>
        {!booking.travel_date && derived && (
          <span className="text-[10px] text-cream-muted">Suggested: {formatTravelDateLabel(derived)}</span>
        )}
        {booking.travel_date && (
          <span className="text-[10px] text-teal-500">Manual override set</span>
        )}
      </div>
    </div>
  )
}

function LoyaltyBlock({ booking }: { booking: TourBooking }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CustomerLoyalty | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchCustomerLoyalty({ email: booking.email, phone: booking.phone })
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [booking.email, booking.phone])

  if (loading) {
    return <p className="text-[11px] text-cream-muted">Loading loyalty…</p>
  }
  if (!data) return null

  const repeat = data.trips_count > 1
  return (
    <div
      className={`rounded-lg px-2.5 py-2 text-[11px] ${
        repeat ? 'border border-teal-500/40 bg-teal-500/10' : 'bg-near-black-green/40'
      }`}
    >
      <p className="font-semibold text-cream">
        Loyalty · {data.trips_count} trip{data.trips_count === 1 ? '' : 's'} ·{' '}
        {formatAud(data.total_spend_aud)} lifetime
        {repeat ? ' · REPEAT' : ''}
      </p>
      <p className="mt-0.5 text-cream-muted">
        {data.bookings_count} booking row(s) matched by email/phone — for seasonal outreach (manual)
        <span className="mt-0.5 block font-thai text-[10px]">
          จับคู่ด้วยอีเมล/เบอร์ — สำหรับติดต่อลูกค้าประจำ (ยังไม่ส่งออโต้)
        </span>
      </p>
    </div>
  )
}
