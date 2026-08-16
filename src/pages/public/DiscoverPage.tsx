import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { List, Map as MapIcon } from 'lucide-react'
import { GALLERY_PHOTOS, photoThumbSrc, type GalleryPhoto } from '../../data/galleryPhotos'
import GalleryAuthenticityNote from '../../components/gallery/GalleryAuthenticityNote'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import SpotsMap from '../../components/spots/SpotsMap'
import SpotFeedCard, { SpotCompactRow } from '../../components/spots/SpotFeedCard'
import SplitFlapText from '../../components/spots/SplitFlapText'
import { useLang } from '../../hooks/useLang'
import type { TranslationKey } from '../../i18n/translations'
import {
  fetchPhotoSpots,
  filterSpotsByCategory,
  type PhotoSpotDetail,
} from '../../lib/photoSpotsApi'
import { supabase } from '../../lib/supabase'

type DiscoverChip = 'All' | 'Aurora' | 'Portrait' | 'Landscape' | 'Coastal' | 'Night'

const ICON = {
  stroke: 'currentColor',
  strokeWidth: 1.7,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

const CHIPS: { id: DiscoverChip; key: TranslationKey }[] = [
  { id: 'All', key: 'discover.chip.all' },
  { id: 'Aurora', key: 'discover.chip.aurora' },
  { id: 'Portrait', key: 'discover.chip.portrait' },
  { id: 'Landscape', key: 'discover.chip.landscape' },
  { id: 'Coastal', key: 'discover.chip.coastal' },
  { id: 'Night', key: 'discover.chip.night' },
]

const FEED_LARGE = 6
const FEED_INITIAL = 16
const FEED_PAGE = 15

const GALLERY_BADGE: Record<GalleryPhoto['category'], string> = {
  'new-zealand': 'NZ',
  tasmania: 'TAS',
  nsw: 'NSW',
  sydney: 'Sydney',
  outback: 'Outback',
  melbourne: 'MEL',
  bermagui: 'Coast',
}

/** Trust-building portfolio — never filtered by Discover chips. */
const LATEST_WORK_PHOTOS = GALLERY_PHOTOS.slice(0, 8)

function nameFromAuthUser(user: {
  email?: string | null
  user_metadata?: Record<string, unknown>
}): string | null {
  const meta = user.user_metadata ?? {}
  const raw =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    (typeof meta.first_name === 'string' && meta.first_name) ||
    (user.email?.split('@')[0] ?? '')
  const first = raw.trim().split(/\s+/)[0]
  return first || null
}

function useAuthDisplayName(): string | null {
  const [name, setName] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setName(data.session?.user ? nameFromAuthUser(data.session.user) : null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setName(session?.user ? nameFromAuthUser(session.user) : null)
    })
    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])
  return name
}

function SectionLabel({
  en,
  th,
  seeAllTo,
  onSeeAll,
  seeAllEn,
  seeAllTh,
}: {
  en: string
  th: string
  seeAllTo?: string
  onSeeAll?: () => void
  seeAllEn?: string
  seeAllTh?: string
}) {
  const seeAllInner = seeAllEn ? (
    <>
      {seeAllEn}
      {seeAllTh ? <span className="ml-1 font-thai font-medium">{seeAllTh}</span> : null}
    </>
  ) : null
  const seeAllClass = 'shrink-0 text-[10px] font-bold text-orange-deep'

  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <BiDisplayHeading
        en={en}
        th={th}
        as="h2"
        enClassName="font-display text-[15px] font-semibold tracking-tight text-teal-darker"
        thClassName="mt-0.5 font-thai text-[11px] font-medium text-ink-app/55"
      />
      {seeAllEn && onSeeAll ? (
        <button type="button" onClick={onSeeAll} className={seeAllClass}>
          {seeAllInner}
        </button>
      ) : seeAllTo && seeAllEn ? (
        <Link to={seeAllTo} className={seeAllClass}>
          {seeAllInner}
        </Link>
      ) : null}
    </div>
  )
}

