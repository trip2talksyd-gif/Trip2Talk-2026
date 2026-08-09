import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useLang } from '../../hooks/useLang'

/** Hero reel — H.264 web encode (Chrome-safe).
 * Original upload at public-media/VDO/Hero_cover01.mp4 was HEVC/H.265 which
 * Chrome often cannot decode (silent poster-only failure). Keep the original
 * in Storage as archive; serve this H.264 cut for playback. */
export const HERO_VIDEO_SRC = '/hero/Hero_cover01_web.mp4'

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
 * Reduced-motion users get a manual Play control (pointer-events-auto) instead of autoplay.
 */
const HeroVideo = forwardRef<HeroVideoHandle, Props>(function HeroVideo(
  { className = '' },
  ref,
) {
  const { tt } = useLang()
  const playBi = tt('hero.playVideo')

  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [mediaFailed, setMediaFailed] = useState(false)
  const [failReason, setFailReason] = useState<string | null>(null)
  const [reducedMotionOn, setReducedMotionOn] = useState(false)
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false)

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
    const applyRm = (on: boolean) => {
      reducedMotion.current = on
      interactive.current = !on
      setReducedMotionOn(on)
      if (on) {
        stopRaf(rafId)
        stopRaf(leaveRaf)
        stopRaf(whooshRaf)
        applyRate(1)
        // Don't autoplay — keep video mounted and offer tap-to-play.
        videoRef.current?.pause()
        setPlaying(false)
        setNeedsTapToPlay(true)
        setMediaFailed(false)
        setFailReason(null)
      } else {
        setNeedsTapToPlay(false)
      }
    }

    applyRm(prefersReducedMotion())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => applyRm(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [applyRate, stopRaf])

  // Autoplay path (skipped when reduced-motion wants a manual tap).
  useEffect(() => {
    if (mediaFailed || reducedMotion.current || needsTapToPlay) return
    const v = videoRef.current
    if (!v) return

    let cancelled = false
    let attempts = 0

    const markFailed = (reason: string, err?: unknown) => {
      if (cancelled) return
      console.error('[HeroVideo]', reason, err ?? '', {
        src: HERO_VIDEO_SRC,
        networkState: v.networkState,
        readyState: v.readyState,
        mediaError: v.error
          ? { code: v.error.code, message: v.error.message }
          : null,
      })
      setFailReason(reason)
      setMediaFailed(true)
      setPlaying(false)
    }

    const tryPlay = async () => {
      if (cancelled || !v || reducedMotion.current) return
      attempts += 1
      try {
        v.defaultMuted = true
        v.muted = true
        v.playsInline = true
        await v.play()
        if (!cancelled) setPlaying(true)
      } catch (err) {
        if (!cancelled && attempts < 6) {
          window.setTimeout(() => {
            void tryPlay()
          }, 400 * attempts)
        } else if (!cancelled) {
          // Fall back to tap-to-play instead of killing the reel entirely.
          console.warn('[HeroVideo] autoplay blocked — offering tap to play', err)
          setNeedsTapToPlay(true)
          setPlaying(false)
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
      const code = v.error?.code
      const msg = v.error?.message || 'unknown'
      markFailed(`media element error (code ${code ?? '?'}: ${msg})`)
    }

    const h264 = v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
    if (!h264) {
      markFailed('browser reports no H.264/MP4 support')
      return
    }

    v.addEventListener('canplay', onCanPlay)
    v.addEventListener('playing', onPlaying)
    v.addEventListener('error', onError)

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
  }, [mediaFailed, needsTapToPlay, stopRaf])

  // Keep video loadable under reduced-motion so tap-to-play is instant.
  useEffect(() => {
    if (!needsTapToPlay || mediaFailed) return
    const v = videoRef.current
    if (!v) return
    const onError = () => {
      const code = v.error?.code
      const msg = v.error?.message || 'unknown'
      console.error('[HeroVideo] media element error', { code, msg, src: HERO_VIDEO_SRC })
      setFailReason(`media element error (code ${code ?? '?'}: ${msg})`)
      setMediaFailed(true)
    }
    v.addEventListener('error', onError)
    if (v.readyState < 2) v.load()
    return () => v.removeEventListener('error', onError)
  }, [needsTapToPlay, mediaFailed])

  const handleManualPlay = useCallback(async () => {
    const v = videoRef.current
    if (!v || mediaFailed) return
    try {
      v.defaultMuted = true
      v.muted = true
      v.playsInline = true
      await v.play()
      setPlaying(true)
      setNeedsTapToPlay(false)
    } catch (err) {
      console.error('[HeroVideo] manual play failed', err)
      setFailReason('manual play failed')
      setMediaFailed(true)
    }
  }, [mediaFailed])

  const showPoster = !playing || mediaFailed
  const showPlayButton = needsTapToPlay && !mediaFailed && !playing

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 h-full w-full overflow-hidden ${className}`.trim()}
      aria-hidden={mediaFailed && !showPlayButton}
    >
      <img
        src={HERO_POSTER_SRC}
        alt=""
        className={`pointer-events-none absolute inset-0 h-full max-h-full w-full max-w-full object-cover object-center transition-opacity duration-700 ${
          showPoster ? 'opacity-100' : 'opacity-0'
        }`}
        decoding="async"
        fetchPriority="high"
      />

      {!mediaFailed && (
        <video
          ref={videoRef}
          className={`pointer-events-none absolute inset-0 h-full max-h-full w-full max-w-full object-cover object-center transition-opacity duration-700 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          autoPlay={!reducedMotionOn && !needsTapToPlay}
          muted
          loop
          playsInline
          preload="auto"
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(15,26,29,.45) 0%, rgba(15,26,29,.2) 32%, rgba(15,26,29,.78) 68%, rgba(15,26,29,.96) 100%)',
        }}
      />

      {showPlayButton ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            void handleManualPlay()
          }}
          className="pointer-events-auto absolute bottom-[22%] left-1/2 z-[3] flex -translate-x-1/2 items-center gap-2 rounded-full border border-cream/35 bg-teal-darker/85 px-5 py-3 text-cream shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm transition hover:bg-teal-dark md:bottom-[18%]"
          aria-label={`${playBi.en} / ${playBi.th}`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange text-teal-darker">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-left leading-tight">
            <span className="block text-[13px] font-semibold">{playBi.en}</span>
            <span className="mt-0.5 block font-thai text-[11px] text-cream/75">{playBi.th}</span>
          </span>
        </button>
      ) : null}

      {mediaFailed && failReason && import.meta.env.DEV ? (
        <div
          role="status"
          className="pointer-events-none absolute bottom-3 left-3 z-[2] max-w-sm rounded-md bg-black/70 px-3 py-2 text-[11px] leading-snug text-orange-soft"
        >
          Hero video failed: {failReason}
        </div>
      ) : null}
    </div>
  )
})

export default HeroVideo
