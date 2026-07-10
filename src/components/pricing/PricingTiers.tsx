import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { useInView } from '../../hooks/useInView'
import type { TranslationKey } from '../../i18n/translations'

const STANDARD_CHECKS = [
  'pricing.standard.check.1',
  'pricing.standard.check.2',
  'pricing.standard.check.3',
] as const satisfies readonly TranslationKey[]

const PRIVATE_CHECKS = [
  'pricing.private.check.1',
  'pricing.private.check.2',
  'pricing.private.check.3',
] as const satisfies readonly TranslationKey[]

type TierCardProps = {
  variant: 'standard' | 'private'
  visible: boolean
  delayMs?: number
}

function TierCard({ variant, visible, delayMs = 0 }: TierCardProps) {
  const { t } = useLang()
  const isPrivate = variant === 'private'
  const checks = isPrivate ? PRIVATE_CHECKS : STANDARD_CHECKS
  const prefix = isPrivate ? 'pricing.private' : 'pricing.standard'

  return (
    <article
      className={`relative flex flex-col rounded-2xl p-6 transition-all duration-700 sm:p-7 ${
        isPrivate
          ? 'border border-gold/20 bg-surface-card shadow-[0_20px_60px_rgba(0,0,0,0.35)]'
          : 'bg-near-black-green'
      } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {isPrivate && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-dark">
          {t('pricing.private.badge')}
        </span>
      )}

      <h3 className="font-serif text-xl text-cream sm:text-2xl">
        {t(isPrivate ? 'common.private' : 'common.standard')}
      </h3>
      <p className="mt-1 text-sm font-medium text-cream">{t(`${prefix}.pax` as TranslationKey)}</p>
      <p className="mt-4 font-serif text-2xl text-gold sm:text-3xl">
        {t(`${prefix}.price` as TranslationKey)}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-cream-muted">
        {t(`${prefix}.desc` as TranslationKey)}
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {checks.map((key) => (
          <li key={key} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className="text-sm leading-relaxed text-cream/90">{t(key)}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/trips"
        className={`mt-8 inline-flex w-full items-center justify-center rounded-editorial px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 ${
          isPrivate
            ? 'bg-gold text-gold-dark'
            : 'border border-gold/40 bg-transparent text-gold'
        }`}
      >
        {t(`${prefix}.cta` as TranslationKey)}
      </Link>
    </article>
  )
}

export default function PricingTiers() {
  const { t } = useLang()
  const { ref, isVisible } = useInView<HTMLDivElement>(0.12)

  return (
    <section>
      <h2 className="text-lg font-semibold text-brand-dark">{t('pricing.compare')}</h2>
      <div ref={ref} className="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-6">
        <TierCard variant="standard" visible={isVisible} />
        <TierCard variant="private" visible={isVisible} delayMs={120} />
      </div>
    </section>
  )
}
