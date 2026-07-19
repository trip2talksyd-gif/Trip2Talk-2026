import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { WAIVER_CLAUSES } from '../../data/risks'
import { setWaiverSigned } from '../../lib/waiverSession'
import { insertWaiverSignature } from '../../lib/toursApi'
import { useToast } from '../../components/ui/Toast'

export default function WaiverPage() {
  const { lang, t } = useLang()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tripCode = params.get('trip') ?? ''
  const clauses = WAIVER_CLAUSES[lang]

  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [signedName, setSignedName] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const allChecked = clauses.every((c) => checked[c.id])
  const nameValid = signedName.trim().length >= 3

  const errors = useMemo(() => {
    if (!touched) return {}
    const e: Record<string, string> = {}
    if (!allChecked) e.clauses = t('validation.waiverClauses')
    if (!nameValid) e.name = t('validation.required')
    return e
  }, [allChecked, nameValid, touched, t])

  const isValid = allChecked && nameValid

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!tripCode || !isValid) return

    setSubmitting(true)
    const signedAt = new Date().toISOString()
    const clauseIds = clauses.map((c) => c.id)
    const trimmedName = signedName.trim()

    setWaiverSigned(tripCode, {
      tripCode,
      signedName: trimmedName,
      signedAt,
      clauses: clauseIds,
    })

    try {
      await insertWaiverSignature({
        trip_code: tripCode,
        signed_name: trimmedName,
        signed_at: signedAt,
        clauses: clauseIds,
        locale: lang,
      })
    } catch (err) {
      console.error('[WaiverPage] failed to persist waiver signature:', err)
    }

    toast(t('common.success'), 'success')
    navigate(`/booking?trip=${tripCode}`)
    setSubmitting(false)
  }

  if (!tripCode) {
    return (
      <div className="rounded-xl border border-teal-600/40 bg-teal-500/10 p-4 text-sm text-ink">
        {lang === 'th' ? 'กรุณาเลือกทริปก่อนลงนาม waiver' : 'Please select a trip before signing the waiver.'}
        <Link to="/trips" className="mt-2 block text-teal-700 underline">
          {t('nav.trips')}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4" noValidate>
      <div className="flex items-center gap-3">
        <Link
          to={`/trips/${tripCode}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-100 text-teal-700"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-xl text-ink sm:text-2xl">{t('waiver.title')}</h1>
          <p className="font-thai text-xs text-ink-soft">
            {lang === 'th' ? 'เอกสารยินยอม' : 'Waiver & Consent'} · {tripCode}
          </p>
        </div>
      </div>

      <div className="max-h-[42vh] space-y-3 overflow-y-auto rounded-xl border border-line bg-cream p-4 text-sm leading-relaxed text-ink-soft">
        {clauses.map((clause) => (
          <div key={clause.id}>
            <p className="font-semibold text-ink">{clause.title}</p>
            <p className="mt-1">{clause.text}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {clauses.map((clause) => (
          <label
            key={`check-${clause.id}`}
            className="flex gap-3 rounded-xl border border-line bg-cream px-3 py-3"
          >
            <input
              type="checkbox"
              checked={!!checked[clause.id]}
              onChange={(e) => setChecked((prev) => ({ ...prev, [clause.id]: e.target.checked }))}
              className="mt-1 accent-teal-700"
            />
            <span className="text-xs text-ink-soft">
              <span className="font-semibold text-ink">{clause.title}</span>
              <span className="mt-0.5 block font-thai">
                {lang === 'th' ? 'ฉันได้อ่านและยอมรับ' : 'I have read and agree'}
              </span>
            </span>
          </label>
        ))}
      </div>

      {errors.clauses && (
        <p className="text-sm text-coral" role="alert">
          {errors.clauses}
        </p>
      )}

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          {t('waiver.signName')} <span className="text-coral">*</span>
        </span>
        <div
          className={`mt-1 flex min-h-[64px] items-center justify-center rounded-xl border-2 border-dashed px-3 ${
            errors.name ? 'border-coral' : 'border-line'
          } bg-cream`}
        >
          <input
            value={signedName}
            onChange={(e) => setSignedName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={lang === 'th' ? '✍️ เซ็นชื่อที่นี่' : '✍️ Sign here'}
            className="w-full bg-transparent text-center font-hand text-xl text-ink outline-none placeholder:text-ink-soft"
          />
        </div>
        {errors.name && <p className="mt-1 text-xs text-coral">{errors.name}</p>}
        <p className="mt-1 text-xs text-ink-soft">
          {lang === 'th' ? 'บันทึกเวลา: ' : 'Timestamp: '}
          {new Date().toLocaleString(lang === 'th' ? 'th-TH' : 'en-AU')}
        </p>
      </label>

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="btn-embossed w-full !rounded-[13px] disabled:opacity-40"
      >
        {submitting
          ? t('common.loading')
          : lang === 'th'
            ? 'ส่งเอกสารยินยอม'
            : 'Submit Waiver'}
      </button>
    </form>
  )
}