function LatestWorkGrid({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
      {photos.map((photo) => (
        <Link
          key={photo.id}
          to="/gallery"
          className="relative block h-[110px] overflow-hidden rounded-[18px] bg-teal-soft shadow-[0_6px_16px_rgba(18,47,42,0.06)] sm:h-[140px]"
        >
          <img
            src={photoThumbSrc(photo, { width: 480, quality: 68, format: 'webp' })}
            alt={`${photo.caption_en} / ${photo.caption_th}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-orange-soft">
            {GALLERY_BADGE[photo.category]}
          </span>
        </Link>
      ))}
    </div>
  )
}

function NearbySpotCard({ spot }: { spot: PhotoSpotDetail }) {
  const img = spot.thumbSrc ?? spot.heroSrc
  return (
    <Link
      to={`/spots/${spot.slug}`}
      className="w-[46%] shrink-0 overflow-hidden rounded-[18px] bg-white shadow-[0_6px_18px_rgba(18,47,42,0.06)] sm:w-44"
    >
      <div className="relative h-24 bg-teal-soft">
        {img ? (
          <img
            src={img}
            alt={`${spot.title_en} / ${spot.title_th}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="px-2.5 pb-2.5 pt-2">
        <SplitFlapText text={spot.title_en} />
        <p className="mt-0.5 line-clamp-1 font-thai text-[10px] text-ink-app/55">{spot.title_th}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="truncate text-[8.5px] text-ink-app/50">
            {spot.best_time ?? spot.location_en}
          </span>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-dark text-orange-soft">
            <ChevronRightIcon className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function DiscoverPage() {
  const { tt, lang } = useLang()
  const authName = useAuthDisplayName()
  const [chip, setChip] = useState<DiscoverChip>('All')
  const [query, setQuery] = useState('')
  const [spots, setSpots] = useState<PhotoSpotDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'map' | 'list'>('map')
  const [selected, setSelected] = useState<PhotoSpotDetail | null>(null)
  const [feedVisible, setFeedVisible] = useState(FEED_INITIAL)
  const feedRef = useRef<HTMLElement | null>(null)

  const helloGuest = tt('discover.hello')
  const helloNamed = tt('discover.helloNamed')
  const headlineBi = tt('discover.headline')
  const searchBi = tt('discover.search')
  const mapBi = tt('spots.viewMap')
  const listBi = tt('spots.viewList')
  const nearbyBi = tt('discover.nearby')
  const latestBi = tt('discover.latest')
  const seeAllBi = tt('discover.seeAll')
  const emptyTitle = tt('discover.emptyTitle')
  const emptyBody = tt('discover.emptyBody')
  const clearBi = tt('discover.clearFilters')
  const loadMoreBi = tt('discover.loadMore')

  useEffect(() => {
    let cancelled = false
    fetchPhotoSpots().then((rows) => {
      if (cancelled) return
      setSpots(rows)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const helloLine = authName
    ? {
        en: helloNamed.en.replace('{name}', authName),
        th: helloNamed.th.replace('{name}', authName),
      }
    : helloGuest

  const q = query.trim().toLowerCase()

  const filteredSpots = useMemo(() => {
    const byCat = filterSpotsByCategory(spots, chip)
    if (!q) return byCat
    return byCat.filter(
      (s) =>
        s.title_en.toLowerCase().includes(q) ||
        s.title_th.includes(q) ||
        s.location_en.toLowerCase().includes(q) ||
        s.categories.some((c) => c.toLowerCase().includes(q)) ||
        (s.description_en?.toLowerCase().includes(q) ?? false),
    )
  }, [spots, chip, q])

  function scrollToFeed() {
    const el = feedRef.current
    if (!el) return
    const scroller = el.closest('[data-app-scroll]')
    if (scroller instanceof HTMLElement) {
      const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
      scroller.scrollTo({ top, behavior: 'smooth' })
      return
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const nearbySpots = useMemo(() => filteredSpots.slice(0, 8), [filteredSpots])
  const visibleSpots = filteredSpots.slice(0, feedVisible)
  const largeSpots = visibleSpots.slice(0, FEED_LARGE)
  const compactSpots = visibleSpots.slice(FEED_LARGE)
  const feedHasMore = feedVisible < filteredSpots.length

  useEffect(() => {
    setFeedVisible(FEED_INITIAL)
  }, [chip])

  useEffect(() => {
    if (!selected) return
    if (!filteredSpots.some((s) => s.id === selected.id)) setSelected(null)
  }, [filteredSpots, selected])

  return (
    <div className="-mx-4 bg-cream-app pb-10 text-ink-app sm:-mx-6 lg:mx-0">
      <div className="mx-auto max-w-[960px]">
        <header className="bg-gradient-to-b from-teal-soft/80 from-0% to-cream-app to-[78%] px-4 pb-3.5 pt-3 sm:px-6">
          <p className="text-[10px] font-semibold tracking-[0.04em] text-ink-app/55">
            {helloLine.en}
            <span className="ml-1.5 font-thai font-medium">{helloLine.th}</span>
          </p>
          <BiDisplayHeading
            en={headlineBi.en}
            th={headlineBi.th}
            as="h1"
            enClassName="font-display text-[22px] font-bold text-teal-darker sm:text-[26px]"
            thClassName="mt-0.5 font-thai text-[13px] text-ink-app/55"
          />

          <label className="relative mt-3 block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-app/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'th' ? searchBi.th : searchBi.en}
              className="w-full rounded-full border border-line bg-white py-2.5 pl-9 pr-4 text-[13px] text-ink outline-none placeholder:text-ink-app/40"
            />
          </label>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {CHIPS.map(({ id, key }) => {
              const label = tt(key)
              const on = chip === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setChip(id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                    on ? 'bg-teal-dark text-cream' : 'bg-white text-ink-app/70 ring-1 ring-line'
                  }`}
                >
                  {label.en}
                  <span className={`ml-1 text-[10px] font-medium ${on ? 'text-cream/80' : 'text-ink-app/50'} font-thai`}>
                    {label.th}
                  </span>
                </button>
              )
            })}
          </div>
        </header>

        <div className="space-y-4 px-4 sm:px-6">
          {view === 'map' ? (
            <div className="relative overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_8px_22px_rgba(18,47,42,0.08)]">
              <div className="absolute right-2.5 top-2.5 z-[1000] inline-flex rounded-full border border-line bg-white/95 p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setView('map')}
                  aria-pressed
                  className="inline-flex items-center gap-1 rounded-full bg-teal-dark px-2.5 py-1.5 text-[11px] font-bold text-cream"
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  {mapBi.en}
                  <span className="font-thai text-[10px] font-medium text-cream/80">{mapBi.th}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  aria-pressed={false}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold text-ink-app/55"
                >
                  <List className="h-3.5 w-3.5" />
                  {listBi.en}
                  <span className="font-thai text-[10px] font-medium text-ink-app/45">{listBi.th}</span>
                </button>
              </div>
              <SpotsMap
                spots={filteredSpots}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
                className="h-[240px] w-full sm:h-[300px]"
              />
            </div>
          ) : (
            <div className="flex justify-end">
              <div className="inline-flex rounded-full border border-line bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setView('map')}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold text-ink-app/55"
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  {mapBi.en}
                  <span className="font-thai text-[10px] font-medium text-ink-app/45">{mapBi.th}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-dark px-2.5 py-1.5 text-[11px] font-bold text-cream"
                >
                  <List className="h-3.5 w-3.5" />
                  {listBi.en}
                  <span className="font-thai text-[10px] font-medium text-cream/80">{listBi.th}</span>
                </button>
              </div>
            </div>
          )}

          {!loading && nearbySpots.length > 0 ? (
            <section>
              <SectionLabel
                en={nearbyBi.en}
                th={nearbyBi.th}
                onSeeAll={scrollToFeed}
                seeAllEn={seeAllBi.en}
                seeAllTh={seeAllBi.th}
              />
              <div data-featured-strip className="hide-scrollbar flex gap-2.5 overflow-x-auto pb-1">
                {nearbySpots.map((spot) => (
                  <NearbySpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </section>
          ) : null}

          {loading ? (
            <p className="py-8 text-center text-sm text-ink-soft">…</p>
          ) : filteredSpots.length === 0 ? (
            <section ref={feedRef} id="discover-feed" className="rounded-2xl bg-white px-4 py-10 text-center">
              <p className="font-semibold text-ink">{emptyTitle.en}</p>
              <p className="mt-1 font-thai text-[13px] text-ink-soft">{emptyTitle.th}</p>
              <p className="mt-3 text-[13px] text-ink-soft">{emptyBody.en}</p>
              <button
                type="button"
                onClick={() => {
                  setChip('All')
                  setQuery('')
                }}
                className="mt-6 rounded-full bg-ink-app px-5 py-2.5 text-sm font-semibold text-white"
              >
                {clearBi.en}
                <span className="ml-1.5 font-thai font-medium text-white/80">{clearBi.th}</span>
              </button>
            </section>
          ) : (
            <section ref={feedRef} id="discover-feed" className="space-y-4">
              {largeSpots.map((spot) => (
                <SpotFeedCard key={spot.id} spot={spot} />
              ))}
              {compactSpots.length > 0 ? (
                <div className="space-y-2">
                  {compactSpots.map((spot) => (
                    <SpotCompactRow key={spot.id} spot={spot} />
                  ))}
                </div>
              ) : null}
              {feedHasMore ? (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setFeedVisible((n) => n + FEED_PAGE)}
                    className="rounded-full bg-ink-app px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    {loadMoreBi.en}
                    <span className="ml-1.5 font-thai font-medium text-white/80">{loadMoreBi.th}</span>
                  </button>
                </div>
              ) : null}
            </section>
          )}

          {LATEST_WORK_PHOTOS.length > 0 ? (
            <section>
              <SectionLabel
                en={latestBi.en}
                th={latestBi.th}
                seeAllTo="/gallery"
                seeAllEn={seeAllBi.en}
                seeAllTh={seeAllBi.th}
              />
              <GalleryAuthenticityNote className="mb-3" />
              <LatestWorkGrid photos={LATEST_WORK_PHOTOS} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
