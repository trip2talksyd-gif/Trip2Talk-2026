import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { fetchConfirmedTours, formatAud, formatDate, seatsRemaining } from '../../lib/toursApi'
import type { Tour } from '../../types/tour'
import { PageError } from '../../components/ui/PageError'
import CalendarValueProps from '../../components/calendar/CalendarValueProps'

function borderColor(tour: Tour): string {
  const seats = seatsRemaining(tour)
  if (seats === 0) return 'border-l-coral'
  if (seats <= 3) return 'border-l-amber'
  return 'border-l-gold'
}

export default function CalendarPage() {
  const { lang, t } = useLang()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <div className="-mx-4 bg-near-black-green px-4 py-6 text-cream">
      <h1 className="font-serif text-2xl text-cream">{t('nav.calendar')}</h1>

      <CalendarValueProps />

      {loading && (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="liquid-glass h-20 animate-pulse rounded-xl" aria-hidden />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-6">
          <PageError message={error} onRetry={load} dark />
        </div>
      )}

      {!loading && !error && (
        <ul className="mt-6 space-y-3">
          {tours.map((tour) => {
            const seats = seatsRemaining(tour)
            const name = lang === 'th' ? tour.name_th : tour.name_en
            return (
              <li key={tour.id}>
                <Link
                  to={`/trips/${tour.trip_code}`}
                  className={`liquid-glass block rounded-xl border-l-4 p-4 transition-opacity hover:opacity-95 ${borderColor(tour)}`}
                >
                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-cream">{name}</p>
                      <p className="text-sm text-cream-muted">{formatDate(tour.departure_date, lang)}</p>
                    </div>
                    <p className="font-serif text-sm text-gold">{formatAud(tour.price_aud)}</p>
                  </div>
                  <p className="relative z-10 mt-2 text-xs text-cream-muted/60">
                    {seats === 0 ? t('common.full') : `${seats} ${t('common.seatsRemaining')}`}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
