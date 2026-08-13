import type { ReactNode } from 'react'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'p' | 'div'

type Props = {
  en: string
  th: string
  /** English line element — default h1 */
  as?: HeadingTag
  /** Thai line element — default p (never nest Thai under Fraunces) */
  thAs?: HeadingTag
  id?: string
  className?: string
  enClassName?: string
  thClassName?: string
  children?: ReactNode
}

/**
 * Bilingual display heading: English on Fraunces (`font-display`), Thai on
 * Noto Serif Thai (`font-serif`) as a sibling — never the same font-family tree.
 * Nesting Thai under Fraunces breaks Thai vowel/tone shaping.
 */
export default function BiDisplayHeading({
  en,
  th,
  as: EnTag = 'h1',
  thAs: ThTag = 'p',
  id,
  className = '',
  enClassName = '',
  thClassName = '',
  children,
}: Props) {
  return (
    <div id={id} className={className}>
      <EnTag className={`font-display ${enClassName}`.trim()}>{en}</EnTag>
      <ThTag lang="th" className={`font-serif ${thClassName}`.trim()}>
        {th}
      </ThTag>
      {children}
    </div>
  )
}
