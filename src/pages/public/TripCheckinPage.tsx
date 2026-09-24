import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import { getTripCheckinInfo, submitTripCheckin, type TripCheckinInfo } from '../../lib/toursApi'
import { useToast } from '../../components/ui/Toast'
import WaiverForm from '../../components/waiver/WaiverForm'

type Fields = {
  full_name: string
  phone: string
  email: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  allergies: string
  medical_conditions: string
  dietary_requirements: string
  other_notes: string
  website: string
}

const EMPTY: Fields = {
  full_name: '',
  phone: '',
  email: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  allergies: '',
  medical_conditions: '',
  dietary_requirements: '',
  other_notes: '',
  website: '',
}

const digits = (v: string) => v.replace(/\D/g, '').length

function validate(f: Fields): Partial<Record<keyof Fields, true>> {
  const e: Partial<Record<keyof Fields, true>> = {}
  if (f.full_name.trim().length < 2) e.full_name = true
  if (digits(f.phone) < 8) e.phone = true
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = true
  if (f.emergency_contact_name.trim().length < 2) e.emergency_contact_name = true
  if (digits(f.emergency_contact_phone) < 8) e.emergency_contact_phone = true
  return e
}

const ERROR_TEXT: Record<string, { en: string; th: string }> = {
  rate_limited: {
    en: 'Too many submissions from this network. Please try again in an hour or message us.',
    th: 'ส่งจากเครือข่ายนี้บ่อยเกินไป กรุณาลองใหม่ในอีก 1 ชั่วโมง หรือทักแชทหาเรา',
  },
  invalid_contact: {
    en: 'Please check your name and phone numbers.',
    th: 'กรุณาตรวจสอบชื่อและเบอร์โทรอีกครั้ง',
  },
  invalid_waiver: {
    en: 'Please accept all terms and sign your full name.',
    th: 'กรุณายอมรับข้อตกลงทั้งหมดและลงชื่อเต็ม',
  },
  trip_closed: { en: 'Check-in for this trip has closed.', th: 'ปิดรับเช็กอินทริปนี้แล้ว' },
}

type FieldProps = {
  label: string
  labelTh: string
  value: string
  onChange: (v: string) => void
  invalid?: boolean
  type?: string
  inputMode?: 'tel' | 'email' | 'text'
  autoComplete?: string
  multiline?: boolean
  optional?: boolean
}

function Field({
  label,
  labelTh,
  value,
  onChange,
  invalid,
  type = 'text',
  inputMode,
  autoComplete,
  multiline,
  optional,
}: FieldProps) {
  const cls = `mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-teal-600 ${
    invalid ? 'border-coral' : 'border-line'
  }`
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-ink">
        {label}
        {optional ? <span className="font-normal text-ink-soft"> (optional)</span> : null}
      </span>
      <span className="block font-thai text-[11px] text-ink-soft">
        {labelTh}
        {optional ? ' (ไม่บังคับ)' : ''}
      </span>
      {multiline ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          aria-invalid={invalid || undefined}
        />
      )}
    </label>
  )
}

