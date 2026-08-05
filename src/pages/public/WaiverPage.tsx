import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { WAIVER_CLAUSES } from '../../data/risks'
import { setWaiverSigned } from '../../lib/waiverSession'
import { insertWaiverSignature } from '../../lib/toursApi'
import { useToast } from '../../components/ui/Toast'
import BiText from '../../components/ui/BiText'

export default function WaiverPage() {
  const { tt, lang } = useLang()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const tripCode = params.get('trip') ?? ''
  // Always show EN clauses as primary; TH secondary — bilingual pattern.
  const clausesEn = WAIVER_CLAUSES.en
  const clausesTh = WAIVER_CLAUSES.th

  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [signedName, setSignedName] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [allergies, setAllergies] = useState('')
  const [medical, setMedical] = useState('')
  const [insProvider, setInsProvider] = useState('')
  const [insPolicy, setInsPolicy] = useState('')
  const [otherNotes, setOtherNotes] = useState('')

  const allChecked = clausesEn.every((c) => checked[c.id])
  const nameValid = signedName.trim().length >= 3
  const emergencyOk =
    emergencyName.trim().length >= 2 && emergencyPhone.trim().length >= 8

  const title = tt('waiver.title')
  const signPh = tt('waiver.signName')
  const safetyTitle = tt('safety.title')
  const safetySub = tt('safety.subtitle')
  const emName = tt('safety.emergencyName')
  const emPhone = tt('safety.emergencyPhone')
  const allergiesBi = tt('safety.allergies')
  const allergiesPh = tt('safety.allergies.ph')
  const medicalBi = tt('safety.medical')
  const medicalPh = tt('safety.medical.ph')
  const insProvBi = tt('safety.insuranceProvider')
  const insProvPh = tt('safety.insuranceProvider.ph')
  const insPolBi = tt('safety.insurancePolicy')
  const insPolPh = tt('safety.insurancePolicy.ph')
  const notesBi = tt('safety.otherNotes')
  const notesPh = tt('safety.otherNotes.ph')
  const emReq = tt('safety.emergencyRequired')
  const requiredBi = tt('validation.required')
  const clauseErr = tt('validation.waiverClauses')
  const loadingBi = tt('common.loading')
  const successBi = tt('common.success')
  const tripsBi = tt('nav.trips')

  const errors = useMemo(() => {
    if (!touched) return {}
    const e: Record<string, string> = {}
    if (!allChecked) e.clauses = clauseErr.en
    if (!nameValid) e.name = requiredBi.en
    if (!emergencyOk) e.emergency = emReq.en
    return e
  }, [touched, allChecked, nameValid, emergencyOk, clauseErr.en, requiredBi.en, emReq.en])

  const isValid = allChecked && nameValid && emergencyOk

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
    const signedAt = new Date().toISOString()
    const clauseIds = clausesEn.map((c) => c.id)
    const trimmedName = signedName.trim()

    setWaiverSigned(tripCode, {
      tripCode,
      signedName: trimmedName,
      signedAt,
      clauses: clauseIds,
      safety: {
        emergency_contact_name: emergencyName.trim(),
        emergency_contact_phone: emergencyPhone.trim(),
        allergies: allergies.trim(),
        medical_conditions: medical.trim(),
        insurance_provider: insProvider.trim(),
        insurance_policy_number: insPolicy.trim(),
        other_notes: otherNotes.trim(),
      },
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

    toast(successBi.en, 'success')
    navigate(`/booking?trip=${tripCode}`)
    setSubmitting(false)
  }

  if (!tripCode) {
    return (
      <div className="rounded-xl border border-teal-600/40 bg-teal-500/10 p-4 text-sm text-ink">
        <BiText
          en="Please select a trip before signing the waiver."
          th="กรุณาเลือกทริปก่อนลงนาม waiver"
          thClassName="mt-1 block font-thai text-ink-soft"
        />
        <Link to="/trips" className="mt-2 block text-teal-700 underline">
          {tripsBi.en} / {tripsBi.th}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="waiver-shell pb-4" noValidate>
      <div className="flow-top -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:border lg:border-line">
        <Link to={`/trips/${tripCode}`} className="back" aria-label="Back">
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
        <h1 className="m-0 font-serif text-[15.5px] text-ink sm:text-xl">
          {title.en}
          <span className="mt-0.5 block font-thai text-[10px] font-medium text-ink-soft">
            {title.th}
          </span>
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

        {/* Safety Info — after waiver agree + signature, before submit */}
        <section className="rounded-2xl border border-line bg-mint-100/50 p-3.5">
          <BiText
            as="h2"
            en={safetyTitle.en}
            th={safetyTitle.th}
            className="text-[13px] font-bold text-ink"
            thClassName="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft"
          />
          <BiText
            as="p"
            en={safetySub.en}
            th={safetySub.th}
            className="mt-1 text-[11px] text-ink-soft"
            thClassName="mt-0.5 block font-thai text-[10px] text-ink-soft/85"
          />

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <label className="block sm:col-span-1">
              <span className="text-[10px] font-semibold text-ink">
                {emName.en} *
                <span className="mt-px block font-thai font-medium text-ink-soft">{emName.th}</span>
              </span>
              <input
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                onBlur={() => setTouched(true)}
                required
                className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-teal-600"
              />
            </label>
            <label className="block sm:col-span-1">
              <span className="text-[10px] font-semibold text-ink">
                {emPhone.en} *
                <span className="mt-px block font-thai font-medium text-ink-soft">{emPhone.th}</span>
              </span>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                onBlur={() => setTouched(true)}
                required
                className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-teal-600"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold text-ink">
                {allergiesBi.en}
                <span className="mt-px block font-thai font-medium text-ink-soft">
                  {allergiesBi.th}
                </span>
              </span>
              <input
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder={`${allergiesPh.en} / ${allergiesPh.th}`}
                className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-teal-600"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold text-ink">
                {medicalBi.en}
                <span className="mt-px block font-thai font-medium text-ink-soft">{medicalBi.th}</span>
              </span>
              <input
                value={medical}
                onChange={(e) => setMedical(e.target.value)}
                placeholder={`${medicalPh.en} / ${medicalPh.th}`}
                className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-teal-600"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold text-ink">
                {insProvBi.en}
                <span className="mt-px block font-thai font-medium text-ink-soft">{insProvBi.th}</span>
              </span>
              <input
                value={insProvider}
                onChange={(e) => setInsProvider(e.target.value)}
                placeholder={`${insProvPh.en} / ${insProvPh.th}`}
                className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-teal-600"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold text-ink">
                {insPolBi.en}
                <span className="mt-px block font-thai font-medium text-ink-soft">{insPolBi.th}</span>
              </span>
              <input
                value={insPolicy}
                onChange={(e) => setInsPolicy(e.target.value)}
                placeholder={`${insPolPh.en} / ${insPolPh.th}`}
                className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-teal-600"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] font-semibold text-ink">
                {notesBi.en}
                <span className="mt-px block font-thai font-medium text-ink-soft">{notesBi.th}</span>
              </span>
              <textarea
                value={otherNotes}
                onChange={(e) => setOtherNotes(e.target.value)}
                placeholder={`${notesPh.en} / ${notesPh.th}`}
                rows={2}
                className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-teal-600"
              />
            </label>
          </div>
          {errors.emergency && (
            <p className="mt-2 text-[10.5px] text-coral" role="alert">
              {errors.emergency}
              <span className="mt-0.5 block font-thai">{emReq.th}</span>
            </p>
          )}
        </section>
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
