import { useEffect, useMemo, useState } from 'react'
import { countdownParts, sydneyDepartureMs } from '../../lib/departureCountdown'

type Props = {
  date: string | null | undefined
  lang: 'en' | 'th'
  className?: string
  /** One line for the trip list. The booking card uses the tile board. */
  compact?: boolean
}

const UNITS = [
  { key: 'days', en: 'Days', th: 'วัน' },
  { key: 'hours', en: 'Hrs', th: 'ชม.' },
  { key: 'minutes', en: 'Min', th: 'นาที' },
  { key: 'seconds', en: 'Sec', th: 'วิ' },
] as const

export default function DepartureCountdown({ date, lang, className = '', compact = false }: Props) {
  const target = useMemo(() => (date ? sydneyDepartureMs(date) : null), [date])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (target == null) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (target == null) return null
  const parts = countdownParts(target - now)
  if (!parts) {
    return (
      <p className={`text-[11px] font-bold text-ink-soft ${className}`}>
        {lang === 'th' ? 'ออกเดินทางแล้ว' : 'Departed'}
      </p>
    )
  }

  const spoken =
    lang === 'th'
      ? `ออกเดินทางใน ${parts.days} วัน ${parts.hours} ชั่วโมง ${parts.minutes} นาที`
      : `Departs in ${parts.days} days ${parts.hours} hours ${parts.minutes} minutes`

  if (compact) {
    return (
      <p className={`text-[9px] font-bold text-coral ${className}`} aria-label={spoken}>
        {lang === 'th' ? `อีก ${parts.days} วัน` : `${parts.days} days to go`}
        <span className="ml-1 font-mono tabular-nums">
          {String(parts.hours).padStart(2, '0')}:{String(parts.minutes).padStart(2, '0')}:{String(parts.seconds).padStart(2, '0')}
        </span>
      </p>
    )
  }

  return (
    <div className={`rounded-2xl bg-teal-900 px-2.5 py-2 text-cream ${className}`} aria-label={spoken}>
      <p className="text-[10px] font-bold tracking-wide text-coral">
        {lang === 'th' ? 'ออกเดินทางใน' : 'Departs in'}
      </p>
      <div className="mt-1.5 grid grid-cols-4 gap-1.5">
        {UNITS.map((unit) => {
          const value = parts[unit.key]
          const live = unit.key === 'seconds'
          return (
            <div
              key={unit.key}
              className={`rounded-xl px-1 py-1.5 text-center ${live ? 'bg-coral text-cream' : 'bg-cream/10'}`}
            >
              <span className="block font-mono text-[15px] font-bold leading-none tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
              <span className={`mt-1 block text-[8px] font-bold uppercase tracking-wide ${live ? 'text-cream/90' : 'text-cream/70'}`}>
                {lang === 'th' ? unit.th : unit.en}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
