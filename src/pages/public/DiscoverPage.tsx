import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GALLERY_PHOTOS, photoThumbSrc, type GalleryPhoto } from '../../data/galleryPhotos'
import { TEAM_MEMBERS } from '../../data/teamMembers'
import TeamAvatar from '../../components/about/TeamAvatar'
import GalleryAuthenticityNote from '../../components/gallery/GalleryAuthenticityNote'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import { useLang } from '../../hooks/useLang'
import type { TranslationKey } from '../../i18n/translations'
import {
  fetchPhotoSpots,
  tripCtaHref,
  type PhotoSpotDetail,
} from '../../lib/photoSpotsApi'
import { supabase } from '../../lib/supabase'

type DiscoverChip = 'all' | 'aurora' | 'portrait' | 'nature'

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

const CHIP_KEYS: { id: DiscoverChip; key: TranslationKey; Icon: typeof ChipAllIcon }[] = [
  { id: 'all', key: 'discover.chip.all', Icon: ChipAllIcon },
  { id: 'aurora', key: 'discover.chip.aurora', Icon: ChipAuroraIcon },
  { id: 'portrait', key: 'discover.chip.portrait', Icon: ChipPortraitIcon },
  { id: 'nature', key: 'discover.chip.nature', Icon: ChipNatureIcon },
]

const GALLERY_BADGE: Record<GalleryPhoto['category'], string> = {
  'new-zealand': 'NZ',
  tasmania: 'TAS',
  nsw: 'NSW',
  sydney: 'Sydney',
  outback: 'Outback',
  melbourne: 'MEL',
  bermagui: 'Coast',
}

function chipMatchesSpot(spot: PhotoSpotDetail, chip: DiscoverChip): boolean {
  if (chip === 'all') return true
  const cats = spot.categories.map((c) => c.toLowerCase())
  if (chip === 'aurora') {
    return cats.some((c) => c.includes('aurora') || c.includes('night') || c.includes('milky'))
  }
  if (chip === 'portrait') return cats.some((c) => c.includes('portrait'))
  // nature
  return cats.some((c) =>
    ['landscape', 'nature', 'coastal', 'sunrise', 'sunset'].some((k) => c.includes(k)),
  )
}

function chipMatchesGallery(photo: GalleryPhoto, chip: DiscoverChip): boolean {
  if (chip === 'all') return true
  if (chip === 'aurora') return photo.category === 'tasmania' || photo.category === 'outback'
  if (chip === 'portrait') {
    return (
      photo.category === 'sydney' ||
      photo.category === 'melbourne' ||
      /portrait|พอร์ต/i.test(photo.caption_en + photo.caption_th)
    )
  }
  return (
    photo.category === 'new-zealand' ||
    photo.category === 'nsw' ||
    photo.category === 'tasmania' ||
    photo.category === 'bermagui' ||
    photo.category === 'outback'
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
  seeAllEn,
  seeAllTh,
}: {
  en: string
  th: string
  seeAllTo?: string
  seeAllEn?: string
  seeAllTh?: string
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <BiDisplayHeading
        en={en}
        th={th}
        as="h2"
        enClassName="font-display text-[15px] font-semibold tracking-tight text-teal-darker"
        thClassName="mt-0.5 font-thai text-[11px] font-medium text-ink-app/55"
      />
      {seeAllTo && seeAllEn ? (
        <Link to={seeAllTo} className="shrink-0 text-[10px] font-bold text-orange-deep">
          {seeAllEn}
          {seeAllTh ? <span className="ml-1 font-thai font-medium">{seeAllTh}</span> : null}
        </Link>
      ) : null}
    </div>
  )
}

