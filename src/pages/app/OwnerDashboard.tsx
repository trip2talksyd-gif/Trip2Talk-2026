import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Banknote,
  CalendarDays,
  CalendarPlus,
  Camera,
  ClipboardList,
  CreditCard,
  FileCheck,
  FilePen,
  History,
  KeyRound,
  LayoutDashboard,
  Receipt,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
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
  StaffActionChip,
  StaffActionTile,
  StaffCard,
  StaffMain,
  StaffPageHeader,
  StaffSectionTitle,
  StaffStatCard,
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

const NAV_LINKS: { to: string; label: string; icon: ReactNode; highlighted?: boolean }[] = [
  {
    to: '/app/trips',
    label: 'ลงทริปใหม่',
    icon: <CalendarPlus className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
    highlighted: true,
  },
  {
    to: '/app/expenses/new',
    label: 'Add expense',
    icon: <Receipt className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/cashier',
    label: 'Cashier POS',
    icon: <CreditCard className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/payments',
    label: 'Customer payments / งวดชำระ',
    icon: <Wallet className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/staff',
    label: 'Staff Dashboard',
    icon: <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/staff-pins',
    label: 'Staff PIN reset',
    icon: <KeyRound className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/waiver-assist',
    label: 'Waiver assist / กรอกแทนลูกค้า',
    icon: <FileCheck className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/tax-summary',
    label: 'Tax Summary (รายทริป + Export)',
    icon: <ClipboardList className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/income',
    label: 'Income — paid installments',
    icon: <Banknote className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/logins',
    label: 'Recent staff logins',
    icon: <History className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/content-review',
    label: 'Content Review (Facebook drafts)',
    icon: <FilePen className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
  {
    to: '/app/quick-post',
    label: 'Quick Post (value content)',
    icon: <Camera className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
  },
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
  const netProfit = revenue - expenseTotal

  const urgentItems = items.filter(
    (item) => item.due_date && daysUntil(item.due_date) <= 30 && item.status !== 'done',
  )

  const primaryActions = NAV_LINKS.filter((link) => link.highlighted)
  const secondaryActions = NAV_LINKS.filter((link) => !link.highlighted)

  // Relative bar heights: money metrics share an AUD scale; bookings uses its own
  // count scale against the busiest of {count, 1} so 0 stays empty and N fills
  // honestly vs this month only (no fabricated history).
  const moneyPeak = Math.max(revenue, expenseTotal, Math.abs(netProfit), 1)
  const bookingPeak = Math.max(activeBookings.length, 1)

  const stats = [
    {
      label: 'Bookings (month)',
      value: String(activeBookings.length),
      tone: 'default' as const,
      barRatio: activeBookings.length / bookingPeak,
      icon: <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
    },
    {
      label: 'Revenue',
      value: formatAud(revenue),
      tone: 'default' as const,
      barRatio: revenue / moneyPeak,
      icon: <Banknote className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
    },
    {
      label: 'Expenses',
      value: formatAud(expenseTotal),
      tone: 'muted' as const,
      barRatio: expenseTotal / moneyPeak,
      icon: <Receipt className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />,
    },
    {
      label: 'Net profit',
      value: formatAud(netProfit),
      tone: netProfit >= 0 ? ('positive' as const) : ('negative' as const),
      barRatio: Math.abs(netProfit) / moneyPeak,
      icon:
        netProfit >= 0 ? (
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        ),
    },
  ]

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app"
        backLabel="← PIN"
        title="Owner Dashboard"
        subtitle="Ops overview · this month"
      />

      <StaffMain>
        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && (
          <>
            {urgentItems.length > 0 && (
              <StaffCard className="border-coral/45 [background:linear-gradient(145deg,rgba(226,115,74,0.22),rgba(32,54,60,0.92)_50%,rgba(22,38,43,0.96))]">
                <div className="flex items-center justify-between gap-3">
                  <StaffSectionTitle>
                    <span className="inline-flex items-center gap-2 normal-case tracking-normal text-coral">
                      <ShieldAlert className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                      Compliance alerts (30 days)
                    </span>
                  </StaffSectionTitle>
                  <span className="rounded-full bg-coral px-2.5 py-0.5 text-xs font-semibold text-white shadow-[0_6px_14px_-6px_rgba(226,115,74,0.8)]">
                    {urgentItems.length}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {[...urgentItems]
                    .sort((a, b) => daysUntil(a.due_date) - daysUntil(b.due_date))
                    .map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-coral/35 bg-near-black-green/55 px-3.5 py-2.5"
                      >
                        <span className="min-w-0 text-sm text-cream">
                          {item.item_name}{' '}
                          <span className="text-cream-muted">· {item.status}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-coral px-2 py-0.5 text-xs font-medium text-white">
                          {daysUntil(item.due_date)}d
                        </span>
                      </li>
                    ))}
                </ul>
              </StaffCard>
            )}

            <section>
              <StaffSectionTitle>This month</StaffSectionTitle>
              <div className="mt-3.5 grid grid-cols-2 gap-3 sm:gap-3.5">
                {stats.map((card) => (
                  <StaffStatCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    tone={card.tone}
                    icon={card.icon}
                    barRatio={card.barRatio}
                  />
                ))}
              </div>
            </section>

            <section>
              <StaffSectionTitle>Quick actions</StaffSectionTitle>
              <div className="mt-3.5 space-y-3">
                {primaryActions.map((link) => (
                  <StaffActionChip
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    label={link.label}
                    highlighted
                  />
                ))}
                <div className="grid grid-cols-2 gap-2.5">
                  {secondaryActions.map((link) => (
                    <StaffActionTile
                      key={link.to}
                      to={link.to}
                      icon={link.icon}
                      label={link.label}
                    />
                  ))}
                </div>
              </div>
            </section>

            {urgentItems.length === 0 && (
              <StaffCard>
                <StaffSectionTitle>Compliance alerts (30 days)</StaffSectionTitle>
                <p className="mt-2 text-sm text-cream-muted">No urgent alerts</p>
              </StaffCard>
            )}
          </>
        )}
      </StaffMain>
    </div>
  )
}
