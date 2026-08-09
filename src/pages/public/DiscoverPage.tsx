import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  DISCOVER_INITIAL_FEED_CAP,
  DISCOVER_NEARBY_PAGE_SIZE,
  filterDiscoverSpots,
  getDiscoverSpots,
  getMasterpiece,
  sliceDiscoverSpots,
  type DiscoverChip,
  type DiscoverSpot,
} from '../../data/discoverFeed'
import { photoThumbSrc } from '../../data/galleryPhotos'
import { librarySlugForGalleryPhotoId } from '../../lib/photoSpotsApi'
import { TEAM_MEMBERS } from '../../data/teamMembers'
import TeamAvatar from '../../components/about/TeamAvatar'
import { useLang } from '../../hooks/useLang'
import type { TranslationKey } from '../../i18n/translations'
import { supabase } from '../../lib/supabase'

/** SVG line icons — paths matched to Trip2Talk-Discover-Tab-v3-Brand-Icons-Mockup.html */
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

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M4 6h16M8 12h12M12 18h8" />
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.7}
      fill={filled ? 'currentColor' : 'none'}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-4.4-9.5-8.9C.6 8.4 2.4 5 6 5c2 0 3.4 1 4.5 2.3C11.6 6 13 5 15 5c3.6 0 5.4 3.4 3.5 7.1C19 16.6 12 21 12 21z" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M15 6l-6 6 6 6" />
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

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  )
}

function ApertureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IsoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <path d="M8 7V5h8v2" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor" stroke="none">
      <path d="M12 2l2.9 6.9 7.1.6-5.4 4.6 1.7 7-6.3-4-6.3 4 1.7-7L2 9.5l7.1-.6z" />
    </svg>
  )
}

function ChipAllIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M4 12h16M4 6h16M4 18h16" />
    </svg>
  )
}

function ChipAuroraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M3 15c4-6 14-6 18 0M6 18c3-4 9-4 12 0" />
    </svg>
  )
}

function ChipPortraitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M12 12v9M8 21h8" />
    </svg>
  )
}

function ChipNatureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M3 18l6-9 4 6 3-4 5 7z" />
    </svg>
  )
}

function CompassEmptyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5L10 10l-.5 4.5L14 14z" />
    </svg>
  )
}

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
      const user = data.session?.user
      setName(user ? nameFromAuthUser(user) : null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      setName(user ? nameFromAuthUser(user) : null)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  return name
}

