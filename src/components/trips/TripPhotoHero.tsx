import { useMemo, useState } from 'react'
import { getHeroPhotoForTrip, photoSrc, type GalleryPhoto } from '../../data/galleryPhotos'
import TripCoverFallback from './TripCoverFallback'

type Props = {
  tripCode: string
  alt: string
  className?: string
  /** When set (e.g. hovering a filmstrip thumbnail), shows this photo instead of the trip's default hero photo. */
  overridePhoto?: GalleryPhoto | null
}

/** Hero/thumbnail from gallery, or bilingual “photo coming soon” fallback */
export default function TripPhotoHero({ tripCode, alt, className = '', overridePhoto }: Props) {
  const [failed, setFailed] = useState(false)
  const defaultPhoto = useMemo(() => getHeroPhotoForTrip(tripCode), [tripCode])
  const photo = overridePhoto ?? defaultPhoto
  const src = useMemo(() => (photo ? photoSrc(photo) : ''), [photo])

  if (photo && src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    )
  }

  return <TripCoverFallback className={className} />
}
