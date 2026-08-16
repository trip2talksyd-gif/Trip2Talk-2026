import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import BookingJourneyTimeline from '../../components/booking/BookingJourneyTimeline'
import BookingPaymentMethodPicker, {
  type CustomerPaymentChoice,
} from '../../components/booking/BookingPaymentMethodPicker'
import PayIdDepositPanel from '../../components/booking/PayIdDepositPanel'
import SquareCardElement from '../../components/booking/SquareCardElement'
import { FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import {
  fetchTourByCode,
  formatAud,
  formatDate,
  getUnbookableReason,
  insertBooking,
  uploadPaymentSlip,
} from '../../lib/toursApi'
import { SeatsFullError } from '../../types/errors'
import { tourDurationLabel, isOneDayTrip } from '../../lib/tourDisplay'
import {
  isWaiverSigned,
  getWaiverSession,
  setConfirmationSummary,
  markConfirmationDepositPaid,
} from '../../lib/waiverSession'
import { readPreferredCustomerPayment } from '../../lib/preferredPayment'
import {
  getSupabaseErrorMessage,
  isValidAuMobile,
  isValidEmail,
  normalizeAuMobile,
} from '../../lib/validation'
import type { Tour } from '../../types/tour'
import { Skeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import TripCoverImage from '../../components/trips/TripCoverImage'
import SplitFlapPrice from '../../components/ui/SplitFlapPrice'
import { useToast } from '../../components/ui/Toast'

type FormState = {
  first_name_en: string
  last_name_en: string
  passport_number: string
  date_of_birth: string
  email: string
  phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  dietary_requirements: string
  medical_conditions: string
  allergies: string
  insurance_type: 'oshc' | 'travel_insurance' | 'none'
  oshc_membership_number: string
  oshc_risk_acknowledged: boolean
  insurance_provider: string
  insurance_policy_number: string
  travel_insurance_provider: string
  travel_insurance_policy_number: string
  other_notes: string
  oshc_provider: string
  oshc_expiry: string
  flight_booking_requested: boolean
  flight_legal_first_name: string
  flight_legal_last_name: string
  flight_date_of_birth: string
  flight_passport_number: string
  flight_nationality: string
  flight_frequent_flyer_number: string
}

type FormStringKey = {
  [K in keyof FormState]: FormState[K] extends string ? K : never
}[keyof FormState]

const REQUIRED: FormStringKey[] = [
  'first_name_en',
  'last_name_en',
  'date_of_birth',
  'email',
  'phone',
  'emergency_contact_name',
  'emergency_contact_phone',
]

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
  const [slipFile, setSlipFile] = useState<File | null>(null)
  const [paymentChoice, setPaymentChoice] = useState<CustomerPaymentChoice>(() =>
    readPreferredCustomerPayment(params.get('pay')),
  )
  const [squareCardReady, setSquareCardReady] = useState(false)
  const [squareBookingRef, setSquareBookingRef] = useState('')
  const [installmentPlan, setInstallmentPlan] = useState<1 | 2 | 4>(1)
  const [payIdAmountKind, setPayIdAmountKind] = useState<'deposit' | 'custom'>('deposit')
  const [payIdCustomRaw, setPayIdCustomRaw] = useState('')

  const [form, setForm] = useState<FormState>(() => {
    const session = tripCode ? getWaiverSession(tripCode) : null
    const safety = session?.safety
    const flight = session?.flight
    return {
      first_name_en: '',
      last_name_en: '',
      passport_number: '',
      date_of_birth: '',
      email: '',
      phone: '',
      emergency_contact_name: safety?.emergency_contact_name ?? '',
      emergency_contact_phone: safety?.emergency_contact_phone ?? '',
      dietary_requirements: '',
      medical_conditions: safety?.medical_conditions ?? '',
      allergies: safety?.allergies ?? '',
      insurance_type: safety?.insurance_type ?? 'oshc',
      oshc_membership_number: safety?.oshc_membership_number ?? '',
      oshc_risk_acknowledged: safety?.oshc_risk_acknowledged ?? false,
      insurance_provider:
        safety?.travel_insurance_provider ?? safety?.insurance_provider ?? '',
      insurance_policy_number:
        safety?.travel_insurance_policy_number ?? safety?.insurance_policy_number ?? '',
      travel_insurance_provider: safety?.travel_insurance_provider ?? '',
      travel_insurance_policy_number: safety?.travel_insurance_policy_number ?? '',
      other_notes: safety?.other_notes ?? '',
      oshc_provider: '',
      oshc_expiry: '',
      flight_booking_requested: flight?.requested ?? false,
      flight_legal_first_name: flight?.flight_legal_first_name ?? '',
      flight_legal_last_name: flight?.flight_legal_last_name ?? '',
      flight_date_of_birth: flight?.flight_date_of_birth ?? '',
      flight_passport_number: flight?.flight_passport_number ?? '',
      flight_nationality: flight?.flight_nationality ?? '',
      flight_frequent_flyer_number: flight?.flight_frequent_flyer_number ?? '',
    }
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
      .then((row) => {
        const reason = row ? getUnbookableReason(row) : null
        if (
          reason === 'no_date' ||
          reason === 'template' ||
          reason === 'draft' ||
          reason === 'cancelled' ||
          reason === 'completed'
        ) {
          navigate(`/trips/${tripCode}`, { replace: true })
          return
        }
        setTour(row)
      })
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!tour || !isValid) {
      toast(
        lang === 'th'
          ? 'กรุณากรอกข้อมูลที่จำเป็นให้ครบก่อนชำระมัดจำ'
          : 'Please complete the required booking fields before paying the deposit.',
        'error',
      )
      return
    }

    setSubmitting(true)

    const bookingRef = `T2T-${tour.trip_code}-${Date.now().toString(36).toUpperCase()}`
    const waiver = getWaiverSession(tripCode)

    try {
      let slipUrl: string | null = null
      if (paymentChoice === 'payid' && slipFile) {
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
        date_of_birth: form.date_of_birth || null,
        email: form.email.trim(),
        phone: normalizeAuMobile(form.phone),
        emergency_contact_name: form.emergency_contact_name.trim() || null,
        emergency_contact_phone: form.emergency_contact_phone.trim() || null,
        dietary_requirements: form.dietary_requirements || null,
        medical_conditions: form.medical_conditions || null,
        allergies: form.allergies.trim() || null,
        insurance_type: form.insurance_type,
        oshc_membership_number: form.oshc_membership_number.trim() || null,
        oshc_risk_acknowledged: form.oshc_risk_acknowledged,
        insurance_provider:
          form.travel_insurance_provider.trim() || form.insurance_provider.trim() || null,
        insurance_policy_number:
          form.travel_insurance_policy_number.trim() ||
          form.insurance_policy_number.trim() ||
          null,
        travel_insurance_provider: form.travel_insurance_provider.trim() || null,
        travel_insurance_policy_number: form.travel_insurance_policy_number.trim() || null,
        other_notes: form.other_notes.trim() || null,
        oshc_provider: form.oshc_provider || null,
        oshc_expiry: form.oshc_expiry || null,
        flight_booking_requested: form.flight_booking_requested,
        flight_legal_first_name: form.flight_booking_requested
          ? form.flight_legal_first_name.trim() || null
          : null,
        flight_legal_last_name: form.flight_booking_requested
          ? form.flight_legal_last_name.trim() || null
          : null,
        flight_date_of_birth: form.flight_booking_requested
          ? form.flight_date_of_birth || null
          : null,
        flight_passport_number: form.flight_booking_requested
          ? form.flight_passport_number.trim() || null
          : null,
        flight_nationality: form.flight_booking_requested
          ? form.flight_nationality.trim() || null
          : null,
        flight_frequent_flyer_number: form.flight_booking_requested
          ? form.flight_frequent_flyer_number.trim() || null
          : null,
        waiver_signed: true,
        waiver_signed_at: waiver?.signedAt ?? new Date().toISOString(),
        booking_status: 'pending_payment',
        amount_paid_aud: 0,
        payment_method: paymentChoice === 'square' ? 'square' : 'payid',
        source: 'website',
        slip_url: slipUrl,
        booking_reference: bookingRef,
        payment_plan_installments: installmentPlan,
      })

      setConfirmationSummary({
        bookingReference: bookingRef,
        tripCode: tour.trip_code,
        tripNameEn: tour.name_en,
        tripNameTh: tour.name_th,
        coverImageUrl: tour.cover_image_url,
        departureDate: tour.departure_date,
        durationLabel: tourDurationLabel(tour, 'en'),
        waiverSigned: true,
        safetyInfoOnFile: Boolean(
          form.emergency_contact_name.trim() && form.emergency_contact_phone.trim(),
        ),
        depositPaid: false,
        paymentMethod: paymentChoice === 'square' ? 'square' : 'payid',
        priceAud: tour.price_aud,
        depositAud: tour.deposit_aud,
        amountPaidAud: 0,
        bookingStatus: 'pending_payment',
        facebookMessagePending: true,
        createdAt: new Date().toISOString(),
        lookupContact: form.email.trim() || form.phone.trim() || undefined,
      })

      if (paymentChoice === 'square') {
        setSquareBookingRef(bookingRef)
        setSquareCardReady(true)
        toast(
          lang === 'th'
            ? 'จองที่นั่งแล้ว — กรอกบัตร Square ด้านล่างเพื่อชำระมัดจำ'
            : 'Seat reserved — enter your card below to pay the deposit via Square.',
          'success',
        )
        return
      }

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
      <div className="success-screen -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl">
        <div className="success-check" aria-hidden>
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <BiDisplayHeading
          en="Booking Confirmed!"
          th="จองสำเร็จแล้ว!"
          as="h2"
          thAs="p"
          enClassName=""
          thClassName="th-sub font-thai"
        />
        <div className="success-ref">{reference}</div>

        {/* .mini-trip — booked trip recap card */}
        {tour && (
          <div className="mini-trip w-full">
            <TripCoverImage src={tour.cover_image_url} alt="" className="mini-trip-fallback" compact />
            <div className="min-w-0">
              <b className="truncate">{lang === 'th' ? tour.name_th : tour.name_en}</b>
              <span>
                {tourDurationLabel(tour, lang)}
                {tour.departure_date ? ` · ${formatDate(tour.departure_date, lang)}` : ''}
                {` · ${lang === 'th' ? '1 คน' : '1 traveler'}`}
              </span>
            </div>
          </div>
        )}

        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="fb-next-card"
        >
          <span className="fb-ic" aria-hidden>
            ✉
          </span>
          <div>
            <b>
              {lang === 'th'
                ? 'ขั้นต่อไป: Inbox หาเราทาง Facebook'
                : 'Next: message us on Facebook'}
              <span className="th" style={{ display: 'block', fontWeight: 500 }}>
                {lang === 'th'
                  ? 'Next: message us on Facebook'
                  : 'ขั้นต่อไป: Inbox หาเราทาง Facebook'}
              </span>
            </b>
            <span>
              Screenshot this confirmation and send it to our Facebook Page inbox — we&apos;ll
              create your trip group chat there.
            </span>
            <span className="th">
              แคปหน้าจอนี้ส่งเข้า Inbox เพจ Facebook ของเรา ทีมงานจะสร้างกลุ่มแชททริปให้ในนั้น
            </span>
          </div>
        </a>

        <BookingJourneyTimeline bookingStatus="pending_payment" tripCode={tripCode} />

        <Link
          to={`/booking/confirmation?ref=${encodeURIComponent(reference)}`}
          className="book-btn flip-cta mt-[18px] block w-full"
        >
          {lang === 'th' ? 'เปิดสรุปการยืนยัน' : 'Open confirmation summary'}
          <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-85">
            {lang === 'th' ? 'Open confirmation summary' : 'เปิดสรุปการยืนยัน'}
          </span>
        </Link>
        <Link to="/my-trip" className="ghost-link mt-2 block">
          {lang === 'th' ? 'ดูการจองของฉัน' : 'View My Booking'}
        </Link>
        <Link to="/trips" className="ghost-link">
          {lang === 'th' ? 'กลับไปหน้าสำรวจ' : 'Back to Explore'}
          <span className="th" style={{ display: 'block', fontFamily: 'var(--font-th)' }}>
            {lang === 'th' ? 'Back to Explore' : 'กลับไปหน้าสำรวจ'}
          </span>
        </Link>
      </div>
    )
  }

  if (loadError || !tour) {
    return <PageError message={loadError || t('common.error')} />
  }

  const name = lang === 'th' ? tour.name_th : tour.name_en

  const fields: { key: FormStringKey; label: string; type?: string; required?: boolean }[] = [
    { key: 'first_name_en', label: t('form.firstName'), required: true },
    { key: 'last_name_en', label: t('form.lastName'), required: true },
    { key: 'passport_number', label: t('form.passport') },
    { key: 'date_of_birth', label: t('form.dob'), type: 'date', required: true },
    { key: 'email', label: t('form.email'), type: 'email', required: true },
    { key: 'phone', label: t('form.phone'), required: true },
    { key: 'emergency_contact_name', label: t('form.emergencyName'), required: true },
    { key: 'emergency_contact_phone', label: t('form.emergencyPhone'), required: true },
    { key: 'dietary_requirements', label: t('form.dietary') },
    { key: 'medical_conditions', label: t('form.medical') },
    { key: 'oshc_provider', label: t('form.oshcProvider') },
  ]

  const depositDue = tour.deposit_aud
  const payIdCustomParsed = (() => {
    const trimmed = payIdCustomRaw.trim()
    if (!trimmed) return null
    if (!/^-?\d+(\.\d{1,2})?$/.test(trimmed)) return null
    const n = Number(trimmed)
    if (!Number.isFinite(n)) return null
    return Math.round(n * 100) / 100
  })()
  const payIdTransferAud =
    payIdAmountKind === 'custom'
      ? payIdCustomParsed != null && payIdCustomParsed > 0
        ? payIdCustomParsed
        : undefined
      : depositDue
  const payIdCustomWarning =
    payIdAmountKind === 'custom' &&
    (payIdCustomParsed == null || payIdCustomParsed <= 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 pb-4" noValidate>
      {/* .flow-top — focused checkout header: back circle + bilingual title */}
      <div className="flow-top -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
        <Link to={`/trips/${tripCode}`} className="back" aria-label="Back / กลับ">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <div className="min-w-0">
          <BiDisplayHeading
            en="Book Your Trip"
            th={`จองทริปของคุณ · ${tripCode}`}
            as="h1"
            thAs="p"
            enClassName="m-0 text-[15.5px] font-semibold text-ink sm:text-xl"
            thClassName="m-0 font-thai text-[10px] font-medium text-ink-soft"
          />
        </div>
      </div>

      {/* .mini-trip */}
      <div className="mini-trip">
        <TripCoverImage src={tour.cover_image_url} alt="" className="mini-trip-fallback" compact />
        <div className="min-w-0">
          <b className="truncate">{name}</b>
          <span>{tourDurationLabel(tour, lang)}</span>
        </div>
      </div>

      {/* .field — white inputs, radius 10, pad 9×11 */}
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, type, required }) => (
          <label key={key} className="flow-field">
            <span>
              {label}
              {required && <span className="normal-case text-coral"> *</span>}
            </span>
            <input
              type={type ?? 'text'}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              onBlur={() => setTouched(true)}
              className={fieldErrors[key] ? 'flow-field-error' : undefined}
            />
            {fieldErrors[key] && (
              <p className="text-[10px] font-normal normal-case tracking-normal text-coral">
                {fieldErrors[key]}
              </p>
            )}
          </label>
        ))}
        <label className="flow-field">
          <span>{t('form.oshcExpiry')}</span>
          <input
            type="date"
            value={form.oshc_expiry}
            onChange={(e) => setForm((f) => ({ ...f, oshc_expiry: e.target.value }))}
          />
        </label>
      </div>

      <div className="rounded-[14px] border border-dashed border-line px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 text-[11px] text-ink-soft">
          <span>
            {lang === 'th' ? 'ราคาทริปโดยประมาณ' : 'Trip total (est.)'}
          </span>
          <SplitFlapPrice
            amountAud={tour.price_aud}
            board
            className="text-[12px] font-extrabold leading-none text-ink"
          />
        </div>
      </div>

      <div className="rounded-[14px] bg-mint-100 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2 py-0.5 text-[11px] text-ink-soft">
          <span>
            {lang === 'th' ? 'ยอดรวมทริปโดยประมาณ' : 'Trip total (est.)'}
          </span>
          <SplitFlapPrice
            amountAud={tour.price_aud}
            board
            className="text-[12px] font-extrabold leading-none text-ink"
          />
        </div>
        <div className="flex items-center justify-between gap-2 py-0.5 text-[11px] text-ink-soft">
          <span>
            {lang === 'th' ? `มัดจำ ${formatAud(tour.deposit_aud)}/คน` : `Deposit — ${formatAud(tour.deposit_aud)}`}
          </span>
          <SplitFlapPrice
            amountAud={depositDue}
            board
            className="text-[12px] font-extrabold leading-none text-ink"
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-dashed border-[#c9d8d1] pt-2 text-sm font-extrabold text-teal-800">
          <span>
            {lang === 'th' ? 'ชำระตอนนี้' : 'Due now'}
            <span className="mt-0.5 block font-thai text-[9.5px] font-medium text-teal-700">
              ชำระตอนนี้
            </span>
          </span>
          <span className="inline-flex items-baseline gap-1">
            <SplitFlapPrice
              amountAud={depositDue}
              board
              className="text-[15px] font-extrabold leading-none"
            />
            <span className="text-[10px] font-semibold">AUD</span>
          </span>
        </div>
        <p className="mt-2 text-[9px] leading-relaxed text-ink-soft">
          We only collect a {formatAud(tour.deposit_aud)}/person deposit to secure your seat. The
          remaining balance is arranged directly with Saen & the Trip2Talk team.
          <span className="mt-0.5 block font-thai">
            เราเก็บมัดจำเพื่อจองที่นั่ง ส่วนที่เหลือพี่แสนและทีมจะติดต่อจัดการเองโดยตรง
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-[12px] border border-line bg-white px-[11px] py-[9px]">
        <div className="flex gap-2">
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
        <div className="grid grid-cols-3 gap-1.5">
          {([1, 2, 4] as const).map((plan) => (
            <button
              key={plan}
              type="button"
              onClick={() => setInstallmentPlan(plan)}
              className={`rounded-[10px] border px-2 py-2 text-center text-[10px] font-bold transition-colors ${
                installmentPlan === plan
                  ? 'border-teal-700 bg-teal-800 text-cream'
                  : 'border-line bg-white text-ink-soft'
              }`}
            >
              {plan === 1
                ? lang === 'th'
                  ? 'จ่ายเต็ม'
                  : 'Pay in full'
                : lang === 'th'
                  ? `แบ่ง ${plan} งวด`
                  : `Split ×${plan}`}
            </button>
          ))}
        </div>
        {installmentPlan > 1 && (
          <p className="mt-1.5 text-[9px] leading-relaxed text-ink-soft">
            {lang === 'th'
              ? 'พี่แสนจะติดต่อนัดวันโอนแต่ละงวดกับคุณโดยตรงหลังจองเสร็จ'
              : "Saen will follow up directly to arrange each installment's due date after you book."}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-[#f0dfb8] bg-[#fff8ee] px-3 py-2.5">
        <p className="text-[10.5px] font-bold text-[#7a5b16]">
          {lang === 'th' ? 'รายการที่ไม่รวมในค่าทริป' : 'Not included in trip price'}
        </p>
        <ul className="mt-1.5 space-y-1 text-[9.5px] text-[#7a5b16]">
          {tour && isOneDayTrip(tour.trip_code) ? (
            <>
              <li>✈️ Flights · ตั๋วเครื่องบิน (ทริปวันเดียวไม่รวม)</li>
              <li>🛏 Accommodation · ที่พัก (ทริปวันเดียวไม่รวม)</li>
              <li>🍽 Meals · ค่าอาหาร</li>
              <li>🛡 Travel insurance · ประกันการเดินทาง</li>
            </>
          ) : (
            <>
              <li>✈️ Flights · ตั๋วเครื่องบิน</li>
              <li>🍽 Meals · ค่าอาหาร</li>
              <li>🛡 Travel insurance · ประกันการเดินทาง</li>
            </>
          )}
        </ul>
        {tour && isOneDayTrip(tour.trip_code) && (
          <p className="mt-2 text-[9px] leading-relaxed text-[#7a5b16]/90">
            {lang === 'th'
              ? 'ทริปวันเดียว: นัดพบ Thai Town / Starbucks มีแค่รถรับ–ส่งตามเส้นทาง (Tesla Model Y)'
              : 'One-day trips: meetup at Thai Town / Starbucks — route pickup only (Tesla Model Y).'}
          </p>
        )}
      </div>

      {tour && !isOneDayTrip(tour.trip_code) && (
      <div className="flex items-center gap-[9px] rounded-[12px] border border-line bg-white px-[11px] py-[9px]">
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
          {lang === 'th'
            ? 'จัดการให้ฟรี — ห้องส่วนตัวมีค่าใช้จ่ายเพิ่ม'
            : 'Arranging is free — private room has an extra cost'}
        </span>
      </div>
      )}

      <BookingPaymentMethodPicker
        value={paymentChoice}
        onChange={setPaymentChoice}
        depositAud={depositDue}
        disabled={submitting || squareCardReady}
      />

      {paymentChoice === 'payid' && (
        <>
          <fieldset className="space-y-2 rounded-xl border border-line bg-white p-3">
            <legend className="px-1 text-[11px] font-bold text-ink">
              {lang === 'th' ? 'ยอดโอน PayID' : 'PayID amount'}
            </legend>
            <label
              className={`flex cursor-pointer items-start gap-2 rounded-[10px] border px-3 py-2 ${
                payIdAmountKind === 'deposit' ? 'border-teal-600 bg-mint-100' : 'border-line'
              }`}
            >
              <input
                type="radio"
                name="t2t-payid-amount"
                checked={payIdAmountKind === 'deposit'}
                onChange={() => setPayIdAmountKind('deposit')}
                className="mt-0.5 accent-teal-700"
              />
              <span className="text-[11px] font-semibold text-ink">
                {lang === 'th'
                  ? `มัดจำมาตรฐาน — ${formatAud(depositDue)} AUD`
                  : `Standard Deposit — ${formatAud(depositDue)} AUD`}
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-2 rounded-[10px] border px-3 py-2 ${
                payIdAmountKind === 'custom' ? 'border-teal-600 bg-mint-100' : 'border-line'
              }`}
            >
              <input
                type="radio"
                name="t2t-payid-amount"
                checked={payIdAmountKind === 'custom'}
                onChange={() => setPayIdAmountKind('custom')}
                className="mt-0.5 accent-teal-700"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-ink">
                  {lang === 'th' ? 'ยอดกำหนดเอง' : 'Custom Amount'}
                </span>
                <span className="mt-0.5 block text-[10px] leading-snug text-ink-soft">
                  {lang === 'th'
                    ? 'กรอกยอดที่ตกลงกับผู้จัดทริป — โอน PayID ไม่มีค่าธรรมเนียมบัตร'
                    : 'Enter the amount agreed with your trip organizer'}
                </span>
                {payIdAmountKind === 'custom' && (
                  <span className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      value={payIdCustomRaw}
                      onChange={(e) => setPayIdCustomRaw(e.target.value)}
                      className="w-full rounded-lg border border-line px-2 py-1.5 text-[12px] text-ink"
                      placeholder="0.00"
                      aria-label={
                        lang === 'th'
                          ? 'ยอดที่ตกลงกับผู้จัดทริป'
                          : 'Amount agreed with your trip organizer'
                      }
                    />
                    <span className="shrink-0 text-[11px] font-semibold text-ink-soft">AUD</span>
                  </span>
                )}
              </span>
            </label>
            {payIdCustomWarning && (
              <p className="text-[10.5px] leading-relaxed text-[#7a5b16]" role="status">
                {lang === 'th'
                  ? 'ยอดนี้เป็น 0 หรือติดลบ — ตรวจกับผู้จัดทริปก่อนโอน (ยังจองที่นั่งได้)'
                  : 'This amount is $0 or negative. Confirm with your trip organizer before transferring (you can still submit the booking).'}
              </p>
            )}
          </fieldset>

          <PayIdDepositPanel variant="booking" amountAud={payIdTransferAud} />

          <label className="mt-1 block cursor-pointer rounded-[12px] border-[1.5px] border-dashed border-line bg-white p-4 text-center text-[11.5px] text-ink-soft">
            {t('booking.uploadSlip')}
            <input
              type="file"
              accept="image/*,.pdf"
              className="sr-only"
              onChange={(e) => setSlipFile(e.target.files?.[0] ?? null)}
            />
            {slipFile && <p className="mt-1 text-[10.5px] text-ink">{slipFile.name}</p>}
          </label>
        </>
      )}

      {paymentChoice === 'square' && !squareCardReady && (
        <p className="rounded-xl border border-line bg-white px-3 py-2.5 text-[11px] leading-relaxed text-ink-soft">
          {lang === 'th'
            ? 'กดปุ่มด้านล่างเพื่อจองที่นั่ง แล้วชำระด้วย Visa/Mastercard บนหน้านี้ผ่าน Square (รวมบัตรที่ออกในไทย) — ระบบ PayID ไม่เปลี่ยน'
            : 'Tap below to reserve your seat, then pay with Visa/Mastercard on this page via Square (Thai-issued cards OK). PayID is unchanged.'}
        </p>
      )}

      {paymentChoice === 'square' && squareCardReady && tour && (
        <SquareCardElement
          amountAud={depositDue}
          depositAud={tour.deposit_aud}
          listedPriceAud={tour.price_aud}
          alreadyPaidAud={0}
          showAmountOptions
          bookingReference={squareBookingRef}
          email={form.email.trim()}
          phone={form.phone.trim()}
          givenName={form.first_name_en.trim()}
          familyName={form.last_name_en.trim()}
          onPaid={() => {
            markConfirmationDepositPaid(squareBookingRef)
            setReference(squareBookingRef)
            navigate(
              `/booking/confirmation?ref=${encodeURIComponent(squareBookingRef)}&paid=1`,
            )
          }}
        />
      )}

      {/* Sticky Pay Deposit bar — mockup's white bar with top hairline above the CTA */}
      {!squareCardReady && (
      <div className="flow-bar sticky bottom-0 -mx-4 !pb-[max(18px,env(safe-area-inset-bottom))] sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
        <button
          type="submit"
          disabled={submitting}
          className="book-btn flip-cta cta-shine w-full disabled:opacity-50"
        >
          {submitting
            ? t('common.loading')
            : paymentChoice === 'square'
              ? lang === 'th'
                ? `จองที่นั่งแล้วชำระบัตร`
                : `Reserve & pay card`
              : lang === 'th'
                ? `ชำระ ${formatAud(payIdTransferAud ?? depositDue)}`
                : `Pay ${formatAud(payIdTransferAud ?? depositDue)}`}
        </button>
      </div>
      )}
    </form>
  )
}
