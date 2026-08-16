import { useCallback, useEffect, useMemo, useState } from 'react'
import { Camera } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { fetchAllTours } from '../../lib/toursApi'
import type { Tour } from '../../types/tour'
import { PageError } from '../../components/ui/PageError'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import TripFilmstrip from '../../components/trips/TripFilmstrip'
import CalendarHero from '../../components/calendar/CalendarHero'
import CalendarMonthGrid, { departureIso } from '../../components/calendar/CalendarMonthGrid'
import CalendarMonthTripList from '../../components/calendar/CalendarMonthTripList'

function monthKey(iso: string | null | undefined): string | null {
  const day = departureIso(iso)
  return day ? day.slice(0, 7) : null
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-AU', {
    month: 'short',
    year: 'numeric',
  })
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
    fetchAllTours()
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
      <CalendarHero titleEn={title.en} titleTh={title.th} />

      {months.length > 0 && (
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
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

      {loading && <ListRowSkeleton count={3} />}

      {error && !loading && <PageError message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          {activeMonth !== 'all' && (
            <CalendarMonthGrid monthKey={activeMonth} tours={upcomingTours} />
          )}
          <CalendarMonthTripList
            tours={filtered}
            emptyEn={emptyBi.en}
            emptyTh={emptyBi.th}
            seatsLeftEn={seatsLeftBi.en}
            seatsLeftTh={seatsLeftBi.th}
            seatsFullEn={seatsFullBi.en}
            seatsFullTh={seatsFullBi.th}
          />

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
