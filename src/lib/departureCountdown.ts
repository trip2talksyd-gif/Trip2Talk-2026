const SYDNEY = 'Australia/Sydney'

/** Calendar date in Australia/Sydney, YYYY-MM-DD. */
export function sydneyToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SYDNEY,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** True from 00:00 Sydney on the departure date. Undated trips stay open. */
export function countdownFinished(isoDate: string | null | undefined, now = new Date()): boolean {
  if (!isoDate) return false
  const day = isoDate.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false
  return day <= sydneyToday(now)
}

export type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function countdownParts(ms: number): CountdownParts | null {
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

/** Midnight at the start of `YYYY-MM-DD` in Australia/Sydney. */
export function sydneyDepartureMs(isoDate: string): number | null {
  const day = isoDate.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: SYDNEY,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  const start = Date.parse(`${day}T00:00:00Z`) - 14 * 3_600_000
  for (let t = start; t < start + 20 * 3_600_000; t += 1000) {
    const parts = Object.fromEntries(fmt.formatToParts(new Date(t)).map((p) => [p.type, p.value]))
    if (
      `${parts.year}-${parts.month}-${parts.day}` === day &&
      parts.hour === '00' &&
      parts.minute === '00' &&
      parts.second === '00'
    ) {
      return t
    }
  }
  return null
}
