import { useLang } from '../../hooks/useLang'
import type { InsuranceType, WaiverFlightInfo, WaiverSafetyInfo } from '../../lib/waiverSession'
import BiText from '../ui/BiText'

const OSHC_RISK_EN =
  'I understand OSHC does not cover repatriation of remains and I accept this risk.'
const OSHC_RISK_TH =
  'ฉันรับทราบว่าประกันนักเรียน (OSHC) ไม่คุ้มครองการส่งร่างกลับประเทศ และยินดีรับความเสี่ยงเอง'

export type SafetyTravelValue = WaiverSafetyInfo & {
  flight: WaiverFlightInfo
}

type Props = {
  tripCode: string
  value: SafetyTravelValue
  onChange: (next: SafetyTravelValue) => void
  touched?: boolean
}

export function emptySafetyTravel(): SafetyTravelValue {
  return {
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergies: '',
    medical_conditions: '',
    other_notes: '',
    insurance_type: 'oshc',
    oshc_membership_number: '',
    oshc_risk_acknowledged: false,
    travel_insurance_provider: '',
    travel_insurance_policy_number: '',
    insurance_provider: '',
    insurance_policy_number: '',
    flight: {
      requested: false,
      flight_legal_first_name: '',
      flight_legal_last_name: '',
      flight_date_of_birth: '',
      flight_passport_number: '',
      flight_nationality: '',
      flight_frequent_flyer_number: '',
    },
  }
}

export function validateSafetyTravel(
  tripCode: string,
  value: SafetyTravelValue,
): Record<string, string> {
  const e: Record<string, string> = {}
  const emergencyOk =
    value.emergency_contact_name.trim().length >= 2 &&
    value.emergency_contact_phone.trim().length >= 8
  if (!emergencyOk) e.emergency = 'emergency'
  if (value.insurance_type === 'oshc' && !value.oshc_risk_acknowledged) e.oshc = 'oshc'
  const needsFlightPassport = tripCode.startsWith('NZ')
  const flight = value.flight
  const flightOk =
    !flight.requested ||
    (flight.flight_legal_first_name.trim().length >= 1 &&
      flight.flight_legal_last_name.trim().length >= 1 &&
      Boolean(flight.flight_date_of_birth) &&
      (!needsFlightPassport ||
        (flight.flight_passport_number.trim().length >= 5 &&
          flight.flight_nationality.trim().length >= 2)))
  if (!flightOk) e.flight = 'flight'
  return e
}

