import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchPendingBookings, fetchTourByCode, updateBookingStatus } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { TourBooking } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import { useLang } from '../../hooks/useLang'

export default function CashierPOS() {
  const { t } = useLang()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<TourBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchPendingBookings()
      .then(setBookings)
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

      <main className="mx-auto max-w-2xl px-4 py-6">
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
