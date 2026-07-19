import { useState } from 'react'

type Props = {
  srcs: string[]
  alt: string
  initial: string
  className?: string
}

/** Circular portrait — tries each src, then falls back to initial letter. */
export default function TeamAvatar({ srcs, alt, initial, className = '' }: Props) {
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState(srcs.length === 0)
  const src = !failed && index < srcs.length ? srcs[index] : null

  return (
    <div
      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-line bg-teal-900 shadow-sm sm:h-[88px] sm:w-[88px] ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => {
            if (index + 1 < srcs.length) setIndex((i) => i + 1)
            else setFailed(true)
          }}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-serif text-2xl text-cream">
          {initial}
        </span>
      )}
    </div>
  )
}
