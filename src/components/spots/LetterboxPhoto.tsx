type Props = {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
}

/**
 * Instagram-style letterbox: full photo uncropped (contain) over a blurred,
 * darkened cover of the same file so letterbox gaps are not a flat colour.
 * Both images share src/srcSet — one network request.
 */
export default function LetterboxPhoto({
  src,
  srcSet,
  sizes,
  alt,
  className = '',
  loading,
}: Props) {
  const file = { src, srcSet, sizes, draggable: false as const, decoding: 'async' as const, loading }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-teal-darker ${className}`.trim()}>
      <img
        {...file}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full scale-[1.2] object-cover blur-[28px] brightness-[0.55]"
      />
      <img
        {...file}
        alt={alt}
        className="pointer-events-none relative z-[1] h-full w-full object-contain object-center"
      />
    </div>
  )
}
