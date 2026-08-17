import { paymentMethodAccent, paymentMethodBadge } from '../../lib/paymentCredit'

type Props = {
  name: string
  tripCode: string
  paymentMethod?: string | null
  remainingAud: number | null
  cancelled?: boolean
  onOpen: () => void
}

/** Compact Cashier list card — tap to open the existing booking detail. */
export default function BookingSummaryCard({
  name,
  tripCode,
  paymentMethod,
  remainingAud,
  cancelled,
  onOpen,
}: Props) {
  const accent = paymentMethodAccent(paymentMethod)
  const remainingLabel =
    remainingAud === null ? 'เหลือ —' : `เหลือ ${remainingAud.toLocaleString()} AUD`

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-xl border border-white/12 border-t-[3px] bg-white/[0.06] p-3 text-left transition-colors hover:border-teal-500/35 hover:bg-white/[0.09] ${accent.border} ${
        cancelled ? 'opacity-60' : ''
      }`}
    >
      <p className="truncate text-sm font-medium leading-snug text-cream">{name}</p>
      <p className="mt-0.5 truncate text-[11px] text-cream-muted">{tripCode}</p>
      <span
        className={`mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${accent.badge}`}
      >
        {paymentMethodBadge(paymentMethod)}
      </span>
      <p className="mt-1.5 font-thai text-xs text-cream-muted" lang="th">
        {remainingLabel}
      </p>
    </button>
  )
}
