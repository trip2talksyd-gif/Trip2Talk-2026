import { useEffect, useState } from 'react'
import { useLang } from '../../hooks/useLang'
import { GALLERY_PHOTOS, photoSrc, type GalleryPhoto } from '../../data/galleryPhotos'

type Slide = {
  photo?: GalleryPhoto
  src?: string
  sceneEn: string
  sceneTh: string
  titleEn: string
  titleTh: string
  meta?: string
}

type Props = {
  slides: Slide[]
  /** Mockup shot-slideshow uses 4s per slide × 6 = 24s loop */
  intervalMs?: number
  className?: string
}

export default function PhotoSlideshow({ slides, intervalMs = 4000, className = '' }: Props) {
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
      {/* Mockup .shot-slideshow — 21/9 desktop, 16/10 mobile, radius 16 */}
      <div className="shot-slideshow relative aspect-[16/10] overflow-hidden rounded-2xl bg-teal-900 shadow-mockup md:aspect-[21/9]">
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
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(180deg,rgba(0,0,0,0) 42%,rgba(0,0,0,.82) 100%)',
          }}
        />
        {/* .sc-scene — white pill */}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/92 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.02em] text-ink">
          {scene}
        </span>
        <div className="absolute inset-x-3.5 bottom-3 text-cream">
          <p className="text-[13.5px] font-bold leading-[1.3]">{title}</p>
          {lang === 'en' && (
            <p className="mt-0.5 font-thai text-[10px] opacity-85">{slide.titleTh}</p>
          )}
          {slide.meta && (
            <p className="mt-1.5 font-mono text-[9.5px] font-bold tracking-[0.01em] opacity-92">
              {slide.meta}
            </p>
          )}
        </div>
      </div>
      <div className="ss-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={i === index ? 'on' : ''}
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
