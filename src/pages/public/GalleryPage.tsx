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

export default function GalleryPage() {
  const { lang, t } = useLang()
  const [cat, setCat] = useState<GalleryFilter>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const tabs: { id: GalleryFilter; label: string }[] = [
    { id: 'all', label: t('common.all') },
    { id: 'new-zealand', label: lang === 'th' ? 'นิวซีแลนด์' : 'New Zealand' },
    { id: 'tasmania', label: lang === 'th' ? 'แทสเมเนีย' : 'Tasmania' },
    { id: 'nsw', label: 'NSW' },
    { id: 'sydney', label: lang === 'th' ? 'ซิดนีย์' : 'Sydney' },
  ]

  const items = useMemo(() => filterGalleryPhotos(cat), [cat])

  return (
    <div>
      <h1 className="font-serif text-2xl text-brand-dark">{t('nav.gallery')}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {lang === 'th'
          ? 'ผลงานถ่ายภาพจากทริป Trip2Talk'
          : 'Photography from Trip2Talk journeys'}
      </p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCat(tab.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              cat === tab.id ? 'bg-deep-green text-cream' : 'bg-white text-brand-dark/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {GALLERY_PHOTOS.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
          <ImageOff className="h-10 w-10 text-gray-400" />
          <p className="mt-3 text-sm font-medium text-brand-dark">
            {lang === 'th' ? 'ยังไม่มีรูปในแกลเลอรี' : 'No gallery photos yet'}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          {lang === 'th' ? 'ไม่มีรูปในหมวดนี้' : 'No photos in this category'}
        </div>
      ) : (
        <div className="mt-6 columns-2 gap-3 md:columns-3 lg:columns-4">
          {items.map((photo, idx) => {
            const caption = lang === 'th' ? photo.caption_th : photo.caption_en
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <img
                  src={photoSrc(photo)}
                  alt={caption}
                  loading="lazy"
                  className="w-full object-cover"
                />
                <p className="mt-1 truncate px-1 text-left text-xs text-gray-600">{caption}</p>
              </button>
            )
          })}
        </div>
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
