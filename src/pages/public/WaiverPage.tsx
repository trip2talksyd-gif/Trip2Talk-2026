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

  function toggleAll(next: boolean) {
    const map: Record<string, boolean> = {}
    for (const clause of clauses) map[clause.id] = next
    setChecked(map)
  }

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
    <form onSubmit={handleSubmit} className="waiver-shell pb-4" noValidate>
      {/* .flow-top — back circle + bilingual title */}
      <div className="flow-top -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
        <Link to={`/trips/${tripCode}`} className="back" aria-label="Back">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <h1 className="m-0 font-serif text-[15.5px] text-ink sm:text-xl">
          {lang === 'th' ? 'เอกสารยินยอม' : 'Waiver & Consent'}
          <span className="mt-0.5 block font-thai text-[10px] font-medium text-ink-soft">
            {lang === 'th' ? 'Waiver & Consent' : 'เอกสารยินยอม'}
          </span>
        </h1>
      </div>

      <div className="waiver-body">
        {/* .waiver-text — sections in one white card */}
        <div className="waiver-text">
          {clauses.map((clause, i) => (
            <p key={clause.id} className={i > 0 ? 'mt-3' : undefined}>
              <b>{clause.title}</b> — {clause.text}
            </p>
          ))}
        </div>

        {/* Single compact agree checkbox — still marks every clause id for submit */}
        <label className="waiver-check">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          <span>
            I have read and agree to the terms above
            <span className="th" style={{ display: 'block', fontFamily: 'var(--font-th)' }}>
              ฉันได้อ่านและยอมรับเงื่อนไขข้างต้น
            </span>
          </span>
        </label>

        {errors.clauses && (
          <p className="text-[10.5px] text-coral" role="alert">
            {errors.clauses}
          </p>
        )}

        {/* .sign-box */}
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
      </div>

      {/* Sticky submit bar */}
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
