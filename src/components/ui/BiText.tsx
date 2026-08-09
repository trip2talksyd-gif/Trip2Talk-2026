import { useLang } from '../../hooks/useLang'

/** Bilingual EN+TH stack — primary line follows active language preference. */
type Props = {
  en: string
  th: string
  /** Outer element — default span */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div'
  className?: string
  thClassName?: string
  /** When true, EN uses font-serif (headings) */
  serif?: boolean
}

const DEFAULT_SECONDARY =
  'mt-0.5 block font-thai text-[0.82em] font-medium text-ink-soft'

export default function BiText({
  en,
  th,
  as: Tag = 'span',
  className = '',
  thClassName = DEFAULT_SECONDARY,
  serif = false,
}: Props) {
  const { lang } = useLang()
  const primary = lang === 'th' ? th : en
  const secondary = lang === 'th' ? en : th
  const primaryIsThai = lang === 'th'
  const secondaryIsThai = lang !== 'th'
  const secondaryBase = thClassName.replace(/\bfont-thai\b/g, '').replace(/\s+/g, ' ').trim()

  return (
    <Tag
      className={`${serif && !primaryIsThai ? 'font-serif' : ''} ${primaryIsThai ? (serif ? 'font-serif' : 'font-thai') : ''} ${className}`.trim()}
    >
      {primary}
      <span
        className={`${secondaryBase} ${secondaryIsThai ? (serif ? 'font-serif' : 'font-thai') : ''}`.trim()}
      >
        {secondary}
      </span>
    </Tag>
  )
}
