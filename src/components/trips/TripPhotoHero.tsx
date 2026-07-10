import { useMemo } from 'react'
import { getHeroPhotoForTrip, photoSrc } from '../../data/galleryPhotos'

type Props = {
  tripCode: string
  alt: string
  className?: string
}

/** Hero/thumbnail from gallery base64, or brand gradient fallback */
export default function TripPhotoHero({ tripCode, alt, className = '' }: Props) {
  const photo = useMemo(() => getHeroPhotoForTrip(tripCode), [tripCode])
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
      className={`flex items-center justify-center bg-gradient-to-br from-brand-green-light to-brand-green/20 ${className}`}
      aria-hidden
    >
      <span className="text-4xl font-bold text-brand-green/30">T2T</span>
    </div>
  )
}