export default function TripCheckinPage() {
  const { tripCode = '' } = useParams()
  const { lang } = useLang()
  const { toast } = useToast()
  const [state, setState] = useState<'loading' | 'open' | 'done' | 'not_found' | 'closed' | 'error'>(
    'loading',
  )
  const [info, setInfo] = useState<TripCheckinInfo | null>(null)
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    let cancelled = false
    getTripCheckinInfo(tripCode)
      .then((data) => {
        if (cancelled) return
        setInfo(data)
        setState('open')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const code = err instanceof Error ? err.message : ''
        setState(code === 'not_found' ? 'not_found' : code === 'trip_closed' ? 'closed' : 'error')
      })
    return () => {
      cancelled = true
    }
  }, [tripCode])

  const errors = touched ? validate(fields) : {}
  const set = (key: keyof Fields) => (v: string) => setFields((f) => ({ ...f, [key]: v }))

  if (state === 'loading') {
    return <p className="py-16 text-center text-sm text-ink-soft">Loading… / กำลังโหลด…</p>
  }

  if (state !== 'open' && state !== 'done') {
    const msg =
      state === 'not_found'
        ? { en: 'This check-in link is not valid.', th: 'ลิงก์เช็กอินนี้ไม่ถูกต้อง' }
        : state === 'closed'
          ? ERROR_TEXT.trip_closed
          : { en: 'Could not load this page. Please try again.', th: 'โหลดหน้านี้ไม่สำเร็จ กรุณาลองใหม่' }
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-ink">{msg.en}</p>
        <p className="mt-1 font-thai text-sm text-ink-soft">{msg.th}</p>
      </div>
    )
  }

  if (state === 'done') {
    return (
      <div className="mx-auto max-w-md space-y-3 py-16 text-center">
        <h1 className="font-serif text-2xl text-ink">
          Checked in — thank you!
          <span className="mt-1 block font-thai text-base text-ink-soft">เช็กอินเรียบร้อย ขอบคุณค่ะ</span>
        </h1>
        <p className="text-sm text-ink-soft">
          Our team now has your emergency details for {info?.trip_code}.
          <span className="mt-1 block font-thai">
            ทีมงานได้รับข้อมูลติดต่อฉุกเฉินของคุณแล้ว หากต้องแก้ไข ให้ทักแชทหาเรา
          </span>
        </p>
      </div>
    )
  }

  const tripName = lang === 'th' ? info?.name_th || info?.name_en : info?.name_en || info?.name_th

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <header className="rounded-2xl border border-line bg-card p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
          Group check-in · เช็กอินก่อนออกทริป
        </p>
        <h1 className="mt-1 font-serif text-xl text-ink">{tripName || info?.trip_code}</h1>
        <p className="text-sm text-ink-soft">
          {info?.trip_code} · {info?.departure_date}
        </p>
        <p className="mt-2 text-[13px] text-ink-soft">
          Fill in your own details only. Nobody else in the group can see what you submit.
          <span className="mt-0.5 block font-thai">
            กรอกข้อมูลของตัวเองเท่านั้น คนอื่นในกลุ่มมองไม่เห็นข้อมูลที่คุณส่ง
          </span>
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-line bg-card p-4">
        <h2 className="font-serif text-base text-ink">
          About you <span className="font-thai text-sm text-ink-soft">· ข้อมูลของคุณ</span>
        </h2>
        <Field
          label="Full name"
          labelTh="ชื่อ-นามสกุล"
          value={fields.full_name}
          onChange={set('full_name')}
          invalid={errors.full_name}
          autoComplete="name"
        />
        <Field
          label="Mobile"
          labelTh="เบอร์มือถือ"
          value={fields.phone}
          onChange={set('phone')}
          invalid={errors.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
        <Field
          label="Email"
          labelTh="อีเมล"
          value={fields.email}
          onChange={set('email')}
          invalid={errors.email}
          type="email"
          inputMode="email"
          autoComplete="email"
          optional
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-line bg-card p-4">
        <h2 className="font-serif text-base text-ink">
          Emergency contact <span className="font-thai text-sm text-ink-soft">· ผู้ติดต่อฉุกเฉิน</span>
        </h2>
        <Field
          label="Contact name"
          labelTh="ชื่อผู้ติดต่อ"
          value={fields.emergency_contact_name}
          onChange={set('emergency_contact_name')}
          invalid={errors.emergency_contact_name}
        />
        <Field
          label="Contact phone"
          labelTh="เบอร์ผู้ติดต่อ"
          value={fields.emergency_contact_phone}
          onChange={set('emergency_contact_phone')}
          invalid={errors.emergency_contact_phone}
          type="tel"
          inputMode="tel"
        />
        <Field
          label="Relationship"
          labelTh="ความสัมพันธ์ เช่น พ่อ แม่ แฟน"
          value={fields.emergency_contact_relationship}
          onChange={set('emergency_contact_relationship')}
          optional
        />
      </section>

      <section className="space-y-3 rounded-2xl border border-line bg-card p-4">
        <h2 className="font-serif text-base text-ink">
          Health &amp; food <span className="font-thai text-sm text-ink-soft">· สุขภาพและอาหาร</span>
        </h2>
        <Field label="Allergies" labelTh="แพ้อะไรบ้าง" value={fields.allergies} onChange={set('allergies')} multiline optional />
        <Field
          label="Medical conditions / medication"
          labelTh="โรคประจำตัว / ยาที่ใช้"
          value={fields.medical_conditions}
          onChange={set('medical_conditions')}
          multiline
          optional
        />
        <Field
          label="Dietary requirements"
          labelTh="ข้อจำกัดด้านอาหาร"
          value={fields.dietary_requirements}
          onChange={set('dietary_requirements')}
          optional
        />
        <Field label="Anything else" labelTh="อื่นๆ" value={fields.other_notes} onChange={set('other_notes')} multiline optional />
        <p className="text-[11px] text-ink-soft">
          Health details are deleted 60 days after the trip.
          <span className="block font-thai">ข้อมูลสุขภาพจะถูกลบภายใน 60 วันหลังจบทริป</span>
        </p>
      </section>

      {/* Honeypot — hidden from people, bots fill it. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={fields.website}
        onChange={(e) => set('website')(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <WaiverForm
        tripCode={info?.trip_code ?? tripCode}
        defaultSignedName={fields.full_name}
        onSubmit={async (payload) => {
          setTouched(true)
          if (Object.keys(validate(fields)).length > 0) {
            toast(
              lang === 'th' ? 'กรุณากรอกชื่อ เบอร์ และผู้ติดต่อฉุกเฉินให้ครบ' : 'Please complete your details and emergency contact.',
              'error',
            )
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
          }
          try {
            await submitTripCheckin({
              ...fields,
              trip_code: info?.trip_code ?? tripCode,
              signed_name: payload.signedName,
              clauses: payload.clauses,
              locale: lang,
            })
            setState('done')
            window.scrollTo({ top: 0 })
          } catch (err) {
            const code = err instanceof Error ? err.message : ''
            const text = ERROR_TEXT[code] ?? {
              en: 'Could not submit. Please try again.',
              th: 'ส่งไม่สำเร็จ กรุณาลองใหม่',
            }
            toast(lang === 'th' ? text.th : text.en, 'error')
          }
        }}
      />
    </div>
  )
}
