import { useEffect, useRef, useState } from 'react'

type Props = {
  end: number
  durationMs?: number
  suffix?: string
  className?: string
}

/** Counts from 0 → end once when the element enters the viewport. */
export default function CountUpStat({ end, durationMs = 1200, suffix = '', className = '' }: Props) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function run() {
      if (started.current) return
      started.current = true
      if (prefersReduced) {
        setValue(end)
        return
      }
      const start = performance.now()
      function tick(now: number) {
        const t = Math.min(1, (now - start) / durationMs)
        const eased = 1 - (1 - t) ** 3
        setValue(Math.round(end * eased))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run()
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, durationMs])

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  )
}
