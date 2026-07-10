import { useLang } from '../../hooks/useLang'
import { GALLERY_PHOTOS, photoSrc } from '../../data/galleryPhotos'
import type { TranslationKey } from '../../i18n/translations'

/** Chamfered/angular card — top-left & bottom-right cuts (founders stat card spec). */
const CHAMFER_CLIP =
  'polygon(0 40px, 40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)'

const STAT_CARDS = [
  {
    value: '13',
    labelKey: 'about.stats.1.label' as const,
    descKey: 'about.stats.1.desc' as const,
    photoId: 'nsw-006',
    offset: false,
  },
  {
    value: '100%',
    labelKey: 'about.stats.2.label' as const,
    descKey: 'about.stats.2.desc' as const,
    photoId: 'tas-002',
    offset: true,
  },
  {
    value: '10+',
    labelKey: 'about.stats.3.label' as const,
    descKey: 'about.stats.3.desc' as const,
    photoId: 'syd-011',
    offset: false,
  },
] satisfies {
  value: string
  labelKey: TranslationKey
  descKey: TranslationKey
  photoId: string
  offset: boolean
}[]

function StatCard({
  value,
  labelKey,
  descKey,
  photoId,
  offset,
}: (typeof STAT_CARDS)[number]) {
  const { t } = useLang()
  const photo = GALLERY_PHOTOS.find((p) => p.id === photoId)

  return (
    <article
      className={`relative min-h-[300px] sm:min-h-[360px] ${offset ? 'lg:mt-24' : ''}`}
      style={{ clipPath: CHAMFER_CLIP }}
    >
      {photo && (
        <img
          src={photoSrc(photo)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-near-black-green/90 via-near-black-green/45 to-near-black-green/20" />
      <div className="relative flex h-full min-h-[300px] flex-col justify-end p-6 sm:min-h-[360px] sm:p-8">
        <p
          className="font-serif text-5xl font-semibold leading-none tracking-tight sm:text-6xl"
          style={{
            backgroundImage: 'linear-gradient(294deg, #0d4a2e 20%, #d4a853)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {value}
        </p>
        <p className="mt-2 font-serif text-lg font-semibold text-cream sm:text-xl">
          {t(labelKey)}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-cream-muted">{t(descKey)}</p>
      </div>
    </article>
  )
}

export default function AboutStatsSection() {
  const { t } = useLang()

  return (
    <section className="relative -mx-4 bg-cream px-4 pb-16 pt-2 sm:px-6 lg:pb-20">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-12">
        <h2 className="font-serif text-3xl leading-tight tracking-tight text-brand-dark sm:text-4xl lg:text-5xl">
          {t('about.stats.heading.line1')}
          <br />
          <span className="text-deep-green">{t('about.stats.heading.line2')}</span>
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-brand-dark/75 sm:text-base">
          {t('about.stats.intro')}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.photoId} {...card} />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-40"
        style={{
          background:
            'linear-gradient(to bottom, rgba(247,244,236,0), rgba(247,244,236,0.7), #f7f4ec)',
        }}
        aria-hidden
      />
    </section>
  )
}
