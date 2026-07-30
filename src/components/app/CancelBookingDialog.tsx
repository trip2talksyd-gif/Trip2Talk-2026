import { useState } from 'react'
import type { TourBooking } from '../../types/tour'

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-booking-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-editorial border border-white/10 bg-near-black-green p-4 shadow-xl"
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
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. customer request, duplicate booking…"
            className="mt-1 w-full resize-none rounded-lg border border-white/15 bg-surface-card px-3 py-2 text-sm text-cream placeholder:text-cream-muted/50"
          />
        </label>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => onConfirm(reason)}
            className="flex-1 rounded-lg bg-coral px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
          >
            {submitting ? 'Cancelling…' : 'Confirm cancel'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-2.5 text-xs text-cream-muted"
          >
            Keep booking
          </button>
        </div>
      </div>
    </div>
  )
}
