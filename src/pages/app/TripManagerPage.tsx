import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  StaffButton,
  StaffCard,
  StaffField,
  StaffInput,
  StaffMain,
  StaffPageHeader,
  StaffSelect,
  staffShellClass,
  staffTabIdleClass,
} from '../../components/app/staffUi'
import {
  addMonthsIso,
  archiveTour,
  createTour,
  createToursBulk,
  deleteTour,
  deriveTripCodeForDate,
  fetchToursAdmin,
  fetchWaitlist,
  formatDate,
  generateTripPost,
  markWaitlistContacted,
  unarchiveTour,
  updateTourStatus,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { Tour, WaitlistEntry } from '../../types/tour'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'
import TripItineraryEditor from '../../components/app/TripItineraryEditor'
import TripSeatsEditor from '../../components/app/TripSeatsEditor'
import ArchiveTourDialog from '../../components/app/ArchiveTourDialog'
import { Archive, Loader2, RotateCcw, Trash2 } from 'lucide-react'

const LOW_SEATS_RATIO = 0.8

function seatFillRatio(tour: Tour): number {
  if (tour.max_seats <= 0) return 1
  return tour.booked_seats / tour.max_seats
}

function isUpcoming(tour: Tour): boolean {
  if (!tour.departure_date) return true
  return new Date(tour.departure_date) >= new Date(new Date().toDateString())
}

function isLiveStatus(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'confirmed' || s === 'published' || s === 'active'
}

export default function TripManagerPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [tours, setTours] = useState<Tour[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [templateCode, setTemplateCode] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [tripCode, setTripCode] = useState('')
  const [tripCodeTouched, setTripCodeTouched] = useState(false)
  const [nameEn, setNameEn] = useState('')
  const [nameTh, setNameTh] = useState('')
  const [priceAud, setPriceAud] = useState('')
  const [depositAud, setDepositAud] = useState('')
  const [maxSeats, setMaxSeats] = useState('')
  const [status, setStatus] = useState('')
  const [repeatMonths, setRepeatMonths] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const [generatingTripId, setGeneratingTripId] = useState<string | null>(null)
  const [contentBanner, setContentBanner] = useState<{ tripName: string; reused: boolean } | null>(
    null,
  )
  const [listTab, setListTab] = useState<'active' | 'archived'>('active')
  const [tourAction, setTourAction] = useState<{
    tour: Tour
    mode: 'archive' | 'unarchive' | 'delete'
  } | null>(null)
  const [tourActionSubmitting, setTourActionSubmitting] = useState(false)
  const isOwner = sessionStorage.getItem('staff_role') === 'OWNER'

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([fetchToursAdmin(), fetchWaitlist()])
      .then(([t, w]) => {
        setTours(t)
        setWaitlist(w)
      })
      .catch((err) => {
        if (err instanceof StaffSessionExpiredError) {
          navigate('/app')
          return
        }
        console.error('[TripManagerPage] load failed:', err)
        setError('Could not load trip data')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  const statusOptions = useMemo(() => {
    const seen = new Set(tours.map((t) => t.status).filter(Boolean))
    seen.add('draft')
    seen.add('published')
    return [...seen]
  }, [tours])

  const template = useMemo(
    () => tours.find((t) => t.trip_code === templateCode) ?? null,
    [tours, templateCode],
  )

  const lowSeatTrips = useMemo(
    () =>
      tours.filter(
        (t) => isLiveStatus(t.status) && isUpcoming(t) && seatFillRatio(t) >= LOW_SEATS_RATIO,
      ),
    [tours],
  )

  // Surfaces trips that now have an open seat AND still have uncontacted
  // waitlist entries — so staff sees it the moment they open Trip Manager
  // instead of having to remember to cross-check the two lists by hand.
  const waitlistMatches = useMemo(() => {
    return tours
      .filter((t) => isLiveStatus(t.status) && t.max_seats - t.booked_seats > 0)
      .map((t) => ({
        tour: t,
        waiting: waitlist.filter((w) => w.trip_code === t.trip_code && !w.contacted),
      }))
      .filter((m) => m.waiting.length > 0)
  }, [tours, waitlist])

  // Every trip stays in the database forever (booking/revenue history is
  // needed for tax records) — this only controls what's shown in the list.
  // Past trips are hidden by default so the list doesn't grow forever, but
  // "แสดงทริปเก่า" reveals full history any time, e.g. at tax time.
  const allTours = useMemo(
    () =>
      tours.filter((t) => {
        const s = t.status.toLowerCase()
        return s !== 'cancelled' && s !== 'archived'
      }),
    [tours],
  )
  const archivedTours = useMemo(
    () => tours.filter((t) => t.status.toLowerCase() === 'archived'),
    [tours],
  )
  const pastCount = useMemo(() => allTours.filter((t) => !isUpcoming(t)).length, [allTours])
  const visibleTours = useMemo(() => {
    if (listTab === 'archived') return archivedTours
    return showPast ? allTours : allTours.filter(isUpcoming)
  }, [listTab, archivedTours, showPast, allTours])

  async function confirmTourAction() {
    if (!tourAction || !isOwner) return
    setTourActionSubmitting(true)
    const { tour, mode } = tourAction
    try {
      if (mode === 'archive') {
        const updated = await archiveTour(tour.id)
        setTours((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        toast('Archived trip', 'success')
      } else if (mode === 'unarchive') {
        const updated = await unarchiveTour(tour.id, 'published')
        setTours((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        toast('Restored trip', 'success')
      } else {
        await deleteTour(tour.id)
        setTours((prev) => prev.filter((x) => x.id !== tour.id))
        toast('Deleted trip', 'success')
      }
      setTourAction(null)
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('has_bookings')) {
        toast('Cannot delete — trip has bookings. Archive instead.', 'error')
      } else {
        toast(
          mode === 'delete'
            ? 'Delete failed'
            : mode === 'archive'
              ? 'Archive failed'
              : 'Restore failed',
          'error',
        )
      }
    } finally {
      setTourActionSubmitting(false)
    }
  }

  const existingCodes = useMemo(() => new Set(tours.map((t) => t.trip_code)), [tours])
  const duplicateCode = tripCode.length > 0 && existingCodes.has(tripCode)

  function applyTemplate(code: string) {
    setTemplateCode(code)
    const t = tours.find((x) => x.trip_code === code)
    if (!t) return
    setNameEn(t.name_en)
    setNameTh(t.name_th)
    setPriceAud(String(t.price_aud))
    setDepositAud(String(t.deposit_aud))
    setMaxSeats(String(t.max_seats))
    setStatus(t.status)
    if (!tripCodeTouched && departureDate) {
      setTripCode(
        deriveTripCodeForDate(t.trip_code, departureDate, t.duration_days),
      )
    }
  }

  function handleDateChange(value: string) {
    setDepartureDate(value)
    if (!tripCodeTouched && template && value) {
      setTripCode(
        deriveTripCodeForDate(template.trip_code, value, template.duration_days),
      )
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!template || !departureDate || !tripCode) {
      toast('กรอกข้อมูลให้ครบก่อนครับ', 'error')
      return
    }
    if (duplicateCode) {
      toast('รหัสทริปนี้มีอยู่แล้ว กรุณาแก้ไข', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (repeatMonths > 1) {
        const entries = Array.from({ length: repeatMonths }).map((_, i) => {
          const date = addMonthsIso(departureDate, i)
          return {
            trip_code:
              i === 0
                ? tripCode
                : deriveTripCodeForDate(template.trip_code, date, template.duration_days),
            name_en: nameEn || undefined,
            name_th: nameTh || undefined,
            departure_date: date,
            price_aud: priceAud ? Number(priceAud) : undefined,
            deposit_aud: depositAud ? Number(depositAud) : undefined,
            max_seats: maxSeats ? Number(maxSeats) : undefined,
            status: status || undefined,
          }
        })
        const result = await createToursBulk(template.trip_code, entries)
        if (result.skipped.length > 0) {
          toast(`สร้าง ${result.data.length} ทริป ข้าม ${result.skipped.length} รหัสซ้ำ`, 'success')
        } else {
          toast(`สร้างทริปใหม่ ${result.data.length} รอบสำเร็จ`, 'success')
        }
      } else {
        await createTour({
          templateTripCode: template.trip_code,
          trip_code: tripCode,
          name_en: nameEn || undefined,
          name_th: nameTh || undefined,
          departure_date: departureDate,
          price_aud: priceAud ? Number(priceAud) : undefined,
          deposit_aud: depositAud ? Number(depositAud) : undefined,
          max_seats: maxSeats ? Number(maxSeats) : undefined,
          status: status || undefined,
        })
        toast('ลงทริปใหม่สำเร็จ', 'success')
      }
      setFormOpen(false)
      setTemplateCode('')
      setDepartureDate('')
      setTripCode('')
      setTripCodeTouched(false)
      setRepeatMonths(1)
      load()
    } catch (err) {
      console.error('[TripManagerPage] create failed:', err)
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('duplicate_trip_code')) {
        toast('รหัสทริปนี้มีอยู่แล้ว', 'error')
      } else if (msg.includes('template_not_found')) {
        toast('ไม่พบทริปต้นแบบ', 'error')
      } else {
        toast('สร้างทริปไม่สำเร็จ ลองสถานะอื่น (เช่น published แทน draft) ได้ครับ', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancelTour(t: Tour) {
    const ok = window.confirm(
      `งดจัดทริป "${t.name_en}" (${t.trip_code})?\n\nทริปจะหายจากหน้าเว็บ, ปฏิทิน และหน้าจองทันที แต่ข้อมูลการจอง/การเงินยังอยู่ครบ กดกู้คืนได้ภายหลัง`,
    )
    if (!ok) return
    try {
      const updated = await updateTourStatus(t.id, 'cancelled')
      toast('งดจัดทริปแล้ว', 'success')
      setTours((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('งดจัดทริปไม่สำเร็จ', 'error')
    }
  }

  async function handleRestoreTour(t: Tour) {
    const ok = window.confirm(`เปิดทริป "${t.name_en}" (${t.trip_code}) กลับมาใหม่ (published)?`)
    if (!ok) return
    try {
      const updated = await updateTourStatus(t.id, 'published')
      toast('เปิดทริปกลับมาแล้ว', 'success')
      setTours((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast('กู้คืนไม่สำเร็จ', 'error')
    }
  }

  async function toggleContacted(entry: WaitlistEntry) {
    try {
      await markWaitlistContacted(entry.id, !entry.contacted)
      setWaitlist((prev) =>
        prev.map((w) => (w.id === entry.id ? { ...w, contacted: !w.contacted } : w)),
      )
    } catch {
      toast('อัปเดตไม่สำเร็จ', 'error')
    }
  }

  async function handleGenerateTripPost(tour: Tour) {
    if (generatingTripId) return
    setGeneratingTripId(tour.id)
    setContentBanner(null)
    try {
      const result = await generateTripPost(tour.id)
      toast('สร้างโพสต์ร่างแล้ว ไปดูที่หน้ารีวิว', 'success')
      setContentBanner({
        tripName: tour.name_th || tour.name_en,
        reused: result.reused,
      })
    } catch (err) {
      console.error('[TripManagerPage] generate-trip-post failed:', err)
      if (err instanceof StaffSessionExpiredError) {
        navigate('/app')
        return
      }
      toast(err instanceof Error ? err.message : 'สร้างโพสต์ไม่สำเร็จ ลองอีกครั้ง', 'error')
    } finally {
      setGeneratingTripId(null)
    }
  }

  return (
    <div className={staffShellClass}>
      <StaffPageHeader
        backTo="/app/owner"
        backLabel="← Owner Dashboard"
        title="Trip Manager"
        subtitle="ลงทริปใหม่ · ดูที่นั่งใกล้เต็ม · Waitlist"
      />

      <StaffMain className="space-y-6">
        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && (
          <>
            {contentBanner && (
              <StaffCard className="border-teal-500/40 bg-teal-500/10 text-sm text-cream">
                <p>
                  {contentBanner.reused
                    ? `มีร่างของ “${contentBanner.tripName}” อยู่แล้วใน 7 วันล่าสุด`
                    : `สร้างโพสต์ร่างสำหรับ “${contentBanner.tripName}” แล้ว`}
                </p>
                <Link
                  to="/admin/content-review"
                  className="mt-2 inline-block font-medium text-teal-500 underline-offset-2 hover:underline"
                >
                  ไปดูที่หน้ารีวิว →
                </Link>
                <button
                  type="button"
                  onClick={() => setContentBanner(null)}
                  className="ml-3 text-xs text-cream-muted hover:text-cream"
                >
                  ปิด
                </button>
              </StaffCard>
            )}

            {waitlistMatches.length > 0 && (
              <StaffCard className="border-2 border-teal-500 bg-teal-500/15">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-500">
                    🔔 มีที่ว่าง + คนรอคิว
                  </h2>
                  <span className="rounded-full bg-teal-500 px-2 py-0.5 text-xs font-medium text-near-black-green">
                    {waitlistMatches.reduce((sum, m) => sum + m.waiting.length, 0)}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {waitlistMatches.map(({ tour: t, waiting }) => (
                    <li
                      key={t.id}
                      className="rounded-editorial border border-teal-500/40 bg-near-black-green/60 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cream">
                          {t.name_en} <span className="text-cream-muted">· {t.trip_code}</span>
                        </span>
                        <span className="rounded-full bg-teal-500 px-2 py-0.5 text-xs font-medium text-near-black-green">
                          {t.max_seats - t.booked_seats} ว่าง
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {waiting.map((w) => (
                          <li
                            key={w.id}
                            className="flex items-center justify-between gap-2 text-xs text-cream-muted"
                          >
                            <span className="truncate">
                              {w.name} · {w.phone}
                              {w.email ? ` · ${w.email}` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleContacted(w)}
                              className="shrink-0 rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-medium text-near-black-green"
                            >
                              ติดต่อแล้ว
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-cream-muted">
                  ทริปเหล่านี้มีที่ว่างแล้ว และยังมีคนลงชื่อ waitlist รออยู่ — ติดต่อได้เลยก่อนที่ว่างจะเต็มอีกครั้ง
                </p>
              </StaffCard>
            )}

            {lowSeatTrips.length > 0 && (
              <StaffCard className="border-2 border-coral bg-coral/15">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-coral">
                    ที่นั่งใกล้เต็ม
                  </h2>
                  <span className="rounded-full bg-coral px-2 py-0.5 text-xs font-medium text-white">
                    {lowSeatTrips.length}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {lowSeatTrips.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between rounded-editorial border border-coral/40 bg-near-black-green/60 px-3 py-2"
                    >
                      <span className="text-sm text-cream">
                        {t.name_en} <span className="text-cream-muted">· {t.trip_code}</span>
                      </span>
                      <span className="rounded-full bg-coral px-2 py-0.5 text-xs font-medium text-white">
                        {t.booked_seats}/{t.max_seats}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-cream-muted">
                  ที่นั่งเหลือน้อย พิจารณาเปิดรอบถัดไปได้เลยครับ
                </p>
              </StaffCard>
            )}

            <section>
              <StaffButton
                variant="secondary"
                className="border-teal-500/40 bg-teal-500/10 text-teal-500 hover:border-teal-500/40 hover:bg-teal-500/15"
                onClick={() => setFormOpen((v) => !v)}
              >
                {formOpen ? '− ปิดฟอร์ม' : '+ ลงทริปใหม่'}
              </StaffButton>

              {formOpen && (
                <StaffCard className="mt-3">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <StaffField label="ทริปต้นแบบ (คัดลอกรายละเอียดจากนี้)">
                    <StaffSelect
                      value={templateCode}
                      onChange={(e) => applyTemplate(e.target.value)}
                      required
                      className="mt-1 w-full text-sm"
                    >
                      <option value="">— เลือกทริป —</option>
                      {tours.map((t) => (
                        <option key={t.id} value={t.trip_code}>
                          {t.name_en} · {t.trip_code}
                          {t.departure_date ? ` · ${formatDate(t.departure_date)}` : ''}
                        </option>
                      ))}
                    </StaffSelect>
                  </StaffField>

                  <StaffField label="วันเดินทางใหม่">
                    <StaffInput
                      type="date"
                      value={departureDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                      className="mt-1 w-full text-sm"
                    />
                  </StaffField>

                  <StaffField
                    label={`รหัสทริป ${repeatMonths > 1 ? '(รอบแรก — รอบถัดไป auto-gen ตามเดือน)' : ''}`}
                  >
                    <StaffInput
                      type="text"
                      value={tripCode}
                      onChange={(e) => {
                        setTripCode(e.target.value.toUpperCase())
                        setTripCodeTouched(true)
                      }}
                      required
                      className={`mt-1 w-full text-sm ${duplicateCode ? 'border-coral' : ''}`}
                    />
                    {duplicateCode && (
                      <p className="mt-1 text-xs text-coral">รหัสนี้มีทริปอยู่แล้ว ลองเปลี่ยนรหัส</p>
                    )}
                  </StaffField>

                  <div className="grid grid-cols-2 gap-3">
                    <StaffField label="ที่นั่ง">
                      <StaffInput
                        type="number"
                        min={1}
                        value={maxSeats}
                        onChange={(e) => setMaxSeats(e.target.value)}
                        className="mt-1 w-full text-sm"
                      />
                    </StaffField>
                    <StaffField label="สถานะ">
                      <StaffSelect
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-1 w-full text-sm"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </StaffSelect>
                    </StaffField>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <StaffField label="ราคา (AUD)">
                      <StaffInput
                        type="number"
                        min={0}
                        value={priceAud}
                        onChange={(e) => setPriceAud(e.target.value)}
                        className="mt-1 w-full text-sm"
                      />
                    </StaffField>
                    <StaffField label="มัดจำ (AUD)">
                      <StaffInput
                        type="number"
                        min={0}
                        value={depositAud}
                        onChange={(e) => setDepositAud(e.target.value)}
                        className="mt-1 w-full text-sm"
                      />
                    </StaffField>
                  </div>

                  <StaffField label="ทำซ้ำทุกเดือน กี่รอบ (1 = แค่รอบเดียว)">
                    <StaffInput
                      type="number"
                      min={1}
                      max={12}
                      value={repeatMonths}
                      onChange={(e) => setRepeatMonths(Math.max(1, Number(e.target.value) || 1))}
                      className="mt-1 w-full text-sm"
                    />
                  </StaffField>

                  <StaffButton type="submit" disabled={submitting}>
                    {submitting ? 'กำลังบันทึก...' : repeatMonths > 1 ? `สร้าง ${repeatMonths} รอบ` : 'บันทึกทริปใหม่'}
                  </StaffButton>
                </form>
                </StaffCard>
              )}
            </section>

            <section>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-cream-muted">
                  {listTab === 'archived'
                    ? 'Archived trips'
                    : showPast
                      ? 'ทริปทั้งหมด'
                      : 'ทริปที่กำลังจะมาถึง'}
                </h2>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setListTab('active')}
                    className={listTab === 'active' ? 'rounded-full bg-teal-500/20 px-2.5 py-1 text-xs text-teal-400' : staffTabIdleClass}
                  >
                    Active ({allTours.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setListTab('archived')}
                    className={listTab === 'archived' ? 'rounded-full bg-teal-500/20 px-2.5 py-1 text-xs text-teal-400' : staffTabIdleClass}
                  >
                    Archived ({archivedTours.length})
                  </button>
                  {listTab === 'active' && pastCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPast((v) => !v)}
                      className={staffTabIdleClass}
                    >
                      {showPast ? 'ซ่อนทริปเก่า' : `แสดงทริปเก่า (${pastCount})`}
                    </button>
                  )}
                </div>
              </div>
              {listTab === 'active' && !showPast && pastCount > 0 && (
                <p className="mt-1 text-xs text-cream-muted">
                  ทริปเก่ายังอยู่ครบสำหรับทำบัญชี/ภาษี · OWNER: Archive (soft) หรือ Delete ถาวรเมื่อ 0 bookings
                </p>
              )}
              {listTab === 'archived' && (
                <p className="mt-1 text-xs text-cream-muted">
                  Soft-hidden from public + default lists. Restore or hard-delete (0 bookings only).
                </p>
              )}
              <ul className="mt-2 space-y-1.5">
                {visibleTours.map((t) => {
                  const ratio = seatFillRatio(t)
                  const badgeColor =
                    ratio >= 1
                        ? 'bg-coral text-white'
                        : ratio >= LOW_SEATS_RATIO
                          ? 'bg-teal-500/80 text-near-black-green'
                          : 'bg-white/10 text-cream-muted'
                  const isGenerating = generatingTripId === t.id
                  const showContentBtn =
                    listTab === 'active' && isLiveStatus(t.status) && isUpcoming(t)
                  const isArchived = t.status.toLowerCase() === 'archived'
                  return (
                    <li key={t.id}>
                      <StaffCard className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-cream">{t.name_en}</p>
                          <p className="truncate text-xs text-cream-muted">
                            {t.trip_code} · {formatDate(t.departure_date)} · {t.status}
                          </p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                            {t.booked_seats}/{t.max_seats}
                          </span>
                          {!isArchived && t.status.toLowerCase() === 'cancelled' ? (
                            <button
                              type="button"
                              onClick={() => handleRestoreTour(t)}
                              title="เปิดทริปนี้กลับมา (published)"
                              className="rounded-full p-1 text-cream-muted hover:bg-teal-500/20 hover:text-teal-500"
                            >
                              ♻️
                            </button>
                          ) : !isArchived ? (
                            <button
                              type="button"
                              onClick={() => handleCancelTour(t)}
                              title="งดจัดทริปนี้ — ซ่อนจากเว็บแต่เก็บข้อมูลไว้ครบ"
                              className="rounded-full p-1 text-cream-muted hover:bg-coral/20 hover:text-coral"
                            >
                              🚫
                            </button>
                          ) : null}
                          {isOwner && !isArchived && (
                            <button
                              type="button"
                              title="Archive trip (soft hide)"
                              onClick={() => setTourAction({ tour: t, mode: 'archive' })}
                              className="rounded-full p-1 text-cream-muted hover:bg-amber/20 hover:text-amber"
                            >
                              <Archive className="h-4 w-4" strokeWidth={2} aria-hidden />
                            </button>
                          )}
                          {isOwner && isArchived && (
                            <button
                              type="button"
                              title="Restore trip"
                              onClick={() => setTourAction({ tour: t, mode: 'unarchive' })}
                              className="rounded-full p-1 text-cream-muted hover:bg-teal-500/20 hover:text-teal-500"
                            >
                              <RotateCcw className="h-4 w-4" strokeWidth={2} aria-hidden />
                            </button>
                          )}
                          {isOwner && (
                            <button
                              type="button"
                              title="Delete permanently (only if zero bookings)"
                              onClick={() => setTourAction({ tour: t, mode: 'delete' })}
                              className="rounded-full p-1 text-cream-muted hover:bg-coral/20 hover:text-coral"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                            </button>
                          )}
                        </span>
                      </div>
                      {showContentBtn && (
                        <button
                          type="button"
                          disabled={generatingTripId !== null}
                          onClick={() => void handleGenerateTripPost(t)}
                          className="mt-2 flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl border border-teal-500/40 bg-teal-500/10 px-3 text-xs font-medium text-teal-500 transition-colors hover:bg-teal-500/15 disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                              กำลังสร้าง…
                            </>
                          ) : (
                            'สร้าง content ให้ทริปนี้'
                          )}
                        </button>
                      )}
                      {isOwner && (
                        <TripSeatsEditor
                          tour={t}
                          onSaved={(updated) =>
                            setTours((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                          }
                          onSessionExpired={() => navigate('/app')}
                          onToast={(msg, tone) => toast(msg, tone ?? 'success')}
                        />
                      )}
                      <TripItineraryEditor
                        tour={t}
                        onSaved={(updated) =>
                          setTours((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                        }
                        onSessionExpired={() => navigate('/app')}
                        onToast={(msg, tone) => toast(msg, tone ?? 'success')}
                      />
                      </StaffCard>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-cream-muted">Waitlist</h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-cream-muted">
                  {waitlist.filter((w) => !w.contacted).length} ยังไม่ติดต่อ
                </span>
              </div>
              {waitlist.length === 0 ? (
                <p className="mt-2 text-sm text-cream-muted">ยังไม่มีคนลงชื่อ waitlist</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {waitlist.map((w) => (
                    <li key={w.id}>
                      <StaffCard className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="truncate text-cream">
                          {w.name} <span className="text-cream-muted">· {w.trip_code}</span>
                        </p>
                        <p className="truncate text-xs text-cream-muted">
                          {w.phone}
                          {w.email ? ` · ${w.email}` : ''} · {formatDate(w.created_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleContacted(w)}
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          w.contacted ? 'bg-white/10 text-cream-muted' : 'bg-teal-500 text-near-black-green'
                        }`}
                      >
                        {w.contacted ? 'ติดต่อแล้ว' : 'ติดต่อแล้ว?'}
                      </button>
                      </StaffCard>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </StaffMain>

      {tourAction && (
        <ArchiveTourDialog
          tour={tourAction.tour}
          mode={tourAction.mode}
          submitting={tourActionSubmitting}
          onConfirm={() => void confirmTourAction()}
          onClose={() => {
            if (!tourActionSubmitting) setTourAction(null)
          }}
        />
      )}
    </div>
  )
}
