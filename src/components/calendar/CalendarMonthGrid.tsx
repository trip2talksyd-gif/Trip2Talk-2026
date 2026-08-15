import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, MapPin, Mountain, Plane, Trees } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import type { Tour } from '../../types/tour'

const WEEKDAY_KEYS = [
  'calendar.weekday.mon',
  'calendar.weekday.tue',
  'calendar.weekday.wed',
  'calendar.weekday.thu',
  'calendar.weekday.fri',
  'calendar.weekday.sat',
  'calendar.weekday.sun',
] as const

type DayCell = {
  iso: string
  day: number
  inMonth: boolean
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toIso(y: number, m1: number, d: number) {
  return `${y}-${pad2(m1)}-${pad2(d)}`
}

function parseMonthKey(key: string): { y: number; m: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(key)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]) }
}

export function departureIso(iso: string | null | undefined): string | null {
  if (!iso) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null
}

function buildMonthCells(year: number, month1: number): DayCell[] {
  const first = new Date(year, month1 - 1, 1)
  const daysInMonth = new Date(year, month1, 0).getDate()
  const mondayIndex = (first.getDay() + 6) % 7
  const prevDays = new Date(year, month1 - 1, 0).getDate()
  const cells: DayCell[] = []

  for (let i = mondayIndex; i > 0; i -= 1) {
    const d = prevDays - i + 1
    const prev = new Date(year, month1 - 1, 0)
    cells.push({ iso: toIso(prev.getFullYear(), prev.getMonth() + 1, d), day: d, inMonth: false })
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ iso: toIso(year, month1, d), day: d, inMonth: true })
  }

  const trailing = (7 - (cells.length % 7)) % 7
  const next = new Date(year, month1, 1)
  for (let d = 1; d <= trailing; d += 1) {
    cells.push({
      iso: toIso(next.getFullYear(), next.getMonth() + 1, d),
      day: d,
      inMonth: false,
    })
  }

  return cells
}

function tripIcon(tripCode: string) {
  const code = tripCode.toUpperCase()
  if (code.startsWith('ULU')) return { Icon: Mountain, className: 'text-coral' }
  if (code.startsWith('TAS')) return { Icon: Trees, className: 'text-teal-700' }
  if (code.startsWith('NZ')) return { Icon: Plane, className: 'text-teal-700' }
  if (code.startsWith('MEL') || code.startsWith('CAN') || code.startsWith('BER')) {
    return { Icon: MapPin, className: 'text-amber' }
  }
  return { Icon: Camera, className: 'text-teal-800' }
}

type Props = {
  monthKey: string
  tours: Tour[]
}

export default function CalendarMonthGrid({ monthKey, tours }: Props) {
  const { t, lang } = useLang()
  const rootRef = useRef<HTMLDivElement>(null)
  const [openIso, setOpenIso] = useState<string | null>(null)

  const parsed = parseMonthKey(monthKey)
  const cells = useMemo(() => {
    const month = parseMonthKey(monthKey)
    return month ? buildMonthCells(month.y, month.m) : []
  }, [monthKey])

  const byStart = useMemo(() => {
    const map = new Map<string, Tour[]>()
    for (const tour of tours) {
      const iso = departureIso(tour.departure_date)
      if (!iso) continue
      const list = map.get(iso) ?? []
      list.push(tour)
      map.set(iso, list)
    }
    return map
  }, [tours])

  const todayIso = useMemo(() => {
    const now = new Date()
    return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate())
  }, [])

  useEffect(() => {
    setOpenIso(null)
  }, [monthKey])

  useEffect(() => {
    if (!openIso) return
    function onDoc(ev: MouseEvent) {
      if (!rootRef.current?.contains(ev.target as Node)) setOpenIso(null)
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpenIso(null)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [openIso])

  if (!parsed) return null

  return (
    <div ref={rootRef} className="rounded-[14px] border border-line bg-card p-2 sm:p-3">
      <div className="grid grid-cols-7 gap-px sm:gap-1">
        {WEEKDAY_KEYS.map((key) => (
          <div
            key={key}
            className="pb-1 text-center text-[9px] font-bold uppercase tracking-wide text-ink-soft sm:text-[10.5px]"
          >
            {t(key)}
          </div>
        ))}
        {cells.map((cell) => {
          const starts = byStart.get(cell.iso) ?? []
          const hasTrips = starts.length > 0
          const shown = starts.slice(0, 2)
          const extra = starts.length - shown.length
          const isToday = cell.iso === todayIso
          const open = openIso === cell.iso

          return (
            <div key={cell.iso} className="relative">
              <button
                type="button"
                disabled={!hasTrips}
                onClick={() => setOpenIso((cur) => (cur === cell.iso ? null : cell.iso))}
                className={`flex min-h-[2.7rem] w-full flex-col items-center rounded-lg px-0.5 py-1 sm:min-h-[3.4rem] sm:px-1 ${
                  cell.inMonth ? 'text-ink' : 'text-ink-soft/45'
                } ${
                  isToday && cell.inMonth ? 'bg-mint-100 ring-1 ring-teal-700/25' : ''
                } ${hasTrips ? 'cursor-pointer hover:bg-mint-100' : 'cursor-default'}`}
                aria-expanded={hasTrips ? open : undefined}
                aria-label={
                  hasTrips
                    ? `${cell.day} — ${starts.map((s) => (lang === 'th' ? s.name_th : s.name_en)).join(', ')}`
                    : String(cell.day)
                }
              >
                <span className="text-[11px] font-semibold tabular-nums sm:text-[13px]">{cell.day}</span>
                {hasTrips && (
                  <span className="mt-0.5 flex items-center justify-center gap-0.5">
                    {shown.map((tour) => {
                      const { Icon, className } = tripIcon(tour.trip_code)
                      return (
                        <Icon
                          key={tour.id}
                          className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${className}`}
                          strokeWidth={2.25}
                          aria-hidden
                        />
                      )
                    })}
                    {extra > 0 && (
                      <span className="text-[8px] font-extrabold text-coral sm:text-[9px]">+{extra}</span>
                    )}
                  </span>
                )}
              </button>
              {open && hasTrips && (
                <div
                  className="absolute left-1/2 z-20 mt-1 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-line bg-white p-2 shadow-lg"
                  role="dialog"
                >
                  <ul className="space-y-1">
                    {starts.map((tour) => (
                      <li key={tour.id}>
                        <Link
                          to={`/trips/${tour.trip_code}`}
                          className="block rounded-lg px-2 py-1.5 hover:bg-mint-100"
                          onClick={() => setOpenIso(null)}
                        >
                          <span className="block text-[12px] font-semibold leading-snug text-ink">
                            {lang === 'th' ? tour.name_th : tour.name_en}
                          </span>
                          <span className="mt-0.5 block text-[10px] leading-snug text-ink-soft">
                            {lang === 'th' ? tour.name_en : tour.name_th}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
