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
    <form onSubmit={handleSubmit} className="space-y-3.5 pb-4" noValidate>
      {/* .flow-top — focused flow header: back circle + title, full-bleed white bar */}
      <div className="flow-top -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
        <Link to={`/trips/${tripCode}`} className="back" aria-label="Back">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <div className="min-w-0">
          <h1 className="m-0 font-serif text-[15.5px] text-ink sm:text-xl">{t('waiver.title')}</h1>
          <p className="m-0 font-thai text-[10px] text-ink-soft">
            {lang === 'th' ? 'เอกสารยินยอม' : 'Waiver & Consent'} · {tripCode}
          </p>
        </div>
      </div>

      {/* .waiver-text */}
      <div className="max-h-[42vh] space-y-2.5 overflow-y-auto rounded-[12px] border border-line bg-white p-[11px] text-[9.5px] leading-[1.6] text-ink-soft shadow-mockup">
        {clauses.map((clause) => (
          <div key={clause.id}>
            <p className="font-semibold text-ink">{clause.title}</p>
            <p className="mt-1">{clause.text}</p>
          </div>
        ))}
      </div>

      {/* .waiver-check — compact white rows (one per clause; logic unchanged) */}
      <div className="flex flex-col gap-2">
        {clauses.map((clause) => (
          <label key={`check-${clause.id}`} className="waiver-check-row">
            <input
              type="checkbox"
              checked={!!checked[clause.id]}
              onChange={(e) => setChecked((prev) => ({ ...prev, [clause.id]: e.target.checked }))}
            />
            <span className="min-w-0 leading-[1.4]">
              <span className="block font-semibold text-ink">{clause.title}</span>
              <span className="mt-0.5 block font-thai text-[9.5px]">
                {lang === 'th' ? 'ฉันได้อ่านและยอมรับเงื่อนไขข้างต้น' : 'I have read and agree to the terms above'}
              </span>
            </span>
          </label>
        ))}
      </div>

      {errors.clauses && (
        <p className="text-[10.5px] text-coral" role="alert">
          {errors.clauses}
        </p>
      )}

      {/* .sign-box */}
      <div className="flow-field">
        <span>
          {t('waiver.signName')} <span className="normal-case text-coral">*</span>
        </span>
        <div className={`sign-box ${errors.name ? 'sign-box-error' : ''}`}>
          <input
            value={signedName}
            onChange={(e) => setSignedName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={lang === 'th' ? '✍️ Sign here / เซ็นชื่อที่นี่' : '✍️ Sign here'}
            aria-label={t('waiver.signName')}
          />
        </div>
        {errors.name && <p className="text-[10px] text-coral">{errors.name}</p>}
        <p className="text-[9.5px] font-normal normal-case tracking-normal text-ink-soft">
          {lang === 'th' ? 'บันทึกเวลา: ' : 'Timestamp: '}
          {new Date().toLocaleString('en-AU')}
        </p>
      </div>

      {/* Sticky submit bar — mockup's white bar with top hairline above the CTA */}
      <div className="flow-bar sticky bottom-0 -mx-4 !pb-[max(18px,env(safe-area-inset-bottom))] sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="book-btn w-full disabled:opacity-40"
        >
          {submitting
            ? t('common.loading')
            : lang === 'th'
              ? 'ส่งเอกสารยินยอม'
              : 'Submit Waiver'}
        </button>
      </div>
    </form>
  )
}
