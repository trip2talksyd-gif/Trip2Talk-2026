import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { fetchConfirmedTours, formatDate, seatsRemaining } from '../../lib/toursApi'
import { tourDestination, tourDurationLabel } from '../../lib/tourDisplay'
import type { Tour } from '../../types/tour'
import { PageError } from '../../components/ui/PageError'
import TripFilmstrip from '../../components/trips/TripFilmstrip'

function monthKey(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string, lang: 'en' | 'th'): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-AU', {
    month: 'short',
    year: 'numeric',
  })
}

function dayParts(iso: string | null | undefined, lang: 'en' | 'th') {
  if (!iso) return { day: '—', mon: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '—', mon: '' }
  return {
    day: String(d.getDate()).padStart(2, '0'),
    mon: d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-AU', { month: 'short' }),
  }
}

export default function CalendarPage() {
  const { lang, t } = useLang()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeMonth, setActiveMonth] = useState<string | 'all'>('all')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchConfirmedTours()
      .then(setTours)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const months = useMemo(() => {
    const keys = new Set<string>()
    for (const tour of tours) {
      const k = monthKey(tour.departure_date)
      if (k) keys.add(k)
    }
    return [...keys].sort()
  }, [tours])

  useEffect(() => {
    if (months.length > 0 && activeMonth === 'all') {
      setActiveMonth(months[0])
    }
  }, [months, activeMonth])

  const filtered = useMemo(() => {
    if (activeMonth === 'all') return tours
    return tours.filter((tour) => monthKey(tour.departure_date) === activeMonth)
  }, [tours, activeMonth])

  return (
    <div className="space-y-4 pb-4">
      <header className="-mx-4 border-b border-line bg-card px-4 pb-3 pt-2">
        <h1 className="font-serif text-[17px] text-ink sm:text-2xl">
          {t('nav.calendar')}
          <span className="mt-px block font-thai text-[11px] font-medium text-ink-soft">
            {lang === 'th' ? 'ปฏิทินทริป' : 'Trip Calendar'}
          </span>
        </h1>
      </header>

      {months.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {months.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setActiveMonth(m)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[10.5px] font-bold transition-colors ${
                activeMonth === m
                  ? 'bg-gradient-to-b from-teal-500 to-teal-800 text-cream'
                  : 'bg-mint-100 text-teal-700'
              }`}
            >
              {monthLabel(m, lang)}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-teal-900 to-teal-700 px-3.5 py-3 text-cream">
        <Camera className="h-5 w-5 shrink-0 text-teal-400" strokeWidth={2} />
        <div>
          <p className="text-[11.5px] font-bold">
            {lang === 'th'
              ? 'ทุกทริปมีช่างภาพ · พร้อมทีมสไตล์ลิ่ง'
              : 'Every trip includes a photographer'}
          </p>
          <p className="mt-0.5 font-thai text-[9.5px] text-cream/70">
            {lang === 'th'
              ? 'พร้อมทีมสไตล์ลิ่ง/wardrobe ดูแลตลอดทริป'
              : 'Styling / wardrobe support throughout the trip'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-mint-100" />
          ))}
        </div>
      )}

      {error && !loading && <PageError message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          <ul className="space-y-2.5">
            {filtered.map((tour) => {
              const seats = seatsRemaining(tour)
              const name = lang === 'th' ? tour.name_th : tour.name_en
              const parts = dayParts(tour.departure_date, lang)
              return (
                <li key={tour.id}>
                  <Link
                    to={`/trips/${tour.trip_code}`}
                    className="flex items-center gap-2.5 rounded-xl border border-line bg-cream px-2.5 py-2.5 transition-colors hover:border-teal-500/40"
                  >
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-mint-100 text-teal-800">
                      <span className="text-sm font-bold leading-none">{parts.day}</span>
                      <span className="text-[7.5px] font-bold uppercase">{parts.mon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">{name}</p>
                      <p className="truncate text-[9.5px] text-ink-soft">
                        {tourDurationLabel(tour, lang)} · {tourDestination(tour.trip_code)}
                        {tour.departure_date ? ` · ${formatDate(tour.departure_date, lang)}` : ''}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[9px] font-bold ${
                        seats === 0 ? 'text-coral' : 'text-coral'
                      }`}
                    >
                      {seats === 0
                        ? lang === 'th'
                          ? 'เต็ม'
                          : 'Full'
                        : lang === 'th'
                          ? `เหลือ ${seats}`
                          : `${seats} left`}
                    </span>
                  </Link>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-soft">
                {lang === 'th' ? 'ไม่มีทริปในเดือนนี้' : 'No trips in this month'}
              </p>
            )}
          </ul>

          <TripFilmstrip
            tours={tours}
            labelEn="More destinations"
            labelTh="ทริปอื่นๆ ที่น่าสนใจ"
            className="mt-4"
          />
        </>
      )}
    </div>
  )
}
