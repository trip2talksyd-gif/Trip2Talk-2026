import { useMemo, useState } from 'react'
import { getHeroPhotoForTrip, photoImageAttrs, photoThumbSrc, type GalleryPhoto } from '../../data/galleryPhotos'
import { STORAGE_IMG, STORAGE_SIZES } from '../../lib/storageImage'
import TripCoverFallback from './TripCoverFallback'

type HeroSize = 'hero' | 'card'

type Props = {
  tripCode: string
  alt: string
  className?: string
  /** When set (e.g. hovering a filmstrip thumbnail), shows this photo instead of the trip's default hero photo. */
  overridePhoto?: GalleryPhoto | null
  /** `hero` uses a 960/1440/1920 srcset; `card` stays at 720 for related-trip tiles. */
  size?: HeroSize
}

/** Hero/thumbnail from gallery, or bilingual “photo coming soon” fallback */
export default function TripPhotoHero({
  tripCode,
  alt,
  className = '',
  overridePhoto,
  size = 'hero',
}: Props) {
  const [failed, setFailed] = useState(false)
  const defaultPhoto = useMemo(() => getHeroPhotoForTrip(tripCode), [tripCode])
  const photo = overridePhoto ?? defaultPhoto
  const attrs = useMemo(() => {
    if (!photo) return null
    if (size === 'card') {
      return { src: photoThumbSrc(photo, STORAGE_IMG.card), srcSet: undefined, sizes: undefined }
    }
    return photoImageAttrs(photo, 'hero', STORAGE_SIZES.hero)
  }, [photo, size])

  if (photo && attrs?.src && !failed) {
    return (
      <img
        src={attrs.src}
        srcSet={attrs.srcSet}
        sizes={attrs.sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    )
  }

  return <TripCoverFallback className={className} />
}
