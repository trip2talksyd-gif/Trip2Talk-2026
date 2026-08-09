import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  filterDiscoverSpots,
  getDiscoverSpots,
  getMasterpiece,
  type DiscoverChip,
  type DiscoverSpot,
} from '../../data/discoverFeed'
import { photoThumbSrc } from '../../data/galleryPhotos'
import { TEAM_MEMBERS } from '../../data/teamMembers'
import TeamAvatar from '../../components/about/TeamAvatar'

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
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  )
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      stroke="currentColor"
      strokeWidth={1.7}
      fill={filled ? 'currentColor' : 'none'}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  )
}

function ApertureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 3 3.5 9H21M12 3 8.5 12H3M8.5 12 12 21l3.5-9" />
    </svg>
  )
}

function IsoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 10h3v4H8zM14 10h2v4M14 14h2" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 18.4l.9-5.4-3.9-3.8 5.4-.8z" />
    </svg>
  )
}

const CHIPS: { id: DiscoverChip; en: string; th: string }[] = [
  { id: 'all', en: 'All', th: 'ทั้งหมด' },
  { id: 'aurora', en: 'Aurora', th: 'ออโรร่า' },
  { id: 'portrait', en: 'Portrait', th: 'พอร์ตเทรต' },
  { id: 'nature', en: 'Nature', th: 'ธรรมชาติ' },
]

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
  children: React.ReactNode
  className?: string
}) {
  const cls = `flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-opacity hover:opacity-90 motion-reduce:transition-none ${className}`
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
  return (
    <article className="overflow-hidden rounded-spot bg-white shadow-spot">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-teal-soft">
        <img
          src={photoThumbSrc(spot.photo, { width: 900, quality: 72 })}
          alt={`${spot.titleEn} / ${spot.titleTh}`}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget
            if (spot.photo.url && img.src !== spot.photo.url) img.src = spot.photo.url
          }}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <CircleBtn
            label="Back"
            onClick={() => navigate(-1)}
            className="bg-white/85 text-teal-dark"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </CircleBtn>
          <CircleBtn
            label={liked ? 'Remove favorite' : 'Save favorite'}
            onClick={onToggleLike}
            className="bg-white/85 text-orange"
          >
            <HeartIcon className="h-5 w-5" filled={liked} />
          </CircleBtn>
        </div>
      </div>

      <div className="space-y-3 px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold leading-tight text-ink-app">
              {spot.titleEn}
            </h2>
            <p className="mt-1 font-thai text-sm font-medium text-ink-app/55">{spot.titleTh}</p>
          </div>
          <p className="flex shrink-0 items-center gap-1 text-sm font-semibold text-orange">
            <StarIcon className="h-4 w-4" />
            {spot.rating.toFixed(1)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/20 px-3 py-1.5 text-[11px] font-semibold text-orange-deep">
            <SunIcon className="h-3.5 w-3.5" />
            {spot.goldenHourEn}
            <span className="font-thai font-medium opacity-80">· {spot.goldenHourTh}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1.5 text-[11px] font-semibold text-teal-mid">
            <ApertureIcon className="h-3.5 w-3.5" />
            {spot.fStop}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1.5 text-[11px] font-semibold text-teal-mid">
            <IsoIcon className="h-3.5 w-3.5" />
            ISO {spot.iso}
          </span>
        </div>

        <Link
          to={`/trips/${spot.tripCode}`}
          className="flex items-center gap-3 rounded-2xl bg-teal-dark px-4 py-3 text-white transition-opacity hover:opacity-95"
        >
          <span className="min-w-0 flex-1 text-sm leading-snug">
            <span className="block font-semibold">Shoot this on a Trip2Talk trip</span>
            <span className="mt-0.5 block font-thai text-[12px] text-white/75">
              จองทริปถ่ายภาพพร้อมช่างภาพที่โลเคชันนี้
            </span>
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange text-white">
            <ArrowRightIcon className="h-5 w-5" />
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
  return (
    <article className="w-[46%] shrink-0 overflow-hidden rounded-2xl bg-white shadow-spot sm:w-44">
      <div className="relative aspect-[3/4] overflow-hidden bg-teal-soft">
        <img
          src={photoThumbSrc(spot.photo, { width: 420, quality: 68 })}
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
          label={liked ? 'Remove favorite' : 'Save favorite'}
          onClick={onToggleLike}
          className="absolute right-2 top-2 h-8 w-8 bg-white/85 text-orange"
        >
          <HeartIcon className="h-4 w-4" filled={liked} />
        </CircleBtn>
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink-app">
          {spot.titleEn}
          <span className="mt-0.5 block font-thai text-[11px] font-medium text-ink-app/55">
            {spot.titleTh}
          </span>
        </h3>
        <p className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-mid">
          <SunIcon className="h-3 w-3" />
          {spot.timeOfDayEn}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] text-ink-app/50">{spot.location}</span>
          <CircleBtn
            label={`Open ${spot.titleEn}`}
            to={`/photo-guide/mobile`}
            className="h-8 w-8 bg-teal-dark text-white"
          >
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </CircleBtn>
        </div>
      </div>
    </article>
  )
}

