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
import BiText from '../../components/ui/BiText'

export default function GalleryPage() {
  const { tt } = useLang()
  const [cat, setCat] = useState<GalleryFilter>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const allBi = tt('common.all')
  const titleBi = tt('nav.gallery')
  const emptyBi = tt('gallery.empty')
  const emptyCatBi = tt('gallery.emptyCategory')
  const albumBi = tt('gallery.exampleAlbum')

  const tabs: { id: GalleryFilter; label: string; th: string }[] = [
    { id: 'all', label: allBi.en, th: allBi.th },
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
    const album = tt('gallery.exampleAlbum')
    return mixed.slice(0, 10).map((photo) => ({
      photo,
      sceneEn: photo.caption_en || 'Gallery',
      sceneTh: photo.caption_th || 'แกลเลอรี',
      titleEn: album.en,
      titleTh: album.th,
      meta: photo.id,
    }))
  }, [tt])

  return (
    <div className="space-y-4 pb-4">
      <header className="-mx-4 border-b border-line bg-card px-4 pb-2.5 pt-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <BiText
          as="h1"
          en={titleBi.en}
          th={titleBi.th}
          serif
          className="mb-2.5 text-[17px] text-ink sm:text-2xl"
          thClassName="mt-px block font-thai text-[11px] font-medium text-ink-soft sm:text-[13px]"
        />
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
              {tab.label}
              <span className="ml-1 font-thai text-[9px] font-medium opacity-80">{tab.th}</span>
            </button>
          ))}
        </div>
      </header>

      {GALLERY_PHOTOS.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-line bg-mint-100 px-6 py-12 text-center">
          <ImageOff className="h-10 w-10 text-ink-soft" />
          <p className="mt-3 text-sm font-medium text-ink">
            {emptyBi.en}
            <span className="mt-0.5 block font-thai text-xs font-normal text-ink-soft">
              {emptyBi.th}
            </span>
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-mint-100 px-4 py-8 text-center text-sm text-ink-soft">
          {emptyCatBi.en}
          <span className="mt-0.5 block font-thai text-xs text-ink-soft/85">{emptyCatBi.th}</span>
        </div>
      ) : (
        <section className="space-y-2.5">
          <div>
            <p className="mb-1.5 text-sm font-bold text-ink">
              {albumBi.en}
              <span className="ml-1.5 font-thai text-xs font-medium text-ink-soft">
                {albumBi.th}
              </span>
            </p>
            <PhotoSlideshow slides={slides} />
          </div>

          <div className="grid grid-cols-3 gap-[5px]">
            {items.map((photo, idx) => {
              const caption = `${photo.caption_en} / ${photo.caption_th}`
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
        </section>
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
