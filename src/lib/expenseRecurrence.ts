import type { Expense, ExpenseFrequency } from '../types/tour'

export const FREQ_LABEL: Record<ExpenseFrequency, { en: string; th: string }> = {
  once: { en: 'Once', th: 'ครั้งเดียว' },
  monthly: { en: 'Monthly', th: 'รายเดือน' },
  yearly: { en: 'Yearly', th: 'รายปี' },
}

function parseISO(isoDate: string): Date {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function iso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function clampDay(year: number, month: number, day: number): Date {
  const last = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, last))
}

function inWindow(date: Date, start: Date, ended: Date | null): boolean {
  if (date < start) return false
  if (ended && date > ended) return false
  return true
}

/** AU tax year: 1 Jul (taxYearEnding-1) inclusive → 1 Jul taxYearEnding exclusive. */
export function auTaxYearWindow(taxYearEnding: number): { start: Date; endExclusive: Date } {
  return {
    start: new Date(taxYearEnding - 1, 6, 1),
    endExclusive: new Date(taxYearEnding, 6, 1),
  }
}

function inTaxYear(date: Date, taxYearEnding: number): boolean {
  const { start, endExclusive } = auTaxYearWindow(taxYearEnding)
  return date >= start && date < endExclusive
}

/**
 * Expand one stored expense into occurrences in the AU tax year ending 30 Jun
 * of `year` (same meaning as Tax Summary’s taxYearEnding).
 */
export function occurrencesInYear(
  expense: Expense,
  year: number,
): { dateISO: string; month: number; amount: number }[] {
  const start = parseISO(expense.expense_date)
  const ended = expense.ended_iso ? parseISO(expense.ended_iso) : null
  const freq: ExpenseFrequency = expense.frequency ?? 'once'
  const amount = expense.amount_aud ?? 0
  const out: { dateISO: string; month: number; amount: number }[] = []
  const { start: winStart, endExclusive } = auTaxYearWindow(year)

  if (freq === 'once') {
    if (inTaxYear(start, year) && inWindow(start, start, ended)) {
      out.push({ dateISO: expense.expense_date.slice(0, 10), month: start.getMonth(), amount })
    }
    return out
  }

  if (freq === 'yearly') {
    for (const calYear of [year - 1, year]) {
      const due = clampDay(calYear, start.getMonth(), start.getDate())
      if (due >= winStart && due < endExclusive && inWindow(due, start, ended)) {
        out.push({ dateISO: iso(due), month: due.getMonth(), amount })
      }
    }
    return out
  }

  const cursor = new Date(winStart)
  while (cursor < endExclusive) {
    const due = clampDay(cursor.getFullYear(), cursor.getMonth(), start.getDate())
    if (inWindow(due, start, ended) && due >= winStart && due < endExclusive) {
      out.push({ dateISO: iso(due), month: due.getMonth(), amount })
    }
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return out
}

export function expenseOverlapsYear(expense: Expense, year: number): boolean {
  return occurrencesInYear(expense, year).length > 0
}

export function yearExpenseTotal(expenses: Expense[], year: number): number {
  return expenses.reduce(
    (s, e) => s + occurrencesInYear(e, year).reduce((a, o) => a + o.amount, 0),
    0,
  )
}

export function monthExpenseTotal(expenses: Expense[], year: number, month: number): number {
  return expenses.reduce(
    (s, e) =>
      s +
      occurrencesInYear(e, year)
        .filter((o) => o.month === month)
        .reduce((a, o) => a + o.amount, 0),
    0,
  )
}

export function categoryTotals(
  expenses: Expense[],
  year: number,
): { label: string; value: number }[] {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const label = e.ato_category || 'Other'
    const sum = occurrencesInYear(e, year).reduce((s, o) => s + o.amount, 0)
    if (sum) map.set(label, (map.get(label) ?? 0) + sum)
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}
