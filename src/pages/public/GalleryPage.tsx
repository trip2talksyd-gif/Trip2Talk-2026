import { useMemo, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import {
  filterGalleryPhotos,
  GALLERY_PHOTOS,
  photoSrc,
  type GalleryFilter,
} from '../../data/galleryPhotos'
import GalleryLightbox from '../../components/gallery/GalleryLightbox'
import PhotoSlideshow from '../../components/photoGuide/PhotoSlideshow'

export default function GalleryPage() {
  const { lang, t } = useLang()
  const [cat, setCat] = useState<GalleryFilter>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const tabs: { id: GalleryFilter; label: string; th: string }[] = [
    { id: 'all', label: t('common.all'), th: 'ทั้งหมด' },
    { id: 'new-zealand', label: 'New Zealand', th: 'นิวซีแลนด์' },
    { id: 'tasmania', label: 'Tasmania', th: 'แทสเมเนีย' },
    { id: 'nsw', label: 'NSW', th: 'NSW' },
    { id: 'sydney', label: 'Sydney', th: 'ซิดนีย์' },
  ]

  const items = useMemo(() => filterGalleryPhotos(cat), [cat])

  const slides = useMemo(
    () =>
      items.slice(0, 8).map((photo) => ({
        photo,
        sceneEn: photo.caption_en || 'Gallery',
        sceneTh: photo.caption_th || 'แกลเลอรี',
        titleEn: 'Example album from Saen & team',
        titleTh: 'อัลบั้มตัวอย่างจากพี่แสนและทีม',
        meta: photo.id,
      })),
    [items],
  )

  return (
    <div className="space-y-4 pb-4">
      <header>
        <h1 className="font-serif text-2xl text-ink">{t('nav.gallery')}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {lang === 'th'
            ? 'ผลงานถ่ายภาพจากทริป Trip2Talk'
            : 'Photography from Trip2Talk journeys'}
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCat(tab.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              cat === tab.id
                ? 'bg-teal-900 text-cream'
                : 'border border-line bg-cream text-ink-soft'
            }`}
          >
            {lang === 'th' ? tab.th : tab.label}
          </button>
        ))}
      </div>

      {GALLERY_PHOTOS.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line bg-mint-100 px-6 py-12 text-center">
          <ImageOff className="h-10 w-10 text-ink-soft" />
          <p className="mt-3 text-sm font-medium text-ink">
            {lang === 'th' ? 'ยังไม่มีรูปในแกลเลอรี' : 'No gallery photos yet'}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-mint-100 px-4 py-8 text-center text-sm text-ink-soft">
          {lang === 'th' ? 'ไม่มีรูปในหมวดนี้' : 'No photos in this category'}
        </div>
      ) : (
        <>
          <section>
            <p className="mb-2 text-sm font-bold text-ink">
              {lang === 'th' ? 'อัลบั้มตัวอย่างจากพี่แสนและทีม' : 'Example album from Saen & team'}
            </p>
            <PhotoSlideshow slides={slides} />
          </section>

          <div className="grid grid-cols-3 gap-1.5">
            {items.map((photo, idx) => {
              const caption = lang === 'th' ? photo.caption_th : photo.caption_en
              const tall = idx % 7 === 0
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                    tall ? 'row-span-2' : ''
                  }`}
                >
                  <img
                    src={photoSrc(photo)}
                    alt={caption}
                    loading="lazy"
                    className={`w-full object-cover ${tall ? 'h-[164px]' : 'h-[78px]'}`}
                  />
                </button>
              )
            })}
          </div>
        </>
      )}

      {lightboxIndex !== null && items.length > 0 && (
        <GalleryLightbox
          photos={items}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
