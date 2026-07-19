import { formatAud } from '../../lib/toursApi'

type Props = {
  amountAud: number
  className?: string
  /** Airport board digit tiles (mockup .flip-price.board) */
  board?: boolean
}

/**
 * Airport split-flap price — flips digit-by-digit on parent `.group:hover` or self-hover.
 * Matches mockup `.flip-price` / `.priceFlip`.
 */
export default function SplitFlapPrice({ amountAud, className = '', board = true }: Props) {
  const formatted = formatAud(amountAud)

  return (
    <span
      className={`flip-price ${board ? 'board' : ''} ${className}`}
      aria-label={formatted}
    >
      <span className="fdigits">
        {formatted.split('').map((char, i) => {
          const isNum = /\d/.test(char)
          return (
            <span
              key={`${i}-${char}`}
              className={`fdigit ${isNum ? 'is-num' : ''}`}
              style={{ animationDelay: `${i * 28}ms` }}
            >
              <span className="dwrap">{char === ' ' ? '\u00A0' : char}</span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
