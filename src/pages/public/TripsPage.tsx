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
  const { t, lang } = useLang()
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
      <header className="border-b border-line bg-card -mx-4 px-4 pb-3 pt-2">
        <h1 className="font-serif text-[17px] text-ink sm:text-2xl">
          {t('nav.trips')}
          <span className="mt-px block font-thai text-[11px] font-medium text-ink-soft">
            {lang === 'th' ? 'สำรวจทริป' : 'Explore trips'}
          </span>
        </h1>
        <p className="mt-1 text-[11px] text-ink-soft">{t('trips.subtitle')}</p>
      </header>

      <div
        className="mt-3 flex gap-2 overflow-x-auto pb-1"
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
            className={`shrink-0 rounded-full px-3 py-[7px] text-center text-[10px] font-semibold leading-[1.4] ${
              filter === tab.id
                ? 'border border-white/20 bg-gradient-to-b from-teal-500 to-teal-800 text-cream shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_4px_10px_-4px_rgba(30,20,10,0.5)]'
                : 'bg-mint-100 text-teal-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-3.5 space-y-3">
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
        <div className="mt-3.5 flex flex-col gap-3">
          {filtered.map((tour) => (
            <TripCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}
