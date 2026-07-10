import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
      // The sessionStorage copy above still lets the customer proceed to booking;
      // log so this doesn't silently vanish, but don't block the flow on it.
      console.error('[WaiverPage] failed to persist waiver signature:', err)
    }

    toast(t('common.success'), 'success')
    navigate(`/booking?trip=${tripCode}`)
    setSubmitting(false)
  }

  if (!tripCode) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {lang === 'th' ? 'กรุณาเลือกทริปก่อนลงนาม waiver' : 'Please select a trip before signing the waiver.'}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <h1 className="font-serif text-2xl text-brand-dark">{t('waiver.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{tripCode}</p>
      </div>

      {clauses.map((clause) => (
        <label
          key={clause.id}
          className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
        >
          <input
            type="checkbox"
            checked={!!checked[clause.id]}
            onChange={(e) => setChecked((prev) => ({ ...prev, [clause.id]: e.target.checked }))}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-semibold text-brand-dark">{clause.title}</span>
            <span className="mt-1 block text-sm text-gray-600">{clause.text}</span>
          </span>
        </label>
      ))}

      {errors.clauses && (
        <p className="text-sm text-red-600" role="alert">
          {errors.clauses}
        </p>
      )}

      <label className="block">
        <span className="text-sm font-medium text-brand-dark">
          {t('waiver.signName')} <span className="text-red-500">*</span>
        </span>
        <input
          value={signedName}
          onChange={(e) => setSignedName(e.target.value)}
          onBlur={() => setTouched(true)}
          className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm ${
            errors.name ? 'border-red-400' : 'border-gray-200'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {lang === 'th' ? 'บันทึกเวลา: ' : 'Timestamp: '}
          {new Date().toLocaleString(lang === 'th' ? 'th-TH' : 'en-AU')}
        </p>
      </label>

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="btn-primary w-full disabled:opacity-40"
      >
        {submitting ? t('common.loading') : t('btn.submit')}
      </button>
    </form>
  )
}
