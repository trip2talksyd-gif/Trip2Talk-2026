import { useState } from 'react'
import { Check, MessageSquare, RotateCcw } from 'lucide-react'
import { resetWaiver } from '../../lib/toursApi'
import { StaffApiError, StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { useToast } from '../ui/Toast'
import { StaffButton, StaffTextarea } from './staffUi'
import StaffActionTile from './StaffActionTile'
import StaffTaskView, { TaskFieldLabel } from './StaffTaskView'

type Props = {
  bookingId: string
  subtitle?: string
  onSessionExpired?: () => void
  onReset?: () => void
  layout?: 'button' | 'tile'
}

export default function ResetWaiverButton({
  bookingId,
  subtitle,
  onSessionExpired,
  onReset,
  layout = 'button',
}: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState('')

  async function confirm() {
    setBusy(true)
    try {
      await resetWaiver(bookingId, reason.trim() || undefined)
      toast('Waiver reset — same link is editable again', 'success')
      setOpen(false)
      setReason('')
      onReset?.()
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired?.()
        return
      }
      const code = err instanceof StaffApiError ? err.code : ''
      toast(
        code === 'archive_table_missing'
          ? 'Reset needs the archive table — apply the SQL migration first'
          : code === 'waiver_not_submitted'
            ? 'No submitted waiver to reset'
            : 'Could not reset waiver',
        'error',
      )
    } finally {
      setBusy(false)
    }
  }

  const trigger =
    layout === 'tile' ? (
      <StaffActionTile
        icon={RotateCcw}
        label="Reset waiver"
        labelTh="รีเซ็ต"
        onClick={() => setOpen(true)}
      />
    ) : (
      <StaffButton
        type="button"
        variant="secondary"
        className="!w-auto gap-1.5 px-3 py-1.5 text-[11px]"
        onClick={() => setOpen(true)}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset waiver
      </StaffButton>
    )

  return (
    <>
      {trigger}
      {open ? (
        <StaffTaskView
          icon={RotateCcw}
          title="Reset waiver"
          titleTh="รีเซ็ตเอกสารยินยอม"
          subtitle={subtitle}
          onClose={() => !busy && setOpen(false)}
          closeDisabled={busy}
        >
          <p className="text-sm leading-relaxed text-cream-muted">
            The customer can resubmit on the <strong className="text-cream">same waiver link</strong>.
            The current submission is archived, not deleted.
          </p>
          <p className="mt-1 font-thai text-sm leading-relaxed text-cream-muted" lang="th">
            ลูกค้ากรอกใหม่ได้ที่ลิงก์เดิม การส่งครั้งนี้จะถูกเก็บเข้าคลัง ไม่ถูกลบ
          </p>
          <label className="mt-5 block">
            <TaskFieldLabel icon={MessageSquare}>เหตุผล (ไม่บังคับ) / Reason (optional)</TaskFieldLabel>
            <StaffTextarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. customer error, guest changed…"
              className="min-h-16 resize-none text-base"
            />
          </label>
          <StaffButton
            type="button"
            variant="danger"
            disabled={busy}
            onClick={() => void confirm()}
            className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 text-[17px] font-bold"
          >
            <Check className="h-5 w-5" />
            {busy ? 'Resetting…' : 'Confirm reset'}
          </StaffButton>
        </StaffTaskView>
      ) : null}
    </>
  )
}
