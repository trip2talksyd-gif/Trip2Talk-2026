import { Link } from 'react-router-dom'
import type { TripType } from '../../types/tour'
import { useLang } from '../../hooks/useLang'
import { useInView } from '../../hooks/useInView'
import { GALLERY_PHOTOS, photoImageAttrs } from '../../data/galleryPhotos'
import { STORAGE_SIZES } from '../../lib/storageImage'

const CATEGORIES: { type: TripType; photoId: string; labelKey: 'common.oneday' | 'common.overnight' | 'common.multiday' }[] = [
  { type: 'oneday', photoId: 'syd-015', labelKey: 'common.oneday' },
  { type: 'overnight', photoId: 'nsw-010', labelKey: 'common.overnight' },
  { type: 'multiday', photoId: 'nz-013', labelKey: 'common.multiday' },
]

function CategoryCard({ category }: { category: (typeof CATEGORIES)[number] }) {
  const { t } = useLang()
  const photo = GALLERY_PHOTOS.find((p) => p.id === category.photoId)
  const label = t(category.labelKey)

  return (
    <Link
      to={`/trips?type=${category.type}`}
      className="group relative flex min-h-[400px] flex-col items-start justify-between overflow-hidden p-6 sm:min-h-[500px] sm:p-8 md:min-h-[750px] md:p-12"
    >
      {photo && (
        <img
          {...photoImageAttrs(photo, 'hero', STORAGE_SIZES.third)}
          alt={label}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-teal-900/70 via-teal-900/15 to-teal-900/25 transition-colors duration-500 group-hover:from-teal-900/80" />

      <h2
        className="relative z-10 whitespace-nowrap font-serif text-3xl font-medium text-cream transition-transform duration-500 group-hover:-translate-y-2 sm:text-5xl md:text-6xl lg:text-7xl"
        style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
      >
        {label}
      </h2>

      <span className="btn-embossed relative z-10 mt-auto !flex-none rounded-full px-8 py-3 text-sm">
        {t('home.category.viewPrefix')} {label}
      </span>
    </Link>
  )
}

export default function TripTypeCategories() {
  const { t } = useLang()
  const { ref, isVisible } = useInView<HTMLDivElement>(0.1)

  return (
    <section className="w-full bg-teal-900 text-white">
      <h2 className="px-4 py-4 text-center font-serif text-xl text-cream sm:hidden">
        {t('home.category.title')}
      </h2>
      <div
        ref={ref}
        className={`grid grid-cols-1 transition-all duration-1000 ease-out md:grid-cols-3 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}
      >
        {CATEGORIES.map((category, index) => (
          <div key={category.type} className="min-h-0" style={{ transitionDelay: `${index * 150}ms` }}>
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </section>
  )
}
