import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import { getDiscoverSpots } from '../../data/discoverFeed'
import { photoThumbSrc } from '../../data/galleryPhotos'
import { useLang } from '../../hooks/useLang'
import {
  fetchPhotoSpotByKey,
  navigateMapsUrl,
  type PhotoSpotDetail,
} from '../../lib/photoSpotsApi'

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SettingPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-line bg-white px-2.5 py-1.5 font-mono text-[11px] text-ink-app/65">
      <span className="text-ink-app/40">{label} </span>
      {value}
    </span>
  )
}

export default function SpotDetailPage() {
  const { id = '', slug = '' } = useParams<{ id?: string; slug?: string }>()
  const key = slug || id
  const navigate = useNavigate()
  const { tt } = useLang()
  const [spot, setSpot] = useState<PhotoSpotDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'landscape' | 'portrait'>('landscape')
  const galleryFallback = useMemo(
    () => (!loading && !spot ? (getDiscoverSpots().find((s) => s.id === key) ?? null) : null),
    [loading, spot, key],
  )

  const backBi = tt('spot.back')
  const missingBi = tt('spot.missing')
  const soonBi = tt('spot.librarySoon')
  const navigateBi = tt('spots.navigate')
  const tripCtaBi = tt('spots.tripCta')
  const tipsBi = tt('spots.tips')
  const settingsBi = tt('spots.cameraSettings')
  const landscapeBi = tt('spot.gearLandscape')
  const portraitBi = tt('spot.gearPortrait')
  const droneProhibitedBi = tt('spot.droneProhibited')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPhotoSpotByKey(key).then((row) => {
      if (cancelled) return
      setSpot(row)
      if (row && !row.camera_settings.portrait && !row.gear_portrait) {
        setMode('landscape')
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [key])

  const mapsHref = useMemo(() => (spot ? navigateMapsUrl(spot) : null), [spot])
  const cam = mode === 'portrait' ? spot?.camera_settings.portrait : spot?.camera_settings.landscape
  const gearNote = mode === 'portrait' ? spot?.gear_portrait : spot?.gear_landscape
  const showPortraitToggle = Boolean(
    spot?.camera_settings.portrait || spot?.gear_portrait,
  )
  const hero = spot?.thumbSrc ?? spot?.heroSrc

  if (loading) {
    return (
      <div className="min-h-[70dvh] bg-cream px-4 py-16 text-center text-sm text-teal-mid">…</div>
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
              <BiDisplayHeading
                en={galleryFallback.titleEn}
                th={galleryFallback.titleTh}
                as="h1"
                enClassName="text-[22px] font-semibold text-teal-darker"
                thClassName="mt-1 text-[15px] font-medium text-ink-app/60"
              />
              <p className="mt-3 text-[13px] leading-relaxed text-ink-app/70">{soonBi.en}</p>
              <p className="mt-1 font-thai text-[12px] text-ink-app/50">{soonBi.th}</p>
              <div className="mt-4 flex gap-2">
                <Link to="/spots" className="text-[12px] font-bold text-orange-deep">
                  Photo Spots
                </Link>
                {galleryFallback.tripCode ? (
                  <Link
                    to={`/trips/${galleryFallback.tripCode}`}
                    className="text-[12px] font-bold text-teal-dark"
                  >
                    {galleryFallback.tripCode}
                  </Link>
                ) : null}
              </div>
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
        <Link to="/spots" className="mt-6 inline-block text-sm font-bold text-orange-deep">
          Photo Spots
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] bg-cream pb-[7.5rem] md:pb-16">
      <div className="-mx-4 sm:-mx-6 lg:-mx-10">
        <div className="relative h-[38vh] min-h-[220px] max-h-[420px] overflow-hidden bg-teal-dark">
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
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-dark to-teal-mid text-cream/70">
              Photo Spot
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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
          <div role="alert" className="border-y-4 border-[#5c1408] bg-[#b91c1c] px-4 py-3 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#fecaca]">
              Legal ban · No drones
            </p>
            <p className="mt-1 text-[15px] font-black">{droneProhibitedBi.en}</p>
            <p className="font-thai text-[13px] font-bold text-[#fee2e2]">{droneProhibitedBi.th}</p>
            {spot.drone_notes ? (
              <p className="mt-2 border-t border-white/25 pt-2 text-[12px] font-semibold leading-relaxed text-[#fff1f2]">
                {spot.drone_notes}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-4 pt-4">
        <header>
          <BiDisplayHeading
            en={spot.title_en}
            th={spot.title_th}
            as="h1"
            enClassName="font-display text-[24px] font-bold leading-tight text-teal-darker"
            thClassName="mt-1 font-thai text-[14px] text-ink-app/55"
          />
          <p className="mt-1 text-[12px] text-teal-mid">
            {spot.location_en}
            <span className="text-ink-app/35"> · </span>
            <span className="font-thai">{spot.location_th}</span>
          </p>
          {spot.description_en ? (
            <p className="mt-3 text-[13px] leading-relaxed text-ink-app/70">{spot.description_en}</p>
          ) : null}
          {spot.description_th ? (
            <p className="mt-1 font-thai text-[12px] leading-relaxed text-ink-app/50">
              {spot.description_th}
            </p>
          ) : null}
        </header>

        <div className="flex flex-wrap gap-2">
          {spot.best_time ? (
            <span className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-app/60">
              Best time <b className="text-orange-deep">{spot.best_time}</b>
            </span>
          ) : null}
          {spot.best_season ? (
            <span className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-app/60">
              Season <b className="text-orange-deep">{spot.best_season}</b>
            </span>
          ) : null}
          {spot.drive_time_from_sydney ? (
            <span className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-app/60">
              From Sydney <b className="text-orange-deep">{spot.drive_time_from_sydney}</b>
            </span>
          ) : null}
        </div>

        {spot.warnings_en || spot.warnings_th ? (
          <div className="rounded-[10px] border border-[rgba(201,147,46,0.3)] bg-amber-bg px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-[#7a5c1c]">
            {spot.warnings_en ? <p>{spot.warnings_en}</p> : null}
            {spot.warnings_th ? (
              <p className="mt-1 font-thai text-[11px] font-medium opacity-90">{spot.warnings_th}</p>
            ) : null}
          </div>
        ) : null}

        {(cam || gearNote || showPortraitToggle) && (
          <section>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-teal-darker">
              {settingsBi.en}
              <span className="ml-1 font-thai font-medium normal-case tracking-normal text-ink-app/45">
                {settingsBi.th}
              </span>
            </p>
            {showPortraitToggle ? (
              <div className="mb-3 flex rounded-full border border-line bg-white p-1">
                <button
                  type="button"
                  onClick={() => setMode('landscape')}
                  className={`flex-1 rounded-full px-3 py-2 text-[11px] font-bold ${
                    mode === 'landscape' ? 'bg-teal-dark text-cream' : 'text-ink-app/50'
                  }`}
                >
                  {landscapeBi.en}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('portrait')}
                  className={`flex-1 rounded-full px-3 py-2 text-[11px] font-bold ${
                    mode === 'portrait' ? 'bg-teal-dark text-cream' : 'text-ink-app/50'
                  }`}
                >
                  {portraitBi.en}
                </button>
              </div>
            ) : null}
            {cam ? (
              <div className="flex flex-wrap gap-1.5">
                {cam.aperture ? <SettingPill label="ƒ" value={cam.aperture} /> : null}
                {cam.iso ? <SettingPill label="ISO" value={cam.iso} /> : null}
                {cam.shutter ? <SettingPill label="S" value={cam.shutter} /> : null}
                {cam.filter ? <SettingPill label="Filter" value={cam.filter} /> : null}
              </div>
            ) : null}
            {gearNote ? (
              <p className="mt-3 text-[13px] leading-relaxed text-ink-app/70">{gearNote}</p>
            ) : null}
          </section>
        )}

        {(spot.tips_en || spot.tips_th) && (
          <section>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-teal-darker">
              {tipsBi.en}
              <span className="ml-1 font-thai font-medium normal-case tracking-normal text-ink-app/45">
                {tipsBi.th}
              </span>
            </p>
            {spot.tips_en ? (
              <p className="text-[13px] leading-relaxed text-ink-app/70">{spot.tips_en}</p>
            ) : null}
            {spot.tips_th ? (
              <p className="mt-1 font-thai text-[12px] leading-relaxed text-ink-app/50">{spot.tips_th}</p>
            ) : null}
          </section>
        )}

        {(spot.best_time_morning || spot.best_time_evening || spot.best_time_night) && (
          <section className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-teal-darker">More timing</p>
            <ul className="mt-2 space-y-2 text-[12px] leading-relaxed text-ink-app/70">
              {spot.best_time_morning ? (
                <li>
                  <b className="text-teal-dark">Morning — </b>
                  {spot.best_time_morning}
                </li>
              ) : null}
              {spot.best_time_evening ? (
                <li>
                  <b className="text-teal-dark">Evening — </b>
                  {spot.best_time_evening}
                </li>
              ) : null}
              {spot.best_time_night ? (
                <li>
                  <b className="text-teal-dark">Night — </b>
                  {spot.best_time_night}
                </li>
              ) : null}
            </ul>
          </section>
        )}

        {spot.access_private_car ? (
          <section className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-teal-darker">Access</p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-app/70">{spot.access_private_car}</p>
            {spot.access_public_transport ? (
              <p className="mt-2 text-[12px] leading-relaxed text-ink-app/70">
                <b className="text-teal-dark">Transit — </b>
                {spot.access_public_transport}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:px-4 md:py-0 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl gap-2">
          {mapsHref ? (
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center rounded-full border-[1.5px] border-teal-dark px-4 py-3 text-center text-[12px] font-bold text-teal-dark"
            >
              {navigateBi.en}
              <span className="mx-1 opacity-40">/</span>
              <span className="font-thai">{navigateBi.th}</span>
            </a>
          ) : null}
          <Link
            to={spot.tripHref}
            className="flex-[1.4] rounded-full bg-orange px-4 py-3 text-center text-[12px] font-bold text-ink-app shadow-[0_8px_18px_rgba(230,147,90,0.35)]"
          >
            {tripCtaBi.en}
            <span className="mt-0.5 block font-thai text-[10px] font-semibold opacity-80">
              {tripCtaBi.th}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
