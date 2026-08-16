import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, ClipboardList, ShieldAlert, Users } from 'lucide-react'
import {
  fetchBookingStatusCounts,
  fetchInsuranceAlerts,
  fetchOwnerOpsMetrics,
  fetchPaymentReconciliationIssues,
  fetchPhotosPending,
  fetchToursAdmin,
  fetchWaitlist,
  formatAud,
  seatsRemaining,
  type BookingStatusCounts,
  type InsuranceAlert,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { Tour } from '../../types/tour'
import { StaffCard, StaffSectionTitle } from './staffUi'

const OWNER_MANAGER = new Set(['OWNER', 'MANAGER'])
const PHOTO_ROLES = new Set(['OWNER', 'MANAGER', 'GUIDE'])
const RECON_ROLES = new Set(['OWNER', 'MANAGER', 'CASHIER'])
const ALL_STAFF = new Set(['OWNER', 'MANAGER', 'GUIDE', 'CASHIER'])

const LIVE_TOUR_STATUSES = new Set(['confirmed', 'published', 'active', 'draft', 'completed'])

const STATUS_SEGMENTS: {
  key: keyof BookingStatusCounts
  labelEn: string
  labelTh: string
  color: string
}[] = [
  { key: 'pending_payment', labelEn: 'Pending', labelTh: 'รอชำระ', color: '#E8A54B' },
  { key: 'deposit_paid', labelEn: 'Deposit', labelTh: 'มัดจำ', color: '#C9A36A' },
  { key: 'fully_paid', labelEn: 'Paid', labelTh: 'ชำระครบ', color: '#2DD4BF' },
  { key: 'cancelled', labelEn: 'Cancelled', labelTh: 'ยกเลิก', color: '#9AA8AB' },
  { key: 'no_show', labelEn: 'No-show', labelTh: 'ไม่มา', color: '#E2734A' },
]

function ignoreUnlessExpired(err: unknown, onExpired: () => void): void {
  if (err instanceof StaffSessionExpiredError) onExpired()
}

function BookingStatusDonut({ counts }: { counts: BookingStatusCounts }) {
  const total = STATUS_SEGMENTS.reduce((sum, seg) => sum + counts[seg.key], 0)
  const r = 36
  const stroke = 13
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 100 100"
        className="h-[11.5rem] w-[11.5rem] sm:h-[13.5rem] sm:w-[13.5rem]"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {total > 0
          ? STATUS_SEGMENTS.map((seg) => {
              const value = counts[seg.key]
              if (value <= 0) return null
              const len = (value / total) * c
              const dashOffset = offset
              offset += len
              return (
                <circle
                  key={seg.key}
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeLinecap="butt"
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-dashOffset}
                  transform="rotate(-90 50 50)"
                />
              )
            })
          : null}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-cream"
          fontSize="18"
          fontWeight="600"
        >
          {total}
        </text>
      </svg>
      <ul className="mt-4 w-full space-y-1.5">
        {STATUS_SEGMENTS.map((seg) => (
          <li key={seg.key} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-cream-muted">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="truncate">
                {seg.labelEn} / {seg.labelTh}
              </span>
            </span>
            <span className="tabular-nums font-medium text-cream">{counts[seg.key]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RatioBar({
  ratio,
  tone = 'teal',
}: {
  ratio: number
  tone?: 'teal' | 'coral' | 'amber'
}) {
  const pct = `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%`
  const fill =
    tone === 'coral'
      ? 'from-coral to-coral/35'
      : tone === 'amber'
        ? 'from-amber to-amber/35'
        : 'from-teal-400 to-teal-500/35'
  return (
    <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-white/[0.06]">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${fill} transition-[width] duration-500`}
        style={{ width: pct }}
      />
    </div>
  )
}

export default function StaffOpsSummary({
  role,
  tours,
  toursLoading = false,
}: {
  role: string | null
  tours?: Tour[]
  toursLoading?: boolean
}) {
  const navigate = useNavigate()
  const staffRole = (role ?? '').toUpperCase()
  const allowed = ALL_STAFF.has(staffRole)
  const showWaitlist = OWNER_MANAGER.has(staffRole)
  const showPhotos = PHOTO_ROLES.has(staffRole)
  const showRecon = RECON_ROLES.has(staffRole)
  const showRevenue = staffRole === 'OWNER'
  const needOwnTours = allowed && tours === undefined

  const [counts, setCounts] = useState<BookingStatusCounts | null>(null)
  const [waitlistOpen, setWaitlistOpen] = useState<number | null>(null)
  const [photosPending, setPhotosPending] = useState<number | null>(null)
  const [reconCount, setReconCount] = useState<number | null>(null)
  const [alerts, setAlerts] = useState<InsuranceAlert[] | null>(null)
  const [profitRows, setProfitRows] = useState<
    { trip_code: string; revenue_aud: number; expense_aud: number; profit_aud: number }[] | null
  >(null)
  const [ownTours, setOwnTours] = useState<Tour[]>([])
  const [ownToursLoading, setOwnToursLoading] = useState(needOwnTours)

  useEffect(() => {
    if (!allowed) return
    const onExpired = () => navigate('/app')

    void fetchBookingStatusCounts()
      .then(setCounts)
      .catch((err) => ignoreUnlessExpired(err, onExpired))

    void fetchInsuranceAlerts()
      .then(setAlerts)
      .catch((err) => ignoreUnlessExpired(err, onExpired))

    if (showWaitlist) {
      void fetchWaitlist()
        .then((rows) => setWaitlistOpen(rows.filter((r) => !r.contacted).length))
        .catch((err) => ignoreUnlessExpired(err, onExpired))
    }

    if (showPhotos) {
      void fetchPhotosPending()
        .then((rows) => setPhotosPending(rows.length))
        .catch((err) => ignoreUnlessExpired(err, onExpired))
    }

    if (showRecon) {
      void fetchPaymentReconciliationIssues()
        .then((rows) => setReconCount(rows.length))
        .catch((err) => ignoreUnlessExpired(err, onExpired))
    }

    if (showRevenue) {
      void fetchOwnerOpsMetrics()
        .then((m) => setProfitRows(m.profit_per_trip ?? []))
        .catch((err) => ignoreUnlessExpired(err, onExpired))
    }

    if (needOwnTours) {
      setOwnToursLoading(true)
      void fetchToursAdmin()
        .then((rows) => setOwnTours(rows))
        .catch((err) => ignoreUnlessExpired(err, onExpired))
        .finally(() => setOwnToursLoading(false))
    }
  }, [
    allowed,
    navigate,
    needOwnTours,
    showPhotos,
    showRecon,
    showRevenue,
    showWaitlist,
  ])

  const seatTours = useMemo(() => {
    const source = tours ?? ownTours
    const today = new Date().toISOString().slice(0, 10)
    return source
      .filter((t) => LIVE_TOUR_STATUSES.has((t.status ?? '').toLowerCase()))
      .filter((t) => t.departure_date && t.departure_date >= today)
      .slice()
      .sort((a, b) => String(a.departure_date ?? '').localeCompare(String(b.departure_date ?? '')))
      .slice(0, 8)
  }, [ownTours, tours])

  const seatsBusy = tours === undefined ? ownToursLoading : toursLoading
  const maxRevenue = Math.max(1, ...(profitRows ?? []).map((r) => Math.max(r.revenue_aud, r.expense_aud, 0)))

  if (!allowed) return null

  return (
    <section>
      <StaffSectionTitle>Ops snapshot / สรุปงานวันนี้</StaffSectionTitle>
      <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {counts ? (
          <StaffCard className="h-full">
            <p className="text-center text-[11px] font-medium uppercase tracking-[0.08em] text-cream-muted/90">
              Bookings / สถานะการจอง
            </p>
            <div className="mt-4">
              <BookingStatusDonut counts={counts} />
            </div>
          </StaffCard>
        ) : null}

        {seatsBusy ? (
          <StaffCard>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-cream-muted/90">
              Seats / ที่นั่ง
            </p>
            <p className="mt-3 text-sm text-cream-muted">Loading…</p>
          </StaffCard>
        ) : (
          <StaffCard>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-cream-muted/90">
              Seats filled / ที่นั่งที่จองแล้ว
            </p>
            {seatTours.length === 0 ? (
              <p className="mt-3 text-sm text-cream-muted">No upcoming tours / ไม่มีทริปใกล้ถึงวันเดินทาง</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {seatTours.map((tour) => {
                  const max = Math.max(tour.max_seats, 1)
                  const left = seatsRemaining(tour)
                  return (
                    <li key={tour.id}>
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="truncate text-cream">{tour.trip_code}</span>
                        <span className="shrink-0 tabular-nums text-cream-muted">
                          {tour.booked_seats}/{tour.max_seats}
                          {left <= 0 ? ' · full' : ''}
                        </span>
                      </div>
                      <div className="mt-1">
                        <RatioBar
                          ratio={tour.booked_seats / max}
                          tone={left <= 0 ? 'coral' : left <= 2 ? 'amber' : 'teal'}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </StaffCard>
        )}

        {showRevenue && profitRows ? (
          <StaffCard>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-cream-muted/90">
              Revenue / profit · รายได้กำไร
            </p>
            {profitRows.length === 0 ? (
              <p className="mt-3 text-sm text-cream-muted">No trip P&L yet / ยังไม่มีกำไรขาดทุนต่อทริป</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {profitRows.slice(0, 8).map((row) => (
                  <li key={row.trip_code}>
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate text-cream">{row.trip_code}</span>
                      <span
                        className={`shrink-0 tabular-nums ${row.profit_aud >= 0 ? 'text-teal-400' : 'text-coral'}`}
                      >
                        {formatAud(row.profit_aud)}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      <RatioBar ratio={row.revenue_aud / maxRevenue} tone="teal" />
                      <RatioBar ratio={row.expense_aud / maxRevenue} tone="coral" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </StaffCard>
        ) : null}

        {showWaitlist && waitlistOpen !== null ? (
          <StaffCard>
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-cream-muted/90">
              <Users className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              Waitlist / รายชื่อรอคิว
            </p>
            <p className="mt-3 font-serif text-[1.65rem] font-semibold tabular-nums text-teal-400">
              {waitlistOpen}
            </p>
            <p className="mt-1 text-xs text-cream-muted">Not contacted / ยังไม่ได้ติดต่อ</p>
            <Link
              to="/app/trips"
              className="mt-3 inline-block text-xs font-medium text-teal-400 underline-offset-2 hover:underline"
            >
              Open trip manager / เปิดจัดการทริป
            </Link>
          </StaffCard>
        ) : null}

        {showPhotos && photosPending !== null ? (
          <StaffCard>
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-cream-muted/90">
              <Camera className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              Photo delivery / ส่งรูป
            </p>
            <p className="mt-3 font-serif text-[1.65rem] font-semibold tabular-nums text-teal-400">
              {photosPending}
            </p>
            <p className="mt-1 text-xs text-cream-muted">Guests waiting / รอส่งอัลบั้ม</p>
            <Link
              to="/app/photos"
              className="mt-3 inline-block text-xs font-medium text-teal-400 underline-offset-2 hover:underline"
            >
              Open photo delivery / เปิดหน้าส่งรูป
            </Link>
          </StaffCard>
        ) : null}

        {showRecon && reconCount !== null && reconCount > 0 ? (
          <StaffCard className="border-coral/45">
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-coral">
              <ShieldAlert className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              Reconciliation / ยอดไม่ตรง
            </p>
            <p className="mt-3 font-serif text-[1.65rem] font-semibold tabular-nums text-coral">
              {reconCount}
            </p>
            <p className="mt-1 text-xs text-cream-muted">
              Square mismatches — use the banner above to retry / ใช้แถบด้านบนเพื่อซิงก์ใหม่
            </p>
          </StaffCard>
        ) : null}

        {alerts ? (
          <StaffCard>
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-cream-muted/90">
              <ClipboardList className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              Insurance / ประกัน
            </p>
            {alerts.length === 0 ? (
              <p className="mt-3 text-sm text-cream-muted">No active alerts / ไม่มีแจ้งเตือน</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {alerts.slice(0, 6).map((alert) => (
                  <li
                    key={alert.id}
                    className="rounded-xl border border-white/10 bg-near-black-green/50 px-3 py-2"
                  >
                    <p className="text-sm text-cream">{alert.title || alert.item_name || 'Insurance'}</p>
                    {alert.expiry_date ? (
                      <p className="mt-0.5 text-[11px] text-cream-muted">Expires {alert.expiry_date}</p>
                    ) : null}
                    {alert.note ? (
                      <p className="mt-0.5 text-[11px] text-cream-muted">{alert.note}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </StaffCard>
        ) : null}
      </div>
    </section>
  )
}
