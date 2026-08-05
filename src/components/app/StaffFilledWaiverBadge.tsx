/** Visible audit badge when a waiver was filled by staff on the customer's behalf. */
type Props = {
  staffName?: string | null
  authorizedAt?: string | null
  note?: string | null
  className?: string
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function StaffFilledWaiverBadge({
  staffName,
  authorizedAt,
  note,
  className = '',
}: Props) {
  const when = formatWhen(authorizedAt)
  return (
    <span
      className={`inline-flex max-w-full flex-col gap-0.5 rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-1 text-left ${className}`}
      title={note ?? undefined}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-200">
        Filled by staff
        <span className="ml-1 font-thai font-medium normal-case tracking-normal opacity-90">
          · กรอกโดยพนักงาน
        </span>
      </span>
      <span className="truncate text-[10px] text-amber-100/90">
        {staffName || 'Staff'}
        {when ? ` · ${when}` : ''}
      </span>
    </span>
  )
}
