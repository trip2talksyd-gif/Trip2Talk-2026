import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  label: string
  labelTh?: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  busy?: boolean
}

/** Equal-size Cashier action tile — icon above short label, min 44px tap height. */
export default function StaffActionTile({
  icon: Icon,
  label,
  labelTh,
  onClick,
  disabled,
  danger,
  busy,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-2xl border px-1.5 py-2 text-center transition-colors disabled:opacity-40 ${
        danger
          ? 'border-coral/45 bg-coral/10 text-coral hover:bg-coral/20'
          : 'border-white/12 bg-white/[0.06] text-cream hover:border-teal-500/40 hover:bg-teal-800/50'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <span className="text-[11px] font-semibold leading-tight">{busy ? '…' : label}</span>
      {labelTh ? (
        <span className="font-thai text-[10px] font-medium leading-tight opacity-80" lang="th">
          {labelTh}
        </span>
      ) : null}
    </button>
  )
}
