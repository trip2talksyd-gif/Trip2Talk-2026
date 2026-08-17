import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { getWaiverRecord } from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { useToast } from '../ui/Toast'
import { StaffButton, StaffCard } from './staffUi'
import WaiverRecordActions from './WaiverRecordActions'
import StaffActionTile from './StaffActionTile'

type Props = {
  bookingId: string
  tripName?: string | null
  onSessionExpired?: () => void
  layout?: 'button' | 'tile'
}

export default function StaffWaiverRecordButton({
  bookingId,
  tripName,
  onSessionExpired,
  layout = 'button',
}: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [record, setRecord] = useState<Awaited<ReturnType<typeof getWaiverRecord>> | null>(null)

  async function openRecord() {
    setBusy(true)
    try {
      const data = await getWaiverRecord(bookingId)
      if (!data.waiver && !data.booking.waiver_signed) {
        toast('ยังไม่มี waiver สำหรับการจองนี้', 'error')
        return
      }
      setRecord(data)
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

  const w = record?.waiver
  const b = record?.booking
  const name =
    w?.signed_name ||
    (b ? `${b.first_name_en} ${b.last_name_en}`.trim() : '')

  return (
    <>
      {layout === 'tile' ? (
        <StaffActionTile
          icon={FileDown}
          label="Download"
          labelTh="ดาวน์โหลด"
          busy={busy}
          disabled={busy}
          onClick={() => void openRecord()}
        />
      ) : (
        <StaffButton
          type="button"
          variant="secondary"
          className="!w-auto gap-1.5 px-3 py-1.5 text-[11px]"
          disabled={busy}
          onClick={() => void openRecord()}
        >
          <FileDown className="h-3.5 w-3.5" />
          {busy ? '…' : 'Download waiver'}
        </StaffButton>
      )}
      {open && record && b ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <StaffCard className="max-h-[90vh] w-full max-w-md overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-cream">Waiver record</p>
              <StaffButton
                type="button"
                variant="ghost"
                className="!w-auto px-2 py-1 text-[11px]"
                onClick={() => setOpen(false)}
              >
                Close
              </StaffButton>
            </div>
            <WaiverRecordActions
              bookingReference={b.booking_reference}
              customerName={name}
              tripCode={b.trip_code}
              tripName={tripName}
              signedAt={w?.signed_at ?? b.waiver_signed_at ?? new Date().toISOString()}
              clauses={w?.clauses ?? []}
              filledByStaff={Boolean(w?.filled_by_staff)}
              staffName={w?.staff_fill_staff_name}
              authorizationNote={w?.staff_fill_authorization_note}
            />
          </StaffCard>
        </div>
      ) : null}
    </>
  )
}
