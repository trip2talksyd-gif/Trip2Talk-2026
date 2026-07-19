import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import {
  groupToursByDestination,
  inferTripType,
  tourDestinationLabel,
} from '../../lib/tourDisplay'
import { fetchAllTours, sortToursForListing } from '../../lib/toursApi'
import { getPreviewPhotoForTrip, photoSrc } from '../../data/galleryPhotos'
import type { Tour, TripType } from '../../types/tour'
import TripCard from '../../components/trips/TripCard'
import DestinationBoardRow from '../../components/trips/DestinationBoardRow'
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
  const [openDest, setOpenDest] = useState<string | null>(null)

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

  const groups = useMemo(() => groupToursByDestination(filtered), [filtered])

  useEffect(() => {
    if (groups.length === 0) {
      setOpenDest(null)
      return
    }
    setOpenDest((prev) => {
      if (prev && groups.some((g) => g.destination === prev)) return prev
      return groups[0].destination
    })
  }, [groups])

  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: t('common.all') },
    { id: 'oneday', label: t('common.oneday') },
    { id: 'overnight', label: t('common.overnight') },
    { id: 'multiday', label: t('common.multiday') },
  ]

  function toggleGroup(destination: string) {
    setOpenDest((prev) => (prev === destination ? null : destination))
  }

  return (
    <div className="pb-2">
      <header className="-mx-4 border-b border-line bg-card px-4 pb-3 pt-2">
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

      {!loading && !error && groups.length > 0 && (
        <div className="mt-3.5 flex flex-col gap-2.5">
          {groups.map(({ destination, tours: groupTours }) => {
            const open = openDest === destination
            const cover = groupCover(groupTours)
            const fromPrice = Math.min(...groupTours.map((t) => t.price_aud))
            const label = tourDestinationLabel(destination, lang)

            return (
              <section
                key={destination}
                className="flight-board-shell overflow-hidden rounded-2xl border border-line bg-card shadow-[0_6px_18px_-12px_rgba(10,61,58,0.28)]"
              >
                <DestinationBoardRow
                  label={label}
                  tripCount={groupTours.length}
                  fromPrice={fromPrice}
                  coverSrc={cover}
                  open={open}
                  onToggle={() => toggleGroup(destination)}
                />

                {open && (
                  <div className="space-y-2.5 border-t border-line bg-cream/60 px-2.5 py-2.5">
                    {groupTours.map((tour) => (
                      <TripCard key={tour.id} tour={tour} />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function groupCover(tours: Tour[]): string {
  for (const tour of tours) {
    if (tour.cover_image_url) return tour.cover_image_url
    const preview = getPreviewPhotoForTrip(tour.trip_code)
    if (preview) return photoSrc(preview)
  }
  return ''
}
