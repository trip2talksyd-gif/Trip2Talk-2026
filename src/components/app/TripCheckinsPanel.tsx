import { useCallback, useEffect, useState } from 'react'
import { Copy, Link2, Phone, RefreshCw } from 'lucide-react'
import { listTripCheckins, type TripCheckin } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { useToast } from '../ui/Toast'

type Props = {
  tripCode: string
  onSessionExpired?: () => void
}

/** Public check-ins always point at the production domain, never a preview URL. */
const PUBLIC_ORIGIN = 'https://www.trip2talk.com.au'

function TelLink({ phone }: { phone: string }) {
  const p = phone.trim()
  if (!p) return <span>—</span>
  return (
    <a
      href={`tel:${p.replace(/\s/g, '')}`}
      className="inline-flex items-center gap-1 rounded-full bg-teal-600/30 px-2 py-0.5 text-[10px] font-semibold text-gold"
    >
      <Phone className="h-3 w-3" />
      {p}
    </a>
  )
}

/** Group check-in link for a trip + the submissions staff read on trip day. */
export default function TripCheckinsPanel({ tripCode, onSessionExpired }: Props) {
  const { toast } = useToast()
  const [rows, setRows] = useState<TripCheckin[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const link = `${PUBLIC_ORIGIN}/checkin/${encodeURIComponent(tripCode)}`

  const fetchRows = useCallback(
    () =>
      listTripCheckins(tripCode)
        .then(setRows)
        .catch((err) => {
          if (err instanceof StaffSessionExpiredError) {
            onSessionExpired?.()
            return
          }
          toast('โหลดรายการเช็กอินไม่สำเร็จ', 'error')
        }),
    [tripCode, onSessionExpired, toast],
  )

  useEffect(() => {
    void fetchRows()
  }, [fetchRows])

  function refresh() {
    setLoading(true)
    void fetchRows().finally(() => setLoading(false))
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast('คัดลอกลิงก์เช็กอินแล้ว — วางในกลุ่ม FB ได้เลย', 'success')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('คัดลอกไม่สำเร็จ', 'error')
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-gold">
            Group check-in ({rows?.length ?? 0})
          </h3>
          <p lang="th" className="mt-0.5 font-serif text-[10px] font-medium text-cream-muted">
            ลิงก์เดียวส่งทั้งกลุ่ม · ลูกค้ากรอกเอง
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-3 py-1.5 text-[11px] font-semibold text-gold"
          >
            {copied ? <Copy className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy group link'}
          </button>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh check-ins"
            className="inline-flex items-center rounded-full border border-white/15 px-2 py-1.5 text-cream-muted disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <p className="break-all text-[10px] text-cream-muted">{link}</p>

      {rows === null ? (
        <p className="text-xs text-cream-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-cream-muted">
          No check-ins yet
          <span className="mt-0.5 block font-thai opacity-80">ยังไม่มีใครเช็กอิน</span>
        </p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((c) => {
            const hasAlert = Boolean(c.allergies?.trim() || c.medical_conditions?.trim())
            return (
              <li
                key={c.id}
                className={`rounded-editorial border px-3 py-2.5 ${
                  hasAlert ? 'border-coral/60 bg-coral/15' : 'border-white/10 bg-surface-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-cream">{c.full_name}</p>
                    <p className="text-[10px] text-cream-muted">
                      {new Date(c.created_at).toLocaleString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · signed '}
                      {c.waiver_signed_name}
                    </p>
                  </div>
                  {hasAlert && (
                    <span className="shrink-0 rounded-full bg-coral px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cream">
                      Alert
                    </span>
                  )}
                </div>
                <div className="mt-2 grid gap-1.5 text-[11px] leading-snug text-cream/90">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-cream-muted">Guest · ลูกค้า:</span>
                    <TelLink phone={c.phone} />
                  </p>
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-cream-muted">Emergency · ฉุกเฉิน:</span>
                    <span>
                      {c.emergency_contact_name}
                      {c.emergency_contact_relationship ? ` (${c.emergency_contact_relationship})` : ''}
                    </span>
                    <TelLink phone={c.emergency_contact_phone} />
                  </p>
                  {c.allergies?.trim() && (
                    <p className="font-semibold text-coral">
                      <span className="text-cream-muted">Allergies · แพ้: </span>
                      {c.allergies}
                    </p>
                  )}
                  {c.medical_conditions?.trim() && (
                    <p className="font-semibold text-coral">
                      <span className="text-cream-muted">Medical · สุขภาพ: </span>
                      {c.medical_conditions}
                    </p>
                  )}
                  {c.dietary_requirements?.trim() && (
                    <p>
                      <span className="text-cream-muted">Diet · อาหาร: </span>
                      {c.dietary_requirements}
                    </p>
                  )}
                  {c.other_notes?.trim() && (
                    <p>
                      <span className="text-cream-muted">Notes · หมายเหตุ: </span>
                      {c.other_notes}
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
