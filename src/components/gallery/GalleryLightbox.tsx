import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import type { GalleryPhoto } from '../../data/galleryPhotos'
import { photoSrc } from '../../data/galleryPhotos'

type Props = {
  photos: GalleryPhoto[]
  initialIndex: number
  onClose: () => void
}

export default function GalleryLightbox({ photos, initialIndex, onClose }: Props) {
  const { lang } = useLang()
  const [index, setIndex] = useState(initialIndex)

  const photo = photos[index]

  const prev = useCallback(() => {
    setIndex((i) => (i <= 0 ? photos.length - 1 : i - 1))
  }, [photos.length])

  const next = useCallback(() => {
    setIndex((i) => (i >= photos.length - 1 ? 0 : i + 1))
  }, [photos.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!photo) return null

  const caption = lang === 'th' ? photo.caption_th : photo.caption_en

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm text-white/70">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2">
        <button
          type="button"
          onClick={prev}
          className="absolute left-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <img
          src={photoSrc(photo)}
          alt={caption}
          className="max-h-[70vh] max-w-full object-contain"
        />

        <button
          type="button"
          onClick={next}
          className="absolute right-2 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="px-4 pb-8 pt-2 text-center">
        <p className="text-base font-medium text-white">{caption}</p>
        <p className="mt-1 text-sm text-white/60">{photo.location}</p>
      </div>
    </div>
  )
}
