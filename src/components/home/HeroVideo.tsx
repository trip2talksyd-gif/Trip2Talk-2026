import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

/** Hero reel — production Supabase `public-media` bucket. */
export const HERO_VIDEO_SRC =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/public-media/VDO/Hero_cover01.mp4'

/** Night-sky still used while the reel buffers / if autoplay is blocked. */
export const HERO_POSTER_SRC = '/brand/pin-gate-bg.webp'

const RATE_MIN = 0.25
const RATE_MAX = 4
const POINTER_RATE_LEFT = 0.3
const POINTER_RATE_CENTER = 1
const POINTER_RATE_RIGHT = 2.5
/** How quickly the live rate catches the pointer target (0–1 per frame). */
const LERP_FACTOR = 0.12
const LEAVE_EASE_MS = 600
const WHOOSH_PEAK = 3
const WHOOSH_UP_MS = 250
const WHOOSH_DOWN_MS = 400

export type HeroVideoHandle = {
  /** Brief CTA “whoosh”: ramp to ~3x then ease back to 1x. */
  whoosh: () => void
}

type Props = {
  className?: string
}

function clampRate(n: number) {
  return Math.min(RATE_MAX, Math.max(RATE_MIN, n))
}

/**
 * Map horizontal pointer position in [0, 1] → playbackRate.
 * Left edge ≈ 0.3x, center ≈ 1x, right edge ≈ 2.5x (piecewise linear).
 */
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
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Full-bleed hero background video with interactive playbackRate “speed ramp”.
 *
 * Pointer X → target rate (lerp each rAF). Leaving the area eases back to 1x.
 * `whoosh()` runs a short scripted ramp for CTA clicks (debounced / cancelable).
 * Reduced-motion users get a static poster (or 1x play with no rate scrubbing).
 */
const HeroVideo = forwardRef<HeroVideoHandle, Props>(function HeroVideo(
  { className = '' },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [showPoster, setShowPoster] = useState(true)
  const [useStaticOnly, setUseStaticOnly] = useState(false)

  /** Live playbackRate currently applied to the element. */
  const currentRate = useRef(1)
  /** Pointer-driven target (or leave-ease / whoosh target). */
  const targetRate = useRef(1)
  const pointerActive = useRef(false)
  const reducedMotion = useRef(false)
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
      v.playbackRate = next
    } catch {
      /* some browsers reject extreme rates mid-load */
    }
  }, [])

  const stopRaf = useCallback((idRef: { current: number }) => {
    if (idRef.current) {
      cancelAnimationFrame(idRef.current)
      idRef.current = 0
    }
  }, [])

  /** Continuous lerp loop: currentRate → targetRate until close enough. */
  const ensureLerpLoop = useCallback(() => {
    if (reducedMotion.current || useStaticOnly) return
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
  }, [applyRate, useStaticOnly])

  const setPointerTargetFromClientX = useCallback(
    (clientX: number) => {
      if (reducedMotion.current || useStaticOnly) return
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0) return
      const norm = (clientX - rect.left) / rect.width
      targetRate.current = rateFromNormX(norm)
      pointerActive.current = true
      stopRaf(leaveRaf)
      stopRaf(whooshRaf)
      whooshToken.current += 1
      ensureLerpLoop()
    },
    [ensureLerpLoop, stopRaf, useStaticOnly],
  )

  /** Ease targetRate → 1x over ~LEAVE_EASE_MS when pointer leaves. */
  const easeBackToOne = useCallback(() => {
    if (reducedMotion.current || useStaticOnly) return
    pointerActive.current = false
    stopRaf(leaveRaf)
    stopRaf(whooshRaf)
    whooshToken.current += 1

    const start = currentRate.current
    const from = start
    const to = 1
    const t0 = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / LEAVE_EASE_MS)
      // ease-out cubic
      const eased = 1 - (1 - t) ** 3
      targetRate.current = from + (to - from) * eased
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
  }, [applyRate, stopRaf, useStaticOnly])

  const whoosh = useCallback(() => {
    if (reducedMotion.current || useStaticOnly) return
    const v = videoRef.current
    if (!v || v.paused) return

    // Cancel any in-flight whoosh / leave ease; start a fresh token.
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
        const eased = t * t
        rate = startRate + (WHOOSH_PEAK - startRate) * eased
      } else if (elapsed < WHOOSH_UP_MS + WHOOSH_DOWN_MS) {
        const t = (elapsed - WHOOSH_UP_MS) / WHOOSH_DOWN_MS
        const eased = 1 - (1 - t) ** 3
        rate = WHOOSH_PEAK + (1 - WHOOSH_PEAK) * eased
      } else {
        rate = 1
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
  }, [applyRate, stopRaf, useStaticOnly])

  useImperativeHandle(ref, () => ({ whoosh }), [whoosh])

  // Lazy-init: only wire pointer listeners once the hero is in view.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true)
      },
      { threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    reducedMotion.current = prefersReducedMotion()
    if (reducedMotion.current) {
      setUseStaticOnly(true)
      return
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      reducedMotion.current = mq.matches
      if (mq.matches) {
        setUseStaticOnly(true)
        stopRaf(rafId)
        stopRaf(leaveRaf)
        stopRaf(whooshRaf)
        applyRate(1)
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [applyRate, stopRaf])

  // Attempt autoplay when in view; fall back to poster if blocked / failed.
  useEffect(() => {
    if (!inView || useStaticOnly) return
    const v = videoRef.current
    if (!v) return

    let cancelled = false
    const tryPlay = async () => {
      try {
        v.muted = true
        await v.play()
        if (!cancelled) setShowPoster(false)
      } catch {
        if (!cancelled) {
          setUseStaticOnly(true)
          setShowPoster(true)
        }
      }
    }
    void tryPlay()

    return () => {
      cancelled = true
    }
  }, [inView, useStaticOnly])

  // Pointer / touch scrubbing — attached only while in viewport and interactive.
  useEffect(() => {
    if (!inView || useStaticOnly || reducedMotion.current) return
    const el = containerRef.current
    if (!el) return

    const onMove = (e: MouseEvent) => setPointerTargetFromClientX(e.clientX)
    const onLeave = () => easeBackToOne()
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) setPointerTargetFromClientX(t.clientX)
    }
    const onTouchEnd = () => easeBackToOne()

    el.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
      stopRaf(rafId)
      stopRaf(leaveRaf)
      stopRaf(whooshRaf)
      applyRate(1)
    }
  }, [
    applyRate,
    easeBackToOne,
    inView,
    setPointerTargetFromClientX,
    stopRaf,
    useStaticOnly,
  ])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 overflow-hidden ${className}`.trim()}
      aria-hidden
    >
      {/* Poster always under the video so load / autoplay-fail never flashes empty. */}
      <img
        src={HERO_POSTER_SRC}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          showPoster || useStaticOnly ? 'opacity-100' : 'opacity-0'
        }`}
        decoding="async"
      />

      {!useStaticOnly && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            showPoster ? 'opacity-0' : 'opacity-100'
          }`}
          src={inView ? HERO_VIDEO_SRC : undefined}
          poster={HERO_POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setShowPoster(false)}
          onError={() => {
            setUseStaticOnly(true)
            setShowPoster(true)
          }}
        />
      )}

      {/* Dark gradient so bottom-anchored copy stays legible over bright frames. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(15,26,29,.35) 0%, rgba(15,26,29,.08) 38%, rgba(15,26,29,.72) 72%, rgba(15,26,29,.92) 100%)',
        }}
      />
    </div>
  )
})

export default HeroVideo