export default function DiscoverPage() {
  const [chip, setChip] = useState<DiscoverChip>('all')
  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const saen = TEAM_MEMBERS.find((m) => m.id === 'saen')

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

  const masterpiece = useMemo(() => getMasterpiece(filtered.length ? filtered : spots), [filtered, spots])
  const nearby = useMemo(() => {
    const rest = filtered.filter((s) => s.id !== masterpiece?.id)
    return rest.slice(0, 12)
  }, [filtered, masterpiece])

  const toggleLike = (id: string) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="-mx-4 bg-cream-app pb-8 text-ink-app sm:-mx-6 lg:mx-0">
      {/* Top wash + greeting */}
      <header className="bg-gradient-to-b from-teal-soft to-cream-app px-4 pb-4 pt-2 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-mid">
              Hello, traveler
              <span className="ml-1.5 font-thai font-medium normal-case tracking-normal">สวัสดี</span>
            </p>
            <h1 className="mt-1 font-display text-[1.65rem] font-semibold leading-tight text-ink-app">
              Where to shoot next?
              <span className="mt-1 block font-thai text-base font-medium text-ink-app/55">
                จะไปถ่ายที่ไหนต่อดี?
              </span>
            </h1>
          </div>
          {saen ? (
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-orange ring-offset-2 ring-offset-cream-app">
              <TeamAvatar
                srcs={saen.photoSrcs}
                alt={saen.nameEn}
                initial={saen.initial}
                className="!h-11 !w-11 !border-0 !shadow-none sm:!h-11 sm:!w-11"
              />
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="pointer-events-none absolute left-3.5 text-teal-mid">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search spots · ค้นหามุมถ่าย"
              className="w-full rounded-full border-0 bg-white py-3 pl-10 pr-4 text-sm text-ink-app shadow-sm outline-none placeholder:text-ink-app/40"
              aria-label="Search photo spots"
            />
          </label>
          <button
            type="button"
            aria-label="Filter spots"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-dark text-orange-soft"
          >
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {CHIPS.map((c) => {
            const active = chip === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setChip(c.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-teal-dark text-white'
                    : 'bg-white text-teal-mid shadow-sm'
                }`}
              >
                {active ? <SunIcon className="h-3.5 w-3.5 text-orange-soft" /> : null}
                {c.en}
                <span className={`font-thai font-medium ${active ? 'text-white/80' : ''}`}>
                  {c.th}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      <div className="space-y-7 px-4 sm:px-6">
        {masterpiece ? (
          <section aria-labelledby="masterpiece-heading">
            <h2 id="masterpiece-heading" className="sr-only">
              Masterpiece
            </h2>
            <MasterpieceCard
              spot={masterpiece}
              liked={Boolean(liked[masterpiece.id])}
              onToggleLike={() => toggleLike(masterpiece.id)}
            />
          </section>
        ) : (
          <div className="h-72 animate-pulse rounded-spot bg-teal-soft/80" aria-hidden />
        )}

        <section aria-labelledby="nearby-heading">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 id="nearby-heading" className="font-display text-xl font-semibold text-ink-app">
              Nearby spots
              <span className="mt-0.5 block font-thai text-sm font-medium text-ink-app/55">
                มุมถ่ายใกล้เคียง
              </span>
            </h2>
            <Link
              to="/gallery"
              className="pb-1 text-sm font-semibold text-orange-deep"
            >
              See all
              <span className="ml-1 font-thai font-medium">ดูทั้งหมด</span>
            </Link>
          </div>

          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
            {nearby.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-56 w-[46%] shrink-0 animate-pulse rounded-2xl bg-teal-soft/80 sm:w-44"
                  />
                ))
              : nearby.map((spot) => (
                  <NearbyCard
                    key={spot.id}
                    spot={spot}
                    liked={Boolean(liked[spot.id])}
                    onToggleLike={() => toggleLike(spot.id)}
                  />
                ))}
          </div>
        </section>
      </div>
    </div>
  )
}
