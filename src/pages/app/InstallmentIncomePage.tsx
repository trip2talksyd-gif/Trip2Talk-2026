import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchInstallmentIncomeSummary,
  fetchOwnerOpsMetrics,
  formatAud,
  type InstallmentIncomeSummary,
  type OwnerOpsMetrics,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useLang } from '../../hooks/useLang'
import {
  StaffCard,
  StaffInput,
  StaffMain,
  StaffPageHeader,
  StaffSelect,
  staffShellClass,
  staffTabActiveClass,
  staffTabIdleClass,
} from '../../components/app/staffUi'

const NOW = new Date()
const CURRENT_CALENDAR_YEAR = NOW.getFullYear()

/**
 * AU tax year label year = calendar year of 30 Jun end.
 * Jul–Dec → ending next Jun (e.g. Aug 2026 → TY ending Jun 2027).
 * Jan–Jun → ending this Jun (e.g. Mar 2026 → TY ending Jun 2026).
 */
export function currentAuTaxYearEnding(now: Date = new Date()): number {
  const y = now.getFullYear()
  const month = now.getMonth() + 1
  return month >= 7 ? y + 1 : y
}

const DEFAULT_AU_TY_ENDING = currentAuTaxYearEnding(NOW)

/**
 * Owner-only income from paid installments.
 * Group by calendar month, trip, or AU tax year (1 Jul–30 Jun).
 * Does not merge expenseDb / expenses — P&L combined view is a follow-up.
 */
