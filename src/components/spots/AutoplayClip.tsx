import { useEffect, useRef, useState } from 'react'

/** Only compressed derivatives — never Storage masters or other .mp4. */
export function isCompressedWebMp4(url: string): boolean {
  const path = url.split('?')[0]?.split('#')[0] ?? ''
  return /_web\.mp4$/i.test(path)
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

type Props = {
  src: string
  className?: string
  poster?: string
  /** Pause when mostly off-screen (default). Set false for always-on heroes. */
  pauseOffscreen?: boolean
}

/**
 * Muted loop. Plays only `*_web.mp4` URLs.
 * `prefers-reduced-motion`: freeze on the first frame (no autoplay).
 */
export default function AutoplayClip({
  src,
  className = '',
  poster,
  pauseOffscreen = true,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const allowed = isCompressedWebMp4(src)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(prefersReducedMotion())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!allowed || !el) return

    if (reduced) {
      const freeze = () => {
        el.pause()
        el.currentTime = 0
      }
      freeze()
      el.addEventListener('loadeddata', freeze)
      return () => el.removeEventListener('loadeddata', freeze)
    }

    if (!pauseOffscreen) {
      void el.play().catch(() => undefined)
      return () => el.pause()
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          void el.play().catch(() => undefined)
        } else {
          el.pause()
        }
      },
      { threshold: [0, 0.4, 0.75] },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      el.pause()
    }
  }, [allowed, src, pauseOffscreen, reduced])

  if (!allowed) return null

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      className={className}
      muted
      loop
      playsInline
      autoPlay={!reduced}
      preload="metadata"
      controls={false}
      disablePictureInPicture
    />
  )
}
