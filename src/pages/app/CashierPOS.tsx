import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createBookingManual,
  fetchPendingBookings,
  fetchToursAdmin,
  fetchTourByCode,
  updateBookingStatus,
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
  const [submitting, setSubmitting] = useState(false)

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
      await createBookingManual({
        trip_code: tripCode,
        first_name_en: firstName.trim(),
        last_name_en: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        amount_paid_aud: amountPaid ? Number(amountPaid) : 0,
        payment_method: paymentMethod,
        booking_status: amountPaid ? 'deposit_paid' : 'pending_payment',
      })
      toast('เพิ่มการจองสำเร็จ', 'success')
      setFormOpen(false)
      setTripCode('')
      setFirstName('')
      setLastName('')
      setPhone('')
      setEmail('')
      setAmountPaid('')
      load()
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

  async function markPaid(booking: TourBooking, status: 'deposit_paid' | 'fully_paid') {
    try {
      const tour = await fetchTourByCode(booking.trip_code)
      const amount =
        status === 'deposit_paid'
          ? tour?.deposit_aud ?? 100
          : tour?.price_aud ?? booking.amount_paid_aud

      await updateBookingStatus(booking.id, status, amount)
      toast(t('toast.paymentUpdated'), 'success')
      load()
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast(t('toast.paymentFailed'), 'error')
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
            {bookings.map((b) => (
              <li key={b.id} className="rounded-editorial border border-white/8 bg-surface-card p-4">
                <p className="font-medium text-cream">
                  {b.first_name_en} {b.last_name_en}
                </p>
                <p className="text-xs text-cream-muted">
                  {b.trip_code} · {b.email}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => markPaid(b, 'deposit_paid')}
                    className="rounded-editorial bg-gold px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gold-dark transition-transform active:scale-95"
                  >
                    Deposit Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => markPaid(b, 'fully_paid')}
                    className="rounded-editorial border border-gold px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gold transition-transform active:scale-95"
                  >
                    Fully Paid
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
