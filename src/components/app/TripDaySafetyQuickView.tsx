import { useMemo, useState } from 'react'
import { Phone } from 'lucide-react'
import type { TourBooking } from '../../types/tour'
import { useLang } from '../../hooks/useLang'

type Props = {
  bookings: TourBooking[]
  /** Optional trip filter — when empty, show all (caller usually pre-filters by tour). */
  tripFilter?: string
  onTripFilterChange?: (tripCode: string) => void
  tripOptions?: { code: string; label: string }[]
}

function display(value: string | null | undefined, empty = '—'): string {
  const v = (value ?? '').trim()
  return v || empty
}

function insuranceLine(b: TourBooking): string {
  const type = b.insurance_type ?? (b.oshc_provider ? 'oshc' : null)
  if (type === 'oshc') {
    const mem = b.oshc_membership_number || b.oshc_provider
    return `OSHC${mem ? ` · ${mem}` : ''}${b.oshc_risk_acknowledged ? ' · risk OK' : ''}`
  }
  if (type === 'travel_insurance') {
    const prov =
      b.travel_insurance_provider || b.insurance_provider || 'Travel'
    const pol = b.travel_insurance_policy_number || b.insurance_policy_number
    return `${prov}${pol ? ` · #${pol}` : ''}`
  }
  if (type === 'none') return 'None / ไม่มี'
  if (b.insurance_provider || b.oshc_provider) {
    return display(b.insurance_provider || b.oshc_provider)
  }
  return '—'
}

/** Compact trip-day cards: tap-to-call emergency + color-coded warnings. */
export default function TripDaySafetyQuickView({
  bookings,
  tripFilter = '',
  onTripFilterChange,
  tripOptions,
}: Props) {
  const { tt } = useLang()
  const [localFilter, setLocalFilter] = useState('')
  const filter = tripFilter || localFilter
  const setFilter = onTripFilterChange ?? setLocalFilter

  const title = tt('staff.safety.quickView')

  const active = useMemo(() => {
    return bookings
      .filter((b) => !b.cancelled_at)
      .filter((b) => !filter || b.trip_code === filter)
  }, [bookings, filter])

  const options =
    tripOptions ??
    [...new Set(bookings.map((b) => b.trip_code).filter(Boolean))].map((code) => ({
      code,
      label: code,
    }))

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-gold">
            {title.en}
          </h3>
          <p lang="th" className="mt-0.5 font-serif text-[10px] font-medium text-cream-muted">
            {title.th}
          </p>
        </div>
        {options.length > 0 && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-white/15 bg-surface-card px-2 py-1 text-[11px] text-cream"
            aria-label="Filter by trip"
          >
            <option value="">All trips</option>
            {options.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {active.length === 0 ? (
        <p className="text-xs text-cream-muted">
          No guests yet
          <span className="mt-0.5 block font-thai opacity-80">ยังไม่มีลูกทริป</span>
        </p>
      ) : (
        <ul className="space-y-2.5">
          {active.map((b) => {
            const hasAllergy = Boolean(b.allergies?.trim())
            const hasMedical = Boolean(b.medical_conditions?.trim())
            const hasFlag =
              hasAllergy ||
              hasMedical ||
              Boolean(b.other_notes?.trim()) ||
              Boolean(b.dietary_requirements?.trim())
            const phone = (b.emergency_contact_phone ?? '').trim()

            return (
              <li
                key={b.id}
                className={`rounded-editorial border px-3 py-2.5 ${
                  hasAllergy || hasMedical
                    ? 'border-coral/60 bg-coral/15'
                    : hasFlag
                      ? 'border-gold/40 bg-gold/10'
                      : 'border-white/10 bg-surface-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-cream">
                      {b.first_name_en} {b.last_name_en}
                    </p>
                    <p className="text-[10px] text-cream-muted">{b.trip_code}</p>
                  </div>
                  {(hasAllergy || hasMedical) && (
                    <span className="shrink-0 rounded-full bg-coral px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cream">
                      Alert
                    </span>
                  )}
                </div>

                <div className="mt-2 grid gap-1.5 text-[11px] leading-snug text-cream/90">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-cream-muted">Emergency · ฉุกเฉิน:</span>
                    <span>{display(b.emergency_contact_name)}</span>
                    {phone ? (
                      <a
                        href={`tel:${phone.replace(/\s/g, '')}`}
                        className="inline-flex items-center gap-1 rounded-full bg-teal-600/30 px-2 py-0.5 text-[10px] font-semibold text-gold"
                      >
                        <Phone className="h-3 w-3" />
                        {phone}
                      </a>
                    ) : (
                      <span>—</span>
                    )}
                  </p>
                  <p className={hasAllergy ? 'font-semibold text-coral' : undefined}>
                    <span className="text-cream-muted">Allergies · แพ้: </span>
                    {display(b.allergies, 'none / ไม่มี')}
                  </p>
                  <p className={hasMedical ? 'font-semibold text-coral' : undefined}>
                    <span className="text-cream-muted">Medical · สุขภาพ: </span>
                    {display(b.medical_conditions, 'none / ไม่มี')}
                  </p>
                  <p>
                    <span className="text-cream-muted">Insurance · ประกัน: </span>
                    {insuranceLine(b)}
                  </p>
                  {b.dietary_requirements?.trim() && (
                    <p>
                      <span className="text-cream-muted">Diet · อาหาร: </span>
                      {b.dietary_requirements}
                    </p>
                  )}
                  {b.other_notes?.trim() && (
                    <p>
                      <span className="text-cream-muted">Notes · หมายเหตุ: </span>
                      {b.other_notes}
                    </p>
                  )}
                  {b.flight_booking_requested && (
                    <p className="text-gold">
                      Flight assist requested · ขอให้จองตั๋วบิน
                      {b.flight_legal_first_name
                        ? ` · ${b.flight_legal_first_name} ${b.flight_legal_last_name ?? ''}`
                        : ''}
                      {b.flight_nationality ? ` · ${b.flight_nationality}` : ''}
                      {/* passport intentionally omitted from this scannable view */}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
