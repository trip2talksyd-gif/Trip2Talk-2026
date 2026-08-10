import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Heart, List, Map as MapIcon, X } from 'lucide-react'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import SpotMedia from '../../components/spots/SpotMedia'
import SpotsMap from '../../components/spots/SpotsMap'
import { useLang } from '../../hooks/useLang'
import {
  badgeForSpot,
  fetchPhotoSpots,
  filterSpotsByCategory,
  sortPhotoSpots,
  type PhotoSpotDetail,
  type SpotSort,
} from '../../lib/photoSpotsApi'

const CATEGORY_CHIPS = [
  { id: 'All', en: 'All', th: 'ทั้งหมด' },
  { id: 'Aurora', en: 'Aurora', th: 'ออโรร่า' },
  { id: 'Portrait', en: 'Portrait', th: 'พอร์ตเทรต' },
  { id: 'Landscape', en: 'Landscape', th: 'วิว' },
  { id: 'Coastal', en: 'Coastal', th: 'ชายฝั่ง' },
  { id: 'Night', en: 'Night', th: 'กลางคืน' },
] as const

const FAV_KEY = 't2t_spot_favorites'

function readFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    return new Set(Array.isArray(parsed) ? parsed.map(String) : [])
  } catch {
    return new Set()
  }
}

function writeFavorites(ids: Set<string>) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...ids]))
}

function topBadgeLabel(spot: PhotoSpotDetail): string {
  const best = spot.best_time?.trim()
  if (best) {
    const night = /night|dark|aurora|moon|blue\s*hour|after\s*dark/i.test(best)
    return `${night ? '🌙' : '☀️'} ${best}`
  }
  const cat = badgeForSpot(spot)
  if (/night|aurora/i.test(cat)) return `🌙 ${cat}`
  return cat
}

function SpotCard({ spot }: { spot: PhotoSpotDetail }) {
  const { lang } = useLang()
  const [fav, setFav] = useState(false)
  const category = badgeForSpot(spot)
  const title = lang === 'th' ? spot.title_th : spot.title_en
  const location = lang === 'th' ? spot.location_th : spot.location_en

  useEffect(() => {
    setFav(readFavorites().has(spot.id) || readFavorites().has(spot.slug))
  }, [spot.id, spot.slug])

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !fav
    setFav(next)
    const set = readFavorites()
    if (next) {
      set.add(spot.id)
      set.add(spot.slug)
    } else {
      set.delete(spot.id)
      set.delete(spot.slug)
    }
    writeFavorites(set)
  }

  return (
    <article className="relative h-[158px] overflow-hidden rounded-[20px] bg-teal-darker shadow-[0_10px_24px_rgba(18,47,42,0.1)] sm:h-[180px] lg:h-[200px]">
      <Link
        to={`/spots/${spot.slug}`}
        className="absolute inset-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2"
        aria-label={`${spot.title_en} / ${spot.title_th}`}
      >
        <SpotMedia
          spot={spot}
          className="absolute inset-0 h-full w-full"
          iconSize="lg"
          alt=""
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(12,33,29,0.9), rgba(12,33,29,0.15) 60%, transparent)',
          }}
          aria-hidden
        />

        {/* Top-left light/category badge */}
        <span className="absolute left-3 top-3 z-[1] max-w-[70%] truncate rounded-full bg-[rgba(255,255,255,0.92)] px-2.5 py-1 text-[9.5px] font-bold text-teal-darker">
          {topBadgeLabel(spot)}
        </span>

        {/* Bottom copy + glass pills */}
        <div className="absolute inset-x-0 bottom-0 z-[1] flex items-end justify-between gap-2 p-3.5">
          <div className="min-w-0 flex-1 pr-1">
            <p className="font-display truncate text-[14.5px] font-bold leading-tight text-white">
              {title}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-white/70">{location}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {spot.drive_time_from_sydney ? (
                <span className="rounded-full border border-[rgba(230,147,90,0.55)] bg-[rgba(230,147,90,0.35)] px-2 py-0.5 text-[9.5px] font-semibold text-orange-soft backdrop-blur-[8px]">
                  {spot.drive_time_from_sydney}
                </span>
              ) : null}
              <span className="rounded-full border border-white/20 bg-white/[0.14] px-2 py-0.5 text-[9.5px] font-semibold text-white/90 backdrop-blur-[8px]">
                {category}
              </span>
            </div>
          </div>

          <span
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-orange text-teal-darker shadow-[0_6px_14px_rgba(230,147,90,0.45)]"
            aria-hidden
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </div>
      </Link>

      {/* Favorite — outside Link so it doesn't navigate */}
      <button
        type="button"
        onClick={toggleFav}
        className="absolute right-3 top-3 z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full border border-white/25 bg-white/25 text-white backdrop-blur-[8px] transition hover:bg-white/40"
        aria-label={fav ? 'Remove favorite' : 'Save favorite'}
        aria-pressed={fav}
      >
        <Heart
          className={`h-3.5 w-3.5 ${fav ? 'fill-orange text-orange' : ''}`}
          strokeWidth={1.9}
        />
      </button>
    </article>
  )
}

