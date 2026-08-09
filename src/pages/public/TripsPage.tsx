import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  LayoutGrid,
  Moon,
  Search,
  Sun,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { inferTripType, tourDestination, tourDestinationLabel } from '../../lib/tourDisplay'
import { fetchAllTours, sortToursForListing } from '../../lib/toursApi'
import type { Tour, TripType } from '../../types/tour'
import TripPickerHero from '../../components/trips/TripPickerHero'
import BiText from '../../components/ui/BiText'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import { TripCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import type { TranslationKey } from '../../i18n/translations'

type Filter = 'all' | TripType

const VALID_TYPES: TripType[] = ['oneday', 'overnight', 'multiday']

const FILTER_ICON: Record<Filter, LucideIcon> = {
  all: LayoutGrid,
  oneday: Sun,
  overnight: Moon,
  multiday: CalendarDays,
}

const FILTER_KEYS: { id: Filter; key: TranslationKey }[] = [
  { id: 'all', key: 'common.all' },
  { id: 'oneday', key: 'common.oneday' },
  { id: 'overnight', key: 'common.overnight' },
  { id: 'multiday', key: 'common.multiday' },
]

export default function TripsPage() {
  const { tt } = useLang()
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const qParam = searchParams.get('q') ?? ''
  const initialFilter: Filter =
    typeParam && VALID_TYPES.includes(typeParam as TripType) ? (typeParam as TripType) : 'all'

  const [tours, setTours] = useState<Tour[]>([])
  const [filter, setFilter] = useState<Filter>(initialFilter)
  const [query, setQuery] = useState(qParam)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const errorMsg = tt('common.error')
  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchAllTours()
      .then(sortToursForListing)
      .then(setTours)
      .catch(() => setError(errorMsg.en))
      .finally(() => setLoading(false))
  }, [errorMsg.en])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (typeParam && VALID_TYPES.includes(typeParam as TripType)) {
      setFilter(typeParam as TripType)
    }
  }, [typeParam])

  useEffect(() => {
    if (qParam) setQuery(qParam)
  }, [qParam])

  const searching = query.trim().length > 0
  const searchBi = tt('trips.search')
  const titleBi = tt('trips.title')
  const subtitleBi = tt('trips.subtitle')
  const clearBi = tt('common.clearSearch')
  const emptyBi = tt('trips.empty')
  const searchEmptyBi = tt('trips.search.empty')

  const filtered = useMemo(() => {
    const byType =
      filter === 'all' ? tours : tours.filter((tour) => inferTripType(tour) === filter)
    const needle = query.trim().toLowerCase()
    if (!needle) return byType
    return byType.filter((tour) =>
      [
        tour.name_en,
        tour.name_th,
        tour.trip_code,
        tourDestination(tour.trip_code),
        tourDestinationLabel(tour.trip_code, 'th'),
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }, [tours, filter, query])

  return (
    <div className="pb-2">
      <header className="-mx-4 border-b border-line bg-card px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <BiDisplayHeading
          en={titleBi.en}
          th={titleBi.th}
          as="h1"
          thAs="p"
          enClassName="text-[17px] font-semibold tracking-tight text-ink sm:text-2xl"
          thClassName="mt-px text-[11px] font-medium text-ink-soft sm:text-[13px]"
        />
        <BiText
          as="p"
          en={subtitleBi.en}
          th={subtitleBi.th}
          className="mt-1 text-[11px] text-ink-soft"
          thClassName="mt-px block font-thai text-[10px] text-ink-soft/85"
        />

        <div className="mt-2.5 flex items-center gap-2 rounded-[14px] bg-mint-100 px-3 py-[10px]">
          <Search className="h-3.5 w-3.5 shrink-0 text-ink-soft" strokeWidth={2.25} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${searchBi.en} / ${searchBi.th}`}
            aria-label={`${searchBi.en} / ${searchBi.th}`}
            className="min-w-0 flex-1 bg-transparent text-[11px] text-ink outline-none placeholder:text-ink-soft"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={`${clearBi.en} / ${clearBi.th}`}
              className="shrink-0 text-ink-soft hover:text-ink"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          )}
        </div>

        <div
          className="mt-3 flex justify-between gap-0.5 rounded-[18px] bg-ink px-1.5 pb-[7px] pt-2.5 shadow-[0_10px_22px_-12px_rgba(0,0,0,0.45)]"
          role="tablist"
          aria-label={`${tt('nav.trips').en} / ${tt('nav.trips').th}`}
        >
          {FILTER_KEYS.map((tab) => {
            const active = filter === tab.id
            const Icon = FILTER_ICON[tab.id]
            const label = tt(tab.key)
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className="relative flex flex-1 flex-col items-center gap-[3px] pt-[7px]"
              >
                <span
                  className="absolute -top-0.5 left-1/2 flex -translate-x-1/2 gap-[3px]"
                  aria-hidden
                >
                  <span
                    className={`h-[3px] w-[3px] rounded-full bg-teal-500 ${active ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <span
                    className={`h-[3px] w-[3px] rounded-full bg-teal-500 ${active ? 'opacity-100' : 'opacity-0'}`}
                  />
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-[9px] transition-colors ${
                    active
                      ? 'bg-gradient-to-b from-teal-500 to-teal-700 shadow-[0_4px_10px_-3px_rgba(0,0,0,0.55)]'
                      : ''
                  }`}
                >
                  <Icon
                    className={`h-[15px] w-[15px] ${active ? 'text-white' : 'text-white/55'}`}
                    strokeWidth={1.8}
                  />
                </span>
                <span
                  className={`text-center text-[7.5px] font-bold leading-[1.3] ${
                    active ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {label.en}
                  <span className="block font-thai text-[6.5px] font-medium opacity-85">
                    {label.th}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {loading && (
        <div className="mt-3.5 space-y-3">
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

      {!loading && !error && filtered.length === 0 && (
        <BiText
          as="p"
          en={searching ? searchEmptyBi.en : emptyBi.en}
          th={searching ? searchEmptyBi.th : emptyBi.th}
          className="mt-10 text-center text-sm text-ink-soft"
          thClassName="mt-1 block font-thai text-xs text-ink-soft/85"
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-3.5">
          <TripPickerHero tours={filtered} />
        </div>
      )}
    </div>
  )
}
