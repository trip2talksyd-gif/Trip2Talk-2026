import { useSplitFlapChars } from '../../hooks/useSplitFlapChars'
import { formatAud } from '../../lib/toursApi'

type Props = {
  amountAud: number
  className?: string
  /** Airport board digit tiles (mockup .flip-price.board) */
  board?: boolean
}

function splitCurrency(formatted: string): { prefix: string; body: string } {
  const i = formatted.search(/\d/)
  if (i < 0) return { prefix: formatted, body: '' }
  return { prefix: formatted.slice(0, i), body: formatted.slice(i) }
}

/**
 * Airport split-flap price — digit boxes scramble once on mount.
 * `$` / currency prefix stays static; commas stay as non-flipping glyphs.
 */
export default function SplitFlapPrice({ amountAud, className = '', board = true }: Props) {
  const formatted = formatAud(amountAud)
  const { prefix, body } = splitCurrency(formatted)
  const { chars } = useSplitFlapChars(body, { mode: 'once', kind: 'digits' })

  return (
    <span role="img" aria-label={formatted} className={`flip-price ${board ? 'board' : ''} ${className}`}>
      {prefix ? <span className="flip-price-prefix">{prefix}</span> : null}
      <span className="fdigits">
        {chars.map((char, i) => {
          const isNum = /\d/.test(char)
          return (
            <span key={`${i}-${body[i] ?? char}`} className={`fdigit ${isNum ? 'is-num' : ''}`}>
              <span className="dwrap">{char === ' ' ? '\u00A0' : char}</span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
