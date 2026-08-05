import type { TourBooking } from '../../types/tour'

type Props = {
  bookings: TourBooking[]
}

function display(value: string | null | undefined, empty = '—'): string {
  const v = (value ?? '').trim()
  return v || empty
}

/** Compact trip-day cards: emergency + allergies/medical/insurance for guides. */
export default function TripDaySafetyQuickView({ bookings }: Props) {
  const active = bookings.filter((b) => !b.cancelled_at)

  if (active.length === 0) {
    return (
      <p className="text-xs text-cream-muted">
        No guests yet
        <span className="mt-0.5 block font-thai opacity-80">ยังไม่มีลูกทริป</span>
      </p>
    )
  }

  return (
    <ul className="space-y-2.5">
      {active.map((b) => {
        const hasFlag =
          Boolean(b.allergies?.trim()) ||
          Boolean(b.medical_conditions?.trim()) ||
          Boolean(b.other_notes?.trim()) ||
          Boolean(b.dietary_requirements?.trim())

        return (
          <li
            key={b.id}
            className={`rounded-editorial border px-3 py-2.5 ${
              hasFlag
                ? 'border-coral/50 bg-coral/10'
                : 'border-white/10 bg-surface-card'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-cream">
                {b.first_name_en} {b.last_name_en}
              </p>
              {hasFlag && (
                <span className="shrink-0 rounded-full bg-coral/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cream">
                  Check notes
                </span>
              )}
            </div>

            <div className="mt-2 grid gap-1.5 text-[11px] leading-snug text-cream/90">
              <p>
                <span className="text-cream-muted">🚨 Emergency · ฉุกเฉิน: </span>
                {display(b.emergency_contact_name)} · {display(b.emergency_contact_phone)}
              </p>
              <p>
                <span className="text-cream-muted">⚠️ Allergies · แพ้: </span>
                {display(b.allergies, 'none / ไม่มี')}
              </p>
              <p>
                <span className="text-cream-muted">💊 Medical · สุขภาพ: </span>
                {display(b.medical_conditions, 'none / ไม่มี')}
              </p>
              {(b.insurance_provider || b.insurance_policy_number || b.oshc_provider) && (
                <p>
                  <span className="text-cream-muted">🛡 Insurance · ประกัน: </span>
                  {display(b.insurance_provider || b.oshc_provider)}
                  {b.insurance_policy_number
                    ? ` · #${b.insurance_policy_number}`
                    : b.oshc_expiry
                      ? ` · OSHC exp ${b.oshc_expiry}`
                      : ''}
                </p>
              )}
              {b.dietary_requirements?.trim() && (
                <p>
                  <span className="text-cream-muted">🍽 Diet · อาหาร: </span>
                  {b.dietary_requirements}
                </p>
              )}
              {b.other_notes?.trim() && (
                <p>
                  <span className="text-cream-muted">📝 Notes · หมายเหตุ: </span>
                  {b.other_notes}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
