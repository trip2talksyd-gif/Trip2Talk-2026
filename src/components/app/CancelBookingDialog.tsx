import { useState } from 'react'
import type { TourBooking } from '../../types/tour'
import { StaffButton, StaffTextarea } from './staffUi'

type Props = {
  booking: TourBooking
  submitting: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

/** Staff confirmation sheet for soft-cancelling a booking. Reason is optional. */
export default function CancelBookingDialog({ booking, submitting, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('')

  return (
    <div
      className="staff-shell fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 text-cream sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-booking-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-near-black-green p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="cancel-booking-title" className="font-serif text-lg text-cream">
          Cancel booking?
        </h2>
        <p className="mt-1 text-sm text-cream-muted">
          {booking.first_name_en} {booking.last_name_en}
          {booking.trip_code ? ` · ${booking.trip_code}` : ''}
          {booking.booking_reference ? ` · ${booking.booking_reference}` : ''}
        </p>
        <p className="mt-2 text-xs text-cream-muted">
          ยกเลิกการจอง — ข้อมูลยังเก็บไว้ในระบบ (ไม่ลบแถว) · Soft-cancel only; row is kept for records.
        </p>

        <label className="mt-4 block">
          <span className="text-xs text-cream-muted">เหตุผล (ไม่บังคับ) / Reason (optional)</span>
          <StaffTextarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. customer request, duplicate booking…"
            className="resize-none"
          />
        </label>

        <div className="mt-4 flex gap-2">
          <StaffButton
            type="button"
            variant="danger"
            disabled={submitting}
            onClick={() => onConfirm(reason)}
            className="min-h-11 flex-1 bg-coral px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-coral/90"
          >
            {submitting ? 'Cancelling…' : 'Confirm cancel'}
          </StaffButton>
          <StaffButton type="button" variant="secondary" disabled={submitting} onClick={onClose}>
            Keep booking
          </StaffButton>
        </div>
      </div>
    </div>
  )
}
