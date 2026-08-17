import { useState } from 'react'
import { Ban, Check, MessageSquare } from 'lucide-react'
import type { TourBooking } from '../../types/tour'
import { StaffButton, StaffTextarea } from './staffUi'
import StaffTaskView, { TaskFieldLabel } from './StaffTaskView'

type Props = {
  booking: TourBooking
  submitting: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

/** Staff confirmation sheet for soft-cancelling a booking. Reason is optional. */
export default function CancelBookingDialog({ booking, submitting, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('')
  const subtitle = [
    `${booking.first_name_en} ${booking.last_name_en}`.trim(),
    booking.trip_code,
    booking.booking_reference,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <StaffTaskView
      icon={Ban}
      title="Cancel booking"
      titleTh="ยกเลิกการจอง"
      subtitle={subtitle}
      onClose={onClose}
      closeDisabled={submitting}
    >
      <p className="text-sm leading-relaxed text-cream-muted">
        Soft-cancel only — the row is kept for records. ที่นั่งจะถูกคืน ข้อมูลยังอยู่ในระบบ
      </p>
      <label className="mt-5 block">
        <TaskFieldLabel icon={MessageSquare}>เหตุผล (ไม่บังคับ) / Reason (optional)</TaskFieldLabel>
        <StaffTextarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="e.g. customer request, duplicate booking…"
          className="min-h-16 resize-none text-base"
        />
      </label>
      <StaffButton
        type="button"
        variant="danger"
        disabled={submitting}
        onClick={() => onConfirm(reason)}
        className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 bg-coral text-[17px] font-bold text-white hover:bg-coral/90"
      >
        <Check className="h-5 w-5" />
        {submitting ? 'Cancelling…' : 'Confirm cancel'}
      </StaffButton>
      <StaffButton
        type="button"
        variant="secondary"
        disabled={submitting}
        onClick={onClose}
        className="mt-2 min-h-11 w-full"
      >
        Keep booking
      </StaffButton>
    </StaffTaskView>
  )
}
