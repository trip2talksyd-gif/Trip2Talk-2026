import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarDays,
  LayoutGrid,
  Moon,
  Search,
  Sun,
  User,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import {
  groupToursByDestination,
  inferTripType,
  tourDestination,
  tourDestinationLabel,
} from '../../lib/tourDisplay'
import { fetchAllTours, sortToursForListing } from '../../lib/toursApi'
import { getPreviewPhotoForTrip, photoSrc } from '../../data/galleryPhotos'
import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import { FacebookIcon } from '../../components/contact/contactIcons'
import type { Tour, TripType } from '../../types/tour'
import TripCard from '../../components/trips/TripCard'
import DestinationBoardRow from '../../components/trips/DestinationBoardRow'
import { TripCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'

type Filter = 'all' | TripType

const VALID_TYPES: TripType[] = ['oneday', 'overnight', 'multiday']

const FILTER_ICON: Record<Filter, LucideIcon> = {
  all: LayoutGrid,
  oneday: Sun,
  overnight: Moon,
  multiday: CalendarDays,
}

export default function TripsPage() {
  const { t, lang } = useLang()
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get('type')
  const initialFilter: Filter =
    typeParam && VALID_TYPES.includes(typeParam as TripType) ? (typeParam as TripType) : 'all'

  const [tours, setTours] = useState<Tour[]>([])
  const [filter, setFilter] = useState<Filter>(initialFilter)
  const [query, setQuery] = useState('')
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

  const searching = query.trim().length > 0

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
      {/* Mockup .explore-top — header + search + trip-type dock share one white panel */}
      <header className="-mx-4 border-b border-line bg-card px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <h1 className="font-serif text-[17px] text-ink sm:text-2xl">{t('trips.title')}</h1>
        <p className="mt-px text-[11px] text-ink-soft">{t('trips.subtitle')}</p>

        {/* Mockup .search-bar */}
        <div className="mt-2.5 flex items-center gap-2 rounded-[14px] bg-mint-100 px-3 py-[10px]">
          <Search className="h-3.5 w-3.5 shrink-0 text-ink-soft" strokeWidth={2.25} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('trips.search')}
            aria-label={t('trips.search')}
            className="min-w-0 flex-1 bg-transparent text-[11px] text-ink outline-none placeholder:text-ink-soft"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={lang === 'th' ? 'ล้างคำค้นหา' : 'Clear search'}
              className="shrink-0 text-ink-soft hover:text-ink"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          )}
        </div>

        {/* Mockup .tab-dock */}
        <div
          className="mt-3 flex justify-between gap-0.5 rounded-[18px] bg-ink px-1.5 pb-[7px] pt-2.5 shadow-[0_10px_22px_-12px_rgba(0,0,0,0.45)]"
          role="tablist"
          aria-label={t('nav.trips')}
        >
          {tabs.map((tab) => {
            const active = filter === tab.id
            const Icon = FILTER_ICON[tab.id]
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
                  className={`text-[9px] font-bold leading-[1.3] ${
                    active ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </header>

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
        <p className="mt-10 text-center text-sm text-ink-soft">
          {searching ? t('trips.search.empty') : t('trips.empty')}
        </p>
      )}

      {/* Mockup .explore-list — flat trip cards. Primary list on mobile, and on
          every breakpoint while searching (the destination accordion would hide
          matches behind collapsed groups). */}
      {!loading && !error && filtered.length > 0 && (
        <div className={`mt-3.5 flex flex-col gap-3 ${searching ? '' : 'md:hidden'}`}>
          {filtered.map((tour) => (
            <TripCard key={tour.id} tour={tour} />
          ))}
          <GoingRow label={t('trips.going')} />
        </div>
      )}

      {!loading && !error && !searching && groups.length > 0 && (
        <div className="mt-3.5 hidden flex-col gap-2.5 md:flex">
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

/** Mockup .going-row — decorative avatar stack linking to the Facebook Page,
 *  where trip groups are actually set up. Avatars are placeholders, not people. */
function GoingRow({ label }: { label: string }) {
  const avatarBg = ['bg-teal-700', 'bg-coral', 'bg-teal-600', 'bg-teal-800']

  return (
    <a
      href={FACEBOOK_PAGE_URL}
      target="_blank"
      rel="noreferrer"
      className="px-0.5 pb-0.5 pt-1.5"
    >
      <p className="mb-2 text-[10.5px] font-bold text-ink-soft">{label}</p>
      <div className="flex items-center">
        {avatarBg.map((bg, i) => (
          <span
            key={bg}
            aria-hidden
            className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white text-cream shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)] ${bg} ${
              i === 0 ? '' : '-ml-2.5'
            }`}
          >
            <User className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
        ))}
        <span className="-ml-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-mint-100 text-teal-700 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]">
          <FacebookIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
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
