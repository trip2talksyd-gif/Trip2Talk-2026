import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { MOBILE_ANGLES } from '../../data/photoGuideContent'
import { photoImageAttrs, photoThumbSrc, type GalleryPhoto } from '../../data/galleryPhotos'
import { STORAGE_SIZES } from '../../lib/storageImage'
import { galleryByIds } from './PhotoSlideshow'
import BiText from '../ui/BiText'
import { useInView } from '../../hooks/useInView'

const SWIPE_PX = 40

const TRIP_SWATCHES = [
  { id: 'ulu-001', labelEn: 'Uluru', labelTh: 'อูลูรู', fallback: 'from-[#c45a2a] to-[#7a2e12]' },
  { id: 'nz-013', labelEn: 'Milford Sound', labelTh: 'มิลฟอร์ดซาวด์', fallback: 'from-[#1a5c5a] to-[#0d2f3a]' },
  { id: 'tas-004', labelEn: 'Tasmania', labelTh: 'แทสเมเนีย', fallback: 'from-[#5b3a6e] to-[#1e1430]' },
] as const

function AngleMediaCarousel({ photos, alt }: { photos: GalleryPhoto[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const touchX = useRef<number | null>(null)
  const len = photos.length

  if (len === 0) return null

  function go(next: number) {
    if (len <= 1) return
    setIndex(((next % len) + len) % len)
  }

  function onTouchStart(e: TouchEvent) {
    touchX.current = e.touches[0]?.clientX ?? null
  }

  function onTouchEnd(e: TouchEvent) {
    if (touchX.current == null) return
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current
    touchX.current = null
    if (Math.abs(dx) < SWIPE_PX) return
    go(dx < 0 ? index + 1 : index - 1)
  }

  return (
    <div className="relative">
      <div
        className="relative aspect-video overflow-hidden rounded-2xl bg-white/5"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex h-full w-full transition-transform duration-[450ms] ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {photos.map((photo) => (
            <img
              key={photo.id}
              {...photoImageAttrs(photo, 'hero', STORAGE_SIZES.hero)}
              alt={alt}
              loading="lazy"
              className="h-full w-full shrink-0 object-cover"
              draggable={false}
            />
          ))}
        </div>

        {len > 1 && (
          <>
            <span className="absolute right-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white">
              {index + 1}/{len}
            </span>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(index - 1)}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(index + 1)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </>
        )}
      </div>

      {len > 1 && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              aria-label={`Photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-5 bg-coral' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AngleCard({
  angle,
  tipLabel,
  cardRef,
  active,
}: {
  angle: (typeof MOBILE_ANGLES)[number]
  tipLabel: { en: string; th: string }
  cardRef: (el: HTMLElement | null) => void
  active: boolean
}) {
  const { ref: revealRef, isVisible } = useInView<HTMLElement>(0.15)
  const photos = galleryByIds([...angle.photoIds])

  return (
    <article
      id={`angle-card-${angle.n}`}
      data-angle={angle.n}
      ref={(el) => {
        revealRef.current = el
        cardRef(el)
      }}
      className={`rounded-3xl bg-white/5 p-5 transition-[opacity,transform] duration-700 ease-out sm:p-6 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 lg:translate-x-16'
      } ${active ? 'ring-1 ring-white/15' : ''}`}
    >
      <span className="font-serif text-[15px] font-light tracking-wide text-coral" aria-hidden>
        {angle.n}
      </span>
      <h3 className="mt-2 font-serif text-[17px] font-normal leading-snug tracking-wide text-white sm:text-[18px]">
        {angle.titleEn}
        <span className="mt-1 block font-thai text-[14px] font-medium tracking-normal text-white/80">
          {angle.titleTh}
        </span>
      </h3>

      {photos.length > 0 && (
        <div className="mt-4">
          <AngleMediaCarousel photos={photos} alt={`${angle.titleEn} / ${angle.titleTh}`} />
        </div>
      )}

      <p className="mt-4 text-base leading-[1.65] text-white/80">
        {angle.bodyEn}
        <span className="mt-1.5 block font-thai text-[15px] font-medium leading-[1.65] text-white/75">
          {angle.bodyTh}
        </span>
      </p>
      <p className="mt-3 leading-[1.6]">
        <span className="font-extrabold uppercase tracking-[0.06em] text-coral">
          {tipLabel.en}
          <span className="ml-1 font-thai text-[12px] font-bold normal-case tracking-normal text-coral/90">
            {tipLabel.th}
          </span>
        </span>
        <span className="mt-1 block text-[14.5px] leading-[1.65] text-white/70">
          {angle.tipEn}
          <span className="mt-1 block font-thai text-[14px] font-medium leading-[1.65] text-white/65">
            {angle.tipTh}
          </span>
        </span>
      </p>
    </article>
  )
}

function TripCrossSellBanner() {
  const { tt } = useLang()
  const eyebrow = tt('photoGuide.mobile.angles.cta.eyebrow')
  const title = tt('photoGuide.mobile.angles.cta.title')
  const sub = tt('photoGuide.mobile.angles.cta.sub')
  const button = tt('photoGuide.mobile.angles.cta.button')

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-coral/25 bg-gradient-to-br from-coral/15 via-white/5 to-transparent p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex shrink-0 items-end pl-1">
          {TRIP_SWATCHES.map((swatch, i) => {
            const photo = galleryByIds([swatch.id])[0]
            return (
              <div
                key={swatch.id}
                className="relative h-16 w-[52px] overflow-hidden rounded-lg border border-white/20 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.7)]"
                style={{ marginLeft: i === 0 ? 0 : -14, zIndex: TRIP_SWATCHES.length - i }}
              >
                {photo ? (
                  <img
                    src={photoThumbSrc(photo, { width: 320, quality: 68, format: 'webp' })}
                    alt={`${swatch.labelEn} / ${swatch.labelTh}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className={`h-full w-full bg-gradient-to-br ${swatch.fallback}`} />
                )}
                <span className="absolute bottom-1 left-1 text-[9px] drop-shadow" aria-hidden>
                  📍
                </span>
              </div>
            )
          })}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-coral">
            {eyebrow.en}
            <span className="ml-1.5 font-thai normal-case tracking-normal opacity-90">
              {eyebrow.th}
            </span>
          </p>
          <BiText
            as="p"
            en={title.en}
            th={title.th}
            serif
            className="mt-1 text-[16px] text-white sm:text-[17px]"
            thClassName="mt-0.5 block font-thai text-[14px] font-medium text-white/80"
          />
          <BiText
            as="p"
            en={sub.en}
            th={sub.th}
            className="mt-1.5 text-[14px] leading-[1.65] text-white/70"
            thClassName="mt-1 block font-thai text-[13px] font-medium leading-[1.65] text-white/65"
          />
        </div>

        <Link
          to="/trips"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-coral px-4 py-2.5 text-center text-[12px] font-bold leading-tight text-cream no-underline transition-opacity hover:opacity-95"
        >
          <span>
            {button.en}
            <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-95">
              {button.th}
            </span>
          </span>
        </Link>
      </div>
    </div>
  )
}

