import { type Ref } from 'react'
import { useSplitFlapChars } from '../../hooks/useSplitFlapChars'

type Props = {
  text: string
  className?: string
}

/**
 * Airport split-flap reveal for a single English string.
 * Replays whenever the node crosses IntersectionObserver threshold.
 */
export default function SplitFlapText({ text, className = '' }: Props) {
  const { chars, rootRef } = useSplitFlapChars(text, { mode: 'intersect', kind: 'text' })

  return (
    <span
      ref={rootRef as Ref<HTMLSpanElement>}
      className={`inline-flex max-w-full flex-wrap gap-px ${className}`.trim()}
      aria-label={text}
    >
      {chars.map((ch, i) =>
        ch === ' ' ? (
          <span key={`${text}-sp-${i}`} className="inline-block w-1.5" aria-hidden>
            {' '}
          </span>
        ) : (
          <span
            key={`${text}-${i}`}
            className="inline-flex h-[15px] min-w-[9px] items-center justify-center rounded-[2px] bg-teal-darker px-px font-mono text-[8px] font-bold leading-none text-[#e6935a]"
            aria-hidden
          >
            {ch}
          </span>
        ),
      )}
    </span>
  )
}
