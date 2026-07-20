import { useMemo } from 'react'
import { getHeroPhotoForTrip, photoSrc, type GalleryPhoto } from '../../data/galleryPhotos'

type Props = {
  tripCode: string
  alt: string
  className?: string
  /** When set (e.g. hovering a filmstrip thumbnail), shows this photo instead of the trip's default hero photo. */
  overridePhoto?: GalleryPhoto | null
}

/** Hero/thumbnail from gallery base64, or brand gradient fallback */
export default function TripPhotoHero({ tripCode, alt, className = '', overridePhoto }: Props) {
  const defaultPhoto = useMemo(() => getHeroPhotoForTrip(tripCode), [tripCode])
  const photo = overridePhoto ?? defaultPhoto
  const src = useMemo(() => (photo ? photoSrc(photo) : ''), [photo])

  if (photo) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-mint-100 to-teal-900/20 ${className}`}
      aria-hidden
    >
      <span className="text-4xl font-bold text-teal-900/30">T2T</span>
    </div>
  )
}
