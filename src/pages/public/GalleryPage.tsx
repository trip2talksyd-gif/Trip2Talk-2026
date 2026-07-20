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
    { id: 'melbourne', label: 'Melbourne', th: 'เมลเบิร์น' },
  ]

  const items = useMemo(() => filterGalleryPhotos(cat), [cat])

  // Featured slideshow always mixes photos from every trip/destination
  // (regardless of which filter tab is selected below) so it feels like a
  // showcase of the whole gallery, not just whatever category is active.
  // Interleaved round-robin by category so it doesn't just show Melbourne's
  // 8 photos back-to-back before getting to anywhere else.
  const slides = useMemo(() => {
    const byCategory = new Map<string, typeof GALLERY_PHOTOS>()
    for (const photo of GALLERY_PHOTOS) {
      const list = byCategory.get(photo.category)
      if (list) list.push(photo)
      else byCategory.set(photo.category, [photo])
    }
    const buckets = [...byCategory.values()]
    const mixed: typeof GALLERY_PHOTOS = []
    for (let i = 0; mixed.length < GALLERY_PHOTOS.length; i++) {
      let addedAny = false
      for (const bucket of buckets) {
        if (bucket[i]) {
          mixed.push(bucket[i])
          addedAny = true
        }
      }
      if (!addedAny) break
    }
    return mixed.slice(0, 10).map((photo) => ({
      photo,
      sceneEn: photo.caption_en || 'Gallery',
      sceneTh: photo.caption_th || 'แกลเลอรี',
      titleEn: 'Example album from Saen & team',
      titleTh: 'อัลบั้มตัวอย่างจากพี่แสนและทีม',
      meta: photo.id,
    }))
  }, [])

  return (
    <div className="space-y-4 pb-4">
      <header className="-mx-4 border-b border-line bg-card px-4 pb-2.5 pt-2">
        <h1 className="mb-2.5 font-serif text-[17px] text-ink sm:text-2xl">
          {t('nav.gallery')}
          <span className="mt-px block font-thai text-[11px] font-medium text-ink-soft">
            {lang === 'th' ? 'แกลเลอรีภาพ' : 'Photo gallery'}
          </span>
        </h1>
        <div className="flex gap-[7px] overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCat(tab.id)}
              className={`shrink-0 rounded-full px-3 py-[7px] text-[10px] font-semibold leading-[1.4] ${
                cat === tab.id
                  ? 'border border-white/20 bg-gradient-to-b from-teal-500 to-teal-800 text-cream'
                  : 'bg-mint-100 text-teal-700'
              }`}
            >
              {lang === 'th' ? tab.th : tab.label}
            </button>
          ))}
        </div>
      </header>

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

          <div className="grid grid-cols-3 gap-[5px]">
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
