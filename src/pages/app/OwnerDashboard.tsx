import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchBookingsThisMonth,
  fetchComplianceItems,
  fetchExpensesThisMonth,
  formatAud,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { ComplianceItem, TourBooking } from '../../types/tour'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(dateStr)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000)
}

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<TourBooking[]>([])
  const [expenses, setExpenses] = useState<{ amount_aud: number }[]>([])
  const [items, setItems] = useState<ComplianceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([fetchBookingsThisMonth(), fetchExpensesThisMonth(), fetchComplianceItems()])
      .then(([b, e, c]) => {
        setBookings(b)
        setExpenses(e)
        setItems(c)
      })
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        console.error('[OwnerDashboard] load failed:', err)
        setError('Could not load dashboard data')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  const revenue = useMemo(
    () => bookings.reduce((sum, b) => sum + (b.amount_paid_aud ?? 0), 0),
    [bookings],
  )
  const expenseTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount_aud ?? 0), 0),
    [expenses],
  )

  const urgentItems = items.filter(
    (item) => item.due_date && daysUntil(item.due_date) <= 30 && item.status !== 'done',
  )

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app" className="text-sm text-gold">
          ← PIN
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">Owner Dashboard</h1>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && (
          <>
            {urgentItems.length > 0 && (
              <section className="rounded-editorial border-2 border-coral bg-coral/15 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-coral">
                    Compliance alerts
                  </h2>
                  <span className="rounded-full bg-coral px-2 py-0.5 text-xs font-medium text-white">
                    {urgentItems.length}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {[...urgentItems]
                    .sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date))
                    .map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between rounded-editorial border border-coral/40 bg-near-black-green/60 px-3 py-2"
                      >
                        <span className="text-sm text-cream">
                          {item.item_name}{' '}
                          <span className="text-cream-muted">· {item.status}</span>
                        </span>
                        <span className="rounded-full bg-coral px-2 py-0.5 text-xs font-medium text-white">
                          {daysUntil(item.due_date)}d
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            )}

            <div className="grid grid-cols-2 divide-x divide-white/8 overflow-hidden rounded-editorial border border-white/8 bg-surface-card">
              {[
                { label: 'Bookings (month)', value: String(bookings.length) },
                { label: 'Revenue', value: formatAud(revenue) },
                { label: 'Expenses', value: formatAud(expenseTotal) },
                { label: 'Net profit', value: formatAud(revenue - expenseTotal) },
              ].map((card, i) => (
                <div
                  key={card.label}
                  className={`p-4 ${i >= 2 ? 'border-t border-white/8' : ''}`}
                >
                  <p className="text-xs text-cream-muted">{card.label}</p>
                  <p className="mt-1 font-serif text-lg text-gold">{card.value}</p>
                </div>
              ))}
            </div>

            <Link
              to="/app/expenses/new"
              className="block rounded-editorial border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm font-medium text-gold transition-colors hover:bg-gold/15"
            >
              + Add expense
            </Link>

            {urgentItems.length === 0 && (
              <section>
                <h2 className="text-sm font-medium text-cream-muted">Compliance alerts (30 days)</h2>
                <p className="mt-2 text-sm text-cream-muted">No urgent alerts</p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
