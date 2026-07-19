import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
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
  first_name_th: string
  last_name_th: string
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
    first_name_th: '',
    last_name_th: '',
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
        first_name_th: form.first_name_th.trim() || form.first_name_en.trim(),
        last_name_th: form.last_name_th.trim() || form.last_name_en.trim(),
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
        <p className="text-sm text-gray-600">{t('booking.selectTrip')}</p>
        <Link to="/trips" className="mt-2 inline-block text-deep-green underline">
          {t('nav.trips')}
        </Link>
      </div>
    )
  }

  if (reference) {
    return (
      <div className="rounded-editorial border border-gold/40 bg-gold/10 p-6 text-center">
        <Check className="mx-auto h-10 w-10 text-gold" />
        <h2 className="mt-3 font-serif text-xl text-brand-dark">{t('booking.confirmation')}</h2>
        <p className="mt-2 text-sm text-brand-dark/70">{t('booking.success')}</p>
        <p className="mt-4 font-serif text-lg text-gold-dark">{reference}</p>
        <p className="mt-1 text-xs text-gray-500">{t('booking.reference')}</p>
      </div>
    )
  }

  if (loadError || !tour) {
    return <PageError message={loadError || t('common.error')} />
  }

  const name = lang === 'th' ? tour.name_th : tour.name_en

  const fields: { key: keyof FormState; label: string; type?: string; required?: boolean }[] = [
    { key: 'first_name_th', label: t('form.nameTh') },
    { key: 'last_name_th', label: t('form.nameTh') },
    { key: 'first_name_en', label: t('form.nameEn'), required: true },
    { key: 'last_name_en', label: t('form.nameEn'), required: true },
    { key: 'passport_number', label: t('form.passport') },
    { key: 'email', label: t('form.email'), type: 'email', required: true },
    { key: 'phone', label: t('form.phone'), required: true },
    { key: 'dietary_requirements', label: t('form.dietary') },
    { key: 'medical_conditions', label: t('form.medical') },
    { key: 'oshc_provider', label: t('form.oshcProvider') },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <h1 className="font-serif text-2xl text-brand-dark">{t('booking.summary')}</h1>

      <div className="rounded-editorial border border-gold/40 bg-gold/10 p-4">
        <p className="font-medium text-brand-dark">{name}</p>
        <p className="text-sm text-brand-dark/60">{tourDurationLabel(tour, lang)}</p>
        <p className="mt-2 font-serif text-2xl text-gold-dark">{formatAud(tour.price_aud)}</p>
        <p className="text-sm text-gray-600">
          {t('booking.deposit')}: {formatAud(tour.deposit_aud)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, type, required }) => (
          <label key={key} className="block">
            <span className="text-xs font-medium text-gray-600">
              {label}
              {required && <span className="text-red-500"> *</span>}
            </span>
            <input
              type={type ?? 'text'}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              onBlur={() => setTouched(true)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                fieldErrors[key] ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {fieldErrors[key] && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors[key]}</p>
            )}
          </label>
        ))}
        <label className="block">
          <span className="text-xs font-medium text-gray-600">{t('form.oshcExpiry')}</span>
          <input
            type="date"
            value={form.oshc_expiry}
            onChange={(e) => setForm((f) => ({ ...f, oshc_expiry: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <section className="rounded-xl border border-gray-100 bg-white p-4">
        <h2 className="text-sm font-semibold text-brand-dark">{t('booking.payment')}</h2>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span className="font-mono text-sm">{PAYID_EMAIL}</span>
          <button type="button" onClick={copyPayId} className="text-gold">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <label className="mt-4 block cursor-pointer rounded-lg border-2 border-dashed border-gray-200 p-4 text-center text-sm">
          {t('booking.uploadSlip')}
          <input
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(e) => setSlipFile(e.target.files?.[0] ?? null)}
          />
          {slipFile && <p className="mt-1 text-xs text-gray-500">{slipFile.name}</p>}
        </label>
      </section>

      <button
        type="submit"
        disabled={submitting || !isValid}
        className="btn-primary w-full disabled:opacity-50"
      >
        {submitting ? t('common.loading') : t('btn.submit')}
      </button>
    </form>
  )
}