/** Sticky-nav + reveal cards for Angles to Try (desktop sticky; mobile stacked). */
export default function MobileAnglesSection() {
  const { tt } = useLang()
  const eyebrowBi = tt('photoGuide.mobile.angles.eyebrow')
  const titleBi = tt('photoGuide.mobile.angles.title')
  const introBi = tt('photoGuide.mobile.angles.intro')
  const tipBi = tt('photoGuide.mobile.angles.tip')

  const [active, setActive] = useState<(typeof MOBILE_ANGLES)[number]['n']>(MOBILE_ANGLES[0].n)
  const cardEls = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    // Defer so card refs from mount are registered.
    const id = window.setTimeout(() => {
      const nodes = [...cardEls.current.values()]
      if (nodes.length === 0) return

      const ratios = new Map<string, number>()
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const n = (entry.target as HTMLElement).dataset.angle
            if (!n) continue
            ratios.set(n, entry.isIntersecting ? entry.intersectionRatio : 0)
          }
          let best: (typeof MOBILE_ANGLES)[number]['n'] = MOBILE_ANGLES[0].n
          let bestRatio = -1
          for (const angle of MOBILE_ANGLES) {
            const r = ratios.get(angle.n) ?? 0
            if (r > bestRatio) {
              bestRatio = r
              best = angle.n
            }
          }
          if (bestRatio > 0) setActive(best)
        },
        { threshold: [0.15, 0.35, 0.55, 0.7, 0.85] },
      )

      for (const el of nodes) observer.observe(el)
      cleanup = () => observer.disconnect()
    }, 0)

    let cleanup: (() => void) | undefined
    return () => {
      window.clearTimeout(id)
      cleanup?.()
    }
  }, [])

  function scrollToAngle(n: string) {
    cardEls.current.get(n)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const headingBlock = (
    <>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-coral">
        {eyebrowBi.en}
        <span className="ml-1.5 font-thai normal-case tracking-normal opacity-90">
          {eyebrowBi.th}
        </span>
      </p>
      <BiText
        as="h2"
        en={titleBi.en}
        th={titleBi.th}
        serif
        className="mt-3 text-[28px] font-normal leading-tight tracking-tight text-white sm:text-[34px]"
        thClassName="mt-2 block font-thai text-[17px] font-medium text-white/85 sm:text-[19px]"
      />
      <BiText
        as="p"
        en={introBi.en}
        th={introBi.th}
        className="mt-4 max-w-xl text-base leading-[1.7] text-white/80"
        thClassName="mt-2 block font-thai text-[15px] font-medium leading-[1.7] text-white/75"
      />
    </>
  )

  return (
    <section
      className="relative left-1/2 mt-10 w-screen max-w-[100vw] -translate-x-1/2 px-4 py-12 sm:px-6 sm:py-14 md:px-10"
      style={{ background: '#141414' }}
      aria-label={`${titleBi.en} / ${titleBi.th}`}
    >
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(280px,400px)_minmax(0,1fr)] lg:gap-24">
        <aside className="lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col lg:justify-between lg:py-10">
          <div className="lg:contents">
            <div>{headingBlock}</div>
            <nav className="mt-6 hidden space-y-1 lg:mt-8 lg:block" aria-label="Angle list">
              {MOBILE_ANGLES.map((angle) => {
                const isActive = active === angle.n
                return (
                  <button
                    key={angle.n}
                    type="button"
                    onClick={() => scrollToAngle(angle.n)}
                    className={`flex w-full items-baseline gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-white/10 text-white' : 'text-white/55 hover:text-white/80'
                    }`}
                  >
                    <span className={`font-serif text-[14px] ${isActive ? 'text-coral' : ''}`}>
                      {angle.n}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium leading-snug">
                        {angle.titleEn}
                      </span>
                      <span className="mt-0.5 block font-thai text-[13px] text-white/70">
                        {angle.titleTh}
                      </span>
                    </span>
                  </button>
                )
              })}
            </nav>
            <p className="mt-6 hidden items-center gap-1.5 text-[12px] text-white/55 lg:mt-auto lg:flex">
              <MapPin className="h-3 w-3 text-coral" aria-hidden />
              Scroll to explore each angle
              <span className="font-thai text-white/55"> · เลื่อนดูทีละมุม</span>
            </p>
          </div>
        </aside>

        <div className="mt-8 space-y-5 lg:mt-0 lg:space-y-8 lg:py-10">
          {MOBILE_ANGLES.map((angle) => (
            <AngleCard
              key={angle.n}
              angle={angle}
              tipLabel={tipBi}
              active={active === angle.n}
              cardRef={(el) => {
                if (el) cardEls.current.set(angle.n, el)
                else cardEls.current.delete(angle.n)
              }}
            />
          ))}
          <TripCrossSellBanner />
        </div>
      </div>
    </section>
  )
}
