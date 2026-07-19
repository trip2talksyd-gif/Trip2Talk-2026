import { formatAud } from '../../lib/toursApi'

type Props = {
  amountAud: number
  className?: string
}

/**
 * Decorative airport-style digit flip on parent `.group:hover`.
 * No price logic — display only.
 */
export default function SplitFlapPrice({ amountAud, className = '' }: Props) {
  const formatted = formatAud(amountAud)

  return (
    <span
      className={`split-flap-price inline-flex items-baseline font-serif tabular-nums ${className}`}
      aria-label={formatted}
    >
      {formatted.split('').map((char, i) => (
        <span
          key={`${i}-${char}`}
          className="split-flap-digit inline-block"
          style={{ animationDelay: `${i * 35}ms` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}
