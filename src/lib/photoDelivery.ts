/** Photo delivery SLAs from trip end date (inclusive calendar days). */
/** Highlight window is 1–2 weeks; countdown uses the 2-week upper bound. */
export const HIGHLIGHT_DEADLINE_DAYS = 14
/** Hard deadline for full album (14–30 window; UI counts to 30). */
export const FULL_ALBUM_DEADLINE_DAYS = 30

export function addCalendarDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Whole UTC calendar days from today to deadline (negative = overdue). */
export function calendarDaysRemaining(
  deadlineIso: string,
  todayIso: string = new Date().toISOString().slice(0, 10),
): number {
  const a = Date.parse(`${todayIso.slice(0, 10)}T00:00:00Z`)
  const b = Date.parse(`${deadlineIso.slice(0, 10)}T00:00:00Z`)
  return Math.round((b - a) / 86_400_000)
}

export type DeliveryCountdownState =
  | { kind: 'delivered'; at?: string | null }
  | { kind: 'remaining'; days: number }
  | { kind: 'overdue'; days: number }
  | { kind: 'unknown' }

export function countdownState(
  delivered: boolean,
  deliveredAt: string | null | undefined,
  endDate: string | null | undefined,
  deadlineOffsetDays: number,
): DeliveryCountdownState {
  if (delivered) return { kind: 'delivered', at: deliveredAt }
  if (!endDate) return { kind: 'unknown' }
  const deadline = addCalendarDaysIso(endDate, deadlineOffsetDays)
  const days = calendarDaysRemaining(deadline)
  if (days < 0) return { kind: 'overdue', days: Math.abs(days) }
  return { kind: 'remaining', days }
}

/** Lower = more urgent (overdue highlight first, then soonest deadline). */
export function tripDeliveryUrgencyScore(opts: {
  endDate: string | null | undefined
  highlightPending: boolean
  fullPending: boolean
}): number {
  const { endDate, highlightPending, fullPending } = opts
  if (!endDate) return 10_000
  if (!highlightPending && !fullPending) return 9_000
  if (highlightPending) {
    const days = calendarDaysRemaining(addCalendarDaysIso(endDate, HIGHLIGHT_DEADLINE_DAYS))
    return days
  }
  const days = calendarDaysRemaining(addCalendarDaysIso(endDate, FULL_ALBUM_DEADLINE_DAYS))
  // Full stage slightly less urgent than highlight at same day count
  return days + 0.5
}
