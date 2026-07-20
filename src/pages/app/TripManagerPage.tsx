import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  addMonthsIso,
  createTour,
  createToursBulk,
  deriveTripCodeForDate,
  fetchToursAdmin,
  fetchWaitlist,
  formatDate,
  markWaitlistContacted,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { Tour, WaitlistEntry } from '../../types/tour'
import { DashboardCardSkeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'

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

  // Every trip stays in the database forever (booking/revenue history is
  // needed for tax records) — this only controls what's shown in the list.
  // Past trips are hidden by default so the list doesn't grow forever, but
  // "แสดงทริปเก่า" reveals full history any time, e.g. at tax time.
  const allTours = useMemo(
    () => tours.filter((t) => t.status.toLowerCase() !== 'cancelled'),
    [tours],
  )
  const pastCount = useMemo(() => allTours.filter((t) => !isUpcoming(t)).length, [allTours])
  const visibleTours = useMemo(
    () => (showPast ? allTours : allTours.filter(isUpcoming)),
    [allTours, showPast],
  )

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
      setTripCode(deriveTripCodeForDate(t.trip_code, departureDate))
    }
  }

  function handleDateChange(value: string) {
    setDepartureDate(value)
    if (!tripCodeTouched && template && value) {
      setTripCode(deriveTripCodeForDate(template.trip_code, value))
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
            trip_code: i === 0 ? tripCode : deriveTripCodeForDate(template.trip_code, date),
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

  return (
    <div className="min-h-svh bg-near-black-green text-cream">
      <header className="border-b border-white/8 px-4 py-4">
        <Link to="/app/owner" className="text-sm text-gold">
          ← Owner Dashboard
        </Link>
        <h1 className="mt-2 font-serif text-lg text-cream">Trip Manager</h1>
        <p className="mt-0.5 text-xs text-cream-muted">ลงทริปใหม่ · ดูที่นั่งใกล้เต็ม · Waitlist</p>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {loading && <DashboardCardSkeleton />}
        {error && !loading && <PageError message={error} onRetry={load} dark />}

        {!loading && !error && (
          <>
            {lowSeatTrips.length > 0 && (
              <section className="rounded-editorial border-2 border-coral bg-coral/15 p-4">
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
              </section>
            )}

            <section>
              <button
                type="button"
                onClick={() => setFormOpen((v) => !v)}
                className="block w-full rounded-editorial border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm font-medium text-gold transition-colors hover:bg-gold/15"
              >
                {formOpen ? '− ปิดฟอร์ม' : '+ ลงทริปใหม่'}
              </button>

              {formOpen && (
                <form
                  onSubmit={handleSubmit}
                  className="mt-3 space-y-3 rounded-editorial border border-white/8 bg-surface-card p-4"
                >
                  <label className="block">
                    <span className="text-xs text-cream-muted">ทริปต้นแบบ (คัดลอกรายละเอียดจากนี้)</span>
                    <select
                      value={templateCode}
                      onChange={(e) => applyTemplate(e.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                    >
                      <option value="">— เลือกทริป —</option>
                      {tours.map((t) => (
                        <option key={t.id} value={t.trip_code}>
                          {t.name_en} · {t.trip_code}
                          {t.departure_date ? ` · ${formatDate(t.departure_date)}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs text-cream-muted">วันเดินทางใหม่</span>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                      className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs text-cream-muted">
                      รหัสทริป {repeatMonths > 1 ? '(รอบแรก — รอบถัดไป auto-gen ตามเดือน)' : ''}
                    </span>
                    <input
                      type="text"
                      value={tripCode}
                      onChange={(e) => {
                        setTripCode(e.target.value.toUpperCase())
                        setTripCodeTouched(true)
                      }}
                      required
                      className={`mt-1 w-full rounded-lg border bg-near-black-green px-3 py-2 text-sm text-cream ${
                        duplicateCode ? 'border-coral' : 'border-white/15'
                      }`}
                    />
                    {duplicateCode && (
                      <p className="mt-1 text-xs text-coral">รหัสนี้มีทริปอยู่แล้ว ลองเปลี่ยนรหัส</p>
                    )}
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs text-cream-muted">ที่นั่ง</span>
                      <input
                        type="number"
                        min={1}
                        value={maxSeats}
                        onChange={(e) => setMaxSeats(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-cream-muted">สถานะ</span>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs text-cream-muted">ราคา (AUD)</span>
                      <input
                        type="number"
                        min={0}
                        value={priceAud}
                        onChange={(e) => setPriceAud(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-cream-muted">มัดจำ (AUD)</span>
                      <input
                        type="number"
                        min={0}
                        value={depositAud}
                        onChange={(e) => setDepositAud(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs text-cream-muted">
                      ทำซ้ำทุกเดือน กี่รอบ (1 = แค่รอบเดียว)
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={repeatMonths}
                      onChange={(e) => setRepeatMonths(Math.max(1, Number(e.target.value) || 1))}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-near-black-green px-3 py-2 text-sm text-cream"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-near-black-green disabled:opacity-50"
                  >
                    {submitting ? 'กำลังบันทึก...' : repeatMonths > 1 ? `สร้าง ${repeatMonths} รอบ` : 'บันทึกทริปใหม่'}
                  </button>
                </form>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-cream-muted">
                  {showPast ? 'ทริปทั้งหมด' : 'ทริปที่กำลังจะมาถึง'}
                </h2>
                {pastCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPast((v) => !v)}
                    className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-cream-muted hover:bg-white/15"
                  >
                    {showPast ? 'ซ่อนทริปเก่า' : `แสดงทริปเก่า (${pastCount})`}
                  </button>
                )}
              </div>
              {!showPast && pastCount > 0 && (
                <p className="mt-1 text-xs text-cream-muted">
                  ทริปเก่ายังอยู่ครบสำหรับทำบัญชี/ภาษี แค่ซ่อนจากลิสต์นี้ไว้ไม่ให้รก
                </p>
              )}
              <ul className="mt-2 space-y-1.5">
                {visibleTours.map((t) => {
                  const ratio = seatFillRatio(t)
                  const badgeColor =
                    ratio >= 1
                      ? 'bg-coral text-white'
                      : ratio >= LOW_SEATS_RATIO
                        ? 'bg-gold/80 text-near-black-green'
                        : 'bg-white/10 text-cream-muted'
                  return (
                    <li
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border border-white/8 bg-surface-card px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-cream">{t.name_en}</p>
                        <p className="truncate text-xs text-cream-muted">
                          {t.trip_code} · {formatDate(t.departure_date)} · {t.status}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                        {t.booked_seats}/{t.max_seats}
                      </span>
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
                    <li
                      key={w.id}
                      className="flex items-center justify-between rounded-lg border border-white/8 bg-surface-card px-3 py-2 text-sm"
                    >
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
                          w.contacted ? 'bg-white/10 text-cream-muted' : 'bg-gold text-near-black-green'
                        }`}
                      >
                        {w.contacted ? 'ติดต่อแล้ว' : 'ติดต่อแล้ว?'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
