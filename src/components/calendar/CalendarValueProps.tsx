import { Check, X } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import type { TranslationKey } from '../../i18n/translations'
import { GALLERY_PHOTOS, photoSrc } from '../../data/galleryPhotos'

const CENTER_PHOTO = GALLERY_PHOTOS.find((p) => p.id === 'nz-013')

const NEGATIVE_KEYS = [
  'calendar.value.negative.1',
  'calendar.value.negative.2',
  'calendar.value.negative.3',
  'calendar.value.negative.4',
  'calendar.value.negative.5',
] as const satisfies readonly TranslationKey[]

const POSITIVE_KEYS = [
  'calendar.value.positive.1',
  'calendar.value.positive.2',
  'calendar.value.positive.3',
  'calendar.value.positive.4',
  'calendar.value.positive.5',
] as const satisfies readonly TranslationKey[]

function ValueCard({
  items,
  variant,
}: {
  items: readonly TranslationKey[]
  variant: 'negative' | 'positive'
}) {
  const { t } = useLang()
  const isNegative = variant === 'negative'

  return (
    <div className="liquid-glass relative rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:p-6">
      <ul className="relative z-10 space-y-3.5">
        {items.map((key) => (
          <li key={key} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                isNegative ? 'bg-coral/10 text-coral' : 'bg-gold/10 text-gold'
              }`}
            >
              {isNegative ? (
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
            </span>
            <span className="text-sm leading-relaxed text-cream-muted">{t(key)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CalendarValueProps() {
  const { t } = useLang()

  return (
    <section className="mb-8 font-sans">
      <div className="flex flex-col items-center text-center">
        <span className="liquid-glass inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream">
          {t('calendar.value.badge')}
        </span>

        <h2 className="mt-5 max-w-xl text-2xl font-semibold leading-tight tracking-tight text-cream sm:text-3xl md:text-4xl">
          {t('calendar.value.heading.line1')}
          <br />
          <span className="bg-gradient-to-r from-gold via-gold to-amber bg-clip-text text-transparent">
            {t('calendar.value.heading.line2')}
          </span>
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
        <ValueCard items={NEGATIVE_KEYS} variant="negative" />

        <div className="mx-auto flex justify-center lg:order-none">
          {CENTER_PHOTO && (
            <div
              className="relative shrink-0 overflow-hidden rounded-full shadow-[0_16px_48px_rgba(0,0,0,0.35)] ring-4 ring-gold/30"
              style={{
                width: 'clamp(200px, 22vw, 400px)',
                height: 'clamp(200px, 22vw, 400px)',
              }}
            >
              <img
                src={photoSrc(CENTER_PHOTO)}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <ValueCard items={POSITIVE_KEYS} variant="positive" />
      </div>
    </section>
  )
}