export default function InstallmentIncomePage() {
  const { tt } = useLang()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'month' | 'trip' | 'tax_year'>('tax_year')
  // Calendar year for Month/By trip; AU tax-year *ending* year for tax_year mode.
  const [year, setYear] = useState(DEFAULT_AU_TY_ENDING)
  const [month, setMonth] = useState(NOW.getMonth() + 1)
  const [tripCode, setTripCode] = useState('')
  const [summary, setSummary] = useState<InstallmentIncomeSummary | null>(null)
  const [ops, setOps] = useState<OwnerOpsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const title = tt('staff.income.title')

  const yearOptions = useMemo(() => {
    if (mode === 'tax_year') {
      const end = currentAuTaxYearEnding()
      return [end, end - 1, end - 2]
    }
    return [CURRENT_CALENDAR_YEAR, CURRENT_CALENDAR_YEAR - 1, CURRENT_CALENDAR_YEAR - 2]
  }, [mode])

  // When switching tabs, keep a sensible year for that mode (don't leave TY 2027
  // selected under Month where options are calendar years).
  useEffect(() => {
    if (!yearOptions.includes(year)) {
      setYear(yearOptions[0])
    }
  }, [mode, yearOptions, year])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([
      fetchInstallmentIncomeSummary({
        mode,
        year,
        month: mode === 'month' ? month : undefined,
        tripCode: mode === 'trip' && tripCode.trim() ? tripCode.trim() : undefined,
      }),
      fetchOwnerOpsMetrics().catch(() => null),
    ])
      .then(([sum, metrics]) => {
        setSummary(sum)
        setOps(metrics)
      })
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        console.error('[InstallmentIncomePage]', err)
        setError('Could not load income summary — apply migration + redeploy staff-api first')
      })
      .finally(() => setLoading(false))
  }, [mode, year, month, tripCode, navigate])

  useEffect(() => {
    load()
  }, [load])

  const profitRows = summary?.profit_per_trip ?? []
  const periodRevenue = summary?.total_aud ?? 0
  const periodProfitSum = profitRows.reduce((s, r) => s + r.profit_aud, 0)

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="← Owner"
        title={title.en}
        subtitle={
          <>
            <span className="block font-thai text-sm font-medium">{title.th}</span>
            Paid installments only · AU tax year = 1 Jul–30 Jun · expenses not included
            <span className="mt-0.5 block font-thai">
              เฉพาะงวดที่จ่ายแล้ว · ปีภาษีออสฯ 1 ก.ค.–30 มิ.ย. · ไม่รวมรายจ่าย
            </span>
          </>
        }
      />

      <StaffMain className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['tax_year', 'AU tax year'],
              ['month', 'Month'],
              ['trip', 'By trip'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={mode === m ? staffTabActiveClass : staffTabIdleClass}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <StaffSelect
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {mode === 'tax_year' ? `TY ending Jun ${y}` : y}
              </option>
            ))}
          </StaffSelect>
          {mode === 'month' && (
            <StaffSelect
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </StaffSelect>
          )}
          {mode === 'trip' && (
            <StaffInput
              value={tripCode}
              onChange={(e) => setTripCode(e.target.value)}
              placeholder="Trip code"
              className="text-sm"
            />
          )}
        </div>

        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && summary && (
          <>
            <StaffCard className="border-teal-500/30 bg-teal-500/10">
              <p className="text-xs text-cream-muted">Total paid income</p>
              <p className="mt-1 font-serif text-2xl text-teal-500">{formatAud(summary.total_aud)}</p>
              <p className="mt-1 text-[11px] text-cream-muted">{summary.count} payments</p>
              {summary.range?.start && (
                <p className="mt-1 text-[10px] text-cream-muted">
                  {summary.range.start.slice(0, 10)} → {summary.range.end.slice(0, 10)} (exclusive end)
                </p>
              )}
            </StaffCard>

            {summary.by_trip.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                  By trip
                </h2>
                <ul className="mt-2 space-y-1.5">
                  {summary.by_trip
                    .slice()
                    .sort((a, b) => b.amount_aud - a.amount_aud)
                    .map((r) => (
                      <li
                        key={r.trip_code}
                        className="flex justify-between rounded-lg bg-surface-card px-3 py-2 text-sm"
                      >
                        <span>{r.trip_code}</span>
                        <span className="text-teal-500">{formatAud(r.amount_aud)}</span>
                      </li>
                    ))}
                </ul>
              </section>
            )}

            <section className="space-y-3">
              {ops && (
                <StaffCard>
                  <p className="text-xs text-cream-muted">Repeat customer rate (all-time)</p>
                  <p className="mt-1 font-serif text-2xl text-teal-500">{ops.repeat_customer_rate}%</p>
                  <p className="mt-1 text-[11px] text-cream-muted">
                    {ops.repeat_bookings} of {ops.active_bookings} active bookings from guests who
                    booked before (email/phone match)
                  </p>
                </StaffCard>
              )}

              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                  Profit per trip
                </h2>
                <p className="mt-1 text-[10px] text-cream-muted">
                  Same period as Total paid income · sum revenue {formatAud(periodRevenue)}
                  {profitRows.length > 0
                    ? ` · sum profit ${formatAud(periodProfitSum)}`
                    : ''}
                </p>
                {summary.expenses_linked_to_trips === false && (
                  <p className="mt-1 text-[10px] text-amber-200/90">
                    Few/no expenses linked to trip_code in this period — showing revenue; expense
                    subtract when trip-linked expenses exist.
                  </p>
                )}
                {profitRows.length === 0 ? (
                  <p className="mt-2 text-sm text-cream-muted">No paid installments in this period</p>
                ) : (
                  <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">
                    {profitRows.slice(0, 20).map((r) => (
                      <li
                        key={r.trip_code}
                        className="flex justify-between gap-2 rounded-lg bg-surface-card px-3 py-2 text-sm"
                      >
                        <span>{r.trip_code}</span>
                        <span className="text-right text-[11px]">
                          <span className="text-teal-500">{formatAud(r.profit_aud)}</span>
                          <span className="mt-0.5 block text-cream-muted">
                            rev {formatAud(r.revenue_aud)} − exp {formatAud(r.expense_aud)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <p className="text-[10px] text-cream-muted">
              Combined P&amp;L uses paid installments in the selected period minus trip-linked
              expenses dated in the same period.
            </p>
          </>
        )}
      </StaffMain>
    </div>
  )
}
