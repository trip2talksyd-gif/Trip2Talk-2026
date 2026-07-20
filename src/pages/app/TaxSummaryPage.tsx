import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchYearSummary,
  formatAud,
  summarizeByTrip,
  tripFinancialsToCsv,
  type TripFinancialRow,
  type YearSummary,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]

const SOURCE_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  website: 'Website',
  phone: 'โทรศัพท์',
  line: 'LINE',
  walk_in: 'Walk-in',
  other: 'อื่นๆ',
}

export default function TaxSummaryPage() {
  const navigate = useNavigate()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [rows, setRows] = useState<TripFinancialRow[]>([])
  const [summary, setSummary] = useState<YearSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchYearSummary(year)
      .then((summary) => {
        setSummary(summary)
        setRows(summarizeByTrip(summary))
      })
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        console.error('[TaxSummaryPage] load failed:', err)
        setError('Could not load year summary')
      })
      .finally(() => setLoading(false))
  }, [year, navigate])

  useEffect(() => {
    load()
  }, [load])

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          revenue: acc.revenue + r.revenue_aud,
          expense: acc.expense + r.expense_aud,
          profit: acc.profit + r.profit_aud,
        }),
        { revenue: 0, expense: 0, profit: 0 },
      ),
    [rows],
  )

  // Which channel actually brought paying customers this year — helps decide
  // where to spend ad budget / time (e.g. Facebook vs walk-in vs website).
  const sourceBreakdown = useMemo(() => {
    if (!summary) return []
    const byCode = new Map<string, { count: number; revenue: number }>()
    for (const b of summary.bookings) {
      const code = (b.source || 'unknown').toLowerCase()
      const row = byCode.get(code) ?? { count: 0, revenue: 0 }
      row.count += 1
      row.revenue += b.amount_paid_aud ?? 0
      byCode.set(code, row)
    }
    return [...byCode.entries()]
      .map(([code, v]) => ({ code, label: SOURCE_LABEL[code] ?? code, ...v }))
      .sort((a, b) => b.count - a.count)
  }, [summary])
  const sourceTotal = sourceBreakdown.reduce((sum, s) => sum + s.count, 0)

  function exportCsv() {
    const csv = tripFinancialsToCsv(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trip2talk-tax-summary-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/owner" className="text-sm text-gold">
          ← Owner Dashboard
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">Tax Summary</h1>
        <p className="mt-0.5 text-xs text-cream-muted">รายรับ-รายจ่ายรายทริป สำหรับยื่นภาษีปลายปี</p>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading || rows.length === 0}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-near-black-green disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>

        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-3 divide-x divide-white/8 overflow-hidden rounded-editorial border border-white/8 bg-surface-card">
              {[
                { label: 'Revenue', value: formatAud(totals.revenue) },
                { label: 'Expenses', value: formatAud(totals.expense) },
                { label: 'Net profit', value: formatAud(totals.profit) },
              ].map((card) => (
                <div key={card.label} className="p-4">
                  <p className="text-xs text-cream-muted">{card.label}</p>
                  <p className="mt-1 font-serif text-lg text-gold">{card.value}</p>
                </div>
              ))}
            </div>

            {sourceBreakdown.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-cream-muted">ลูกค้ามาจากไหนมากสุด</h2>
                <ul className="mt-2 space-y-1.5">
                  {sourceBreakdown.map((s) => {
                    const pct = sourceTotal > 0 ? Math.round((s.count / sourceTotal) * 100) : 0
                    return (
                      <li
                        key={s.code}
                        className="rounded-lg border border-white/8 bg-surface-card px-3 py-2 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-cream">{s.label}</span>
                          <span className="text-cream-muted">
                            {s.count} จอง ({pct}%) · {formatAud(s.revenue)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gold"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {rows.length === 0 ? (
              <p className="text-sm text-cream-muted">ไม่มีข้อมูลปี {year}</p>
            ) : (
              <ul className="space-y-1.5">
                {rows.map((r) => (
                  <li
                    key={r.trip_code}
                    className="rounded-lg border border-white/8 bg-surface-card px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-cream">{r.trip_code}</span>
                      <span
                        className={`font-medium ${r.profit_aud >= 0 ? 'text-gold' : 'text-coral'}`}
                      >
                        {formatAud(r.profit_aud)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-cream-muted">
                      {r.bookings_count} bookings · รายรับ {formatAud(r.revenue_aud)} · รายจ่าย{' '}
                      {formatAud(r.expense_aud)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  )
}
