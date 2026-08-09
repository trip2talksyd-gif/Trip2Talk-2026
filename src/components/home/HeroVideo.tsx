import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

/** Hero reel — production Supabase `public-media` bucket (~51MB; stream, don't preload all). */
export const HERO_VIDEO_SRC =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/public-media/VDO/Hero_cover01.mp4'

/** Night-sky still while the reel buffers / if media truly fails. */
export const HERO_POSTER_SRC = '/brand/pin-gate-bg.webp'

const RATE_MIN = 0.25
const RATE_MAX = 4
const POINTER_RATE_LEFT = 0.3
const POINTER_RATE_CENTER = 1
const POINTER_RATE_RIGHT = 2.5
/** How quickly the live rate catches the pointer target (0–1 per frame). */
const LERP_FACTOR = 0.14
const LEAVE_EASE_MS = 600
const WHOOSH_PEAK = 3
const WHOOSH_UP_MS = 250
const WHOOSH_DOWN_MS = 400

export type HeroVideoHandle = {
  /** Brief CTA “whoosh”: ramp to ~3x then ease back to 1x. */
  whoosh: () => void
  /**
   * Drive scrubbing from the hero section (video layer is pointer-events-none
   * so it never blocks nav/CTAs). Pass `null` on leave / touch end.
   */
  setPointerX: (clientX: number | null) => void
}

type Props = {
  className?: string
}

function clampRate(n: number) {
  return Math.min(RATE_MAX, Math.max(RATE_MIN, n))
}