function MapPreviewCard({
  spot,
  onDismiss,
}: {
  spot: PhotoSpotDetail
  onDismiss: () => void
}) {
  return (
    <div
      className="t2t-map-preview pointer-events-auto overflow-hidden rounded-2xl border border-white/40 bg-white shadow-[0_18px_40px_rgba(18,47,42,0.22)]"
      role="dialog"
      aria-label={`${spot.title_en} preview`}
    >
      <div className="flex gap-0">
        <SpotMedia spot={spot} className="h-[96px] w-[96px] shrink-0 sm:h-[108px] sm:w-[108px]" iconSize="md" />
        <div className="relative min-w-0 flex-1 px-3.5 py-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDismiss()
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-cream text-ink-app/45 transition hover:bg-line hover:text-ink-app"
            aria-label="Close preview"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
          <p className="pr-8 truncate text-[14px] font-bold leading-snug text-ink-app">{spot.title_en}</p>
          <p className="mt-0.5 truncate font-thai text-[11px] text-ink-app/55">
            {spot.title_th} · {spot.location_en}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {spot.categories.slice(0, 3).map((c) => (
              <span
                key={c}
                className="rounded-full border border-line bg-cream px-2 py-0.5 text-[9px] font-semibold text-ink-app/55"
              >
                {c}
              </span>
            ))}
          </div>
          <Link
            to={`/spots/${spot.slug}`}
            className="mt-2.5 inline-flex min-h-9 items-center gap-1 rounded-full bg-teal-dark px-3.5 py-1.5 text-[12px] font-bold text-cream transition hover:bg-teal-darker active:scale-[0.98]"
          >
            See details
            <span className="font-thai font-medium opacity-80">/ ดูรายละเอียด</span>
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SpotsPage() {
  const { tt, lang } = useLang()
  const titleBi = tt('spots.title')
  const subBi = tt('spots.subtitle')
  const mapBi = tt('spots.viewMap')
  const listBi = tt('spots.viewList')
  const sortNearestBi = tt('spots.sortNearest')
  const sortPopularBi = tt('spots.sortPopular')
  const sortNewestBi = tt('spots.sortNewest')

  const [spots, setSpots] = useState<PhotoSpotDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'map' | 'list'>('map')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<SpotSort>('nearest')
  const [selected, setSelected] = useState<PhotoSpotDetail | null>(null)

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

  const filtered = useMemo(() => {
    const byCat = filterSpotsByCategory(spots, category)
    return sortPhotoSpots(byCat, sort)
  }, [spots, category, sort])

  useEffect(() => {
    if (!selected) return
    if (!filtered.some((s) => s.id === selected.id)) setSelected(null)
  }, [filtered, selected])

  const filterActive = category !== 'All'

  return (
    <div className="mx-auto min-h-[70dvh] w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
      <style>{`
        @keyframes t2t-preview-in {
          from { opacity: 0; transform: translateY(14px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .t2t-map-preview {
          animation: t2t-preview-in 0.28s ease-out both;
        }
      `}</style>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <BiDisplayHeading
            en={titleBi.en}
            th={titleBi.th}
            as="h1"
            enClassName="font-display text-[26px] font-bold text-teal-darker sm:text-[30px]"
            thClassName="mt-0.5 font-thai text-[13px] text-ink-app/55"
          />
          <p className="mt-1 text-[13px] text-ink-app/60">
            {subBi.en.replace('{n}', String(spots.length))}
            <span className="mx-1.5 text-ink-app/25">·</span>
            <span className="font-thai">{subBi.th.replace('{n}', String(spots.length))}</span>
          </p>
        </div>

        <div className="inline-flex rounded-full border border-line bg-white p-1">
          <button
            type="button"
            onClick={() => setView('map')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold ${
              view === 'map' ? 'bg-teal-dark text-cream' : 'text-ink-app/55'
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            {lang === 'th' ? mapBi.th : mapBi.en}
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold ${
              view === 'list' ? 'bg-teal-dark text-cream' : 'text-ink-app/55'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            {lang === 'th' ? listBi.th : listBi.en}
          </button>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORY_CHIPS.map((chip) => {
          const active = category === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setCategory(chip.id)}
              className={`shrink-0 rounded-full border px-[13px] py-[7px] text-[10px] font-bold transition ${
                active
                  ? 'border-orange bg-orange text-ink-app'
                  : 'border-[rgba(27,29,25,0.1)] bg-white text-ink-app/70'
              }`}
            >
              {lang === 'th' ? chip.th : chip.en}
            </button>
          )
        })}
      </div>
      {filterActive ? (
        <p className="mt-2 text-[11px] font-semibold text-teal-mid">
          Showing {filtered.length} · แสดง {filtered.length} (map + list)
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 text-center text-sm text-teal-mid">…</p>
      ) : (
        <>
          {/* Desktop: map + list side by side — both use the same `filtered` set */}
          <div className="mt-5 hidden gap-5 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
            <div className="relative sticky top-4 h-[min(72vh,680px)]">
              <SpotsMap
                spots={filtered}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
                className="h-full"
              />
              {selected ? (
                <div className="absolute inset-x-4 bottom-4 z-[500]">
                  <MapPreviewCard spot={selected} onDismiss={() => setSelected(null)} />
                </div>
              ) : null}
            </div>
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {(
                  [
                    ['nearest', sortNearestBi],
                    ['popular', sortPopularBi],
                    ['newest', sortNewestBi],
                  ] as const
                ).map(([key, bi]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSort(key)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                      sort === key
                        ? 'border-orange bg-orange text-ink-app'
                        : 'border-line bg-white text-ink-app/55'
                    }`}
                  >
                    {lang === 'th' ? bi.th : bi.en}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 xl:grid-cols-2">
                {filtered.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile / tablet: toggle views — same `filtered` for map pins and list cards */}
          <div className="mt-5 lg:hidden">
            {view === 'map' ? (
              <div className="relative h-[min(68dvh,560px)]">
                <SpotsMap
                  spots={filtered}
                  selectedId={selected?.id ?? null}
                  onSelect={setSelected}
                  className="h-full"
                />
                {selected ? (
                  <div className="absolute inset-x-3 bottom-3 z-[500]">
                    <MapPreviewCard spot={selected} onDismiss={() => setSelected(null)} />
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap gap-2">
                  {(
                    [
                      ['nearest', sortNearestBi],
                      ['popular', sortPopularBi],
                      ['newest', sortNewestBi],
                    ] as const
                  ).map(([key, bi]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSort(key)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                        sort === key
                          ? 'border-orange bg-orange text-ink-app'
                          : 'border-line bg-white text-ink-app/55'
                      }`}
                    >
                      {lang === 'th' ? bi.th : bi.en}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {filtered.map((spot) => (
                    <SpotCard key={spot.id} spot={spot} />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
