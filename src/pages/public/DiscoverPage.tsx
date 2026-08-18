import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, List, Map as MapIcon } from 'lucide-react'
import { GALLERY_PHOTOS, photoThumbSrc, type GalleryPhoto } from '../../data/galleryPhotos'
import GalleryAuthenticityNote from '../../components/gallery/GalleryAuthenticityNote'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import BiText from '../../components/ui/BiText'
import SpotsMap from '../../components/spots/SpotsMap'
import SpotFeedCard, { SpotCompactRow } from '../../components/spots/SpotFeedCard'
import SpotListCard from '../../components/spots/SpotListCard'
import FramesShowcaseRow, { sortFramesCollection } from '../../components/spots/FramesShowcaseRow'
import { useLang } from '../../hooks/useLang'
import type { TranslationKey } from '../../i18n/translations'
import {
  countCollection101Frames,
  fetchPhotoSpots,
  filterSpotsByCategory,
  type PhotoSpotDetail,
} from '../../lib/photoSpotsApi'
import { supabase } from '../../lib/supabase'
import { storageImageSrc, STORAGE_IMG } from '../../lib/storageImage'

type DiscoverChip = 'All' | 'Aurora' | 'Portrait' | 'Landscape' | 'Coastal' | 'Night'

const FRAMES_HERO_IMG =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/content-photos/494005384_1232342625557503_5488091950624198364_n.jpg'

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

export default function DiscoverPage() {
  const { tt, lang } = useLang()
  const authName = useAuthDisplayName()
  const [chip, setChip] = useState<DiscoverChip>('All')
  const [query, setQuery] = useState('')
  const [spots, setSpots] = useState<PhotoSpotDetail[]>([])
  const [framesCount, setFramesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'map' | 'list'>('map')
  const [selected, setSelected] = useState<PhotoSpotDetail | null>(null)
  const [feedVisible, setFeedVisible] = useState(FEED_INITIAL)
  const feedRef = useRef<HTMLElement | null>(null)

  const helloGuest = tt('discover.hello')
  const helloNamed = tt('discover.helloNamed')
  const headlineBi = tt('discover.headline')
  const taglineBi = tt('discover.tagline')
  const creditBi = tt('discover.credit')
  const spotCountBi = tt('discover.spotCount')
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
    Promise.all([fetchPhotoSpots(), countCollection101Frames()]).then(([rows, count]) => {
      if (cancelled) return
      setSpots(rows)
      const fromRows = rows.filter((r) => r.collection_101_frames === true).length
      setFramesCount(Math.max(count, fromRows))
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

  const nearbySpots = useMemo(() => filteredSpots.slice(0, 8), [filteredSpots])
  const framesSpots = useMemo(() => sortFramesCollection(spots), [spots])
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
    <div className="bg-cream-app pb-10 text-ink-app">
      <header className="relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-10">
        <img
          src={storageImageSrc(FRAMES_HERO_IMG, STORAGE_IMG.hero) || FRAMES_HERO_IMG}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(12,33,29,.42) 0%, rgba(12,33,29,.38) 38%, rgba(12,33,29,.88) 100%)',
          }}
          aria-hidden
        />
        <div className="relative z-[1] mx-auto max-w-[960px] px-4 pb-3.5 pt-3 sm:px-6">
          <p className="text-[10px] font-semibold tracking-[0.04em] text-cream/75">
            {helloLine.en}
            <span className="ml-1.5 font-thai font-medium">{helloLine.th}</span>
          </p>
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <BiDisplayHeading
                en={headlineBi.en}
                th={headlineBi.th}
                as="h1"
                enClassName="font-display text-[26px] font-bold text-cream sm:text-[32px]"
                thClassName="mt-0.5 font-serif text-[15px] text-cream/75 sm:text-[17px]"
              />
              <BiDisplayHeading
                en={taglineBi.en}
                th={taglineBi.th}
                as="p"
                className="mt-2"
                enClassName="font-display text-[14px] font-medium italic text-cream/90 sm:text-[16px]"
                thClassName="mt-0.5 font-serif text-[12px] text-cream/70 sm:text-[13px]"
              />
              <p className="mt-2 flex items-start gap-1.5 text-cream/75">
                <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange" aria-hidden />
                <BiText
                  en={creditBi.en}
                  th={creditBi.th}
                  className="text-[11px] leading-snug sm:text-[12px]"
                  thClassName="mt-0.5 block font-thai text-[10px] font-medium text-cream/65"
                />
              </p>
            </div>
            <div className="shrink-0 self-start rounded-[18px] bg-white px-3 py-2 shadow-[0_6px_18px_rgba(18,47,42,0.06)] ring-1 ring-line">
              <p className="font-display text-[13px] font-semibold text-teal-dark">
                {spotCountBi.en.replace('{x}', String(framesCount))}
              </p>
              <p className="font-thai text-[10px] font-medium text-ink-app/50">
                {spotCountBi.th.replace('{x}', String(framesCount))}
              </p>
            </div>
          </div>

          <FramesShowcaseRow spots={framesSpots} />

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
        </div>
      </header>

      <div className="mx-auto max-w-[960px]">
        <div className="space-y-8 px-4 pt-7 sm:px-6 sm:pt-8">
          {view === 'map' ? (
            <div className="relative overflow-hidden rounded-[22px] border border-line bg-white shadow-[0_14px_36px_rgba(18,47,42,0.12)]">
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
                className="h-[240px] w-full overflow-hidden rounded-[22px] sm:h-[300px]"
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
                seeAllTo="/spots"
                seeAllEn={seeAllBi.en}
                seeAllTh={seeAllBi.th}
              />
              <div data-featured-strip className="hide-scrollbar flex snap-x gap-2.5 overflow-x-auto pb-1">
                {nearbySpots.map((spot) => (
                  <SpotListCard key={spot.id} spot={spot} variant="carousel" />
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
