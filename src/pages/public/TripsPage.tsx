import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { inferTripType } from '../../lib/tourDisplay'
import { fetchAllTours, sortToursForListing } from '../../lib/toursApi'
import type { Tour, TripType } from '../../types/tour'
import TripCard from '../../components/trips/TripCard'
import { TripCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'

type Filter = 'all' | TripType

const VALID_TYPES: TripType[] = ['oneday', 'overnight', 'multiday']

export default function TripsPage() {
  const { t } = useLang()
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const initialFilter: Filter =
    typeParam && VALID_TYPES.includes(typeParam as TripType) ? (typeParam as TripType) : 'all'

  const [tours, setTours] = useState<Tour[]>([])
  const [filter, setFilter] = useState<Filter>(initialFilter)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchAllTours()
      .then(sortToursForListing)
      .then(setTours)
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (filter === 'all') return tours
    return tours.filter((tour) => inferTripType(tour) === filter)
  }, [tours, filter])

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: t('common.all') },
    { id: 'oneday', label: t('common.oneday') },
    { id: 'overnight', label: t('common.overnight') },
    { id: 'multiday', label: t('common.multiday') },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">{t('nav.trips')}</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 rounded-editorial px-3 py-1.5 text-xs font-medium uppercase tracking-wider ${
              filter === tab.id ? 'bg-teal-900 text-cream' : 'bg-white text-ink/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mt-6">
          <PageError message={error} onRetry={load} />
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 space-y-4">
          {filtered.map((tour) => (
            <TripCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}