function CircleBtn({
  label,
  onClick,
  to,
  children,
  className = '',
}: {
  label: string
  onClick?: () => void
  to?: string
  children: ReactNode
  className?: string
}) {
  const cls = `flex h-8 w-8 items-center justify-center rounded-full bg-white/94 transition-opacity hover:opacity-90 motion-reduce:transition-none ${className}`
  if (to) {
    return (
      <Link to={to} aria-label={label} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

function MasterpieceCard({
  spot,
  liked,
  onToggleLike,
}: {
  spot: DiscoverSpot
  liked: boolean
  onToggleLike: () => void
}) {
  const navigate = useNavigate()
  const { tt } = useLang()
  const backBi = tt('discover.back')
  const favBi = tt(liked ? 'discover.unfavorite' : 'discover.favorite')
  const ctaLead = tt('discover.ctaLead')
  const ctaBold = tt('discover.ctaBold')

  return (
    <article className="overflow-hidden rounded-spot border border-teal-dark/10 bg-white shadow-spot">
      <div className="relative h-[220px] w-full overflow-hidden bg-teal-soft sm:h-[260px]">
        <img
          src={photoThumbSrc(spot.photo, { width: 1200, quality: 70, format: 'webp' })}
          alt={`${spot.titleEn} / ${spot.titleTh}`}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget
            if (spot.photo.url && img.src !== spot.photo.url) img.src = spot.photo.url
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-dark/25 to-transparent to-[22%]"
          aria-hidden
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
          <CircleBtn
            label={`${backBi.en} / ${backBi.th}`}
            onClick={() => navigate(-1)}
            className="text-teal-dark"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </CircleBtn>
          <CircleBtn
            label={`${favBi.en} / ${favBi.th}`}
            onClick={onToggleLike}
            className="text-orange-deep"
          >
            <HeartIcon className="h-4 w-4" filled={liked} />
          </CircleBtn>
        </div>
      </div>

      <div className="space-y-3 px-[18px] pb-5 pt-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-[17px] font-semibold leading-tight tracking-tight text-teal-darker">
              {spot.titleEn}
            </h2>
            <p className="mt-1 font-thai text-[11px] text-ink-app/55">
              {spot.location} · {spot.titleTh}
            </p>
          </div>
          <p className="flex shrink-0 items-center gap-1 pt-0.5 text-[11px] font-bold text-orange-deep">
            <StarIcon className="h-3 w-3 text-orange" />
            {spot.rating.toFixed(1)}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-bg py-1 pl-1.5 pr-2.5 font-mono text-[9px] text-[#7a5c1c]">
            <SunIcon className="h-[11px] w-[11px]" />
            {spot.goldenHourEn}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft py-1 pl-1.5 pr-2.5 font-mono text-[9px] text-teal-mid">
            <ApertureIcon className="h-[11px] w-[11px]" />
            {spot.fStop}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft py-1 pl-1.5 pr-2.5 font-mono text-[9px] text-teal-mid">
            <IsoIcon className="h-[11px] w-[11px]" />
            ISO {spot.iso}
          </span>
        </div>

        <Link
          to={`/trips/${spot.tripCode}`}
          className="flex items-center justify-between gap-3 rounded-2xl bg-teal-dark px-3.5 py-3 transition-opacity hover:opacity-95 motion-reduce:transition-none"
          aria-label={`${ctaLead.en} ${ctaBold.en} / ${ctaLead.th} ${ctaBold.th}`}
        >
          <span className="min-w-0 max-w-[165px] flex-1 text-[10px] leading-relaxed text-[rgba(245,242,232,0.75)] sm:max-w-none sm:text-[12px]">
            <span className="block">
              {ctaLead.en}
              <span className="mt-0.5 block font-semibold text-white">{ctaBold.en}</span>
            </span>
            <span className="mt-1 block font-thai">
              {ctaLead.th}
              <span className="mt-0.5 block font-semibold text-white">{ctaBold.th}</span>
            </span>
          </span>
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-orange text-teal-darker">
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </article>
  )
}

function NearbyCard({
  spot,
  liked,
  onToggleLike,
}: {
  spot: DiscoverSpot
  liked: boolean
  onToggleLike: () => void
}) {
  const { tt } = useLang()
  const favBi = tt(liked ? 'discover.unfavorite' : 'discover.favorite')
  const openBi = tt('discover.openSpot')
  const MetaIcon = spot.chip === 'aurora' ? ChipAuroraIcon : SunIcon

  return (
    <article className="w-[46%] shrink-0 overflow-hidden rounded-[18px] border border-teal-dark/10 bg-white shadow-[0_6px_16px_rgba(18,47,42,0.06)] sm:w-44">
      <div className="relative h-24 overflow-hidden bg-teal-soft">
        <img
          src={photoThumbSrc(spot.photo, { width: 640, quality: 68, format: 'webp' })}
          alt={`${spot.titleEn} / ${spot.titleTh}`}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget
            if (spot.photo.url && img.src !== spot.photo.url) img.src = spot.photo.url
          }}
        />
        <CircleBtn
          label={`${favBi.en} / ${favBi.th}`}
          onClick={onToggleLike}
          className="absolute right-2 top-2 h-[22px] w-[22px] text-orange-deep"
        >
          <HeartIcon className="h-[11px] w-[11px]" filled={liked} />
        </CircleBtn>
      </div>
      <div className="px-2.5 pb-2.5 pt-2">
        <h3 className="line-clamp-2 text-[10.5px] font-semibold leading-snug text-teal-darker">
          {spot.titleEn}
          <span className="mt-0.5 block font-thai text-[10px] font-medium text-ink-app/55">
            {spot.titleTh}
          </span>
        </h3>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-1 truncate text-[8.5px] text-teal-mid">
            <MetaIcon className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{spot.timeOfDayEn}</span>
          </span>
          <CircleBtn
            label={`${openBi.en}: ${spot.titleEn}`}
            to={`/discover/spot/${librarySlugForGalleryPhotoId(spot.id) ?? spot.id}`}
            className="h-5 w-5 bg-teal-dark text-orange-soft"
          >
            <ChevronRightIcon className="h-2.5 w-2.5" />
          </CircleBtn>
        </div>
      </div>
    </article>
  )
}

const CHIP_KEYS: {
  id: DiscoverChip
  key: TranslationKey
  Icon: typeof ChipAllIcon
}[] = [
  { id: 'all', key: 'discover.chip.all', Icon: ChipAllIcon },
  { id: 'aurora', key: 'discover.chip.aurora', Icon: ChipAuroraIcon },
  { id: 'portrait', key: 'discover.chip.portrait', Icon: ChipPortraitIcon },
  { id: 'nature', key: 'discover.chip.nature', Icon: ChipNatureIcon },
]

export default function DiscoverPage() {
  const { tt } = useLang()
  const authName = useAuthDisplayName()
  const [chip, setChip] = useState<DiscoverChip>('all')
  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [nearbyLimit, setNearbyLimit] = useState(
    Math.max(1, DISCOVER_INITIAL_FEED_CAP - 1),
  )
  const saen = TEAM_MEMBERS.find((m) => m.id === 'saen')

  const helloGuest = tt('discover.hello')
  const helloNamed = tt('discover.helloNamed')
  const headlineBi = tt('discover.headline')
  const searchBi = tt('discover.search')
  const filterBi = tt('discover.filter')
  const masterpieceBi = tt('discover.masterpiece')
  const nearbyBi = tt('discover.nearby')
  const seeAllBi = tt('discover.seeAll')
  const loadMoreBi = tt('discover.loadMore')
  const emptyTitle = tt('discover.emptyTitle')
  const emptyBody = tt('discover.emptyBody')
  const clearBi = tt('discover.clearFilters')

  const helloLine = authName
    ? {
        en: helloNamed.en.replace('{name}', authName),
        th: helloNamed.th.replace('{name}', authName),
      }
    : helloGuest

  const spots = useMemo(() => getDiscoverSpots(), [])

  const filtered = useMemo(() => {
    const byChip = filterDiscoverSpots(spots, chip)
    const q = query.trim().toLowerCase()
    if (!q) return byChip
    return byChip.filter(
      (s) =>
        s.titleEn.toLowerCase().includes(q) ||
        s.titleTh.includes(q) ||
        s.location.toLowerCase().includes(q),
    )
  }, [spots, chip, query])

  const isEmpty = filtered.length === 0

  const masterpiece = useMemo(
    () => (isEmpty ? null : getMasterpiece(filtered)),
    [filtered, isEmpty],
  )

  const nearbyPool = useMemo(() => {
    if (isEmpty || !masterpiece) return []
    return filtered.filter((s) => s.id !== masterpiece.id)
  }, [filtered, isEmpty, masterpiece])

  const nearbySlice = useMemo(
    () => sliceDiscoverSpots(nearbyPool, 0, nearbyLimit),
    [nearbyPool, nearbyLimit],
  )

  useEffect(() => {
    setNearbyLimit(Math.max(1, DISCOVER_INITIAL_FEED_CAP - 1))
  }, [chip, query])

  const toggleLike = (id: string) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }))

  const clearFilters = () => {
    setChip('all')
    setQuery('')
  }

  return (
    <div className="-mx-4 bg-cream-app pb-8 text-ink-app sm:-mx-6 lg:mx-0">
      <header className="bg-gradient-to-b from-teal-soft from-0% to-cream-app to-[78%] px-4 pb-3.5 pt-2 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-teal-mid">
              {helloLine.en}
              <span className="ml-1.5 font-thai font-medium normal-case tracking-normal">
                {helloLine.th}
              </span>
            </p>
            <h1 className="mt-0.5 font-display text-[19px] font-semibold leading-tight tracking-tight text-teal-darker">
              {headlineBi.en}
              <span className="mt-0.5 block font-thai text-sm font-medium text-ink-app/55">
                {headlineBi.th}
              </span>
            </h1>
          </div>
          {saen ? (
            <div className="h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full border-[1.5px] border-orange">
              <TeamAvatar
                srcs={saen.photoSrcs}
                alt={saen.nameEn}
                initial={saen.initial}
                className="!h-[34px] !w-[34px] !border-0 !shadow-none sm:!h-[34px] sm:!w-[34px]"
              />
            </div>
          ) : null}
        </div>

        <div className="mb-3.5 flex items-center gap-2">
          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="pointer-events-none absolute left-4 text-teal-mid">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`${searchBi.en} · ${searchBi.th}`}
              className="w-full rounded-full border border-teal-dark/10 bg-white py-[11px] pl-11 pr-4 text-[11.5px] text-ink-app outline-none placeholder:text-ink-app/55"
              aria-label={`${searchBi.en} / ${searchBi.th}`}
            />
          </label>
          <button
            type="button"
            aria-label={`${filterBi.en} / ${filterBi.th}`}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-teal-dark text-orange-soft"
          >
            <FilterIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="hide-scrollbar flex gap-[7px] overflow-x-auto pb-0.5">
          {CHIP_KEYS.map((c) => {
            const active = chip === c.id
            const label = tt(c.key)
            const ChipIcon = c.Icon
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChip(c.id)}
                className={`inline-flex shrink-0 items-center gap-[5px] rounded-full px-3.5 py-2 text-[10.5px] font-semibold transition-colors motion-reduce:transition-none ${
                  active
                    ? 'border border-teal-dark bg-teal-dark text-white'
                    : 'border border-teal-dark/10 bg-white text-teal-mid'
                }`}
              >
                <ChipIcon className={`h-3 w-3 ${active ? 'text-orange-soft' : 'text-teal-mid'}`} />
                {label.en}
                <span className={`font-thai font-medium ${active ? 'text-white/80' : ''}`}>
                  {label.th}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      <div className="space-y-5 px-[18px] sm:px-6">
        {isEmpty ? (
          <section
            className="flex flex-col items-center rounded-spot border border-teal-dark/10 bg-white px-6 py-12 text-center shadow-spot"
            aria-live="polite"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-soft text-teal-mid">
              <CompassEmptyIcon className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-teal-darker">
              {emptyTitle.en}
              <span className="mt-1 block font-thai text-sm font-medium text-ink-app/55">
                {emptyTitle.th}
              </span>
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-app/70">
              {emptyBody.en}
              <span className="mt-1 block font-thai">{emptyBody.th}</span>
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-teal-dark px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 motion-reduce:transition-none"
            >
              {clearBi.en}
              <span className="ml-1.5 font-thai font-medium text-white/80">{clearBi.th}</span>
            </button>
          </section>
        ) : (
          <>
            <section aria-labelledby="masterpiece-heading">
              <h2 id="masterpiece-heading" className="sr-only">
                {masterpieceBi.en} / {masterpieceBi.th}
              </h2>
              {masterpiece ? (
                <MasterpieceCard
                  spot={masterpiece}
                  liked={Boolean(liked[masterpiece.id])}
                  onToggleLike={() => toggleLike(masterpiece.id)}
                />
              ) : (
                <div className="h-[220px] animate-pulse rounded-spot bg-teal-soft/80 motion-reduce:animate-none" />
              )}
            </section>

            <section aria-labelledby="nearby-heading">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2
                  id="nearby-heading"
                  className="font-display text-[15px] font-semibold tracking-tight text-teal-darker"
                >
                  {nearbyBi.en}
                  <span className="mt-0.5 block font-thai text-[11px] font-medium text-ink-app/55">
                    {nearbyBi.th}
                  </span>
                </h2>
                <Link to="/gallery" className="text-[10px] font-bold text-orange-deep">
                  {seeAllBi.en}
                  <span className="ml-1 font-thai font-medium">{seeAllBi.th}</span>
                </Link>
              </div>

              <div className="hide-scrollbar flex gap-2.5 overflow-x-auto pb-1">
                {nearbySlice.items.map((spot) => (
                  <NearbyCard
                    key={spot.id}
                    spot={spot}
                    liked={Boolean(liked[spot.id])}
                    onToggleLike={() => toggleLike(spot.id)}
                  />
                ))}
              </div>

              {nearbySlice.hasMore ? (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setNearbyLimit((n) => n + DISCOVER_NEARBY_PAGE_SIZE)}
                    className="rounded-full border border-teal-mid/30 bg-white px-4 py-2 text-sm font-semibold text-teal-mid transition-opacity hover:opacity-90 motion-reduce:transition-none"
                  >
                    {loadMoreBi.en}
                    <span className="ml-1.5 font-thai font-medium">{loadMoreBi.th}</span>
                  </button>
                </div>
              ) : null}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
