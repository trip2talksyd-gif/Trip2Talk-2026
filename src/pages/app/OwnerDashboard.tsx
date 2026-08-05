import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Banknote,
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
  StaffCard,
  StaffMain,
  StaffPageHeader,
  StaffSectionTitle,
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

  const stats = [
    { label: 'Bookings (month)', value: String(activeBookings.length), tone: 'default' as const },
    { label: 'Revenue', value: formatAud(revenue), tone: 'default' as const },
    { label: 'Expenses', value: formatAud(expenseTotal), tone: 'muted' as const },
    {
      label: 'Net profit',
      value: formatAud(netProfit),
      tone: netProfit >= 0 ? ('positive' as const) : ('negative' as const),
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
              <StaffCard className="border-coral/50 bg-coral/10">
                <div className="flex items-center justify-between gap-3">
                  <StaffSectionTitle>
                    <span className="inline-flex items-center gap-2 text-coral">
                      <ShieldAlert className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                      Compliance alerts (30 days)
                    </span>
                  </StaffSectionTitle>
                  <span className="rounded-full bg-coral px-2.5 py-0.5 text-xs font-semibold text-white">
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
              <div className="mt-3 grid grid-cols-2 gap-3">
                {stats.map((card) => (
                  <StaffCard key={card.label} className="p-3.5 sm:p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-cream-muted">
                      {card.label}
                    </p>
                    <p
                      className={`mt-2 font-serif text-xl tabular-nums leading-none sm:text-2xl ${
                        card.tone === 'positive'
                          ? 'text-teal-500'
                          : card.tone === 'negative'
                            ? 'text-coral'
                            : card.tone === 'muted'
                              ? 'text-cream'
                              : 'text-teal-500'
                      }`}
                    >
                      {card.value}
                    </p>
                  </StaffCard>
                ))}
              </div>
            </section>

            <section>
              <StaffSectionTitle>Quick actions</StaffSectionTitle>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {NAV_LINKS.map((link) => (
                  <StaffActionChip
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    label={link.label}
                    highlighted={link.highlighted}
                  />
                ))}
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
