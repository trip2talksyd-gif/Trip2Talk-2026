import { useEffect, useRef, useState } from 'react'

const LETTER_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const DIGIT_GLYPHS = '0123456789'
const TICK_MS = 45
const STAGGER_FRAMES = 2
const SPIN_FRAMES = 7

function randomGlyph(glyphs: string): string {
  return glyphs[Math.floor(Math.random() * glyphs.length)] ?? glyphs[0] ?? '0'
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function asChars(text: string): string[] {
  return Array.from(text)
}

function isFlippable(ch: string, kind: 'text' | 'digits'): boolean {
  if (kind === 'digits') return /\d/.test(ch)
  return Boolean(ch.trim())
}

export type SplitFlapMode = 'once' | 'intersect'

export function useSplitFlapChars(
  text: string,
  options: {
    mode: SplitFlapMode
    /** `text` = letters/spaces (Featured names). `digits` = 0–9 only (prices). */
    kind?: 'text' | 'digits'
    intersectRootSelector?: string
  },
) {
  const { mode, kind = 'text', intersectRootSelector = '[data-featured-strip]' } = options
  const glyphs = kind === 'digits' ? DIGIT_GLYPHS : LETTER_GLYPHS
  const rootRef = useRef<HTMLElement | null>(null)
  const [chars, setChars] = useState(() => asChars(text))

  useEffect(() => {
    if (prefersReducedMotion()) {
      setChars(asChars(text))
      return
    }

    let runId = 0
    let intervalId = 0

    const stop = () => {
      if (intervalId) {
        window.clearInterval(intervalId)
        intervalId = 0
      }
    }

    const play = () => {
      stop()
      runId += 1
      const thisRun = runId
      const target = asChars(text)
      const len = target.length
      if (len === 0) {
        setChars([])
        return
      }

      let frame = 0
      const lastFlipIndex = target.reduce((acc, ch, i) => (isFlippable(ch, kind) ? i : acc), 0)
      const totalFrames = lastFlipIndex * STAGGER_FRAMES + SPIN_FRAMES + 1
      setChars(target.map((ch) => (isFlippable(ch, kind) ? randomGlyph(glyphs) : ch)))

      intervalId = window.setInterval(() => {
        if (thisRun !== runId) return
        frame += 1
        setChars(
          target.map((ch, i) => {
            if (!isFlippable(ch, kind)) return ch
            const start = i * STAGGER_FRAMES
            if (frame < start + SPIN_FRAMES) return randomGlyph(glyphs)
            return ch
          }),
        )
        if (frame >= totalFrames) stop()
      }, TICK_MS)
    }

    if (mode === 'once') {
      play()
      return () => {
        runId += 1
        stop()
      }
    }

    const node = rootRef.current
    if (!node) return

    const scrollRoot = node.closest(intersectRootSelector)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          play()
          return
        }
        stop()
        setChars(asChars(text))
      },
      {
        threshold: [0, 0.5, 1],
        root: scrollRoot instanceof Element ? scrollRoot : null,
      },
    )

    io.observe(node)
    return () => {
      runId += 1
      stop()
      io.disconnect()
    }
  }, [text, mode, kind, glyphs, intersectRootSelector])

  return { chars, rootRef }
}
