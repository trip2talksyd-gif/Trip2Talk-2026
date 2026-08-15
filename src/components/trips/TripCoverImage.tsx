import { useState } from 'react'
import { storageImageSrc, storageImageAttrs, STORAGE_IMG, STORAGE_SIZES } from '../../lib/storageImage'
import TripCoverFallback from './TripCoverFallback'

type CoverSize = 'thumb' | 'card' | 'hero'

type Props = {
  src?: string | null
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  compact?: boolean
  /** Display size — maps to a Storage transform. compact defaults to thumb. */
  size?: CoverSize
  sizes?: string
}

const SIZE_OPTS = {
  thumb: STORAGE_IMG.thumb,
  card: STORAGE_IMG.card,
  hero: STORAGE_IMG.hero,
} as const

/** Cover URL with bilingual fallback when missing or 404. */
export default function TripCoverImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  compact = false,
  size,
  sizes,
}: Props) {
  const [failed, setFailed] = useState(false)
  const variant: CoverSize = size ?? (compact ? 'thumb' : 'card')
  const attrs =
    variant === 'hero'
      ? storageImageAttrs(src, 'hero', sizes ?? STORAGE_SIZES.fullBleed)
      : { src: storageImageSrc(src, SIZE_OPTS[variant]), srcSet: undefined, sizes: undefined }
  if (!attrs.src || failed) {
    return <TripCoverFallback className={className} compact={compact} />
  }
  return (
    <img
      src={attrs.src}
      srcSet={attrs.srcSet}
      sizes={attrs.sizes}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
