import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { List, Map as MapIcon } from 'lucide-react'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
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

function SpotCard({ spot }: { spot: PhotoSpotDetail }) {
  const img = spot.thumbSrc ?? spot.heroSrc
  const badge = badgeForSpot(spot)
  return (
    <Link
      to={`/spots/${spot.slug}`}
      className="block overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_20px_rgba(18,47,42,0.06)] transition hover:border-teal-dark/20"
    >
      <div className="relative h-[140px] bg-teal-soft sm:h-[160px]">
        {img ? (
          <img
            src={img}
            alt={`${spot.title_en} / ${spot.title_th}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-soft">
          {badge}
        </span>
      </div>
      <div className="px-3.5 py-3">
        <p className="text-[14px] font-bold text-ink-app">{spot.title_en}</p>
        <p className="mt-0.5 font-thai text-[12px] text-ink-app/55">
          {spot.title_th}
          <span className="text-ink-app/35"> · {spot.location_en}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-app/55">
          {spot.drive_time_from_sydney ? (
            <span>
              🚗 <b className="text-teal-dark">{spot.drive_time_from_sydney}</b>
            </span>
          ) : null}
          {spot.best_time ? (
            <span>
              ☀ <b className="text-teal-dark">{spot.best_time}</b>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

function MapPreviewCard({ spot }: { spot: PhotoSpotDetail }) {
  const img = spot.thumbSrc ?? spot.heroSrc
  return (
    <Link
      to={`/spots/${spot.slug}`}
      className="flex gap-3 rounded-2xl bg-white p-3 shadow-[0_14px_34px_rgba(0,0,0,0.16)]"
    >
      <div className="h-[74px] w-[74px] shrink-0 overflow-hidden rounded-xl bg-teal-soft">
        {img ? (
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-ink-app">{spot.title_en}</p>
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
        <p className="mt-2 text-[11px] font-bold text-orange-deep">ดูรายละเอียด + เส้นทาง →</p>
      </div>
    </Link>
  )
}

export default function SpotsPage() {
  const { tt } = useLang()
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

  return (
    <div className="mx-auto min-h-[70dvh] w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
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
            {mapBi.en}
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold ${
              view === 'list' ? 'bg-teal-dark text-cream' : 'text-ink-app/55'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            {listBi.en}
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORY_CHIPS.map((chip) => {
          const active = category === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setCategory(chip.id)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-semibold ${
                active
                  ? 'border-teal-dark bg-teal-dark text-cream'
                  : 'border-line bg-white text-ink-app/55'
              }`}
            >
              {chip.en}
              <span className="ml-1 font-thai opacity-80">{chip.th}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="mt-10 text-center text-sm text-teal-mid">…</p>
      ) : (
        <>
          {/* Desktop: map + list side by side */}
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
                  <MapPreviewCard spot={selected} />
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
                    {bi.en}
                  </button>
                ))}
              </div>
              <div className="grid gap-3">
                {filtered.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile / tablet: toggle views */}
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
                    <MapPreviewCard spot={selected} />
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
                      {bi.en}
                      <span className="ml-1 font-thai opacity-80">{bi.th}</span>
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
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
