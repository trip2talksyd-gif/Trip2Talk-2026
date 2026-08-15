import { useMemo, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import {
  filterGalleryPhotos,
  GALLERY_PHOTOS,
  photoThumbSrc,
  type GalleryFilter,
  type GalleryPhoto,
} from '../../data/galleryPhotos'
import { getGalleryAlbums } from '../../data/galleryAlbums'
import GalleryAlbumCarousel from '../../components/gallery/GalleryAlbumCarousel'
import GalleryAuthenticityNote from '../../components/gallery/GalleryAuthenticityNote'
import GalleryLightbox from '../../components/gallery/GalleryLightbox'
import BiText from '../../components/ui/BiText'

/** Short location tag for caption chips, e.g. "Ben Lomond · TAS" → BEN LOMOND */
function locationTag(photo: GalleryPhoto): string {
  const raw = photo.location.split(/[·,]/)[0]?.trim() ?? ''
  return raw
    .replace(/\s+/g, ' ')
    .slice(0, 22)
    .toUpperCase()
}

export default function GalleryPage() {
  const { tt } = useLang()
  const [cat, setCat] = useState<GalleryFilter>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const allBi = tt('common.all')
  const titleBi = tt('nav.gallery')
  const emptyBi = tt('gallery.empty')
  const emptyCatBi = tt('gallery.emptyCategory')
  const albumBi = tt('gallery.exampleAlbum')

  const albums = useMemo(() => getGalleryAlbums(), [])

  const tabs: { id: GalleryFilter; label: string; th: string }[] = [
    { id: 'all', label: allBi.en, th: allBi.th },
    { id: 'outback', label: 'Uluru', th: 'อุลูรู' },
    { id: 'tasmania', label: 'Tasmania', th: 'แทสเมเนีย' },
    { id: 'new-zealand', label: 'New Zealand', th: 'นิวซีแลนด์' },
    { id: 'melbourne', label: 'Melbourne', th: 'เมลเบิร์น' },
    { id: 'sydney', label: 'Sydney', th: 'ซิดนีย์' },
    { id: 'nsw', label: 'NSW', th: 'NSW' },
  ]

  const items = useMemo(() => filterGalleryPhotos(cat), [cat])

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
      ) : (
        <section className="space-y-4">
          {albums.length > 0 && (
            <GalleryAlbumCarousel
              albums={albums}
              onSelectAlbum={(album) => setCat(album.id)}
            />
          )}

          <div>
            <p className="mb-2 px-0.5 text-sm font-bold text-ink">
              {albumBi.en}
              <span className="ml-1.5 font-thai text-xs font-medium text-ink-soft">
                {albumBi.th}
              </span>
              {cat !== 'all' && (
                <span className="ml-2 text-[11px] font-medium text-teal-700">
                  · {tabs.find((t) => t.id === cat)?.label}
                </span>
              )}
            </p>

            <GalleryAuthenticityNote className="mb-3" />

            {items.length === 0 ? (
              <div className="rounded-xl bg-mint-100 px-4 py-8 text-center text-sm text-ink-soft">
                {emptyCatBi.en}
                <span className="mt-0.5 block font-thai text-xs text-ink-soft/85">
                  {emptyCatBi.th}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-5">
                {items.map((photo, idx) => {
                  const caption = `${photo.caption_en} / ${photo.caption_th}`
                  const tag = locationTag(photo)
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-teal-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <img
                        src={photoThumbSrc(photo, { width: 720, quality: 70, format: 'webp' })}
                        alt={caption}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
                        aria-hidden
                      />
                      <span className="absolute inset-x-1.5 bottom-1.5 truncate rounded-full bg-cream/93 px-2 py-[3px] text-left text-[8px] font-bold leading-tight tracking-wide text-ink shadow-[0_4px_10px_-4px_rgba(0,0,0,0.45)] sm:inset-x-2 sm:bottom-2 sm:px-2.5 sm:text-[9px]">
                        {photo.caption_en}
                        {tag ? (
                          <span className="font-extrabold text-teal-800"> #{tag}</span>
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
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
