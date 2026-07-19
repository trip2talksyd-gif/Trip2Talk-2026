import { useEffect, useState } from 'react'
import { useLang } from '../../hooks/useLang'
import { GALLERY_PHOTOS, photoSrc, type GalleryPhoto } from '../../data/galleryPhotos'

type Slide = {
  photo?: GalleryPhoto
  /** Fallback remote URL when no gallery photo */
  src?: string
  sceneEn: string
  sceneTh: string
  titleEn: string
  titleTh: string
  meta?: string
}

type Props = {
  slides: Slide[]
  intervalMs?: number
  className?: string
}

export default function PhotoSlideshow({ slides, intervalMs = 4200, className = '' }: Props) {
  const { lang } = useLang()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [slides.length, intervalMs])

  if (slides.length === 0) return null
  const slide = slides[index]
  const scene = lang === 'th' ? slide.sceneTh : slide.sceneEn
  const title = lang === 'th' ? slide.titleTh : slide.titleEn

  return (
    <div className={className}>
      <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-teal-900">
        {slides.map((s, i) => {
          const url = s.photo ? photoSrc(s.photo) : (s.src ?? '')
          return (
            <img
              key={`${s.sceneEn}-${i}`}
              src={url}
              alt={s.titleEn}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          )
        })}
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/90 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-md bg-coral px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cream">
          {scene}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
          <p className="text-sm font-semibold">{title}</p>
          {lang === 'en' && (
            <p className="mt-0.5 font-thai text-xs font-normal text-cream/75">{slide.titleTh}</p>
          )}
          {slide.meta && <p className="mt-1 text-[11px] text-teal-400">{slide.meta}</p>}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-4 bg-teal-700' : 'w-1.5 bg-line'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function galleryByIds(ids: string[]): GalleryPhoto[] {
  return ids
    .map((id) => GALLERY_PHOTOS.find((p) => p.id === id))
    .filter((p): p is GalleryPhoto => Boolean(p))
}
