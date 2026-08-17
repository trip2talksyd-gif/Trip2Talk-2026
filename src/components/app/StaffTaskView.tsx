import type { ReactNode } from 'react'
import { ArrowLeft, type LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  titleTh?: string
  subtitle?: string
  onClose: () => void
  closeDisabled?: boolean
  children: ReactNode
}

/** Large centered staff task panel — 44px back control, readable type, ~420px card. */
export default function StaffTaskView({
  icon: Icon,
  title,
  titleTh,
  subtitle,
  onClose,
  closeDisabled,
  children,
}: Props) {
  return (
    <div
      className="staff-shell fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 text-cream sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-task-title"
      onClick={() => {
        if (!closeDisabled) onClose()
      }}
    >
      <div
        className="max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-2xl border border-white/12 bg-near-black-green p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-cream hover:bg-white/12 disabled:opacity-40"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 pt-0.5">
            <h2 id="staff-task-title" className="flex items-center gap-2 text-lg font-semibold leading-snug text-cream">
              <Icon className="h-5 w-5 shrink-0 text-teal-400" aria-hidden />
              <span>{title}</span>
            </h2>
            {titleTh ? (
              <p className="pl-7 font-thai text-sm text-cream-muted" lang="th">
                {titleTh}
              </p>
            ) : null}
            {subtitle ? (
              <p className="mt-1 pl-7 text-sm text-cream-muted">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

export function TaskFieldLabel({
  icon: Icon,
  children,
}: {
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <span className="mb-1.5 flex items-center gap-2 text-sm text-cream-muted">
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </span>
  )
}
