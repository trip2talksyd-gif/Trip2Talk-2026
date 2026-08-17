import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import SpotMedia from './SpotMedia'
import LetterboxPhoto from './LetterboxPhoto'
import AutoplayClip, { isCompressedWebMp4 } from './AutoplayClip'
import type { PhotoSpotDetail } from '../../lib/photoSpotsApi'
import { storageImageAttrs, STORAGE_SIZES } from '../../lib/storageImage'

type HeroSlide = { kind: 'video'; src: string } | { kind: 'image'; src: string }

const STORY_MS = 3200
/** Matches the slide CSS duration — user nav cannot stack while a slide is moving. */
const TRANSITION_MS = 450
const FAV_KEY = 't2t_spot_favorites'

/** Desktop mouse/trackpad: large tap zones steal hover/tap-to-click. Touch keeps them. */
function isFinePointerHover() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  )
}

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

/** Ordered unique image URLs: hero first, then gallery (cap 5).
 * Prefer uploaded hero/gallery; fall back to a single gallery-linked preview. */
export function spotHeroImages(spot: PhotoSpotDetail): string[] {
  const out: string[] = []
  const push = (url: string | null | undefined) => {
    const u = url?.trim()
    if (!u || out.includes(u)) return
    out.push(u)
  }
  push(spot.hero_image_url)
  for (const g of spot.gallery_image_urls ?? []) push(g)
  if (out.length === 0) {
    push(spot.heroSrc ?? spot.thumbSrc)
  }
  return out.slice(0, 5)
}

