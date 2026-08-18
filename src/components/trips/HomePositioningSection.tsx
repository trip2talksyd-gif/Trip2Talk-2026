import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { GALLERY_PHOTOS, photoThumbSrc } from '../../data/galleryPhotos'
import { useLang } from '../../hooks/useLang'
import { fetchPhotoSpots } from '../../lib/photoSpotsApi'
import { fetchAllTours } from '../../lib/toursApi'

const POLAROID_IDS = ['ulu-001', 'ulu-003', 'nz-001', 'ulu-007'] as const

const POLAROID_POSE = [
  'left-1 top-2 -rotate-[11deg] sm:left-4 sm:top-4',
  'right-1 top-6 rotate-[9deg] sm:right-6 sm:top-2',
  'hidden sm:block left-8 bottom-24 rotate-[7deg]',
  'hidden sm:block right-10 bottom-20 -rotate-[8deg]',
] as const

function AccentBadge() {
  return (
    <span
      className="mx-1.5 inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-orange text-teal-darker shadow-[0_0_18px_rgba(230,147,90,0.55)] align-middle sm:mx-2 sm:h-[42px] sm:w-[42px]"
      aria-hidden
    >
      <Camera className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
    </span>
  )
}

function PolaroidStack() {
  const photos = POLAROID_IDS.map((id) => GALLERY_PHOTOS.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => p != null,
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          className={`pos-polaroid absolute w-[72px] sm:w-[88px] ${POLAROID_POSE[i] ?? ''}`}
          style={{ animationDelay: `${i * 0.45}s` }}
        >
          <div className="rounded-[4px] bg-cream p-1.5 pb-4 shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
            <img
              src={photoThumbSrc(photo, { width: 240, quality: 68, format: 'webp' })}
              alt=""
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

type Props = {
  spotCount?: number
}

/** Condensed homepage positioning — dark teal, CTAs, ticker. Long copy lives on /about. */
export default function HomePositioningSection({ spotCount }: Props) {
  const { tt, lang } = useLang()
  const badge = tt('home.positioning.badge')
  const subtitle = tt('home.positioning.subtitle')
  const tripsCta = tt('home.positioning.cta.trips')
  const galleryCta = tt('home.positioning.cta.gallery')
  const readStory = tt('home.positioning.readStory')
  const statTrips = tt('home.positioning.stat.trips')
  const statPhotographers = tt('home.positioning.stat.photographers')
  const statTravelers = tt('home.positioning.stat.travelers')
  const statSpots = tt('home.positioning.stat.spots')

  const [tripCount, setTripCount] = useState(13)
  const [spots, setSpots] = useState(spotCount ?? 44)

  useEffect(() => {
    if (spotCount != null && spotCount > 0) setSpots(spotCount)
  }, [spotCount])

  useEffect(() => {
    let cancelled = false
    void fetchAllTours()
      .then((rows) => {
        if (!cancelled && rows.length > 0) setTripCount(rows.length)
      })
      .catch(() => {
        /* keep fallback 13 */
      })
    if (spotCount == null) {
      void fetchPhotoSpots()
        .then((rows) => {
          if (!cancelled && rows.length > 0) setSpots(rows.length)
        })
        .catch(() => {
          /* keep fallback 44 */
        })
    }
    return () => {
      cancelled = true
    }
  }, [spotCount])

  const ticker = [
    { value: String(tripCount), label: statTrips },
    { value: '10+', label: statPhotographers },
    { value: '500+', label: statTravelers },
    { value: String(spots), label: statSpots },
  ]
  const loop = [...ticker, ...ticker]

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-teal-darker text-cream">
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14 md:px-10">
        <PolaroidStack />

        <div className="relative z-[1]">
          <span className="pos-badge-shimmer inline-flex items-center gap-2 rounded-full border border-orange/40 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-orange-soft">
            {lang === 'th' ? badge.th : badge.en}
          </span>

          <div className="mt-5 overflow-visible sm:mt-6">
            <h2
              lang="th"
              className="font-serif text-[28px] font-bold leading-normal text-cream sm:text-[40px] md:text-[48px]"
            >
              เราไม่ใช่
              <AccentBadge />
              <span className="pos-word-highlight relative inline-block pb-1">บริษัททัวร์</span>
            </h2>
            <p className="mt-2 font-display text-[16px] font-semibold text-cream/70 sm:text-[20px]">
              We&apos;re Not a Tour Company
            </p>
          </div>

          <p className="mt-4 max-w-xl font-display text-[16px] font-medium italic leading-snug text-cream/85 sm:text-[18px]">
            {subtitle.en}
          </p>
          <p
            lang="th"
            className="mt-1 max-w-xl font-serif text-[14px] font-medium leading-normal text-cream/75 sm:text-[15px]"
          >
            {subtitle.th}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              to="/trips"
              className="cta-shine inline-flex items-center justify-center rounded-full bg-orange px-[26px] py-[14px] text-[14px] font-bold text-teal-darker shadow-[0_0_28px_rgba(230,147,90,0.45)] transition hover:bg-orange-soft"
            >
              {lang === 'th' ? tripsCta.th : tripsCta.en}
            </Link>
            <Link
              to="/gallery"
              className="inline-flex items-center justify-center rounded-full border-[1.5px] border-cream/45 px-[26px] py-[14px] text-[14px] font-bold text-cream transition hover:border-orange hover:text-orange-soft"
            >
              {lang === 'th' ? galleryCta.th : galleryCta.en}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20 py-3">
        <div className="overflow-hidden">
          <div className="pos-ticker flex w-max gap-10 whitespace-nowrap px-6">
            {loop.map((item, i) => (
              <span key={`${item.value}-${i}`} className="inline-flex items-baseline gap-2 text-cream/85">
                <span className="font-display text-[15px] font-bold text-orange-soft">{item.value}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">
                  {lang === 'th' ? item.label.th : item.label.en}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="relative z-[1] mx-auto max-w-5xl px-4 pb-6 pt-5 sm:px-6 md:px-10">
        <Link
          to="/about"
          className={`text-[13px] font-medium text-orange-soft underline-offset-4 hover:underline ${
            lang === 'th' ? 'font-thai leading-normal' : ''
          }`}
        >
          {lang === 'th' ? readStory.th : readStory.en}
        </Link>
      </p>
    </section>
  )
}