function MasterpieceCard({ spot }: { spot: PhotoSpotDetail }) {
  const { tt } = useLang()
  const ctaLead = tt('discover.ctaLead')
  const ctaBold = tt('discover.ctaBold')
  const cam = spot.camera_settings.landscape
  const img = spot.thumbSrc ?? spot.heroSrc
  const tripHref = tripCtaHref(spot)

  return (
    <article className="overflow-hidden rounded-spot bg-white shadow-spot">
      <div className="relative h-[200px] overflow-hidden bg-teal-soft sm:h-[260px]">
        {img ? (
          <img
            src={img}
            alt={`${spot.title_en} / ${spot.title_th}`}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        ) : null}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-bold text-white">
          📍 {spot.location_en}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-bold text-orange-deep shadow-sm">
          <StarIcon className="h-3 w-3 text-orange" />
          {spot.rating.toFixed(1)}
        </span>
      </div>

      <div className="space-y-3.5 px-[18px] pb-5 pt-4">
        <div>
          <h3 className="font-display text-[17px] font-semibold tracking-tight text-teal-darker">
            {spot.title_en}
          </h3>
          <p className="mt-0.5 font-thai text-[11px] text-ink-app/55">{spot.title_th}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {spot.best_time ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-bg px-2.5 py-1 font-mono text-[9px] text-[#7a5c1c]">
              <SunIcon className="h-3 w-3" />
              {spot.best_time}
            </span>
          ) : null}
          {cam?.aperture ? (
            <span className="rounded-full bg-cream-app px-2.5 py-1 font-mono text-[9px] text-ink-app/55">
              {cam.aperture}
            </span>
          ) : null}
          {cam?.iso ? (
            <span className="rounded-full bg-cream-app px-2.5 py-1 font-mono text-[9px] text-ink-app/55">
              ISO {cam.iso}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="max-w-[200px] text-[10.5px] leading-relaxed text-ink-app/55 sm:max-w-none sm:text-[12px]">
            {ctaLead.en}
            <span className="mt-0.5 block font-semibold text-ink-app">{ctaBold.en}</span>
            <span className="mt-1 block font-thai text-[10px] sm:text-[11px]">
              {ctaLead.th}
              <span className="mt-0.5 block font-semibold text-ink-app/80">{ctaBold.th}</span>
            </span>
          </p>
          <Link
            to={tripHref}
            aria-label={`${ctaBold.en} / ${ctaBold.th}`}
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-ink-app text-white shadow-[0_8px_18px_rgba(27,29,25,0.25)] transition-opacity hover:opacity-90"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function MapTeaser({
  spots,
  countLabel,
}: {
  spots: PhotoSpotDetail[]
  countLabel: { en: string; th: string }
}) {
  const pinSpots = spots.filter((s) => s.latitude != null && s.longitude != null).slice(0, 3)
  const positions = [
    { top: '34%', left: '24%' },
    { top: '48%', left: '52%' },
    { top: '64%', left: '74%' },
  ]

  return (
    <Link
      to="/spots"
      className="relative block h-[120px] overflow-hidden rounded-spot bg-gradient-to-br from-[#dde7dd] via-[#cfdfd8] to-[#e9e3d3] shadow-[0_8px_22px_rgba(18,47,42,0.08)] sm:h-[140px]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 25%, rgba(18,47,42,.08) 2px, transparent 2px), radial-gradient(circle at 70% 60%, rgba(18,47,42,.06) 2px, transparent 2px)',
          backgroundSize: '46px 46px',
        }}
        aria-hidden
      />
      {pinSpots.map((s, i) => (
        <span
          key={s.id}
          className="absolute flex h-[26px] w-[26px] items-center justify-center rounded-[50%_50%_50%_4px] shadow-[0_4px_10px_rgba(0,0,0,.2)]"
          style={{
            top: positions[i]?.top,
            left: positions[i]?.left,
            background: i === 0 ? '#e6935a' : '#122f2a',
            transform: 'rotate(-45deg)',
          }}
          title={s.title_en}
        >
          <span className="text-[10px] leading-none text-white" style={{ transform: 'rotate(45deg)' }}>
            ◎
          </span>
        </span>
      ))}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[rgba(18,47,42,0.85)] via-transparent to-transparent px-3.5 py-3">
        <p className="font-display text-[13px] font-semibold text-white sm:text-[15px]">
          {countLabel.en}
        </p>
        <p className="font-thai text-[10px] text-[rgba(245,242,232,0.75)] sm:text-[11px]">
          {countLabel.th}
        </p>
      </div>
    </Link>
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
        <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-teal-darker">
          {spot.title_en}
        </p>
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
  const { tt } = useLang()
  const authName = useAuthDisplayName()
  const [chip, setChip] = useState<DiscoverChip>('all')
  const [query, setQuery] = useState('')
  const [spots, setSpots] = useState<PhotoSpotDetail[]>([])
  const [loading, setLoading] = useState(true)
  const saen = TEAM_MEMBERS.find((m) => m.id === 'saen')

  const helloGuest = tt('discover.hello')
  const helloNamed = tt('discover.helloNamed')
  const headlineBi = tt('discover.headline')
  const searchBi = tt('discover.search')
  const filterBi = tt('discover.filter')
  const masterpieceBi = tt('discover.masterpiece')
  const nearbyBi = tt('discover.nearby')
  const latestBi = tt('discover.latest')
  const mapTeaserBi = tt('discover.mapTeaser')
  const seeAllBi = tt('discover.seeAll')
  const emptyTitle = tt('discover.emptyTitle')
  const emptyBody = tt('discover.emptyBody')
  const clearBi = tt('discover.clearFilters')

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
    return spots.filter((s) => {
      if (!chipMatchesSpot(s, chip)) return false
      if (!q) return true
      return (
        s.title_en.toLowerCase().includes(q) ||
        s.title_th.includes(q) ||
        s.location_en.toLowerCase().includes(q) ||
        s.categories.some((c) => c.toLowerCase().includes(q)) ||
        (s.description_en?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [spots, chip, q])

  const filteredGallery = useMemo(() => {
    return GALLERY_PHOTOS.filter((p) => {
      if (!chipMatchesGallery(p, chip)) return false
      if (!q) return true
      return (
        p.caption_en.toLowerCase().includes(q) ||
        p.caption_th.includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.category.includes(q)
      )
    })
  }, [chip, q])

  const masterpiece = useMemo(() => {
    if (filteredSpots.length === 0) return null
    return [...filteredSpots].sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      return b.rating - a.rating || a.sort_order - b.sort_order
    })[0]
  }, [filteredSpots])

  const nearbySpots = useMemo(() => {
    if (!masterpiece) return filteredSpots.slice(0, 8)
    return filteredSpots.filter((s) => s.id !== masterpiece.id).slice(0, 8)
  }, [filteredSpots, masterpiece])

  const latestPhotos = useMemo(() => filteredGallery.slice(0, 8), [filteredGallery])

  const isEmpty = !loading && filteredSpots.length === 0 && latestPhotos.length === 0

  const spotCount = spots.length || filteredSpots.length || 4
  const mapOverlay = {
    en: mapTeaserBi.en.replace('{n}', String(spotCount)),
    th: mapTeaserBi.th.replace('{n}', String(spotCount)),
  }

  return (
    <div className="-mx-4 bg-cream-app pb-10 text-ink-app sm:-mx-6 lg:mx-0">
      <div className="mx-auto max-w-[960px]">
        <header className="bg-gradient-to-b from-teal-soft/80 from-0% to-cream-app to-[78%] px-4 pb-3.5 pt-3 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.04em] text-ink-app/55">
                {helloLine.en}
                <span className="ml-1.5 font-thai font-medium">{helloLine.th}</span>
              </p>
              <BiDisplayHeading
                en={headlineBi.en}
                th={headlineBi.th}
                as="h1"
                className="mt-0.5"
                enClassName="font-display text-[19px] font-semibold leading-tight tracking-tight text-teal-darker"
                thClassName="mt-0.5 font-thai text-sm font-medium text-ink-app/55"
              />
            </div>
            {saen ? (
              <div className="h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full border border-line">
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
                className="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-[11.5px] text-ink-app outline-none placeholder:text-ink-app/45 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
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
                  className={`inline-flex shrink-0 items-center gap-[5px] rounded-full px-3.5 py-2 text-[10.5px] font-semibold ${
                    active
                      ? 'border border-ink-app bg-ink-app text-white'
                      : 'border border-line bg-white text-ink-app/55'
                  }`}
                >
                  <ChipIcon className={`h-3 w-3 ${active ? 'text-orange-soft' : ''}`} />
                  {label.en}
                  <span className={`font-thai font-medium ${active ? 'text-white/80' : ''}`}>
                    {label.th}
                  </span>
                </button>
              )
            })}
          </div>
        </header>

        <div className="space-y-5 px-4 sm:px-6">
          {loading ? (
            <div className="h-[280px] animate-pulse rounded-spot bg-teal-soft/70" />
          ) : isEmpty ? (
            <section className="flex flex-col items-center rounded-spot bg-white px-6 py-12 text-center shadow-spot">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-soft text-teal-mid">
                <CompassEmptyIcon className="h-7 w-7" />
              </span>
              <BiDisplayHeading
                en={emptyTitle.en}
                th={emptyTitle.th}
                as="h2"
                className="mt-4"
                enClassName="text-xl font-semibold text-teal-darker"
                thClassName="mt-1 text-sm font-medium text-ink-app/55"
              />
              <p className="mt-2 max-w-sm text-sm text-ink-app/70">
                {emptyBody.en}
                <span className="mt-1 block font-thai">{emptyBody.th}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setChip('all')
                  setQuery('')
                }}
                className="mt-6 rounded-full bg-ink-app px-5 py-2.5 text-sm font-semibold text-white"
              >
                {clearBi.en}
                <span className="ml-1.5 font-thai font-medium text-white/80">{clearBi.th}</span>
              </button>
            </section>
          ) : (
            <>
              {masterpiece ? (
                <section>
                  <SectionLabel
                    en={masterpieceBi.en}
                    th={masterpieceBi.th}
                    seeAllTo="/spots"
                    seeAllEn={seeAllBi.en}
                    seeAllTh={seeAllBi.th}
                  />
                  <MasterpieceCard spot={masterpiece} />
                </section>
              ) : null}

              <section>
                <MapTeaser
                  spots={filteredSpots.length ? filteredSpots : spots}
                  countLabel={mapOverlay}
                />
              </section>

              {latestPhotos.length > 0 ? (
                <section>
                  <SectionLabel
                    en={latestBi.en}
                    th={latestBi.th}
                    seeAllTo="/gallery"
                    seeAllEn={seeAllBi.en}
                    seeAllTh={seeAllBi.th}
                  />
                  <GalleryAuthenticityNote className="mb-3" />
                  <LatestWorkGrid photos={latestPhotos} />
                </section>
              ) : null}

              {nearbySpots.length > 0 ? (
                <section>
                  <SectionLabel
                    en={nearbyBi.en}
                    th={nearbyBi.th}
                    seeAllTo="/spots"
                    seeAllEn={seeAllBi.en}
                    seeAllTh={seeAllBi.th}
                  />
                  <div className="hide-scrollbar flex gap-2.5 overflow-x-auto pb-1">
                    {nearbySpots.map((spot) => (
                      <NearbySpotCard key={spot.id} spot={spot} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
