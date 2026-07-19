import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { useFavoriteTripCodes, useRemoveFavorite } from '../../hooks/useFavorites'
import { fetchAllTours } from '../../lib/toursApi'
import type { Tour } from '../../types/tour'
import TripCard from '../../components/trips/TripCard'
import { TripCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'

export default function FavoritesPage() {
  const { t } = useLang()
  const favoriteCodes = useFavoriteTripCodes()
  const removeFavorite = useRemoveFavorite()
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const favoriteTours = useMemo(() => {
    const set = new Set(favoriteCodes.map((c) => c.toUpperCase()))
    return tours.filter((tour) => set.has(tour.trip_code.toUpperCase()))
  }, [tours, favoriteCodes])

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('nav.favorites')}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t('favorites.subtitle')}</p>

      {loading && (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-6">
          <PageError message={error} onRetry={load} />
        </div>
      )}

      {!loading && !error && favoriteCodes.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-editorial border border-line bg-mint-100 px-6 py-12 text-center">
          <Heart className="h-8 w-8 text-teal-600" strokeWidth={1.75} />
          <p className="mt-3 text-sm text-ink-soft">{t('favorites.empty')}</p>
          <Link
            to="/trips"
            className="btn-primary mt-5 !bg-teal-900 !text-cream hover:!opacity-90"
          >
            {t('nav.trips')}
          </Link>
        </div>
      )}

      {!loading && !error && favoriteCodes.length > 0 && favoriteTours.length === 0 && (
        <div className="mt-8 space-y-3">
          <p className="text-sm text-ink-soft">{t('favorites.stale')}</p>
          <ul className="space-y-2">
            {favoriteCodes.map((code) => (
              <li
                key={code}
                className="flex items-center justify-between rounded-editorial border border-line bg-cream px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">{code}</span>
                <button
                  type="button"
                  onClick={() => removeFavorite(code)}
                  className="text-xs uppercase tracking-wider text-coral"
                >
                  {t('favorites.remove')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && favoriteTours.length > 0 && (
        <div className="mt-6 space-y-4">
          {favoriteTours.map((tour) => (
            <TripCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}
