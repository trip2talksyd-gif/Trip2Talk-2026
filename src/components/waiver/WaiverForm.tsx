import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { visibleWaiverClauses } from '../../data/risks'
import { tripRequiresDormAck } from '../../data/tripDetails'
import type { InsuranceType, WaiverFlightInfo, WaiverSafetyInfo } from '../../lib/waiverSession'
import BiText from '../ui/BiText'

const OSHC_RISK_EN =
  'I understand OSHC does not cover repatriation of remains and I accept this risk.'
const OSHC_RISK_TH =
  'ฉันรับทราบว่าประกันนักเรียน (OSHC) ไม่คุ้มครองการส่งร่างกลับประเทศ และยินดีรับความเสี่ยงเอง'

export type WaiverFormSubmit = {
  signedName: string
  clauses: string[]
  signedAt: string
  safety: WaiverSafetyInfo
  flight: WaiverFlightInfo
}

type Props = {
  tripCode: string
  defaultSignedName?: string
  backTo?: string
  onSubmit: (payload: WaiverFormSubmit) => Promise<void>
}

export default function WaiverForm({ tripCode, defaultSignedName = '', backTo, onSubmit }: Props) {
  const { tt } = useLang()
  const includeDormAck = tripRequiresDormAck(tripCode)
  const clausesEn = visibleWaiverClauses('en', { includeDormAck })
  const clausesTh = visibleWaiverClauses('th', { includeDormAck })

  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [signedName, setSignedName] = useState(defaultSignedName)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [allergies, setAllergies] = useState('')
  const [medical, setMedical] = useState('')
  const [otherNotes, setOtherNotes] = useState('')
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('oshc')
  const [oshcMember, setOshcMember] = useState('')
  const [oshcRisk, setOshcRisk] = useState(false)
  const [travelProvider, setTravelProvider] = useState('')
  const [travelPolicy, setTravelPolicy] = useState('')

  const [flightOpen, setFlightOpen] = useState(false)
  const [flightFirst, setFlightFirst] = useState('')
  const [flightLast, setFlightLast] = useState('')
  const [flightDob, setFlightDob] = useState('')
  const [flightPassport, setFlightPassport] = useState('')
  const [flightNationality, setFlightNationality] = useState('')
  const [flightFf, setFlightFf] = useState('')

  const needsFlightPassport = tripCode.startsWith('NZ')

  const allChecked = clausesEn.every((c) => checked[c.id])
  const nameValid = signedName.trim().length >= 3
  const emergencyOk =
    emergencyName.trim().length >= 2 && emergencyPhone.trim().length >= 8
  const oshcOk = insuranceType !== 'oshc' || oshcRisk
  const flightOk =
    !flightOpen ||
    (flightFirst.trim().length >= 1 &&
      flightLast.trim().length >= 1 &&
      Boolean(flightDob) &&
      (!needsFlightPassport ||
        (flightPassport.trim().length >= 5 && flightNationality.trim().length >= 2)))

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
  const notesBi = tt('safety.otherNotes')
  const notesPh = tt('safety.otherNotes.ph')
  const emReq = tt('safety.emergencyRequired')
  const insTypeBi = tt('safety.insuranceType')
  const oshcMemBi = tt('safety.oshcMembership')
  const oshcRiskReq = tt('safety.oshcRiskRequired')
  const travelProvBi = tt('safety.travelProvider')
  const travelPolBi = tt('safety.travelPolicy')
  const flightToggle = tt('safety.flightToggle')
  const flightNzNote = tt('safety.flightNzNote')
  const flightFirstBi = tt('safety.flightFirst')
  const flightLastBi = tt('safety.flightLast')
  const flightDobBi = tt('safety.flightDob')
  const flightPassBi = tt('safety.flightPassport')
  const flightNatBi = tt('safety.flightNationality')
  const flightFfBi = tt('safety.flightFf')
  const requiredBi = tt('validation.required')
  const clauseErr = tt('validation.waiverClauses')
  const loadingBi = tt('common.loading')

  const errors = useMemo(() => {
    if (!touched) return {}
    const e: Record<string, string> = {}
    if (!allChecked) e.clauses = clauseErr.en
    if (!nameValid) e.name = requiredBi.en
    if (!emergencyOk) e.emergency = emReq.en
    if (!oshcOk) e.oshc = oshcRiskReq.en
    if (!flightOk) e.flight = requiredBi.en
    return e
  }, [
    touched,
    allChecked,
    nameValid,
    emergencyOk,
    oshcOk,
    flightOk,
    clauseErr.en,
    requiredBi.en,
    emReq.en,
    oshcRiskReq.en,
  ])

  const isValid = allChecked && nameValid && emergencyOk && oshcOk && flightOk

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
        safety: {
          emergency_contact_name: emergencyName.trim(),
          emergency_contact_phone: emergencyPhone.trim(),
          allergies: allergies.trim(),
          medical_conditions: medical.trim(),
          other_notes: otherNotes.trim(),
          insurance_type: insuranceType,
          oshc_membership_number: oshcMember.trim(),
          oshc_risk_acknowledged: insuranceType === 'oshc' ? oshcRisk : false,
          travel_insurance_provider: travelProvider.trim(),
          travel_insurance_policy_number: travelPolicy.trim(),
          insurance_provider: travelProvider.trim(),
          insurance_policy_number: travelPolicy.trim(),
        },
        flight: {
          requested: flightOpen,
          flight_legal_first_name: flightFirst.trim(),
          flight_legal_last_name: flightLast.trim(),
          flight_date_of_birth: flightDob,
          flight_passport_number: flightPassport.trim(),
          flight_nationality: flightNationality.trim(),
          flight_frequent_flyer_number: flightFf.trim(),
        },
      })
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-teal-600'

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
            <label className="block">
              <span className="text-[10px] font-semibold text-ink">
                {emName.en} *
                <span className="mt-px block font-thai font-medium text-ink-soft">{emName.th}</span>
              </span>
              <input
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                onBlur={() => setTouched(true)}
                required
                className={inputClass}
              />
            </label>
            <label className="block">
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
                className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-3 border-t border-line/60 pt-3">
            <p className="text-[10px] font-semibold text-ink">
              {insTypeBi.en}
              <span className="mt-px block font-thai font-medium text-ink-soft">{insTypeBi.th}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ['oshc', 'OSHC', 'ประกันนักเรียน'],
                  ['travel_insurance', 'Travel insurance', 'ประกันเดินทาง'],
                  ['none', 'None', 'ไม่มี'],
                ] as const
              ).map(([value, en, th]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setInsuranceType(value)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                    insuranceType === value
                      ? 'bg-teal-700 text-white'
                      : 'border border-line bg-card text-ink-soft'
                  }`}
                >
                  {en}
                  <span className="mt-0.5 block font-thai text-[9px] font-medium opacity-90">{th}</span>
                </button>
              ))}
            </div>

            {insuranceType === 'oshc' && (
              <div className="mt-2.5 space-y-2">
                <label className="block">
                  <span className="text-[10px] font-semibold text-ink">
                    {oshcMemBi.en}
                    <span className="mt-px block font-thai font-medium text-ink-soft">
                      {oshcMemBi.th}
                    </span>
                  </span>
                  <input
                    value={oshcMember}
                    onChange={(e) => setOshcMember(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="flex items-start gap-2 rounded-xl border border-line bg-card px-3 py-2">
                  <input
                    type="checkbox"
                    checked={oshcRisk}
                    onChange={(e) => setOshcRisk(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-[11px] leading-snug text-ink">
                    {OSHC_RISK_EN}
                    <span className="mt-1 block font-thai text-[10px] text-ink-soft">
                      {OSHC_RISK_TH}
                    </span>
                  </span>
                </label>
                {errors.oshc && (
                  <p className="text-[10.5px] text-coral" role="alert">
                    {errors.oshc}
                    <span className="mt-0.5 block font-thai">{oshcRiskReq.th}</span>
                  </p>
                )}
              </div>
            )}

            {insuranceType === 'travel_insurance' && (
              <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-semibold text-ink">
                    {travelProvBi.en}
                    <span className="mt-px block font-thai font-medium text-ink-soft">
                      {travelProvBi.th}
                    </span>
                  </span>
                  <input
                    value={travelProvider}
                    onChange={(e) => setTravelProvider(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold text-ink">
                    {travelPolBi.en}
                    <span className="mt-px block font-thai font-medium text-ink-soft">
                      {travelPolBi.th}
                    </span>
                  </span>
                  <input
                    value={travelPolicy}
                    onChange={(e) => setTravelPolicy(e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
            )}
          </div>

          {errors.emergency && (
            <p className="mt-2 text-[10.5px] text-coral" role="alert">
              {errors.emergency}
              <span className="mt-0.5 block font-thai">{emReq.th}</span>
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-card p-3.5">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={flightOpen}
              onChange={(e) => setFlightOpen(e.target.checked)}
              className="mt-1"
            />
            <span className="text-[12px] font-semibold text-ink">
              {flightToggle.en}
              <span className="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft">
                {flightToggle.th}
              </span>
            </span>
          </label>

          {flightOpen && (
            <div className="mt-3 space-y-2.5">
              <BiText
                as="p"
                en={flightNzNote.en}
                th={flightNzNote.th}
                className="rounded-xl bg-mint-100/60 px-2.5 py-2 text-[10.5px] text-ink-soft"
                thClassName="mt-0.5 block font-thai text-[10px]"
              />
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-semibold text-ink">
                    {flightFirstBi.en} *
                    <span className="mt-px block font-thai font-medium text-ink-soft">
                      {flightFirstBi.th}
                    </span>
                  </span>
                  <input
                    value={flightFirst}
                    onChange={(e) => setFlightFirst(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold text-ink">
                    {flightLastBi.en} *
                    <span className="mt-px block font-thai font-medium text-ink-soft">
                      {flightLastBi.th}
                    </span>
                  </span>
                  <input
                    value={flightLast}
                    onChange={(e) => setFlightLast(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold text-ink">
                    {flightDobBi.en} *
                    <span className="mt-px block font-thai font-medium text-ink-soft">
                      {flightDobBi.th}
                    </span>
                  </span>
                  <input
                    type="date"
                    value={flightDob}
                    onChange={(e) => setFlightDob(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold text-ink">
                    {flightPassBi.en}
                    {needsFlightPassport ? ' *' : ''}
                    <span className="mt-px block font-thai font-medium text-ink-soft">
                      {flightPassBi.th}
                    </span>
                  </span>
                  <input
                    value={flightPassport}
                    onChange={(e) => setFlightPassport(e.target.value)}
                    autoComplete="off"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold text-ink">
                    {flightNatBi.en}
                    {needsFlightPassport ? ' *' : ''}
                    <span className="mt-px block font-thai font-medium text-ink-soft">
                      {flightNatBi.th}
                    </span>
                  </span>
                  <input
                    value={flightNationality}
                    onChange={(e) => setFlightNationality(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold text-ink">
                    {flightFfBi.en}
                    <span className="mt-px block font-thai font-medium text-ink-soft">
                      {flightFfBi.th}
                    </span>
                  </span>
                  <input
                    value={flightFf}
                    onChange={(e) => setFlightFf(e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
              {errors.flight && (
                <p className="text-[10.5px] text-coral" role="alert">
                  {requiredBi.en}
                  <span className="mt-0.5 block font-thai">{requiredBi.th}</span>
                </p>
              )}
            </div>
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