/** Left ≈ 0.3x · center ≈ 1x · right ≈ 2.5x */
function rateFromNormX(x: number): number {
  const t = Math.min(1, Math.max(0, x))
  if (t <= 0.5) {
    const u = t / 0.5
    return POINTER_RATE_LEFT + (POINTER_RATE_CENTER - POINTER_RATE_LEFT) * u
  }
  const u = (t - 0.5) / 0.5
  return POINTER_RATE_CENTER + (POINTER_RATE_RIGHT - POINTER_RATE_CENTER) * u
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/**
 * Full-bleed hero background video with interactive playbackRate “speed ramp”.
 *
 * Important: this layer is `pointer-events-none` so it can never freeze the UI.
 * Scrubbing is driven by the parent via `setPointerX`.
 */
const HeroVideo = forwardRef<HeroVideoHandle, Props>(function HeroVideo(
  { className = '' },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [mediaFailed, setMediaFailed] = useState(false)

  const currentRate = useRef(1)
  const targetRate = useRef(1)
  const reducedMotion = useRef(false)
  const interactive = useRef(true)
  const rafId = useRef(0)
  const leaveRaf = useRef(0)
  const whooshRaf = useRef(0)
  const whooshToken = useRef(0)

  const applyRate = useCallback((rate: number) => {
    const v = videoRef.current
    if (!v) return
    const next = clampRate(rate)
    currentRate.current = next
    try {
      if (Math.abs(v.playbackRate - next) > 0.01) v.playbackRate = next
    } catch {
      /* ignore */
    }
  }, [])

  const stopRaf = useCallback((idRef: { current: number }) => {
    if (idRef.current) {
      cancelAnimationFrame(idRef.current)
      idRef.current = 0
    }
  }, [])

  const ensureLerpLoop = useCallback(() => {
    if (!interactive.current || reducedMotion.current) return
    if (rafId.current) return

    const tick = () => {
      const cur = currentRate.current
      const tgt = targetRate.current
      const delta = tgt - cur
      if (Math.abs(delta) < 0.01) {
        applyRate(tgt)
        rafId.current = 0
        return
      }
      applyRate(cur + delta * LERP_FACTOR)
      rafId.current = requestAnimationFrame(tick)
    }
    rafId.current = requestAnimationFrame(tick)
  }, [applyRate])

  const easeBackToOne = useCallback(() => {
    if (!interactive.current || reducedMotion.current) return
    stopRaf(leaveRaf)
    stopRaf(whooshRaf)
    whooshToken.current += 1

    const from = currentRate.current
    const t0 = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / LEAVE_EASE_MS)
      const eased = 1 - (1 - t) ** 3
      targetRate.current = from + (1 - from) * eased
      applyRate(targetRate.current)
      if (t < 1) {
        leaveRaf.current = requestAnimationFrame(tick)
      } else {
        leaveRaf.current = 0
        targetRate.current = 1
        applyRate(1)
      }
    }
    leaveRaf.current = requestAnimationFrame(tick)
  }, [applyRate, stopRaf])

  const setPointerX = useCallback(
    (clientX: number | null) => {
      if (!interactive.current || reducedMotion.current) return
      if (clientX == null) {
        easeBackToOne()
        return
      }
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0) return
      const norm = (clientX - rect.left) / rect.width
      targetRate.current = rateFromNormX(norm)
      stopRaf(leaveRaf)
      stopRaf(whooshRaf)
      whooshToken.current += 1
      ensureLerpLoop()
    },
    [easeBackToOne, ensureLerpLoop, stopRaf],
  )

  const whoosh = useCallback(() => {
    if (!interactive.current || reducedMotion.current) return
    const v = videoRef.current
    if (!v || v.paused) return

    stopRaf(whooshRaf)
    stopRaf(leaveRaf)
    whooshToken.current += 1
    const token = whooshToken.current
    const startRate = currentRate.current
    const t0 = performance.now()

    const tick = (now: number) => {
      if (token !== whooshToken.current) return
      const elapsed = now - t0
      let rate: number
      if (elapsed < WHOOSH_UP_MS) {
        const t = elapsed / WHOOSH_UP_MS
        rate = startRate + (WHOOSH_PEAK - startRate) * (t * t)
      } else if (elapsed < WHOOSH_UP_MS + WHOOSH_DOWN_MS) {
        const t = (elapsed - WHOOSH_UP_MS) / WHOOSH_DOWN_MS
        const eased = 1 - (1 - t) ** 3
        rate = WHOOSH_PEAK + (1 - WHOOSH_PEAK) * eased
      } else {
        targetRate.current = 1
        applyRate(1)
        whooshRaf.current = 0
        return
      }
      targetRate.current = rate
      applyRate(rate)
      whooshRaf.current = requestAnimationFrame(tick)
    }
    whooshRaf.current = requestAnimationFrame(tick)
  }, [applyRate, stopRaf])

  useImperativeHandle(ref, () => ({ whoosh, setPointerX }), [whoosh, setPointerX])

  useEffect(() => {
    reducedMotion.current = prefersReducedMotion()
    interactive.current = !reducedMotion.current
    if (reducedMotion.current) {
      setMediaFailed(true)
      return
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      reducedMotion.current = mq.matches
      interactive.current = !mq.matches
      if (mq.matches) {
        stopRaf(rafId)
        stopRaf(leaveRaf)
        stopRaf(whooshRaf)
        applyRate(1)
        videoRef.current?.pause()
        setMediaFailed(true)
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [applyRate, stopRaf])

  // Try autoplay once enough data is buffered — never permanently kill the
  // video on a transient play() rejection (AbortError / NotAllowedError race).
  useEffect(() => {
    if (mediaFailed || reducedMotion.current) return
    const v = videoRef.current
    if (!v) return

    let cancelled = false
    let attempts = 0

    const tryPlay = async () => {
      if (cancelled || !v) return
      attempts += 1
      try {
        v.defaultMuted = true
        v.muted = true
        v.playsInline = true
        await v.play()
        if (!cancelled) setPlaying(true)
      } catch {
        // Retry a few times as the file buffers; only then keep the poster
        // visible while the element stays mounted for a later user gesture.
        if (!cancelled && attempts < 6) {
          window.setTimeout(() => {
            void tryPlay()
          }, 400 * attempts)
        }
      }
    }

    const onCanPlay = () => {
      void tryPlay()
    }
    const onPlaying = () => {
      if (!cancelled) setPlaying(true)
    }
    const onError = () => {
      if (!cancelled) {
        setMediaFailed(true)
        setPlaying(false)
      }
    }

    v.addEventListener('canplay', onCanPlay)
    v.addEventListener('playing', onPlaying)
    v.addEventListener('error', onError)

    // Kick off load immediately (don't wait for IntersectionObserver — home
    // hero is always the first paint and IO + overflow parents were flaky).
    v.load()
    void tryPlay()

    return () => {
      cancelled = true
      v.removeEventListener('canplay', onCanPlay)
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('error', onError)
      stopRaf(rafId)
      stopRaf(leaveRaf)
      stopRaf(whooshRaf)
      try {
        v.pause()
      } catch {
        /* ignore */
      }
    }
  }, [mediaFailed, stopRaf])

  const showPoster = !playing || mediaFailed

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`.trim()}
      aria-hidden
    >
      <img
        src={HERO_POSTER_SRC}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          showPoster ? 'opacity-100' : 'opacity-0'
        }`}
        decoding="async"
        fetchPriority="high"
      />

      {!mediaFailed && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          // metadata only — full file is ~51MB; preload=auto was saturating the
          // connection and made the hero look "frozen" on the poster.
          preload="metadata"
        />
      )}

      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(15,26,29,.45) 0%, rgba(15,26,29,.2) 32%, rgba(15,26,29,.78) 68%, rgba(15,26,29,.96) 100%)',
        }}
      />
    </div>
  )
})

export default HeroVideo
