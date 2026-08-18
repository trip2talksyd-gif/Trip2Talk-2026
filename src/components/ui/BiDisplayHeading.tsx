import type { ReactNode } from 'react'
import { useLang } from '../../hooks/useLang'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span'

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

const FONT_CLASS = /\bfont-(display|serif|thai)\b/g
/**
 * Tight Latin tracking/leading clips Thai vowels and tone marks (่ ้ ี ็ ไ).
 * Do not use `\b` after `]` — `]` is non-word so `leading-[1.1]` never matched.
 */
const THAI_UNSAFE =
  /\b(?:tracking-(?:tighter|tight)|leading-(?:none|tight))\b|(?:tracking|leading)-\[[^\]]*\]/g

/** Size/weight/color/spacing only — fonts stay language-specific. */
function visualClasses(className: string, forThai = false) {
  let next = className.replace(FONT_CLASS, '')
  if (forThai) {
    next = next.replace(THAI_UNSAFE, '')
    if (!/\bleading-/.test(next)) next = `${next} leading-normal`
  }
  return next.replace(/\s+/g, ' ').trim()
}

/**
 * Bilingual display heading: English on Fraunces (`font-display`), Thai on
 * Noto Serif Thai (`font-serif`) as a sibling — never the same font-family tree.
 * Nesting Thai under Fraunces breaks Thai vowel/tone shaping.
 *
 * Primary line follows `lang` (same order/emphasis as BiText). Both languages
 * stay visible — this only swaps visual order and emphasis.
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
  const { lang } = useLang()
  const thaiPrimary = lang === 'th'
  const enPrimaryVisual = visualClasses(enClassName)
  const thPrimaryVisual = visualClasses(enClassName, true)
  const enSecondaryVisual = visualClasses(thClassName)
  const thSecondaryVisual = visualClasses(thClassName, true)

  const enNode = (
    <EnTag
      lang="en"
      className={`font-display ${thaiPrimary ? enSecondaryVisual : enPrimaryVisual}`.trim()}
    >
      {en}
    </EnTag>
  )
  const thNode = (
    <ThTag
      lang="th"
      className={`overflow-visible font-serif ${thaiPrimary ? thPrimaryVisual : thSecondaryVisual}`.trim()}
    >
      {th}
    </ThTag>
  )

  return (
    <div id={id} data-bi-heading="" className={`overflow-visible ${className}`.trim()}>
      {thaiPrimary ? thNode : enNode}
      {thaiPrimary ? enNode : thNode}
      {children}
    </div>
  )
}
