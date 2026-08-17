import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { getWaiverRecord, updateWaiverDetails } from '../../lib/toursApi'
import { StaffApiError, StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { WAIVER_CLAUSES } from '../../data/risks'
import { useToast } from '../ui/Toast'
import { StaffButton, StaffCard, StaffCheckRow, StaffField, StaffInput, StaffTextarea } from './staffUi'
import StaffActionTile from './StaffActionTile'

type Props = {
  bookingId: string
  onSessionExpired?: () => void
  layout?: 'button' | 'tile'
}

function clauseTitles(clauses: unknown): string[] {
  const ids = Array.isArray(clauses)
    ? clauses.map(String)
    : clauses && typeof clauses === 'object'
      ? Object.keys(clauses as object)
      : []
  return ids.map((id) => WAIVER_CLAUSES.en.find((c) => c.id === id)?.title ?? id)
}

export default function EditWaiverButton({ bookingId, onSessionExpired, layout = 'button' }: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [signedName, setSignedName] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [allergies, setAllergies] = useState('')
  const [medical, setMedical] = useState('')
  const [notes, setNotes] = useState('')
  const [oshcMember, setOshcMember] = useState('')
  const [travelProvider, setTravelProvider] = useState('')
  const [travelPolicy, setTravelPolicy] = useState('')
  const [photoOptOut, setPhotoOptOut] = useState(false)
  const [photoNote, setPhotoNote] = useState('')
  const [signedAt, setSignedAt] = useState('')
  const [terms, setTerms] = useState<string[]>([])
  const [oshcRisk, setOshcRisk] = useState(false)
  const [insuranceType, setInsuranceType] = useState('')

  async function openEditor() {
    setBusy(true)
    try {
      const data = await getWaiverRecord(bookingId)
      const b = data.booking
      const w = data.waiver
      if (!w && !b.waiver_signed) {
        toast('ยังไม่มี waiver สำหรับการจองนี้', 'error')
        return
      }
      setSignedName(w?.signed_name ?? '')
      setEmergencyName(b.emergency_contact_name ?? '')
      setEmergencyPhone(b.emergency_contact_phone ?? '')
      setAllergies(b.allergies ?? '')
      setMedical(b.medical_conditions ?? '')
      setNotes(b.other_notes ?? '')
      setOshcMember(b.oshc_membership_number ?? '')
      setTravelProvider(b.travel_insurance_provider ?? '')
      setTravelPolicy(b.travel_insurance_policy_number ?? '')
      setPhotoOptOut(Boolean(b.marketing_photo_opt_out))
      setPhotoNote(b.marketing_photo_opt_out_note ?? '')
      setSignedAt(w?.signed_at ?? b.waiver_signed_at ?? '')
      setTerms(clauseTitles(w?.clauses))
      setOshcRisk(Boolean(b.oshc_risk_acknowledged))
      setInsuranceType(b.insurance_type ?? '')
      setOpen(true)
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired?.()
        return
      }
      toast('โหลด waiver ไม่สำเร็จ', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    setSaving(true)
    try {
      await updateWaiverDetails(bookingId, {
        signed_name: signedName.trim() || undefined,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        allergies,
        medical_conditions: medical,
        other_notes: notes,
        oshc_membership_number: oshcMember,
        travel_insurance_provider: travelProvider,
        travel_insurance_policy_number: travelPolicy,
        marketing_photo_opt_out: photoOptOut,
        marketing_photo_opt_out_note: photoNote,
      })
      toast('Waiver details updated', 'success')
      setOpen(false)
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired?.()
        return
      }
      const code = err instanceof StaffApiError ? err.code : ''
      toast(
        code === 'edit_audit_table_missing'
          ? 'Edit needs the audit table — apply the SQL migration first'
          : code === 'no_changes'
            ? 'No changes to save'
            : code === 'consent_fields_locked'
              ? 'Consent fields cannot be edited — use Reset Waiver'
              : 'Could not update waiver',
        'error',
      )
    } finally {
      setSaving(false)
    }
  }

  const when = signedAt
    ? new Date(signedAt).toLocaleString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <>
      {layout === 'tile' ? (
        <StaffActionTile
          icon={Pencil}
          label="Edit waiver"
          labelTh="แก้ไข"
          busy={busy}
          onClick={() => void openEditor()}
        />
      ) : (
        <StaffButton
          type="button"
          variant="secondary"
          className="!w-auto gap-1.5 px-3 py-1.5 text-[11px]"
          disabled={busy}
          onClick={() => void openEditor()}
        >
          <Pencil className="h-3.5 w-3.5" />
          {busy ? '…' : 'Edit waiver'}
        </StaffButton>
      )}
      {open ? (
        <div
          className="staff-shell fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 text-cream sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-waiver-title"
        >
          <StaffCard className="max-h-[90vh] w-full max-w-md overflow-y-auto p-4">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h2 id="edit-waiver-title" className="font-serif text-lg text-cream">
                  Edit waiver
                </h2>
                <p className="font-thai text-xs text-cream-muted" lang="th">
                  แก้ไขรายละเอียด (ไม่ใช่ข้อตกลงทางกฎหมาย)
                </p>
              </div>
              <StaffButton
                type="button"
                variant="ghost"
                className="!w-auto px-2 py-1 text-[11px]"
                onClick={() => setOpen(false)}
              >
                Close
              </StaffButton>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-cream-muted">
              Fixes typos and contact info only. Agreed terms stay locked — use Reset Waiver if the
              customer must re-sign.
            </p>

            <div className="mb-4 rounded-xl border border-white/10 bg-near-black-green p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-cream-muted">
                Locked / ล็อกไว้
              </p>
              <p className="mt-1 text-xs text-cream-muted">Submitted {when}</p>
              <p className="mt-1 text-xs text-cream-muted">
                Insurance type: {insuranceType || '—'} · OSHC risk ack: {oshcRisk ? 'yes' : 'no'}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-cream-muted">
                Agreed terms
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] text-cream">
                {terms.length > 0 ? terms.map((t) => <li key={t}>{t}</li>) : <li>—</li>}
              </ul>
            </div>

            <div className="space-y-3">
              <StaffField label="Signature name / ชื่อที่ลงนาม">
                <StaffInput value={signedName} onChange={(e) => setSignedName(e.target.value)} />
              </StaffField>
              <StaffField label="Emergency contact name / ผู้ติดต่อฉุกเฉิน">
                <StaffInput value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
              </StaffField>
              <StaffField label="Emergency phone / เบอร์ฉุกเฉิน">
                <StaffInput value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
              </StaffField>
              <StaffField label="Allergies / แพ้">
                <StaffInput value={allergies} onChange={(e) => setAllergies(e.target.value)} />
              </StaffField>
              <StaffField label="Medical / สุขภาพ">
                <StaffInput value={medical} onChange={(e) => setMedical(e.target.value)} />
              </StaffField>
              <StaffField label="Other notes / หมายเหตุ">
                <StaffTextarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="resize-none" />
              </StaffField>
              <StaffField label="OSHC membership no. / เลขสมาชิก OSHC">
                <StaffInput value={oshcMember} onChange={(e) => setOshcMember(e.target.value)} />
              </StaffField>
              <StaffField label="Travel insurer / บริษัทประกันเดินทาง">
                <StaffInput value={travelProvider} onChange={(e) => setTravelProvider(e.target.value)} />
              </StaffField>
              <StaffField label="Travel policy no. / เลขกรมธรรม์">
                <StaffInput value={travelPolicy} onChange={(e) => setTravelPolicy(e.target.value)} />
              </StaffField>
              <StaffCheckRow checked={photoOptOut} onChange={setPhotoOptOut} tone={photoOptOut ? 'warning' : 'default'}>
                Marketing photo opt-out
                <span className="mt-0.5 block font-thai text-[11px] text-cream-muted" lang="th">
                  ปฏิเสธการใช้รูปเพื่อการตลาด (ไม่ใช่ข้อตกลง photo ใน waiver)
                </span>
              </StaffCheckRow>
              {photoOptOut ? (
                <StaffField label="Opt-out note">
                  <StaffInput value={photoNote} onChange={(e) => setPhotoNote(e.target.value)} />
                </StaffField>
              ) : null}
            </div>

            <div className="mt-4 flex gap-2">
              <StaffButton
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="min-h-11 flex-1 text-xs font-bold uppercase tracking-wider"
              >
                {saving ? 'Saving…' : 'Save'}
              </StaffButton>
              <StaffButton type="button" variant="secondary" disabled={saving} onClick={() => setOpen(false)}>
                Cancel
              </StaffButton>
            </div>
          </StaffCard>
        </div>
      ) : null}
    </>
  )
}
