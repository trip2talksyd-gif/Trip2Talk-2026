import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { fetchTourByCode, insertWaitlistEntry } from '../../lib/toursApi'
import { isValidAuMobile, isValidEmail, normalizeAuMobile } from '../../lib/validation'
import type { Tour } from '../../types/tour'
import { Skeleton } from '../../components/ui/Skeleton'
import { PageError } from '../../components/ui/PageError'
import { useToast } from '../../components/ui/Toast'

export default function WaitlistPage() {
  const { lang, t } = useLang()
  const { toast } = useToast()
  const [params] = useSearchParams()
  const tripCode = params.get('trip') ?? ''

  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [touched, setTouched] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!tripCode) {
      setLoading(false)
      return
    }
    fetchTourByCode(tripCode)
      .then(setTour)
      .catch(() => setLoadError(t('common.error')))
      .finally(() => setLoading(false))
  }, [tripCode, t])

  const isValid = name.trim().length > 0 && isValidAuMobile(phone) && (!email.trim() || isValidEmail(email))

  const nameEl = useMemo(() => (tour ? (lang === 'th' ? tour.name_th : tour.name_en) : ''), [tour, lang])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    setSubmitting(true)
    try {
      await insertWaitlistEntry({
        tour_id: tour?.id ?? null,
        trip_code: tripCode,
        name: name.trim(),
        phone: normalizeAuMobile(phone),
        email: email.trim() || null,
        note: note.trim() || null,
      })
      setDone(true)
    } catch {
      toast(lang === 'th' ? 'ลงชื่อไม่สำเร็จ ลองใหม่อีกครั้ง' : 'Could not join the waitlist — try again', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!tripCode || loadError || !tour) {
    return <PageError message={loadError || t('common.error')} />
  }

  if (done) {
    return (
      <div className="flex flex-col items-center px-[22px] pb-[22px] pt-[30px] text-center">
        <div
          className="mb-3.5 flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-cream"
          style={{
            background: 'linear-gradient(180deg, #efa565, #20363c)',
            boxShadow: '0 12px 24px -10px rgba(20,50,45,.45)',
          }}
        >
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <h2 className="m-0 mb-[3px] font-serif text-[18px] text-ink">
          {lang === 'th' ? 'ลงชื่อ Waitlist แล้ว' : "You're on the waitlist"}
        </h2>
        <p className="mb-4 text-[13px] text-ink-soft">
          {lang === 'th'
            ? 'พอมีที่ว่างหรือเปิดรอบใหม่ ทีมงานจะติดต่อกลับตามลำดับครับ'
            : "We'll reach out as soon as a seat opens up or a new date is scheduled."}
        </p>
        <Link to={`/trips/${tripCode}`} className="text-teal-700 underline">
          {lang === 'th' ? 'กลับหน้าทริป' : 'Back to trip'}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4" noValidate>
      <Link to={`/trips/${tripCode}`} className="inline-block text-sm text-teal-700">
        {lang === 'th' ? '← กลับหน้าทริป' : '← Back to trip'}
      </Link>

      <div>
        <h1 className="font-serif text-2xl text-ink">
          {lang === 'th' ? 'ลงชื่อรอที่ว่าง' : 'Join the waitlist'}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{nameEl}</p>
      </div>

      <div className="rounded-xl border border-line bg-mint-100 p-3 text-[12px] text-ink-soft">
        {lang === 'th'
          ? 'ทริปนี้เต็มแล้ว ฝากชื่อ-เบอร์ไว้ได้เลย เราจะติดต่อกลับถ้ามีที่ว่างหรือเปิดรอบใหม่'
          : "This trip is currently full. Leave your details and we'll contact you if a seat opens up or a new date is scheduled."}
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-[9.5px] font-bold uppercase tracking-wide text-ink-soft">
            {lang === 'th' ? 'ชื่อ' : 'Name'}
            <span className="text-coral"> *</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`mt-1 w-full rounded-[10px] border bg-cream px-3 py-2.5 text-[11.5px] text-ink ${
              touched && !name.trim() ? 'border-coral' : 'border-line'
            }`}
          />
        </label>

        <label className="block">
          <span className="text-[9.5px] font-bold uppercase tracking-wide text-ink-soft">
            {t('form.phone')}
            <span className="text-coral"> *</span>
          </span>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`mt-1 w-full rounded-[10px] border bg-cream px-3 py-2.5 text-[11.5px] text-ink ${
              touched && !isValidAuMobile(phone) ? 'border-coral' : 'border-line'
            }`}
          />
        </label>

        <label className="block">
          <span className="text-[9.5px] font-bold uppercase tracking-wide text-ink-soft">
            {t('form.email')}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            className={`mt-1 w-full rounded-[10px] border bg-cream px-3 py-2.5 text-[11.5px] text-ink ${
              touched && email.trim() && !isValidEmail(email) ? 'border-coral' : 'border-line'
            }`}
          />
        </label>

        <label className="block">
          <span className="text-[9.5px] font-bold uppercase tracking-wide text-ink-soft">
            {lang === 'th' ? 'หมายเหตุ (ถ้ามี)' : 'Note (optional)'}
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-[10px] border border-line bg-cream px-3 py-2.5 text-[11.5px] text-ink"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting || (touched && !isValid)}
        className="book-btn flip-cta cta-shine w-full disabled:opacity-50"
      >
        {submitting
          ? t('common.loading')
          : lang === 'th'
            ? 'ลงชื่อ Waitlist'
            : 'Join Waitlist'}
      </button>
    </form>
  )
}
