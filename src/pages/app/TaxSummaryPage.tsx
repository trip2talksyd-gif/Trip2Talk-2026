import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import {
  StaffButton,
  StaffCard,
  StaffMain,
  StaffPageHeader,
  StaffSelect,
  staffShellClass,
} from '../../components/app/staffUi'
import { currentAuTaxYearEnding } from '../../lib/auTaxYear'

const DEFAULT_TY_ENDING = currentAuTaxYearEnding()
const YEAR_OPTIONS = [DEFAULT_TY_ENDING, DEFAULT_TY_ENDING - 1, DEFAULT_TY_ENDING - 2]

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
  /** AU tax year ending 30 Jun of this calendar year (1 Jul prior → 30 Jun). */
  const [taxYearEnding, setTaxYearEnding] = useState(DEFAULT_TY_ENDING)
  const [rows, setRows] = useState<TripFinancialRow[]>([])
  const [summary, setSummary] = useState<YearSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchYearSummary(taxYearEnding, { mode: 'tax_year' })
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
  }, [taxYearEnding, navigate])

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
      if (b.cancelled_at || b.booking_status === 'cancelled') continue
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
    a.download = `trip2talk-tax-summary-ty-ending-${taxYearEnding}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="← Owner Dashboard"
        title="Tax Summary"
        subtitle="AU tax year 1 Jul–30 Jun · รายรับ-รายจ่ายรายทริปสำหรับยื่นภาษี"
      />

      <StaffMain className="space-y-6">
        <div className="flex items-center gap-2">
          <StaffSelect
            value={taxYearEnding}
            onChange={(e) => setTaxYearEnding(Number(e.target.value))}
            className="text-sm"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                TY ending Jun {y}
              </option>
            ))}
          </StaffSelect>
          <StaffButton
            className="!w-auto shrink-0 px-4 py-2 text-sm"
            onClick={exportCsv}
            disabled={loading || rows.length === 0}
          >
            Export CSV
          </StaffButton>
        </div>

        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && (
          <>
            <StaffCard padding={false}>
              <div className="grid grid-cols-3 divide-x divide-white/8">
                {[
                  {
                    label: 'Total paid income',
                    hint: 'Sum of amount_paid on bookings in this tax year',
                    value: formatAud(totals.revenue),
                  },
                  { label: 'Expenses', hint: 'Trip-linked + general in period', value: formatAud(totals.expense) },
                  {
                    label: 'Net profit',
                    hint: 'Must equal sum of Profit per trip below',
                    value: formatAud(totals.profit),
                  },
                ].map((card) => (
                  <div key={card.label} className="p-4">
                    <p className="text-xs text-cream-muted">{card.label}</p>
                    <p className="mt-1 font-serif text-lg text-teal-500">{card.value}</p>
                    <p className="mt-1 text-[10px] leading-snug text-cream-muted/80">{card.hint}</p>
                  </div>
                ))}
              </div>
            </StaffCard>

            {sourceBreakdown.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-cream-muted">ลูกค้ามาจากไหนมากสุด</h2>
                <ul className="mt-2 space-y-1.5">
                  {sourceBreakdown.map((s) => {
                    const pct = sourceTotal > 0 ? Math.round((s.count / sourceTotal) * 100) : 0
                    return (
                      <li key={s.code}>
                        <StaffCard className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-cream">{s.label}</span>
                            <span className="text-cream-muted">
                              {s.count} จอง ({pct}%) · {formatAud(s.revenue)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-teal-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </StaffCard>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {rows.length === 0 ? (
              <p className="text-sm text-cream-muted">
                ไม่มีข้อมูล TY ending Jun {taxYearEnding}
              </p>
            ) : (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-cream-muted">
                  Profit per trip
                </h2>
                <p className="mt-1 text-[10px] text-cream-muted">
                  Same TY as Total paid income · sum revenue {formatAud(totals.revenue)} · sum
                  profit {formatAud(totals.profit)}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {rows.map((r) => (
                    <li key={r.trip_code}>
                      <StaffCard className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-cream">{r.trip_code}</span>
                          <span
                            className={`font-medium ${r.profit_aud >= 0 ? 'text-teal-500' : 'text-coral'}`}
                          >
                            {formatAud(r.profit_aud)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-cream-muted">
                          {r.bookings_count} bookings · รายรับ {formatAud(r.revenue_aud)} · รายจ่าย{' '}
                          {formatAud(r.expense_aud)}
                        </p>
                      </StaffCard>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </StaffMain>
    </div>
  )
}
