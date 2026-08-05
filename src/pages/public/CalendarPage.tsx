import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { fetchConfirmedTours, formatDate, seatsRemaining } from '../../lib/toursApi'
import { tourDestinationLabel, tourDurationLabel } from '../../lib/tourDisplay'
import type { Tour } from '../../types/tour'
import { PageError } from '../../components/ui/PageError'
import TripFilmstrip from '../../components/trips/TripFilmstrip'
import BiText from '../../components/ui/BiText'

function monthKey(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-AU', {
    month: 'short',
    year: 'numeric',
  })
}

function dayParts(iso: string | null | undefined) {
  if (!iso) return { day: '—', mon: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '—', mon: '' }
  return {
    day: String(d.getDate()).padStart(2, '0'),
    mon: d.toLocaleDateString('en-AU', { month: 'short' }),
  }
}

export default function CalendarPage() {
  const { tt, t } = useLang()
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

  // Departure dates that have already passed shouldn't clutter the calendar —
  // trips with no date yet (TBA) still show since they haven't happened.
  const upcomingTours = useMemo(() => {
    const today = new Date(new Date().toDateString())
    return tours.filter((tour) => {
      if (!tour.departure_date) return true
      return new Date(tour.departure_date) >= today
    })
  }, [tours])

  const months = useMemo(() => {
    const keys = new Set<string>()
    for (const tour of upcomingTours) {
      const k = monthKey(tour.departure_date)
      if (k) keys.add(k)
    }
    return [...keys].sort()
  }, [upcomingTours])

  useEffect(() => {
    if (months.length > 0 && activeMonth === 'all') {
      setActiveMonth(months[0])
    }
  }, [months, activeMonth])

  const filtered = useMemo(() => {
    if (activeMonth === 'all') return upcomingTours
    return upcomingTours.filter((tour) => monthKey(tour.departure_date) === activeMonth)
  }, [upcomingTours, activeMonth])

  const title = tt('nav.calendar')
  const bannerTitle = tt('calendar.banner.title')
  const bannerSub = tt('calendar.banner.sub')
  const emptyBi = tt('calendar.empty')
  const moreDestBi = tt('calendar.moreDestinations')
  const seatsLeftBi = tt('trips.seatsLeft')
  const seatsFullBi = tt('trips.seatsFull')

  return (
    <div className="space-y-4 pb-4">
      {/* .cal-top — title + month chips share the white bar */}
      <header className="-mx-4 border-b border-line bg-card px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <BiText
          as="h1"
          en={title.en}
          th={title.th}
          serif
          className="text-[17px] text-ink sm:text-2xl"
          thClassName="mt-px block font-thai text-[11px] font-medium text-ink-soft sm:text-[13px]"
        />
        {months.length > 0 && (
          <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto">
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
                {monthLabel(m)}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-teal-900 to-teal-700 px-3.5 py-[13px] text-cream">
        <Camera className="h-5 w-5 shrink-0 text-teal-400" strokeWidth={2} />
        <div>
          <p className="text-[11.5px] font-bold">
            {bannerTitle.en}
            <span className="mt-0.5 block font-thai text-[9.5px] font-medium text-cream/80">
              {bannerTitle.th}
            </span>
          </p>
          <p className="mt-1 font-thai text-[9.5px] text-cream/70">
            {bannerSub.en}
            <span className="mt-0.5 block text-[8.5px] opacity-90">{bannerSub.th}</span>
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
              const parts = dayParts(tour.departure_date)
              const destEn = tourDestinationLabel(tour.trip_code, 'en')
              const destTh = tourDestinationLabel(tour.trip_code, 'th')
              return (
                <li key={tour.id}>
                  <Link
                    to={`/trips/${tour.trip_code}`}
                    className="flex items-center gap-2.5 rounded-[14px] border border-line bg-card p-[9px] transition-colors hover:border-teal-500/40"
                  >
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-mint-100 text-teal-800">
                      <span className="text-sm font-bold leading-none">{parts.day}</span>
                      <span className="text-[7.5px] font-bold uppercase">{parts.mon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-ink">
                        {tour.name_en}
                        <span className="ml-1 font-thai text-[10px] font-medium text-ink-soft">
                          {tour.name_th}
                        </span>
                      </p>
                      <p className="truncate text-[9.5px] text-ink-soft">
                        {tourDurationLabel(tour, 'en')} · {destEn}
                        {tour.departure_date ? ` · ${formatDate(tour.departure_date, 'en')}` : ''}
                      </p>
                      <p className="truncate font-thai text-[8.5px] text-ink-soft/80">
                        {tourDurationLabel(tour, 'th')} · {destTh}
                        {tour.departure_date ? ` · ${formatDate(tour.departure_date, 'th')}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-right text-[9px] font-bold text-coral">
                      {seats === 0 ? seatsFullBi.en : `${seats} ${seatsLeftBi.en}`}
                      <span className="mt-0.5 block font-thai text-[8px] font-medium opacity-85">
                        {seats === 0 ? seatsFullBi.th : `${seatsLeftBi.th} ${seats}`}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-soft">
                {emptyBi.en}
                <span className="mt-0.5 block font-thai text-xs text-ink-soft/85">
                  {emptyBi.th}
                </span>
              </p>
            )}
          </ul>

          <TripFilmstrip
            tours={upcomingTours}
            labelEn={moreDestBi.en}
            labelTh={moreDestBi.th}
            className="mt-4"
          />
        </>
      )}
    </div>
  )
}
