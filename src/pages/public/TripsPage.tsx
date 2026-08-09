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
import BiText from '../../components/ui/BiText'
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
  const [openDest, setOpenDest] = useState<string | null>(null)

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
  const goingBi = tt('trips.going')
  const goingNote = tt('trips.going.note')
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

  function toggleGroup(destination: string) {
    setOpenDest((prev) => (prev === destination ? null : destination))
  }

  return (
    <div className="pb-2">
      {/* Mockup .explore-top */}
      <header className="-mx-4 border-b border-line bg-card px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <BiText
          as="h1"
          en={titleBi.en}
          th={titleBi.th}
          serif
          className="text-[17px] text-ink sm:text-2xl"
          thClassName="mt-px block font-thai text-[11px] font-medium text-ink-soft sm:text-[13px]"
        />
        <BiText
          as="p"
          en={subtitleBi.en}
          th={subtitleBi.th}
          className="mt-1 text-[11px] text-ink-soft"
          thClassName="mt-px block font-thai text-[10px] text-ink-soft/85"
        />

        {/* Mockup .search-bar — bilingual placeholder */}
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

        {/* Mockup .tab-dock */}
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
        <BiText
          as="p"
          en={searching ? searchEmptyBi.en : emptyBi.en}
          th={searching ? searchEmptyBi.th : emptyBi.th}
          className="mt-10 text-center text-sm text-ink-soft"
          thClassName="mt-1 block font-thai text-xs text-ink-soft/85"
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className={`mt-3.5 flex flex-col gap-3 ${searching ? '' : 'md:hidden'}`}>
          {filtered.map((tour) => (
            <TripCard key={tour.id} tour={tour} />
          ))}
          <GoingRow en={goingBi.en} th={goingBi.th} noteEn={goingNote.en} noteTh={goingNote.th} />
        </div>
      )}

      {!loading && !error && !searching && groups.length > 0 && (
        <div className="mt-3.5 hidden flex-col gap-2.5 md:flex">
          {groups.map(({ destination, tours: groupTours }) => {
            const open = openDest === destination
            const cover = groupCover(groupTours)
            const fromPrice = Math.min(...groupTours.map((t) => t.price_aud))
            const labelEn = tourDestinationLabel(destination, 'en')
            const labelTh = tourDestinationLabel(destination, 'th')

            return (
              <section
                key={destination}
                className="flight-board-shell overflow-hidden rounded-2xl border border-line bg-card shadow-[0_6px_18px_-12px_rgba(10,61,58,0.28)]"
              >
                <DestinationBoardRow
                  label={`${labelEn} / ${labelTh}`}
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

/** Stub avatar stack — no public “who’s going” API yet; links to Facebook Page. */
function GoingRow({
  en,
  th,
  noteEn,
  noteTh,
}: {
  en: string
  th: string
  noteEn: string
  noteTh: string
}) {
  const avatarBg = ['bg-teal-700', 'bg-coral', 'bg-teal-600', 'bg-teal-800']
  const initials = ['J', 'M', 'A', 'K']

  return (
    <a
      href={FACEBOOK_PAGE_URL}
      target="_blank"
      rel="noreferrer"
      className="px-0.5 pb-0.5 pt-1.5"
    >
      <BiText
        as="p"
        en={en}
        th={th}
        className="mb-1 text-[10.5px] font-bold text-ink-soft"
        thClassName="mt-px block font-thai text-[9px] font-medium text-ink-soft/85"
      />
      <div className="mb-2 flex items-center">
        {avatarBg.map((bg, i) => (
          <span
            key={bg}
            aria-hidden
            className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white text-[10.5px] font-bold text-cream shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)] ${bg} ${
              i === 0 ? '' : '-ml-2.5'
            }`}
          >
            {initials[i] ?? <User className="h-3.5 w-3.5" strokeWidth={2.25} />}
          </span>
        ))}
        <span className="-ml-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-mint-100 text-[10px] font-bold text-teal-700 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]">
          +9
        </span>
        <span className="-ml-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-mint-100 text-teal-700 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]">
          <FacebookIcon className="h-3.5 w-3.5" />
        </span>
      </div>
      <BiText
        as="p"
        en={noteEn}
        th={noteTh}
        className="text-[9px] italic text-ink-soft/80"
        thClassName="mt-px block font-thai text-[8px] not-italic text-ink-soft/70"
      />
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
