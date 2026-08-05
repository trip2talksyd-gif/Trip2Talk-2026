import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileCheck } from 'lucide-react'
import {
  createWaiverStaffAssisted,
  fetchBookingsForTour,
  fetchToursAdmin,
  listWaiversForTour,
  uploadWaiverAuthEvidence,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { WAIVER_CLAUSES } from '../../data/risks'
import type { Tour, TourBooking, WaiverSignature } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import StaffFilledWaiverBadge from '../../components/app/StaffFilledWaiverBadge'

/**
 * Staff-only: fill waiver on customer's behalf after explicit authorization.
 * Public /waiver page is unchanged — this never appears on the customer flow.
 */
export default function StaffWaiverAssistPage() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const [tours, setTours] = useState<Tour[]>([])
  const [bookings, setBookings] = useState<TourBooking[]>([])
  const [waivers, setWaivers] = useState<WaiverSignature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [assistOn, setAssistOn] = useState(false)
  const [tripCode, setTripCode] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [signedName, setSignedName] = useState('')
  const [locale, setLocale] = useState<'en' | 'th'>('en')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [authNote, setAuthNote] = useState('')
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const clauses = WAIVER_CLAUSES[locale]
  const allClausesChecked = clauses.every((c) => checked[c.id])

  const loadTours = useCallback(() => {
    setLoading(true)
    setError('')
    fetchToursAdmin()
      .then((list) =>
        setTours(list.filter((t) => t.status.toLowerCase() !== 'cancelled')),
      )
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        setError('Failed to load trips')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    loadTours()
  }, [loadTours])

  useEffect(() => {
    if (!tripCode) {
      setBookings([])
      setWaivers([])
      return
    }
    const tour = tours.find((t) => t.trip_code === tripCode)
    if (!tour) return
    Promise.all([fetchBookingsForTour(tour.id), listWaiversForTour(tripCode)])
      .then(([b, w]) => {
        setBookings(b)
        setWaivers(w)
      })
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) navigate('/app')
      })
  }, [tripCode, tours, navigate])

  useEffect(() => {
    // Reset clause checks when locale changes (clause set differs).
    setChecked({})
  }, [locale])

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === bookingId) ?? null,
    [bookings, bookingId],
  )

  useEffect(() => {
    if (selectedBooking) {
      const name = `${selectedBooking.first_name_en} ${selectedBooking.last_name_en}`.trim()
      if (name) setSignedName(name)
    }
  }, [selectedBooking])

  const canSubmit =
    assistOn &&
    tripCode &&
    signedName.trim().length >= 3 &&
    allClausesChecked &&
    authNote.trim().length >= 8 &&
    confirmed &&
    !submitting

  function toggleAllClauses(next: boolean) {
    const map: Record<string, boolean> = {}
    for (const c of clauses) map[c.id] = next
    setChecked(map)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      let evidenceUrl: string | null = null
      if (evidenceFile) {
        evidenceUrl = await uploadWaiverAuthEvidence(evidenceFile, tripCode)
      }

      const created = await createWaiverStaffAssisted({
        trip_code: tripCode,
        signed_name: signedName.trim(),
        clauses: clauses.map((c) => c.id),
        locale,
        authorization_note: authNote.trim(),
        evidence_url: evidenceUrl,
        booking_id: bookingId || null,
        confirmed_customer_request: true,
      })

      toast('บันทึก waiver (กรอกแทนลูกค้า) สำเร็จ', 'success')
      setWaivers((prev) => [created, ...prev])
      setAssistOn(false)
      setAuthNote('')
      setEvidenceFile(null)
      setConfirmed(false)
      setChecked({})
      if (bookingId) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, waiver_signed: true, waiver_signed_at: created.signed_at }
              : b,
          ),
        )
      }
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('บันทึกไม่สำเร็จ — ตรวจ migration/staff-api แล้วลองใหม่', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const staffWaivers = waivers.filter((w) => w.filled_by_staff)

  return (
    <div className="min-h-svh bg-near-black-green px-4 py-6 text-cream">
      <div className="mx-auto max-w-lg">
        <Link
          to="/app/staff"
          className="inline-flex items-center gap-1 text-sm text-cream-muted hover:text-cream"
        >
          <ArrowLeft className="h-4 w-4" />
          Staff Dashboard
        </Link>
        <h1 className="mt-3 flex items-center gap-2 font-serif text-lg text-cream">
          <FileCheck className="h-5 w-5 text-gold" />
          Staff-assisted waiver
        </h1>
        <p className="mt-1 font-thai text-sm text-cream-muted">
          กรอก waiver แทนลูกค้า — ต้องมีคำขอชัดเจนจากลูกค้า (audit trail)
        </p>
        <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100/90">
          Same waiver terms as the public page. Do not skip clauses. Public /waiver is
          unchanged — this screen is staff-only.
        </p>

        {loading && <ListRowSkeleton count={2} />}
        {error && !loading && <PageError message={error} onRetry={loadTours} />}

        {!loading && !error && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="flex items-start gap-3 rounded-editorial border border-white/15 bg-surface-card px-3 py-3">
              <input
                type="checkbox"
                checked={assistOn}
                onChange={(e) => setAssistOn(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-cream">
                  Fill on customer&apos;s behalf
                </span>
                <span className="block font-thai text-xs text-cream-muted">กรอกแทนลูกค้า</span>
              </span>
            </label>

            {assistOn && (
              <>
                <label className="block">
                  <span className="text-xs text-cream-muted">Trip / ทริป</span>
                  <select
                    value={tripCode}
                    onChange={(e) => {
                      setTripCode(e.target.value)
                      setBookingId('')
                    }}
                    required
                    className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                  >
                    <option value="">Select trip…</option>
                    {tours.map((t) => (
                      <option key={t.id} value={t.trip_code}>
                        {t.trip_code} — {t.name_en}
                      </option>
                    ))}
                  </select>
                </label>

                {tripCode && (
                  <label className="block">
                    <span className="text-xs text-cream-muted">
                      Link booking (optional) / ผูกกับการจอง
                    </span>
                    <select
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                    >
                      <option value="">— No booking link —</option>
                      {bookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.first_name_en} {b.last_name_en}
                          {b.waiver_signed ? ' (waiver ✓)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="block">
                  <span className="text-xs text-cream-muted">
                    Customer full name (signature) / ชื่อลูกค้า
                  </span>
                  <input
                    value={signedName}
                    onChange={(e) => setSignedName(e.target.value)}
                    required
                    minLength={3}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                    placeholder="As customer would sign"
                  />
                </label>

                <div className="flex gap-2">
                  {(['en', 'th'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLocale(l)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        locale === l
                          ? 'bg-gold text-near-black-green'
                          : 'bg-white/10 text-cream-muted'
                      }`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>

                <fieldset className="rounded-editorial border border-white/10 bg-surface-card/60 p-3">
                  <legend className="px-1 text-xs font-medium text-cream-muted">
                    Waiver terms (must accept all) / ข้อตกลงครบทุกข้อ
                  </legend>
                  <button
                    type="button"
                    onClick={() => toggleAllClauses(!allClausesChecked)}
                    className="mb-2 text-[11px] text-gold underline"
                  >
                    {allClausesChecked ? 'Uncheck all' : 'Accept all clauses'}
                  </button>
                  <ul className="max-h-48 space-y-2 overflow-y-auto">
                    {clauses.map((c) => (
                      <li key={c.id}>
                        <label className="flex gap-2 text-xs text-cream/90">
                          <input
                            type="checkbox"
                            checked={!!checked[c.id]}
                            onChange={(e) =>
                              setChecked((prev) => ({ ...prev, [c.id]: e.target.checked }))
                            }
                            className="mt-0.5 shrink-0"
                          />
                          <span>
                            <b className="block">{c.title}</b>
                            <span className="text-cream-muted">{c.text}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>

                <label className="block">
                  <span className="text-xs text-cream-muted">
                    Authorization note (required) / บันทึกการอนุญาต *
                  </span>
                  <textarea
                    value={authNote}
                    onChange={(e) => setAuthNote(e.target.value)}
                    required
                    minLength={8}
                    rows={3}
                    placeholder="e.g. Customer requested via Facebook Messenger; screenshot on file"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-cream-muted">
                    Evidence (optional screenshot) / หลักฐาน (ถ้ามี)
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full text-xs text-cream-muted file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-cream"
                  />
                </label>

                <label className="flex items-start gap-3 rounded-editorial border border-coral/40 bg-coral/10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-xs leading-relaxed text-cream">
                    I confirm the customer explicitly requested this and understands the waiver
                    terms.
                    <span className="mt-1 block font-thai text-cream-muted">
                      ข้ายืนยันว่าลูกค้าขอให้กรอกแทนอย่างชัดเจน และเข้าใจเงื่อนไขใน waiver
                    </span>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full rounded-editorial bg-gold py-3 text-sm font-bold uppercase tracking-wider text-near-black-green disabled:opacity-40"
                >
                  {submitting ? 'Saving…' : 'Submit staff-assisted waiver'}
                </button>
              </>
            )}
          </form>
        )}

        {tripCode && staffWaivers.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-medium text-cream-muted">
              Staff-filled waivers for {tripCode}
            </h2>
            <ul className="mt-2 space-y-2">
              {staffWaivers.map((w) => (
                <li
                  key={w.id}
                  className="rounded-editorial border border-white/10 bg-surface-card px-3 py-2"
                >
                  <p className="text-sm text-cream">{w.signed_name}</p>
                  <div className="mt-1.5">
                    <StaffFilledWaiverBadge
                      staffName={w.staff_fill_staff_name}
                      authorizedAt={w.staff_fill_authorized_at ?? w.signed_at}
                      note={w.staff_fill_authorization_note}
                    />
                  </div>
                  {w.staff_fill_authorization_note && (
                    <p className="mt-1.5 text-[11px] text-cream-muted">
                      {w.staff_fill_authorization_note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
