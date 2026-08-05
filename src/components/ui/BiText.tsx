/** Bilingual EN+TH stack — matches Home hero / mockup pattern (both always visible). */
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

export default function BiText({
  en,
  th,
  as: Tag = 'span',
  className = '',
  thClassName = 'mt-0.5 block font-thai text-[0.82em] font-medium text-ink-soft',
  serif = false,
}: Props) {
  return (
    <Tag className={`${serif ? 'font-serif' : ''} ${className}`.trim()}>
      {en}
      <span className={thClassName}>{th}</span>
    </Tag>
  )
}
