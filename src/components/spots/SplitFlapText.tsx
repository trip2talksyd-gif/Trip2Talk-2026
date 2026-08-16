import { type Ref } from 'react'
import { useSplitFlapChars } from '../../hooks/useSplitFlapChars'

type Props = {
  text: string
  className?: string
}

const TITLE_CLASS = 'text-[12px] font-semibold leading-snug text-ink'

/**
 * Airport split-flap reveal for a single English string.
 * Replays whenever the node crosses IntersectionObserver threshold.
 * After every character has settled, boxes drop and the title is plain text.
 */
export default function SplitFlapText({ text, className = '' }: Props) {
  const { chars, settled, rootRef } = useSplitFlapChars(text, { mode: 'intersect', kind: 'text' })

  return (
    <span
      ref={rootRef as Ref<HTMLSpanElement>}
      className={`relative grid max-w-full ${className}`.trim()}
      aria-label={text}
    >
      <span className={`invisible col-start-1 row-start-1 ${TITLE_CLASS}`} aria-hidden>
        {text}
      </span>
      {settled ? (
        <span className={`col-start-1 row-start-1 ${TITLE_CLASS}`}>{text}</span>
      ) : (
        <span className="col-start-1 row-start-1 inline-flex max-w-full flex-wrap content-start gap-px" aria-hidden>
          {chars.map((ch, i) =>
            ch === ' ' ? (
              <span key={`${text}-sp-${i}`} className="inline-block w-1.5">
                {' '}
              </span>
            ) : (
              <span
                key={`${text}-${i}`}
                className="inline-flex h-[15px] min-w-[9px] items-center justify-center rounded-[2px] bg-teal-darker px-px font-mono text-[8px] font-bold leading-none text-[#e6935a]"
              >
                {ch}
              </span>
            ),
          )}
        </span>
      )}
    </span>
  )
}
