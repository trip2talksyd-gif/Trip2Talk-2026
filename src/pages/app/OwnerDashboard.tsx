import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchBookingsThisMonth,
  fetchComplianceItems,
  fetchExpensesThisMonth,
  formatAud,
  isBookingCancelled,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { ComplianceItem, TourBooking } from '../../types/tour'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import {
  StaffCard,
  StaffMain,
  StaffPageHeader,
  staffChipClass,
  staffShellClass,
} from '../../components/app/staffUi'

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(dateStr)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000)
}

const NAV_LINKS: { to: string; label: string }[] = [
  { to: '/app/trips', label: '+ ลงทริปใหม่' },
  { to: '/app/expenses/new', label: '+ Add expense' },
  { to: '/app/cashier', label: '💳 Cashier POS' },
  { to: '/app/payments', label: '💰 Customer payments / งวดชำระ' },
  { to: '/app/staff', label: '📋 Staff Dashboard' },
  { to: '/app/staff-pins', label: '🔐 Staff PIN reset' },
  { to: '/app/waiver-assist', label: '✍️ Waiver assist / กรอกแทนลูกค้า' },
  { to: '/app/tax-summary', label: '📊 Tax Summary (รายทริป + Export)' },
  { to: '/app/income', label: '💵 Income — paid installments (AU tax year)' },
  { to: '/app/logins', label: '🔐 Recent staff logins' },
  { to: '/app/content-review', label: '✎ Content Review (Facebook drafts)' },
  { to: '/app/quick-post', label: '📷 Quick Post (value content)' },
]

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

  const activeBookings = useMemo(
    () => bookings.filter((b) => !isBookingCancelled(b)),
    [bookings],
  )
  const revenue = useMemo(
    () => activeBookings.reduce((sum, b) => sum + (b.amount_paid_aud ?? 0), 0),
    [activeBookings],
  )
  const expenseTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount_aud ?? 0), 0),
    [expenses],
  )

  const urgentItems = items.filter(
    (item) => item.due_date && daysUntil(item.due_date) <= 30 && item.status !== 'done',
  )

  return (
    <div className={staffShellClass}>
      <StaffPageHeader backTo="/app" backLabel="← PIN" title="Owner Dashboard" />

      <StaffMain>
        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && (
          <>
            {urgentItems.length > 0 && (
              <StaffCard className="border-2 border-coral bg-coral/15">
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
              </StaffCard>
            )}

            <StaffCard padding={false}>
              <div className="grid grid-cols-2 divide-x divide-white/8">
                {[
                  { label: 'Bookings (month)', value: String(activeBookings.length) },
                  { label: 'Revenue', value: formatAud(revenue) },
                  { label: 'Expenses', value: formatAud(expenseTotal) },
                  { label: 'Net profit', value: formatAud(revenue - expenseTotal) },
                ].map((card, i) => (
                  <div
                    key={card.label}
                    className={`p-4 ${i >= 2 ? 'border-t border-white/8' : ''}`}
                  >
                    <p className="text-xs text-cream-muted">{card.label}</p>
                    <p className="mt-1 font-serif text-lg text-teal-500">{card.value}</p>
                  </div>
                ))}
              </div>
            </StaffCard>

            <div className="grid grid-cols-2 gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${staffChipClass} w-full justify-center text-center`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {urgentItems.length === 0 && (
              <section>
                <h2 className="text-sm font-medium text-cream-muted">Compliance alerts (30 days)</h2>
                <p className="mt-2 text-sm text-cream-muted">No urgent alerts</p>
              </section>
            )}
          </>
        )}
      </StaffMain>
    </div>
  )
}
