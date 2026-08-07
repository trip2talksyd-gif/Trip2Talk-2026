import { Camera, Car, Images } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import type { TranslationKey } from '../../i18n/translations'
import { GALLERY_PHOTOS, photoSrc } from '../../data/galleryPhotos'

const BANNER_PHOTO = GALLERY_PHOTOS.find((p) => p.id === 'nz-013') ?? GALLERY_PHOTOS[0]

const FEATURES: { icon: typeof Camera; title: TranslationKey; desc: TranslationKey }[] = [
  {
    icon: Camera,
    title: 'calendar.photo.feature.1.title',
    desc: 'calendar.photo.feature.1.desc',
  },
  {
    icon: Car,
    title: 'calendar.photo.feature.2.title',
    desc: 'calendar.photo.feature.2.desc',
  },
  {
    icon: Images,
    title: 'calendar.photo.feature.3.title',
    desc: 'calendar.photo.feature.3.desc',
  },
]

export default function CalendarPhotographerBanner() {
  const { tt } = useLang()
  const eyebrow = tt('calendar.photo.eyebrow')
  const heading1 = tt('calendar.photo.heading.line1')
  const heading2 = tt('calendar.photo.heading.line2')
  const sub = tt('calendar.photo.sub')

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl">
      <div className="absolute inset-0">
        {BANNER_PHOTO && (
          <img
            src={photoSrc(BANNER_PHOTO)}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-near-black-green via-near-black-green/85 to-near-black-green/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-near-black-green/70 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 px-5 py-10 sm:px-8 sm:py-14">
        <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream">
          <Camera className="h-3.5 w-3.5 text-gold" strokeWidth={2.5} />
          {eyebrow.en}
          <span className="ml-1 font-thai text-[0.9em] font-medium opacity-85">{eyebrow.th}</span>
        </span>

        <h2 className="mt-5 max-w-md text-2xl font-semibold leading-tight tracking-tight text-cream sm:text-3xl md:text-4xl">
          {heading1.en}
          <br />
          <span className="bg-gradient-to-r from-gold via-gold to-amber bg-clip-text text-transparent">
            {heading2.en}
          </span>
          <span className="mt-1 block font-thai text-lg text-cream/85 sm:text-xl">
            {heading1.th} {heading2.th}
          </span>
        </h2>

        <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-muted">
          {sub.en}
          <span className="mt-1 block font-thai text-[0.92em] opacity-85">{sub.th}</span>
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => {
            const titleBi = tt(title)
            const descBi = tt(desc)
            return (
              <div
                key={title}
                className="liquid-glass rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                </span>
                <p className="mt-3 text-sm font-semibold text-cream">
                  {titleBi.en}
                  <span className="ml-1 font-thai text-[0.9em] font-medium opacity-85">
                    {titleBi.th}
                  </span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-cream-muted/80">
                  {descBi.en}
                  <span className="mt-0.5 block font-thai opacity-90">{descBi.th}</span>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