export default function SafetyTravelFields({ tripCode, value, onChange, touched }: Props) {
  const { tt } = useLang()
  const needsFlightPassport = tripCode.startsWith('NZ')
  const errors = touched ? validateSafetyTravel(tripCode, value) : {}

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

  const patchSafety = (partial: Partial<WaiverSafetyInfo>) => {
    onChange({ ...value, ...partial })
  }
  const patchFlight = (partial: Partial<WaiverFlightInfo>) => {
    onChange({ ...value, flight: { ...value.flight, ...partial } })
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-teal-600'

  return (
    <div className="space-y-4">
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
              value={value.emergency_contact_name}
              onChange={(e) => patchSafety({ emergency_contact_name: e.target.value })}
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
              value={value.emergency_contact_phone}
              onChange={(e) => patchSafety({ emergency_contact_phone: e.target.value })}
              required
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold text-ink">
              {allergiesBi.en}
              <span className="mt-px block font-thai font-medium text-ink-soft">{allergiesBi.th}</span>
            </span>
            <input
              value={value.allergies}
              onChange={(e) => patchSafety({ allergies: e.target.value })}
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
              value={value.medical_conditions}
              onChange={(e) => patchSafety({ medical_conditions: e.target.value })}
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
              value={value.other_notes}
              onChange={(e) => patchSafety({ other_notes: e.target.value })}
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
            ).map(([type, en, th]) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  patchSafety({
                    insurance_type: type as InsuranceType,
                    oshc_risk_acknowledged:
                      type === 'oshc' ? value.oshc_risk_acknowledged : false,
                  })
                }
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  value.insurance_type === type
                    ? 'bg-teal-700 text-white'
                    : 'border border-line bg-card text-ink-soft'
                }`}
              >
                {en}
                <span className="mt-0.5 block font-thai text-[9px] font-medium opacity-90">{th}</span>
              </button>
            ))}
          </div>

          {value.insurance_type === 'oshc' && (
            <div className="mt-2.5 space-y-2">
              <label className="block">
                <span className="text-[10px] font-semibold text-ink">
                  {oshcMemBi.en}
                  <span className="mt-px block font-thai font-medium text-ink-soft">
                    {oshcMemBi.th}
                  </span>
                </span>
                <input
                  value={value.oshc_membership_number}
                  onChange={(e) => patchSafety({ oshc_membership_number: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="flex items-start gap-2 rounded-xl border border-line bg-card px-3 py-2">
                <input
                  type="checkbox"
                  checked={value.oshc_risk_acknowledged}
                  onChange={(e) => patchSafety({ oshc_risk_acknowledged: e.target.checked })}
                  className="mt-1"
                />
                <span className="text-[11px] leading-snug text-ink">
                  {OSHC_RISK_EN}
                  <span className="mt-1 block font-thai text-[10px] text-ink-soft">{OSHC_RISK_TH}</span>
                </span>
              </label>
              {errors.oshc && (
                <p className="text-[10.5px] text-coral" role="alert">
                  {oshcRiskReq.en}
                  <span className="mt-0.5 block font-thai">{oshcRiskReq.th}</span>
                </p>
              )}
            </div>
          )}

          {value.insurance_type === 'travel_insurance' && (
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-semibold text-ink">
                  {travelProvBi.en}
                  <span className="mt-px block font-thai font-medium text-ink-soft">
                    {travelProvBi.th}
                  </span>
                </span>
                <input
                  value={value.travel_insurance_provider}
                  onChange={(e) =>
                    patchSafety({
                      travel_insurance_provider: e.target.value,
                      insurance_provider: e.target.value,
                    })
                  }
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
                  value={value.travel_insurance_policy_number}
                  onChange={(e) =>
                    patchSafety({
                      travel_insurance_policy_number: e.target.value,
                      insurance_policy_number: e.target.value,
                    })
                  }
                  className={inputClass}
                />
              </label>
            </div>
          )}
        </div>

        {errors.emergency && (
          <p className="mt-2 text-[10.5px] text-coral" role="alert">
            {emReq.en}
            <span className="mt-0.5 block font-thai">{emReq.th}</span>
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-card p-3.5">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={value.flight.requested}
            onChange={(e) => patchFlight({ requested: e.target.checked })}
            className="mt-1"
          />
          <span className="text-[12px] font-semibold text-ink">
            {flightToggle.en}
            <span className="mt-0.5 block font-thai text-[11px] font-medium text-ink-soft">
              {flightToggle.th}
            </span>
          </span>
        </label>

        {value.flight.requested && (
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
                  value={value.flight.flight_legal_first_name}
                  onChange={(e) => patchFlight({ flight_legal_first_name: e.target.value })}
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
                  value={value.flight.flight_legal_last_name}
                  onChange={(e) => patchFlight({ flight_legal_last_name: e.target.value })}
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
                  value={value.flight.flight_date_of_birth}
                  onChange={(e) => patchFlight({ flight_date_of_birth: e.target.value })}
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
                  value={value.flight.flight_passport_number}
                  onChange={(e) => patchFlight({ flight_passport_number: e.target.value })}
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
                  value={value.flight.flight_nationality}
                  onChange={(e) => patchFlight({ flight_nationality: e.target.value })}
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
                  value={value.flight.flight_frequent_flyer_number}
                  onChange={(e) => patchFlight({ flight_frequent_flyer_number: e.target.value })}
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
  )
}
