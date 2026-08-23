import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { visibleWaiverClauses } from '../../data/risks'
import { tripRequiresDormAck } from '../../data/tripDetails'

export type WaiverFormSubmit = {
  signedName: string
  clauses: string[]
  signedAt: string
}

type Props = {
  tripCode: string
  defaultSignedName?: string
  backTo?: string
  headingNote?: string
  headingNoteTh?: string
  onSubmit: (payload: WaiverFormSubmit) => Promise<void>
}

export default function WaiverForm({
  tripCode,
  defaultSignedName = '',
  backTo,
  headingNote,
  headingNoteTh,
  onSubmit,
}: Props) {
  const { tt } = useLang()
  const includeDormAck = tripRequiresDormAck(tripCode)
  const clausesEn = visibleWaiverClauses('en', { includeDormAck })
  const clausesTh = visibleWaiverClauses('th', { includeDormAck })

  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [signedName, setSignedName] = useState(defaultSignedName)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const allChecked = clausesEn.every((c) => checked[c.id])
  const nameValid = signedName.trim().length >= 3

  const title = tt('waiver.title')
  const signPh = tt('waiver.signName')
  const requiredBi = tt('validation.required')
  const clauseErr = tt('validation.waiverClauses')
  const loadingBi = tt('common.loading')

  const errors = useMemo(() => {
    if (!touched) return {}
    const e: Record<string, string> = {}
    if (!allChecked) e.clauses = clauseErr.en
    if (!nameValid) e.name = requiredBi.en
    return e
  }, [touched, allChecked, nameValid, clauseErr.en, requiredBi.en])

  const isValid = allChecked && nameValid

  function toggleAll(next: boolean) {
    const map: Record<string, boolean> = {}
    for (const clause of clausesEn) map[clause.id] = next
    setChecked(map)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!tripCode || !isValid) return

    setSubmitting(true)
    try {
      await onSubmit({
        signedName: signedName.trim(),
        clauses: clausesEn.map((c) => c.id),
        signedAt: new Date().toISOString(),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="waiver-shell pb-4" noValidate>
      <div className="flow-top -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
        {backTo ? (
          <Link to={backTo} className="back" aria-label="Back">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="back" aria-hidden>
            <ArrowLeft className="h-3.5 w-3.5 opacity-30" />
          </span>
        )}
        <h1 className="m-0 font-serif text-[15.5px] text-ink sm:text-xl">
          {title.en}
          <span className="mt-0.5 block font-thai text-[10px] font-medium text-ink-soft">
            {title.th}
          </span>
          {headingNote ? (
            <span className="mt-1 block text-[11px] font-sans font-medium text-teal-800">
              {headingNote}
              {headingNoteTh ? (
                <span className="mt-0.5 block font-thai text-[10px] font-medium text-ink-soft">
                  {headingNoteTh}
                </span>
              ) : null}
            </span>
          ) : null}
        </h1>
      </div>

      <div className="waiver-body space-y-4">
        <div className="waiver-text">
          {clausesEn.map((clause, i) => {
            const th = clausesTh.find((c) => c.id === clause.id)
            return (
              <div key={clause.id} className={i > 0 ? 'mt-3' : undefined}>
                <p>
                  <b>{clause.title}</b> — {clause.text}
                </p>
                {th && (
                  <p className="mt-1 font-thai text-[11px] text-ink-soft">
                    <b>{th.title}</b> — {th.text}
                  </p>
                )}
              </div>
            )
          })}
        </div>

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
            <span className="mt-0.5 block font-thai">{clauseErr.th}</span>
          </p>
        )}

        <div className={`sign-box ${errors.name ? 'sign-box-error' : ''}`}>
          <input
            value={signedName}
            onChange={(e) => setSignedName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={`✍️ ${signPh.en}`}
            aria-label={`${signPh.en} / ${signPh.th}`}
          />
        </div>
        {errors.name && (
          <p className="text-[10px] text-coral">
            {errors.name}
            <span className="mt-0.5 block font-thai">{requiredBi.th}</span>
          </p>
        )}
      </div>

      <div className="flow-bar sticky bottom-0 -mx-4 !pb-[max(18px,env(safe-area-inset-bottom))] sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="book-btn w-full disabled:opacity-40"
        >
          {submitting ? loadingBi.en : 'Submit Waiver'}
          <span className="mt-0.5 block font-thai text-[10px] font-medium opacity-85">
            {submitting ? loadingBi.th : 'ส่งเอกสารยินยอม'}
          </span>
        </button>
      </div>
    </form>
  )
}
