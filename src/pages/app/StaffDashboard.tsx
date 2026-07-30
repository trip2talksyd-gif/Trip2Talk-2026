import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchConfirmedTours,
  fetchBookingsForTour,
  markAttendance,
  seatsRemaining,
  updateBookingDetails,
  cancelBooking,
  isBookingCancelled,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { Tour, TourBooking } from '../../types/tour'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import CancelBookingDialog from '../../components/app/CancelBookingDialog'

type ManifestFilter = 'active' | 'cancelled' | 'all'

const CAN_CANCEL_ROLES = new Set(['OWNER', 'MANAGER', 'CASHIER'])

export default function StaffDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tours, setTours] = useState<Tour[]>([])
  const [selected, setSelected] = useState<Tour | null>(null)
  const [manifest, setManifest] = useState<TourBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<ManifestFilter>('active')
  const staffName = sessionStorage.getItem('staff_name') ?? 'Staff'
  const staffRole = sessionStorage.getItem('staff_role')
  const canCancel = staffRole ? CAN_CANCEL_ROLES.has(staffRole) : false

  // Inline "แก้ไข" flow for fixing a typo'd name/phone/email on a booking —
  // does not touch payment status, so it's safe to edit anytime, then
  // re-issue the receipt from Cashier POS with the corrected name.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [cancelling, setCancelling] = useState<TourBooking | null>(null)
  const [cancelSubmitting, setCancelSubmitting] = useState(false)

  function openEdit(booking: TourBooking) {
    setEditingId(booking.id)
    setEditFirst(booking.first_name_en)
    setEditLast(booking.last_name_en)
    setEditPhone(booking.phone ?? '')
    setEditEmail(booking.email ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(booking: TourBooking) {
    setSavingEdit(true)
    try {
      const updated = await updateBookingDetails(booking.id, {
        first_name_en: editFirst,
        last_name_en: editLast,
        phone: editPhone,
        email: editEmail,
      })
      setManifest((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...updated } : b)))
      setEditingId(null)
      toast('แก้ไขข้อมูลแล้ว', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('แก้ไขไม่สำเร็จ', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  async function toggleAttended(booking: TourBooking, attended: boolean) {
    const next = booking.attended === attended ? null : attended
    setManifest((prev) => prev.map((b) => (b.id === booking.id ? { ...b, attended: next } : b)))
    try {
      await markAttendance(booking.id, next)
    } catch {
      toast('บันทึกไม่สำเร็จ', 'error')
      setManifest((prev) => prev.map((b) => (b.id === booking.id ? booking : b)))
    }
  }

  async function confirmCancel(reason: string) {
    if (!cancelling) return
    setCancelSubmitting(true)
    try {
      const updated = await cancelBooking(cancelling.id, reason)
      setManifest((prev) => prev.map((b) => (b.id === cancelling.id ? { ...b, ...updated } : b)))
      setCancelling(null)
      toast('ยกเลิกการจองแล้ว', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('ยกเลิกไม่สำเร็จ', 'error')
    } finally {
      setCancelSubmitting(false)
    }
  }

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    fetchConfirmedTours()
      .then(setTours)
      .catch(() => setError('Could not load tours'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!selected) return
    fetchBookingsForTour(selected.id)
      .then(setManifest)
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        setManifest([])
      })
  }, [selected, navigate])

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = tours.filter((t) => t.departure_date && t.departure_date >= today)

  const filteredManifest = useMemo(() => {
    if (filter === 'all') return manifest
    if (filter === 'cancelled') return manifest.filter(isBookingCancelled)
    return manifest.filter((b) => !isBookingCancelled(b))
  }, [manifest, filter])

  const cancelledCount = useMemo(() => manifest.filter(isBookingCancelled).length, [manifest])
  const activeCount = manifest.length - cancelledCount

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app" className="text-sm text-gold">
          ← PIN
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">Staff Dashboard</h1>
        <p className="text-sm text-cream-muted">{staffName}</p>
        {staffRole === 'MANAGER' && (
          <Link
            to="/app/cashier"
            className="mt-3 inline-block rounded-editorial border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold"
          >
            💳 Cashier POS
          </Link>
        )}
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {loading && <ListRowSkeleton count={4} />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && (
          <section>
            <h2 className="text-sm font-medium text-cream-muted">Upcoming tours</h2>
            <ul className="mt-3 space-y-2">
              {upcoming.map((tour) => (
                <li key={tour.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(tour)}
                    className={`w-full rounded-editorial border px-4 py-3 text-left transition-colors ${
                      selected?.id === tour.id
                        ? 'border-gold bg-surface-card'
                        : 'border-white/8 bg-surface-card/50 hover:border-white/15'
                    }`}
                  >
                    <p className="font-medium text-cream">{tour.name_en}</p>
                    <p className="text-xs text-cream-muted">
                      {tour.departure_date} · {tour.booked_seats}/{tour.max_seats} pax ·{' '}
                      {seatsRemaining(tour)} seats left
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {selected && (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-cream-muted">Manifest — {selected.trip_code}</h2>
              <div className="flex gap-1">
                {(
                  [
                    { id: 'active', label: `Active (${activeCount})` },
                    { id: 'cancelled', label: `Cancelled (${cancelledCount})` },
                    { id: 'all', label: 'All' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      filter === tab.id
                        ? 'bg-gold text-near-black-green'
                        : 'bg-white/10 text-cream-muted hover:bg-white/15'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {filteredManifest.length === 0 ? (
              <p className="mt-3 text-sm text-cream-muted">
                {filter === 'cancelled' ? 'No cancelled bookings' : 'No bookings yet'}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {filteredManifest.map((b) => {
                  const cancelled = isBookingCancelled(b)
                  if (editingId === b.id && !cancelled) {
                    return (
                      <li
                        key={b.id}
                        className="space-y-2 rounded-editorial border border-gold/30 bg-surface-card px-3 py-3 text-sm"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="text-[10px] text-cream-muted">ชื่อ</span>
                            <input
                              value={editFirst}
                              onChange={(e) => setEditFirst(e.target.value)}
                              className="mt-0.5 w-full rounded-lg border border-white/15 bg-near-black-green px-2.5 py-1.5 text-sm text-cream"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] text-cream-muted">นามสกุล</span>
                            <input
                              value={editLast}
                              onChange={(e) => setEditLast(e.target.value)}
                              className="mt-0.5 w-full rounded-lg border border-white/15 bg-near-black-green px-2.5 py-1.5 text-sm text-cream"
                            />
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="text-[10px] text-cream-muted">เบอร์โทร</span>
                            <input
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="mt-0.5 w-full rounded-lg border border-white/15 bg-near-black-green px-2.5 py-1.5 text-sm text-cream"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] text-cream-muted">อีเมล</span>
                            <input
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="mt-0.5 w-full rounded-lg border border-white/15 bg-near-black-green px-2.5 py-1.5 text-sm text-cream"
                            />
                          </label>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            disabled={savingEdit || !editFirst.trim() || !editLast.trim()}
                            onClick={() => saveEdit(b)}
                            className="flex-1 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-near-black-green disabled:opacity-50"
                          >
                            {savingEdit ? 'กำลังบันทึก...' : 'บันทึก'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-cream-muted"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      </li>
                    )
                  }

                  return (
                    <li
                      key={b.id}
                      className={`flex items-center justify-between gap-2 rounded-editorial px-3 py-2 text-sm ${
                        cancelled
                          ? 'border border-white/5 bg-surface-card/40 text-cream-muted opacity-60'
                          : 'bg-surface-card text-cream'
                      }`}
                    >
                      <span className="min-w-0 truncate">
                        {b.first_name_en} {b.last_name_en}
                        {cancelled ? (
                          <span className="ml-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream-muted">
                            Cancelled
                          </span>
                        ) : (
                          <span className="text-cream-muted"> · {b.booking_status}</span>
                        )}
                      </span>
                      {!cancelled && (
                        <span className="flex shrink-0 gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(b)}
                            className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-cream-muted hover:bg-white/15"
                            title="แก้ไขชื่อ/เบอร์/อีเมล"
                          >
                            ✏️ แก้ไข
                          </button>
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => setCancelling(b)}
                              className="rounded-full bg-coral/20 px-2.5 py-1 text-xs font-medium text-coral hover:bg-coral/30"
                              title="Cancel booking"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleAttended(b, true)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              b.attended === true
                                ? 'bg-gold text-near-black-green'
                                : 'bg-white/10 text-cream-muted hover:bg-white/15'
                            }`}
                          >
                            มา
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAttended(b, false)}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              b.attended === false
                                ? 'bg-coral text-white'
                                : 'bg-white/10 text-cream-muted hover:bg-white/15'
                            }`}
                          >
                            ไม่มา
                          </button>
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}
      </main>

      {cancelling && (
        <CancelBookingDialog
          booking={cancelling}
          submitting={cancelSubmitting}
          onConfirm={confirmCancel}
          onClose={() => !cancelSubmitting && setCancelling(null)}
        />
      )}
    </div>
  )
}
