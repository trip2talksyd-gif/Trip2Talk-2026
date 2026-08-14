import { useState } from 'react'
import TripCoverFallback from './TripCoverFallback'

type Props = {
  src?: string | null
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  compact?: boolean
}

/** Cover URL with bilingual fallback when missing or 404. */
export default function TripCoverImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  compact = false,
}: Props) {
  const [failed, setFailed] = useState(false)
  const url = src?.trim() ?? ''
  if (!url || failed) {
    return <TripCoverFallback className={className} compact={compact} />
  }
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  )
}
