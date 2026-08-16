import { useEffect, useRef } from 'react'

/** Only compressed derivatives — never Storage masters or other .mp4. */
export function isCompressedWebMp4(url: string): boolean {
  const path = url.split('?')[0]?.split('#')[0] ?? ''
  return /_web\.mp4$/i.test(path)
}

type Props = {
  src: string
  className?: string
  poster?: string
}

/**
 * Reels-style muted loop. Plays only while mostly on screen.
 * Refuses to mount if `src` is not a `*_web.mp4` URL.
 */
export default function AutoplayClip({ src, className = '', poster }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const allowed = isCompressedWebMp4(src)

  useEffect(() => {
    const el = ref.current
    if (!allowed || !el) return

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
  }, [allowed, src])

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
      autoPlay
      preload="metadata"
      controls={false}
      disablePictureInPicture
    />
  )
}
