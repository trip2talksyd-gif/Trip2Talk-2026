import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const NOW = new Date()
const CURRENT_YEAR = NOW.getFullYear()

/**
 * Owner-only income from paid installments.
 * Group by calendar month, trip, or AU tax year (1 Jul–30 Jun).
 * Does not merge expenseDb / expenses — P&L combined view is a follow-up.
 */
export default function InstallmentIncomePage() {
  const { tt } = useLang()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'month' | 'trip' | 'tax_year'>('tax_year')
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(NOW.getMonth() + 1)
  const [tripCode, setTripCode] = useState('')
  const [summary, setSummary] = useState<InstallmentIncomeSummary | null>(null)
  const [ops, setOps] = useState<OwnerOpsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const title = tt('staff.income.title')

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

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/owner" className="text-sm text-gold">
          ← Owner
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">
          {title.en}
          <span className="mt-0.5 block font-thai text-sm font-medium text-cream-muted">
            {title.th}
          </span>
        </h1>
        <p className="mt-1 text-[11px] text-cream-muted">
          Paid installments only · AU tax year = 1 Jul–30 Jun · expenses not included
          <span className="mt-0.5 block font-thai">
            เฉพาะงวดที่จ่ายแล้ว · ปีภาษีออสฯ 1 ก.ค.–30 มิ.ย. · ไม่รวมรายจ่าย
          </span>
        </p>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
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
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                mode === m ? 'bg-gold text-near-black-green' : 'border border-white/15 text-cream-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-white/15 bg-surface-card px-2 py-1.5 text-sm text-cream"
          >
            {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
              <option key={y} value={y}>
                {mode === 'tax_year' ? `TY ending Jun ${y}` : y}
              </option>
            ))}
          </select>
          {mode === 'month' && (
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-white/15 bg-surface-card px-2 py-1.5 text-sm text-cream"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
          {mode === 'trip' && (
            <input
              value={tripCode}
              onChange={(e) => setTripCode(e.target.value)}
              placeholder="Trip code"
              className="rounded-lg border border-white/15 bg-surface-card px-2 py-1.5 text-sm text-cream"
            />
          )}
        </div>

        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && summary && (
          <>
            <div className="rounded-editorial border border-gold/30 bg-gold/10 p-4">
              <p className="text-xs text-cream-muted">Total paid income</p>
              <p className="mt-1 font-serif text-2xl text-gold">{formatAud(summary.total_aud)}</p>
              <p className="mt-1 text-[11px] text-cream-muted">{summary.count} payments</p>
            </div>

            {summary.by_trip.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                  By trip
                </h2>
                <ul className="mt-2 space-y-1.5">
                  {summary.by_trip
                    .sort((a, b) => b.amount_aud - a.amount_aud)
                    .map((r) => (
                      <li
                        key={r.trip_code}
                        className="flex justify-between rounded-lg bg-surface-card px-3 py-2 text-sm"
                      >
                        <span>{r.trip_code}</span>
                        <span className="text-gold">{formatAud(r.amount_aud)}</span>
                      </li>
                    ))}
                </ul>
              </section>
            )}

            {ops && (
              <section className="space-y-3">
                <div className="rounded-editorial border border-white/10 bg-surface-card p-4">
                  <p className="text-xs text-cream-muted">Repeat customer rate</p>
                  <p className="mt-1 font-serif text-2xl text-gold">{ops.repeat_customer_rate}%</p>
                  <p className="mt-1 text-[11px] text-cream-muted">
                    {ops.repeat_bookings} of {ops.active_bookings} active bookings from guests who
                    booked before (email/phone match)
                  </p>
                </div>

                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                    Profit per trip
                  </h2>
                  {!ops.expenses_linked_to_trips && (
                    <p className="mt-1 text-[10px] text-amber-200/90">
                      Few/no expenses linked to trip_code — showing revenue; expense subtract when
                      trip-linked expenses exist.
                    </p>
                  )}
                  <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto">
                    {ops.profit_per_trip.slice(0, 20).map((r) => (
                      <li
                        key={r.trip_code}
                        className="flex justify-between gap-2 rounded-lg bg-surface-card px-3 py-2 text-sm"
                      >
                        <span>{r.trip_code}</span>
                        <span className="text-right text-[11px]">
                          <span className="text-gold">{formatAud(r.profit_aud)}</span>
                          <span className="mt-0.5 block text-cream-muted">
                            rev {formatAud(r.revenue_aud)} − exp {formatAud(r.expense_aud)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            <p className="text-[10px] text-cream-muted">
              Combined P&amp;L already uses paid installments minus trip-linked expenses when present.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
