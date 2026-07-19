import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import BookingJourneyTimeline from '../../components/booking/BookingJourneyTimeline'
import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import {
  fetchTourByCode,
  formatAud,
  insertBooking,
  uploadPaymentSlip,
} from '../../lib/toursApi'
import { SeatsFullError } from '../../types/errors'
import { tourDurationLabel } from '../../lib/tourDisplay'
import { isWaiverSigned, getWaiverSession } from '../../lib/waiverSession'
import {
  getSupabaseErrorMessage,
  isValidAuMobile,
  isValidEmail,
  normalizeAuMobile,
} from '../../lib/validation'
import type { Tour } from '../../types/tour'
import { Skeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'

const PAYID_EMAIL = import.meta.env.VITE_PAYID_EMAIL ?? 'payments@trip2talk.com.au'

type FormState = {
  first_name_en: string
  last_name_en: string
  passport_number: string
  email: string
  phone: string
  dietary_requirements: string
  medical_conditions: string
  oshc_provider: string
  oshc_expiry: string
}

const REQUIRED: (keyof FormState)[] = ['first_name_en', 'last_name_en', 'email', 'phone']

export default function BookingPage() {
  const { lang, t } = useLang()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tripCode = params.get('trip') ?? ''

  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)
  const [reference, setReference] = useState('')
  const [copied, setCopied] = useState(false)
  const [slipFile, setSlipFile] = useState<File | null>(null)

  const [form, setForm] = useState<FormState>({
    first_name_en: '',
    last_name_en: '',
    passport_number: '',
    email: '',
    phone: '',
    dietary_requirements: '',
    medical_conditions: '',
    oshc_provider: '',
    oshc_expiry: '',
  })

  useEffect(() => {
    if (!tripCode) {
      setLoading(false)
      return
    }
    if (!isWaiverSigned(tripCode)) {
      navigate(`/waiver?trip=${tripCode}`, { replace: true })
      return
    }
    fetchTourByCode(tripCode)
      .then(setTour)
      .catch(() => setLoadError(t('common.error')))
      .finally(() => setLoading(false))
  }, [tripCode, navigate, t])

  const fieldErrors = useMemo(() => {
    if (!touched) return {} as Partial<Record<keyof FormState, string>>
    const e: Partial<Record<keyof FormState, string>> = {}
    for (const key of REQUIRED) {
      if (!form[key].trim()) e[key] = t('validation.required')
    }
    if (form.email.trim() && !isValidEmail(form.email)) e.email = t('validation.email')
    if (form.phone.trim() && !isValidAuMobile(form.phone)) e.phone = t('validation.phone')
    return e
  }, [form, touched, t])

  const isValid =
    REQUIRED.every((k) => form[k].trim()) &&
    isValidEmail(form.email) &&
    isValidAuMobile(form.phone)

  async function copyPayId() {
    await navigator.clipboard.writeText(PAYID_EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!tour || !isValid) return

    setSubmitting(true)

    const bookingRef = `T2T-${tour.trip_code}-${Date.now().toString(36).toUpperCase()}`
    const waiver = getWaiverSession(tripCode)

    try {
      let slipUrl: string | null = null
      if (slipFile) {
        try {
          slipUrl = await uploadPaymentSlip(slipFile, bookingRef)
        } catch {
          /* storage optional */
        }
      }

      await insertBooking(tour.id, {
        trip_code: tour.trip_code,
        // DB columns are NOT NULL on V7 schema — send empty string (no longer collected)
        first_name_th: '',
        last_name_th: '',
        first_name_en: form.first_name_en.trim(),
        last_name_en: form.last_name_en.trim(),
        passport_number: form.passport_number.trim() || 'PENDING',
        email: form.email.trim(),
        phone: normalizeAuMobile(form.phone),
        dietary_requirements: form.dietary_requirements || null,
        medical_conditions: form.medical_conditions || null,
        oshc_provider: form.oshc_provider || null,
        oshc_expiry: form.oshc_expiry || null,
        waiver_signed: true,
        waiver_signed_at: waiver?.signedAt ?? new Date().toISOString(),
        booking_status: 'pending_payment',
        amount_paid_aud: 0,
        payment_method: 'payid',
        slip_url: slipUrl,
        booking_reference: bookingRef,
      })

      setReference(bookingRef)
      toast(t('toast.bookingSuccess'), 'success')
    } catch (err) {
      if (err instanceof SeatsFullError) {
        toast('ที่นั่งเต็มแล้วครับ กรุณาเลือกทริปอื่น', 'error')
        return
      }
      const msg = getSupabaseErrorMessage(err)
      const friendly =
        msg.includes('row-level security') || msg.includes('42501')
          ? t('booking.rlsError')
          : t('toast.bookingFailed')
      toast(friendly, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!tripCode) {
    return (
      <div>
        <p className="text-sm text-ink-soft">{t('booking.selectTrip')}</p>
        <Link to="/trips" className="mt-2 inline-block text-teal-700 underline">
          {t('nav.trips')}
        </Link>
      </div>
    )
  }

  if (reference) {
    return (
      <div className="flex flex-col items-center px-[22px] pb-[22px] pt-[30px] text-center">
        <div
          className="mb-3.5 flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[28px] text-cream"
          style={{
            background: 'linear-gradient(180deg, #efa565, #20363c)',
            boxShadow: '0 12px 24px -10px rgba(20,50,45,.45)',
          }}
        >
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <h2 className="m-0 mb-[3px] font-serif text-[18px] text-ink">
          {t('booking.confirmation')}
        </h2>
        <p className="mb-3.5 font-thai text-[12px] text-teal-700">จองสำเร็จแล้ว!</p>
        <p className="mb-4 text-[13px] text-ink-soft">{t('booking.success')}</p>
        <p className="mb-4 rounded-xl border border-dashed border-line bg-card px-[18px] py-2.5 text-[13px] font-extrabold tracking-[0.06em] text-ink">
          {reference}
        </p>

        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full gap-2.5 rounded-[14px] border border-[#cfe0fb] bg-[#eaf2ff] px-3.5 py-3 text-left"
        >
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#1877F2] text-[14px] font-bold text-cream">
            f
          </span>
          <span>
            <b className="block text-[11px] font-bold text-ink">
              {lang === 'th'
                ? 'ขั้นต่อไป: Inbox หาเราทาง Facebook'
                : 'Next: message us on Facebook'}
            </b>
            <span className="mt-0.5 block text-[9.5px] leading-relaxed text-ink-soft">
              {t('myTrip.messageUs')}
            </span>
          </span>
        </a>

        <BookingJourneyTimeline
          bookingStatus="pending_payment"
          className="mt-5 w-full text-left"
        />
      </div>
    )
  }

  if (loadError || !tour) {
    return <PageError message={loadError || t('common.error')} />
  }

  const name = lang === 'th' ? tour.name_th : tour.name_en

  const fields: { key: keyof FormState; label: string; type?: string; required?: boolean }[] = [
    { key: 'first_name_en', label: t('form.firstName'), required: true },
    { key: 'last_name_en', label: t('form.lastName'), required: true },
    { key: 'passport_number', label: t('form.passport') },
    { key: 'email', label: t('form.email'), type: 'email', required: true },
    { key: 'phone', label: t('form.phone'), required: true },
    { key: 'dietary_requirements', label: t('form.dietary') },
    { key: 'medical_conditions', label: t('form.medical') },
    { key: 'oshc_provider', label: t('form.oshcProvider') },
  ]

  const depositDue = tour.deposit_aud

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4" noValidate>
      <h1 className="font-serif text-2xl text-ink">
        {lang === 'th' ? 'จองทริปของคุณ' : 'Book Your Trip'}
      </h1>

      <div className="flex items-center gap-2.5 rounded-xl bg-mint-100 p-2">
        {tour.cover_image_url ? (
          <img
            src={tour.cover_image_url}
            alt=""
            className="h-11 w-11 rounded-[9px] object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-[9px] bg-teal-800 text-[10px] text-cream">
            T2T
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold text-ink">{name}</p>
          <p className="text-[9px] text-ink-soft">{tourDurationLabel(tour, lang)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, type, required }) => (
          <label key={key} className="block">
            <span className="text-[9.5px] font-bold uppercase tracking-wide text-ink-soft">
              {label}
              {required && <span className="text-coral"> *</span>}
            </span>
            <input
              type={type ?? 'text'}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              onBlur={() => setTouched(true)}
              className={`mt-1 w-full rounded-[10px] border bg-cream px-3 py-2.5 text-[11.5px] text-ink ${
                fieldErrors[key] ? 'border-coral' : 'border-line'
              }`}
            />
            {fieldErrors[key] && (
              <p className="mt-1 text-xs text-coral">{fieldErrors[key]}</p>
            )}
          </label>
        ))}
        <label className="block">
          <span className="text-[9.5px] font-bold uppercase tracking-wide text-ink-soft">
            {t('form.oshcExpiry')}
          </span>
          <input
            type="date"
            value={form.oshc_expiry}
            onChange={(e) => setForm((f) => ({ ...f, oshc_expiry: e.target.value }))}
            className="mt-1 w-full rounded-[10px] border border-line bg-cream px-3 py-2.5 text-[11.5px] text-ink"
          />
        </label>
      </div>

      <div className="rounded-[14px] border border-dashed border-line px-3 py-2.5">
        <div className="flex justify-between text-[11px] text-ink-soft">
          <span>
            {lang === 'th' ? 'ราคาทริปโดยประมาณ' : 'Trip total (est.)'}
          </span>
          <span>{formatAud(tour.price_aud)}</span>
        </div>
      </div>

      <div className="rounded-[14px] bg-mint-100 px-3.5 py-3">
        <div className="flex justify-between py-0.5 text-[11px] text-ink-soft">
          <span>
            {lang === 'th' ? 'ยอดรวมทริปโดยประมาณ' : 'Trip total (est.)'}
          </span>
          <span>{formatAud(tour.price_aud)}</span>
        </div>
        <div className="flex justify-between py-0.5 text-[11px] text-ink-soft">
          <span>
            {lang === 'th' ? `มัดจำ ${formatAud(tour.deposit_aud)}/คน` : `Deposit — ${formatAud(tour.deposit_aud)}`}
          </span>
          <span>{formatAud(depositDue)}</span>
        </div>
        <div className="mt-1.5 flex justify-between border-t border-dashed border-[#c9d8d1] pt-2 text-sm font-extrabold text-teal-800">
          <span>
            {lang === 'th' ? 'ชำระตอนนี้' : 'Due now'}
            <span className="mt-0.5 block font-thai text-[9.5px] font-medium text-teal-700">
              ชำระตอนนี้
            </span>
          </span>
          <span>{formatAud(depositDue)} AUD</span>
        </div>
        <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">
          We only collect a {formatAud(tour.deposit_aud)}/person deposit to secure your seat. The
          remaining balance is arranged directly with Saen & the Trip2Talk team.
          <span className="mt-0.5 block font-thai">
            เราเก็บมัดจำเพื่อจองที่นั่ง ส่วนที่เหลือพี่แสนและทีมจะติดต่อจัดการเองโดยตรง
          </span>
        </p>
      </div>

      <div className="flex gap-2 rounded-xl border border-line bg-cream px-3 py-2.5">
        <span className="text-sm leading-none" aria-hidden>
          💳
        </span>
        <div>
          <p className="text-[10.5px] font-bold text-ink">
            {lang === 'th' ? 'แบ่งจ่ายได้ตามสะดวก' : 'Flexible installments'}
          </p>
          <p className="text-[9.5px] leading-relaxed text-ink-soft">
            Pay the remaining balance in 2–4 installments, whatever works for you.
            <span className="block font-thai">แบ่งจ่ายค่าทริปที่เหลือ 2-4 งวดตามความสะดวก</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#f0dfb8] bg-[#fff8ee] px-3 py-2.5">
        <p className="text-[10.5px] font-bold text-[#7a5b16]">
          {lang === 'th' ? 'รายการที่ไม่รวมในค่าทริป' : 'Not included in trip price'}
        </p>
        <ul className="mt-1.5 space-y-1 text-[9.5px] text-[#7a5b16]">
          <li>✈️ Flights · ตั๋วเครื่องบิน</li>
          <li>🍽 Meals · ค่าอาหาร</li>
          <li>🛡 Travel insurance · ประกันการเดินทาง</li>
        </ul>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-cream px-3 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mint-100 text-sm">
          🛏
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold text-ink">
            {lang === 'th' ? 'อยากได้ที่พักส่วนตัว?' : 'Want a private room?'}
          </p>
          <p className="text-[9px] text-ink-soft">
            {lang === 'th' ? 'จ่ายเพิ่มเล็กน้อย' : 'Extra fee applies'}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#e5f6ec] px-2 py-0.5 text-[8.5px] font-extrabold text-[#1a7a4c]">
          {lang === 'th' ? 'บริการฟรี' : 'Free to arrange'}
        </span>
      </div>

      <section className="rounded-xl border border-line bg-cream p-4">
        <h2 className="text-sm font-semibold text-ink">{t('booking.payment')}</h2>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-mint-100 px-3 py-2">
          <span className="font-mono text-sm text-ink">{PAYID_EMAIL}</span>
          <button type="button" onClick={copyPayId} className="text-teal-700">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <label className="mt-4 block cursor-pointer rounded-lg border-2 border-dashed border-line p-4 text-center text-sm text-ink-soft">
          {t('booking.uploadSlip')}
          <input
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => setSlipFile(e.target.files?.[0] ?? null)}
          />
          {slipFile && <p className="mt-1 text-xs text-ink">{slipFile.name}</p>}
        </label>
      </section>

      <button
        type="submit"
        disabled={submitting || !isValid}
        className="book-btn flip-cta cta-shine w-full disabled:opacity-50"
      >
        {submitting
          ? t('common.loading')
          : lang === 'th'
            ? `ชำระมัดจำ ${formatAud(depositDue)}`
            : `Pay Deposit — ${formatAud(depositDue)}`}
      </button>
    </form>
  )
}
