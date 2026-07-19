type Props = {
  text: string
  className?: string
}

/** Mockup `.flip-text` — each character flips on parent `.flip-cta:hover`. */
export default function FlipText({ text, className = '' }: Props) {
  return (
    <span className={`flip-text ${className}`}>
      {text.split('').map((char, i) => (
        <span key={`${i}-${char}`} className="fchar" style={{ animationDelay: `${i * 18}ms` }}>
          <span className="cwrap">{char === ' ' ? '\u00A0' : char}</span>
        </span>
      ))}
    </span>
  )
}