/** Video first (if a compressed `_web.mp4`), then hero + gallery. Video does not replace photos. */
export function spotHeroSlides(spot: PhotoSpotDetail): HeroSlide[] {
  const slides: HeroSlide[] = []
  const video = spot.video_url?.trim()
  if (video && isCompressedWebMp4(video)) {
    slides.push({ kind: 'video', src: video })
  }
  for (const src of spotHeroImages(spot)) {
    if (slides.some((s) => s.src === src)) continue
    slides.push({ kind: 'image', src })
  }
  return slides
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

type Props = {
  spot: PhotoSpotDetail
  onBack: () => void
  backLabel: string
}

export default function SpotHeroCarousel({ spot, onBack, backLabel }: Props) {
  const slides = useMemo(() => spotHeroSlides(spot), [spot])
  const multi = slides.length > 1
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [fav, setFav] = useState(false)
  const [cycle, setCycle] = useState(0)

  const remainingRef = useRef(STORY_MS)
  const holdTimerRef = useRef<number | null>(null)
  const holdingRef = useRef(false)
  const suppressClickRef = useRef(false)
  const lastNavAtRef = useRef(0)

  useEffect(() => {
    setFav(readFavorites().has(spot.id) || readFavorites().has(spot.slug))
  }, [spot.id, spot.slug])

  useEffect(() => {
    setIndex(0)
    setProgress(0)
    remainingRef.current = STORY_MS
    setCycle((c) => c + 1)
  }, [spot.id, slides.length])

  const go = useCallback(
    (dir: -1 | 1, fromUser = false) => {
      if (!multi) return
      const now = performance.now()
      if (fromUser && now - lastNavAtRef.current < TRANSITION_MS) return
      lastNavAtRef.current = now
      setIndex((i) => (i + dir + slides.length) % slides.length)
      setProgress(0)
      remainingRef.current = STORY_MS
      setCycle((c) => c + 1)
    },
    [slides.length, multi],
  )

  // Auto-advance with pause support (rAF drives the active bar fill).
  useEffect(() => {
    if (!multi || paused) return

    let raf = 0
    const budget = remainingRef.current
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const p = Math.min(1, elapsed / budget)
      setProgress(p)
      if (p >= 1) {
        remainingRef.current = STORY_MS
        go(1)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      const elapsed = performance.now() - start
      remainingRef.current = Math.max(TRANSITION_MS, budget - elapsed)
    }
  }, [multi, paused, cycle, go])

  const toggleFav = () => {
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

  /** Touch press-and-hold pauses; mouse uses container hover. Long-press must not advance. */
  const onPointerDownHold = (e: React.PointerEvent) => {
    if (!multi || e.pointerType === 'mouse') return
    holdTimerRef.current = window.setTimeout(() => {
      holdingRef.current = true
      suppressClickRef.current = true
      setPaused(true)
    }, 150)
  }
  const onPointerUpHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    if (holdingRef.current) {
      holdingRef.current = false
      setPaused(false)
    }
  }
  const onTapZone = (dir: -1 | 1) => {
    if (isFinePointerHover()) return
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    go(dir, true)
  }

  const barFill = (i: number) => {
    if (i < index) return 100
    if (i > index) return 0
    return progress * 100
  }

  return (
    <div
      className="relative h-[min(52vh,440px)] min-h-[260px] overflow-hidden bg-teal-darker sm:h-[min(48vh,480px)]"
      onMouseEnter={() => multi && setPaused(true)}
      onMouseLeave={() => multi && setPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-[450ms] ease-[cubic-bezier(0.22,0.8,0.3,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.length > 0 ? (
          slides.map((slide, i) => {
            const attrs =
              slide.kind === 'image'
                ? storageImageAttrs(slide.src, 'hero', STORAGE_SIZES.fullBleed)
                : null
            const videoActive = slide.kind === 'video' && i === index && !(multi && paused)
            return (
            <div key={`${slide.kind}-${slide.src}`} className="relative h-full min-w-full shrink-0">
              {slide.kind === 'video' ? (
                <AutoplayClip
                  src={slide.src}
                  poster={spot.heroSrc ?? undefined}
                  pauseOffscreen={false}
                  active={videoActive}
                  className="h-full w-full object-contain object-center"
                />
              ) : attrs ? (
                <LetterboxPhoto
                  src={attrs.src}
                  srcSet={attrs.srcSet}
                  sizes={attrs.sizes}
                  alt={`${spot.title_en} ${i + 1}/${slides.length}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ) : null}
            </div>
            )
          })
        ) : (
          <div className="h-full min-w-full shrink-0">
            <SpotMedia spot={spot} variant="wide" className="h-full w-full" iconSize="lg" />
          </div>
        )}
      </div>

      {/* Bottom readability fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[rgba(12,33,29,0.94)] via-[rgba(12,33,29,0.35)] to-transparent"
        aria-hidden
      />

      {/* Story progress bars — multi only */}
      {multi ? (
        <div className="absolute left-3.5 right-3.5 top-3 z-[6] flex gap-1" aria-hidden>
          {slides.map((slide, i) => (
            <div
              key={`${spot.id}-bar-${slide.kind}-${i}`}
              className="h-[2.5px] flex-1 overflow-hidden rounded-sm bg-white/30"
            >
              <div
                className="h-full rounded-sm bg-white"
                style={{ width: `${barFill(i)}%` }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {/* Image counter */}
      {multi ? (
        <div className="absolute left-1/2 top-8 z-[9] -translate-x-1/2 rounded-full border border-white/15 bg-[rgba(18,47,42,0.5)] px-2.5 py-1 font-mono text-[9.5px] font-bold text-white backdrop-blur-[10px]">
          {index + 1} / {slides.length}
        </div>
      ) : null}

      {/* Glass back */}
      <button
        type="button"
        onClick={onBack}
        className="absolute left-3.5 top-8 z-[9] flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/20 bg-[rgba(18,47,42,0.42)] text-white backdrop-blur-[10px] transition hover:bg-[rgba(18,47,42,0.62)]"
        aria-label={backLabel}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {/* Glass favorite */}
      <button
        type="button"
        onClick={toggleFav}
        className="absolute right-3.5 top-8 z-[9] flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/20 bg-[rgba(18,47,42,0.42)] text-white backdrop-blur-[10px] transition hover:bg-[rgba(18,47,42,0.62)]"
        aria-label={fav ? 'Remove favorite' : 'Save favorite'}
        aria-pressed={fav}
      >
        <Heart
          className={`h-4 w-4 ${fav ? 'fill-orange text-orange' : ''}`}
          strokeWidth={1.8}
        />
      </button>

      {/* Touch tap zones — disabled for fine-pointer hover so trackpad tap-to-click
          cannot flip slides while the cursor moves across the image. */}
      {multi ? (
        <>
          <button
            type="button"
            className="absolute bottom-14 left-0 top-0 z-[8] w-[34%] bg-transparent [@media(hover:hover)_and_(pointer:fine)]:pointer-events-none"
            aria-label="Previous photo"
            onClick={() => onTapZone(-1)}
            onPointerDown={onPointerDownHold}
            onPointerUp={onPointerUpHold}
            onPointerCancel={onPointerUpHold}
          />
          <button
            type="button"
            className="absolute bottom-14 right-0 top-0 z-[8] w-[34%] bg-transparent [@media(hover:hover)_and_(pointer:fine)]:pointer-events-none"
            aria-label="Next photo"
            onClick={() => onTapZone(1)}
            onPointerDown={onPointerDownHold}
            onPointerUp={onPointerUpHold}
            onPointerCancel={onPointerUpHold}
          />
          <button
            type="button"
            className="absolute left-2 top-1/2 z-[9] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[rgba(18,47,42,0.42)] text-white backdrop-blur-[10px] transition hover:bg-[rgba(18,47,42,0.62)] [@media(hover:hover)_and_(pointer:fine)]:flex"
            aria-label="Previous photo"
            onClick={() => go(-1, true)}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 z-[9] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[rgba(18,47,42,0.42)] text-white backdrop-blur-[10px] transition hover:bg-[rgba(18,47,42,0.62)] [@media(hover:hover)_and_(pointer:fine)]:flex"
            aria-label="Next photo"
            onClick={() => go(1, true)}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {/* Glass info pills */}
      {(spot.best_time || spot.best_season || spot.drive_time_from_sydney) && (
        <div className="absolute inset-x-3.5 bottom-4 z-[6] flex flex-wrap gap-1.5">
          {spot.best_time ? (
            <span className="rounded-full border border-[rgba(230,147,90,0.5)] bg-[rgba(230,147,90,0.28)] px-3 py-1.5 text-[10px] font-semibold text-[rgba(245,242,232,0.85)] backdrop-blur-[14px]">
              Best time <b className="text-orange-soft">{spot.best_time}</b>
            </span>
          ) : null}
          {spot.best_season ? (
            <span className="rounded-full border border-white/15 bg-[rgba(18,47,42,0.5)] px-3 py-1.5 text-[10px] font-semibold text-[rgba(245,242,232,0.72)] backdrop-blur-[14px]">
              Season <b className="text-white">{spot.best_season}</b>
            </span>
          ) : null}
          {spot.drive_time_from_sydney ? (
            <span className="rounded-full border border-white/15 bg-[rgba(18,47,42,0.5)] px-3 py-1.5 text-[10px] font-semibold text-[rgba(245,242,232,0.72)] backdrop-blur-[14px]">
              Drive <b className="text-white">{spot.drive_time_from_sydney}</b>
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
