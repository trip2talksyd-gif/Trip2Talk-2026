import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Users } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { fetchConfirmedTours, formatAud, formatDate, seatsRemaining } from '../../lib/toursApi'
import type { Tour } from '../../types/tour'
import { PageError } from '../../components/ui/PageError'
import CalendarPhotographerBanner from '../../components/calendar/CalendarPhotographerBanner'

function seatBadgeColor(tour: Tour): string {
  const seats = seatsRemaining(tour)
  if (seats === 0) return 'bg-coral/90 text-white'
  if (seats <= 3) return 'bg-amber/90 text-near-black-green'
  return 'bg-cream/90 text-near-black-green'
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

      <div className="mt-6">
        <CalendarPhotographerBanner />
      </div>

      {loading && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="liquid-glass h-56 animate-pulse rounded-2xl" aria-hidden />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-6">
          <PageError message={error} onRetry={load} dark />
        </div>
      )}

      {!loading && !error && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="liquid-glass inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-cream">
              {t('calendar.trips.badge')}
            </span>
            <span className="text-xs text-cream-muted/70">{tours.length}</span>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tours.map((tour) => {
              const seats = seatsRemaining(tour)
              const name = lang === 'th' ? tour.name_th : tour.name_en
              return (
                <li key={tour.id}>
                  <Link
                    to={`/trips/${tour.trip_code}`}
                    className="group relative block overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-card">
                      {tour.cover_image_url ? (
                        <img
                          src={tour.cover_image_url}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-card to-near-black-green text-cream-muted/40">
                          <Camera className="h-8 w-8" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-near-black-green via-near-black-green/10 to-transparent" />

                      <span
                        className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${seatBadgeColor(tour)}`}
                      >
                        {seats === 0 ? t('common.full') : `${seats} ${t('common.seatsRemaining')}`}
                      </span>

                      <span className="liquid-glass absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-cream">
                        <Camera className="h-3 w-3 text-gold" strokeWidth={2.5} />
                        {t('calendar.photo.feature.1.title')}
                      </span>

                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="font-semibold leading-snug text-cream drop-shadow-sm">{name}</p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <p className="flex items-center gap-1 text-xs text-cream-muted">
                            <Users className="h-3 w-3" strokeWidth={2} />
                            {formatDate(tour.departure_date, lang)}
                          </p>
                          <p className="font-serif text-sm text-gold">{formatAud(tour.price_aud)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
