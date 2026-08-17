import { AFTERPAY_HOW_IT_WORKS } from '../booking/SquareAcceptedPaymentIcons'
import { useLang } from '../../hooks/useLang'

/**
 * Official Afterpay secondary lock-up (merchant kit 02_Logo).
 * Light Trip2Talk cards → black wordmark + symbol. Legal sits beside the mark, never over it.
 */
export default function AfterpayAcceptedBadge() {
  const { lang, tt } = useLang()
  const alt = tt('afterpay.badge.alt')
  const legal = tt('afterpay.legal')
  const how = tt('pricing.ways.afterpay.link')
  const caption = lang === 'th' ? 'รับชำระที่นี่' : 'Now accepted here'

  return (
    <div className="mt-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">{caption}</p>
      <a
        href={AFTERPAY_HOW_IT_WORKS}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block max-w-full"
        aria-label={`${alt.en}. ${how.en}`}
      >
        <img
          src="/brand/afterpay-secondary-logo-black.svg"
          alt={`${alt.en} / ${alt.th}`}
          className="h-auto w-[min(100%,240px)]"
          width={240}
          height={46}
        />
      </a>
      <p className="mt-1.5 max-w-[280px] text-[9px] leading-snug text-ink-soft">{legal.en}</p>
    </div>
  )
}
