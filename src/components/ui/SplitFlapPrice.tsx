import { useCallback, useRef, useState } from 'react'
import { formatAud } from '../../lib/toursApi'

type Props = {
  amountAud: number
  className?: string
  /** Airport board digit tiles (mockup .flip-price.board) */
  board?: boolean
}

/**
 * Airport split-flap price — flips digit-by-digit on hover, tap, or focus.
 * Matches mockup `.flip-price` / `.priceFlip`.
 */
export default function SplitFlapPrice({ amountAud, className = '', board = true }: Props) {
  const formatted = formatAud(amountAud)
  const [flipping, setFlipping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerFlip = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    setFlipping(false)
    requestAnimationFrame(() => {
      setFlipping(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setFlipping(false), 480)
    })
  }, [])

  return (
    <span
      role="img"
      aria-label={formatted}
      tabIndex={0}
      className={`flip-price ${board ? 'board' : ''} ${flipping ? 'is-flipping' : ''} ${className}`}
      onPointerEnter={triggerFlip}
      onPointerDown={(e) => {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
          e.stopPropagation()
          triggerFlip()
        }
      }}
      onFocus={triggerFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          triggerFlip()
        }
      }}
    >
      <span className="fdigits">
        {formatted.split('').map((char, i) => {
          const isNum = /\d/.test(char)
          return (
            <span key={`${i}-${char}`} className={`fdigit ${isNum ? 'is-num' : ''}`}>
              <span className="dwrap" style={{ animationDelay: `${i * 28}ms` }}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
