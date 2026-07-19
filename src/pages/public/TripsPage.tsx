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

  useEffect(() => {
    if (typeParam && VALID_TYPES.includes(typeParam as TripType)) {
      setFilter(typeParam as TripType)
    }
  }, [typeParam])

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
    <div className="pb-2">
      <header className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-teal-600">
          Trip2Talk
        </p>
        <h1 className="font-serif text-3xl tracking-tight text-ink">{t('nav.trips')}</h1>
        <p className="text-sm text-ink-soft">{t('trips.subtitle')}</p>
      </header>

      <div
        className="mt-5 flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label={t('nav.trips')}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium uppercase tracking-wider transition-colors ${
              filter === tab.id
                ? 'bg-teal-900 text-cream shadow-[0_4px_14px_rgba(22,38,43,0.25)]'
                : 'bg-mint-100 text-ink/65 hover:bg-teal-900/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-6 space-y-5">
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

      {!loading && !error && filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink-soft">{t('trips.empty')}</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-6 space-y-5">
          {filtered.map((tour) => (
            <TripCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}
