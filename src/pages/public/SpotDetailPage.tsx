import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { photoSrc, photoThumbSrc } from '../../data/galleryPhotos'
import { getDiscoverSpots, type DiscoverSpot } from '../../data/discoverFeed'
import { useLang } from '../../hooks/useLang'
import { fetchPhotoSpotByKey, type PhotoSpotDetail } from '../../lib/photoSpotsApi'

const ICON = {
  stroke: 'currentColor',
  strokeWidth: 1.7,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M15 6l-6 6 6 6" />
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

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M20 14.5A7.5 7.5 0 0 1 9.5 4 7.6 7.6 0 0 0 4 11.5 7.5 7.5 0 0 0 11.5 19 7.6 7.6 0 0 0 20 14.5z" />
    </svg>
  )
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M5 16l1.2-4.2A2 2 0 0 1 8.1 10h7.8a2 2 0 0 1 1.9 1.8L19 16" />
      <path d="M5 16h14v2a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z" />
    </svg>
  )
}

function TrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <rect x="6" y="3" width="12" height="14" rx="2" />
      <path d="M8 17l-2 4M16 17l2 4M6 10h12M10 6h4" />
    </svg>
  )
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...ICON}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function SectionCard({
  titleEn,
  titleTh,
  children,
}: {
  titleEn: string
  titleTh: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[18px] border border-teal-dark/10 bg-white p-4 shadow-[0_6px_16px_rgba(18,47,42,0.06)]">
      <h2 className="font-display text-[17px] font-semibold text-teal-darker">
        {titleEn}
        <span className="mt-0.5 block font-thai text-[13px] font-medium text-ink-app/55">
          {titleTh}
        </span>
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

function InfoBlock({
  icon,
  labelEn,
  labelTh,
  body,
}: {
  icon: ReactNode
  labelEn: string
  labelTh: string
  body: string
}) {
  return (
    <div className="rounded-xl bg-cream/80 px-3 py-2.5">
      <div className="flex items-center gap-2 text-teal-dark">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-soft text-teal-dark">
          {icon}
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-darker">
            {labelEn}
          </p>
          <p className="font-thai text-[10px] text-ink-app/50">{labelTh}</p>
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-app/80">{body}</p>
    </div>
  )
}

export default function SpotDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tt } = useLang()
  const [spot, setSpot] = useState<PhotoSpotDetail | null>(null)
  const [galleryFallback, setGalleryFallback] = useState<DiscoverSpot | null>(null)
  const [loading, setLoading] = useState(true)
  const [gearTab, setGearTab] = useState<'landscape' | 'portrait'>('landscape')

  const backBi = tt('spot.back')
  const bestBi = tt('spot.bestTime')
  const morningBi = tt('spot.morning')
  const eveningBi = tt('spot.evening')
  const nightBi = tt('spot.night')
  const accessBi = tt('spot.access')
  const carBi = tt('spot.privateCar')
  const transitBi = tt('spot.publicTransport')
  const gearBi = tt('spot.gear')
  const landscapeBi = tt('spot.gearLandscape')
  const portraitBi = tt('spot.gearPortrait')
  const mapsBi = tt('spot.openMaps')
  const ctaBi = tt('spot.cta')
  const ctaSoonBi = tt('spot.ctaSoon')
  const missingBi = tt('spot.missing')
  const soonBi = tt('spot.librarySoon')
  const droneBi = tt('spot.drone')
  const droneAllowedBi = tt('spot.droneAllowed')
  const droneRestrictedBi = tt('spot.droneRestricted')
  const droneProhibitedBi = tt('spot.droneProhibited')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setGalleryFallback(null)
    fetchPhotoSpotByKey(id).then((row) => {
      if (cancelled) return
      setSpot(row)
      if (!row) {
        const feedHit = getDiscoverSpots().find((s) => s.id === id) ?? null
        setGalleryFallback(feedHit)
      }
      setLoading(false)
      if (row?.gear_portrait) setGearTab('landscape')
    })
    return () => {
      cancelled = true
    }
  }, [id])

  const timeBlocks = useMemo(() => {
    if (!spot) return []
    const blocks: { key: string; labelEn: string; labelTh: string; body: string; Icon: typeof SunIcon }[] =
      []
    if (spot.best_time_morning) {
      blocks.push({
        key: 'morning',
        labelEn: morningBi.en,
        labelTh: morningBi.th,
        body: spot.best_time_morning,
        Icon: SunIcon,
      })
    }
    if (spot.best_time_evening) {
      blocks.push({
        key: 'evening',
        labelEn: eveningBi.en,
        labelTh: eveningBi.th,
        body: spot.best_time_evening,
        Icon: SunIcon,
      })
    }
    if (spot.best_time_night) {
      blocks.push({
        key: 'night',
        labelEn: nightBi.en,
        labelTh: nightBi.th,
        body: spot.best_time_night,
        Icon: MoonIcon,
      })
    }
    return blocks
  }, [spot, morningBi, eveningBi, nightBi])

  const showPortrait = Boolean(spot?.gear_portrait)
  const hero = spot?.thumbSrc ?? spot?.heroSrc ?? (spot?.photo ? photoSrc(spot.photo) : null)

  if (loading) {
    return (
      <div className="min-h-[70dvh] bg-cream px-4 py-16 text-center text-sm text-teal-mid">
        …
      </div>
    )
  }

  if (!spot) {
    if (galleryFallback) {
      const fbHero = photoThumbSrc(galleryFallback.photo, {
        width: 960,
        quality: 72,
        format: 'webp',
      })
      return (
        <div className="relative min-h-[100dvh] bg-cream pb-16">
          <div className="relative h-[42vh] min-h-[220px] overflow-hidden bg-teal-dark">
            <img
              src={fbHero}
              alt={`${galleryFallback.titleEn} / ${galleryFallback.titleTh}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cream/95 text-teal-dark shadow"
              aria-label={`${backBi.en} / ${backBi.th}`}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="relative z-[1] -mt-8 px-4">
            <header className="rounded-[18px] border border-teal-dark/10 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(18,47,42,0.08)]">
              <h1 className="font-display text-[22px] font-semibold text-teal-darker">
                {galleryFallback.titleEn}
                <span className="mt-1 block font-thai text-[15px] font-medium text-ink-app/60">
                  {galleryFallback.titleTh}
                </span>
              </h1>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-app/70">{soonBi.en}</p>
              <p className="mt-1 font-thai text-[12px] text-ink-app/50">{soonBi.th}</p>
              {galleryFallback.tripCode ? (
                <Link
                  to={`/trips/${galleryFallback.tripCode}`}
                  className="mt-4 inline-flex text-[12px] font-bold text-orange-deep"
                >
                  {galleryFallback.tripCode}
                </Link>
              ) : null}
            </header>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-[70dvh] bg-cream px-4 py-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-teal-dark"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {backBi.en}
        </button>
        <h1 className="font-display text-2xl text-teal-darker">{missingBi.en}</h1>
        <p className="mt-2 font-thai text-ink-app/60">{missingBi.th}</p>
        <Link to="/discover" className="mt-6 inline-block text-sm font-bold text-orange-deep">
          Discover
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] bg-cream pb-[8.5rem] md:pb-16">
      <div className="-mx-4 sm:-mx-6 lg:-mx-10">
        <div className="relative h-[38vh] min-h-[200px] max-h-[380px] overflow-hidden bg-teal-dark">
          {hero ? (
            <img
              src={hero}
              alt={`${spot.title_en} / ${spot.title_th}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                const img = e.currentTarget
                if (spot.heroSrc && img.src !== spot.heroSrc) img.src = spot.heroSrc
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-dark to-teal-mid text-cream/80">
              <CameraIcon className="h-12 w-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-teal-dark/15 to-transparent" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cream/95 text-teal-dark shadow"
            aria-label={`${backBi.en} / ${backBi.th}`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        </div>

        {spot.drone_allowed === 'prohibited' ? (
          <div
            role="alert"
            className="border-y-4 border-[#5c1408] bg-[#b91c1c] px-4 py-4 text-white shadow-[0_12px_32px_rgba(127,29,29,0.55)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#fecaca]">
              Legal ban · No drones
            </p>
            <p className="mt-1 text-[16px] font-black leading-snug tracking-tight text-white">
              {droneProhibitedBi.en}
            </p>
            <p className="mt-0.5 font-thai text-[14px] font-bold text-[#fee2e2]">
              {droneProhibitedBi.th}
            </p>
            {spot.drone_notes ? (
              <p className="mt-2 border-t border-white/25 pt-2 text-[13px] font-semibold leading-relaxed text-[#fff1f2]">
                {spot.drone_notes}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="relative z-[1] mt-4 space-y-4 px-4">
        <header className="rounded-[18px] border border-teal-dark/10 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(18,47,42,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-[22px] font-semibold leading-tight text-teal-darker">
                {spot.title_en}
                <span className="mt-1 block font-thai text-[15px] font-medium text-ink-app/60">
                  {spot.title_th}
                </span>
              </h1>
              <p className="mt-2 flex items-start gap-1.5 text-[12px] text-teal-mid">
                <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {spot.location_en}
                  <span className="mt-0.5 block font-thai text-[11px] text-ink-app/45">
                    {spot.location_th}
                  </span>
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-orange-soft/80 px-2.5 py-1 text-[12px] font-bold text-orange-deep">
              <StarIcon className="h-3 w-3" />
              {spot.rating.toFixed(1)}
            </div>
          </div>
          {spot.mapsUrl ? (
            <a
              href={spot.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-[12px] font-bold text-orange-deep"
            >
              {mapsBi.en}
              <span className="mx-1 text-ink-app/30">·</span>
              <span className="font-thai font-semibold">{mapsBi.th}</span>
            </a>
          ) : null}
        </header>

        {spot.drone_allowed !== 'prohibited' ? (
          <SectionCard titleEn={droneBi.en} titleTh={droneBi.th}>
            <InfoBlock
              icon={<CameraIcon className="h-3.5 w-3.5" />}
              labelEn={
                spot.drone_allowed === 'allowed' ? droneAllowedBi.en : droneRestrictedBi.en
              }
              labelTh={
                spot.drone_allowed === 'allowed' ? droneAllowedBi.th : droneRestrictedBi.th
              }
              body={
                spot.drone_notes ??
                (spot.drone_allowed === 'allowed' ? droneAllowedBi.en : droneRestrictedBi.en)
              }
            />
          </SectionCard>
        ) : null}

        {timeBlocks.length > 0 ? (
          <SectionCard titleEn={bestBi.en} titleTh={bestBi.th}>
            {timeBlocks.map((b) => (
              <InfoBlock
                key={b.key}
                icon={<b.Icon className="h-3.5 w-3.5" />}
                labelEn={b.labelEn}
                labelTh={b.labelTh}
                body={b.body}
              />
            ))}
          </SectionCard>
        ) : null}

        <SectionCard titleEn={accessBi.en} titleTh={accessBi.th}>
          <InfoBlock
            icon={<CarIcon className="h-3.5 w-3.5" />}
            labelEn={carBi.en}
            labelTh={carBi.th}
            body={spot.access_private_car}
          />
          {spot.access_public_transport ? (
            <InfoBlock
              icon={<TrainIcon className="h-3.5 w-3.5" />}
              labelEn={transitBi.en}
              labelTh={transitBi.th}
              body={spot.access_public_transport}
            />
          ) : null}
        </SectionCard>

        {(spot.gear_landscape || spot.gear_portrait) && (
          <SectionCard titleEn={gearBi.en} titleTh={gearBi.th}>
            {showPortrait ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGearTab('landscape')}
                  className={`flex-1 rounded-full px-3 py-2 text-[11px] font-bold ${
                    gearTab === 'landscape'
                      ? 'bg-teal-dark text-cream'
                      : 'bg-teal-soft text-teal-dark'
                  }`}
                >
                  {landscapeBi.en}
                  <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-80">
                    {landscapeBi.th}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setGearTab('portrait')}
                  className={`flex-1 rounded-full px-3 py-2 text-[11px] font-bold ${
                    gearTab === 'portrait'
                      ? 'bg-teal-dark text-cream'
                      : 'bg-teal-soft text-teal-dark'
                  }`}
                >
                  {portraitBi.en}
                  <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-80">
                    {portraitBi.th}
                  </span>
                </button>
              </div>
            ) : null}

            {(!showPortrait || gearTab === 'landscape') && spot.gear_landscape ? (
              <InfoBlock
                icon={<CameraIcon className="h-3.5 w-3.5" />}
                labelEn={landscapeBi.en}
                labelTh={landscapeBi.th}
                body={spot.gear_landscape}
              />
            ) : null}
            {showPortrait && gearTab === 'portrait' && spot.gear_portrait ? (
              <InfoBlock
                icon={<CameraIcon className="h-3.5 w-3.5" />}
                labelEn={portraitBi.en}
                labelTh={portraitBi.th}
                body={spot.gear_portrait}
              />
            ) : null}
          </SectionCard>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-20 border-t border-teal-dark/10 bg-cream/95 px-4 py-3 backdrop-blur md:static md:mt-6 md:border-0 md:bg-transparent md:px-4 md:py-0 md:backdrop-blur-none">
        {spot.linked_trip_code ? (
          <Link
            to={`/trips/${spot.linked_trip_code}`}
            className="flex w-full items-center justify-between gap-3 rounded-full bg-teal-dark px-5 py-3.5 text-cream shadow-[0_8px_20px_rgba(18,47,42,0.25)]"
          >
            <span className="min-w-0 text-left">
              <span className="block text-[13px] font-semibold leading-snug">{ctaBi.en}</span>
              <span className="mt-0.5 block font-thai text-[11px] text-cream/75">{ctaBi.th}</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-orange">
                {spot.linked_trip_code}
              </span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange text-teal-darker">
              →
            </span>
          </Link>
        ) : (
          <div className="rounded-full border border-dashed border-teal-dark/25 bg-white px-5 py-3.5 text-center">
            <p className="text-[12px] font-semibold text-teal-mid">{ctaSoonBi.en}</p>
            <p className="mt-0.5 font-thai text-[11px] text-ink-app/45">{ctaSoonBi.th}</p>
          </div>
        )}
      </div>
    </div>
  )
}
