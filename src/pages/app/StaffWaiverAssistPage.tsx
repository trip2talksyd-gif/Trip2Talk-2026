import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import {
  createWaiverStaffAssisted,
  deleteWaiverSignature,
  fetchBookingsForTour,
  fetchToursAdmin,
  listWaiversForTour,
  uploadWaiverAuthEvidence,
} from '../../lib/toursApi'
import { isSelectableBookableTour } from '../../lib/tourSelectability'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { WAIVER_CLAUSES } from '../../data/risks'
import type { Tour, TourBooking, WaiverSignature } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import StaffFilledWaiverBadge from '../../components/app/StaffFilledWaiverBadge'
import StaffWaiverConfirmActions from '../../components/app/StaffWaiverConfirmActions'
import {
  staffShellClass,
  StaffPageHeader,
  StaffMain,
  StaffCard,
  StaffButton,
  StaffField,
  StaffCheckRow,
  StaffInput,
  StaffSelect,
  StaffTextarea,
  StaffSectionTitle,
  staffTabActiveClass,
  staffTabIdleClass,
} from '../../components/app/staffUi'

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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const isOwner = sessionStorage.getItem('staff_role') === 'OWNER'

  const clauses = WAIVER_CLAUSES[locale]
  const allClausesChecked = clauses.every((c) => checked[c.id])

  const loadTours = useCallback(() => {
    setLoading(true)
    setError('')
    fetchToursAdmin()
      .then((list) =>
        setTours(
          list.filter(
            (t) =>
              t.status.toLowerCase() !== 'cancelled' &&
              t.status.toLowerCase() !== 'archived' &&
              isSelectableBookableTour(t),
          ),
        ),
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
  const selectedTour = tours.find((t) => t.trip_code === tripCode) ?? null

  async function handleDeleteWaiver(w: WaiverSignature) {
    if (!isOwner) return
    const ok = window.confirm(
      `Delete this waiver record for ${w.signed_name}? This cannot be undone.`,
    )
    if (!ok) return
    setDeletingId(w.id)
    try {
      await deleteWaiverSignature(w.id)
      setWaivers((prev) => prev.filter((x) => x.id !== w.id))
      if (w.booking_id) {
        const stillLinked = waivers.some(
          (x) => x.id !== w.id && x.booking_id === w.booking_id,
        )
        if (!stillLinked) {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === w.booking_id
                ? { ...b, waiver_signed: false, waiver_signed_at: null }
                : b,
            ),
          )
        }
      }
      toast('Deleted waiver record', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('Delete failed', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/staff"
        backLabel="← Staff Dashboard"
        title="Staff-assisted waiver"
        subtitle={
          <>
            <span className="font-thai">กรอก waiver แทนลูกค้า — ต้องมีคำขอชัดเจนจากลูกค้า (audit trail)</span>
            <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-100/90">
              Same waiver terms as the public page. Do not skip clauses. Public /waiver is
              unchanged — this screen is staff-only.
            </p>
          </>
        }
      />

      <StaffMain className="max-w-lg">
        {loading && <ListRowSkeleton count={2} />}
        {error && !loading && <PageError message={error} onRetry={loadTours} />}

        {!loading && !error && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <StaffCheckRow checked={assistOn} onChange={setAssistOn}>
              <span className="block text-sm font-medium text-cream">
                Fill on customer&apos;s behalf
              </span>
              <span className="block font-thai text-xs text-cream-muted">กรอกแทนลูกค้า</span>
            </StaffCheckRow>

            {assistOn && (
              <>
                <StaffField label="Trip / ทริป">
                  <StaffSelect
                    value={tripCode}
                    onChange={(e) => {
                      setTripCode(e.target.value)
                      setBookingId('')
                    }}
                    required
                  >
                    <option value="">Select trip…</option>
                    {tours.map((t) => (
                      <option key={t.id} value={t.trip_code}>
                        {t.trip_code} — {t.name_en}
                      </option>
                    ))}
                  </StaffSelect>
                </StaffField>

                {tripCode && (
                  <StaffField label="Link booking (optional) / ผูกกับการจอง">
                    <StaffSelect
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                    >
                      <option value="">— No booking link —</option>
                      {bookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.first_name_en} {b.last_name_en}
                          {b.waiver_signed ? ' (waiver ✓)' : ''}
                        </option>
                      ))}
                    </StaffSelect>
                  </StaffField>
                )}

                <StaffField label="Customer full name (signature) / ชื่อลูกค้า">
                  <StaffInput
                    value={signedName}
                    onChange={(e) => setSignedName(e.target.value)}
                    required
                    minLength={3}
                    placeholder="As customer would sign"
                  />
                </StaffField>

                <div className="flex gap-2">
                  {(['en', 'th'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLocale(l)}
                      className={locale === l ? staffTabActiveClass : staffTabIdleClass}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>

                <StaffCard padding={false}>
                  <fieldset className="p-3">
                    <legend className="px-1 text-xs font-medium text-cream-muted">
                      Waiver terms (must accept all) / ข้อตกลงครบทุกข้อ
                    </legend>
                    <StaffButton
                      type="button"
                      variant="ghost"
                      onClick={() => toggleAllClauses(!allClausesChecked)}
                      className="mb-2 text-[11px] text-teal-500 underline hover:bg-transparent"
                    >
                      {allClausesChecked ? 'Uncheck all' : 'Accept all clauses'}
                    </StaffButton>
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
                              className="staff-check mt-0.5 shrink-0"
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
                </StaffCard>

                <StaffField label="Authorization note (required) / บันทึกการอนุญาต *">
                  <StaffTextarea
                    value={authNote}
                    onChange={(e) => setAuthNote(e.target.value)}
                    required
                    minLength={8}
                    rows={3}
                    placeholder="e.g. Customer requested via Facebook Messenger; screenshot on file"
                  />
                </StaffField>

                <StaffField label="Evidence (optional screenshot) / หลักฐาน (ถ้ามี)">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
                  />
                </StaffField>

                <StaffCheckRow checked={confirmed} onChange={setConfirmed} tone="danger">
                  <span className="text-xs leading-relaxed">
                    I confirm the customer explicitly requested this and understands the waiver
                    terms.
                    <span className="mt-1 block font-thai text-cream-muted">
                      ข้ายืนยันว่าลูกค้าขอให้กรอกแทนอย่างชัดเจน และเข้าใจเงื่อนไขใน waiver
                    </span>
                  </span>
                </StaffCheckRow>

                <StaffButton type="submit" disabled={!canSubmit}>
                  {submitting ? 'Saving…' : 'Submit staff-assisted waiver'}
                </StaffButton>
              </>
            )}
          </form>
        )}

        {tripCode && staffWaivers.length > 0 && (
          <section>
            <StaffSectionTitle>Staff-filled waivers for {tripCode}</StaffSectionTitle>
            <ul className="mt-2 space-y-2">
              {staffWaivers.map((w) => {
                const linked =
                  bookings.find((b) => b.id === w.booking_id) ??
                  bookings.find(
                    (b) =>
                      `${b.first_name_en} ${b.last_name_en}`.trim().toLowerCase() ===
                      w.signed_name.trim().toLowerCase(),
                  )
                const email = linked?.email ?? null
                return (
                  <li key={w.id}>
                    <StaffCard>
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 text-sm text-cream">{w.signed_name}</p>
                        {isOwner && (
                          <button
                            type="button"
                            title="Delete waiver record (OWNER)"
                            disabled={deletingId === w.id}
                            onClick={() => void handleDeleteWaiver(w)}
                            className="shrink-0 rounded-xl p-2 text-cream-muted transition-colors hover:bg-coral/15 hover:text-coral disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                          </button>
                        )}
                      </div>
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
                      {linked ? (
                        <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-cream-muted">
                            Safety Info (staff only) / ข้อมูลความปลอดภัย — ไม่ส่งให้ลูกค้า
                          </p>
                          <dl className="mt-1.5 space-y-1 text-[11px] text-cream/90">
                            <div>
                              <dt className="inline text-cream-muted">Emergency: </dt>
                              <dd className="inline">
                                {(linked.emergency_contact_name ?? '').trim() || '—'}
                                {(linked.emergency_contact_phone ?? '').trim()
                                  ? ` · ${linked.emergency_contact_phone}`
                                  : ''}
                              </dd>
                            </div>
                            <div>
                              <dt className="inline text-cream-muted">Allergies: </dt>
                              <dd className="inline">
                                {(linked.allergies ?? '').trim() || '—'}
                              </dd>
                            </div>
                            <div>
                              <dt className="inline text-cream-muted">Medical: </dt>
                              <dd className="inline">
                                {(linked.medical_conditions ?? '').trim() || '—'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] text-cream-muted">
                          No linked booking — Safety Info not available here (see trip-day safety
                          view if booked under another name).
                        </p>
                      )}
                      <StaffWaiverConfirmActions
                        waiver={w}
                        tripName={selectedTour?.name_en}
                        departureDate={selectedTour?.departure_date}
                        customerEmail={email}
                      />
                    </StaffCard>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </StaffMain>
    </div>
  )
}
