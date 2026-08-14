import { useEffect, useState } from 'react'
import type { Tour } from '../../types/tour'
import { updateTourMaxSeats } from '../../lib/toursApi'
import { StaffApiError, StaffSessionExpiredError } from '../../lib/supabaseStaff'
import { StaffButton, StaffField, StaffInput, StaffTextarea } from './staffUi'

type Props = {
  tour: Tour
  onSaved: (tour: Tour) => void
  onSessionExpired: () => void
  onToast: (msg: string, tone?: 'success' | 'error') => void
}

export default function TripSeatsEditor({ tour, onSaved, onSessionExpired, onToast }: Props) {
  const [open, setOpen] = useState(false)
  const [maxSeats, setMaxSeats] = useState(String(tour.max_seats))
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMaxSeats(String(tour.max_seats))
  }, [tour.id, tour.max_seats])

  const next = Number(maxSeats)
  const reasonTrim = reason.trim()
  const nextIsInt = Number.isInteger(next)
  const belowBooked = nextIsInt && next < tour.booked_seats
  const canSave =
    nextIsInt && next >= 1 && next <= 99 && next !== tour.max_seats && reasonTrim.length >= 8 && !belowBooked

  async function save() {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const updated = await updateTourMaxSeats(tour.id, next, reasonTrim)
      onSaved(updated)
      setReason('')
      onToast(`อัปเดตที่นั่ง ${tour.max_seats} → ${updated.max_seats}`, 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired()
        return
      }
      if (err instanceof StaffApiError) {
        if (err.code === 'below_booked_seats') {
          onToast(
            `ลดที่นั่งต่ำกว่าจำนวนที่จองแล้วไม่ได้ (${tour.booked_seats})`,
            'error',
          )
          return
        }
        if (err.code === 'reason_required') {
          onToast('ต้องระบุเหตุผลอย่างน้อย 8 ตัวอักษร', 'error')
          return
        }
      }
      onToast(err instanceof Error ? err.message : 'บันทึกที่นั่งไม่สำเร็จ', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-2 border-t border-white/8 pt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-gold hover:underline"
      >
        {open ? '▲ ซ่อนที่นั่ง' : 'แก้ไขที่นั่ง (Edit seats)'}
      </button>

      {open && (
        <div className="mt-2 space-y-2.5">
          <p className="text-[11px] leading-relaxed text-cream-muted">
            ปัจจุบัน{' '}
            <span className="font-medium text-cream">
              {tour.booked_seats}/{tour.max_seats}
            </span>{' '}
            (จองแล้ว {tour.booked_seats} · สูงสุด {tour.max_seats}) — ลดต่ำกว่าจำนวนที่จองแล้วไม่ได้ ·
            ต้องใส่เหตุผลทุกครั้ง
          </p>

          <div className="grid grid-cols-2 gap-2">
            <StaffField label="จองแล้ว (read-only)">
              <StaffInput
                type="number"
                readOnly
                value={tour.booked_seats}
                className="mt-1 w-full cursor-not-allowed text-sm opacity-70"
              />
            </StaffField>
            <StaffField label="ที่นั่งสูงสุดใหม่">
              <StaffInput
                type="number"
                min={Math.max(1, tour.booked_seats)}
                max={99}
                step={1}
                value={maxSeats}
                onChange={(e) => setMaxSeats(e.target.value)}
                className="mt-1 w-full text-sm"
              />
            </StaffField>
          </div>

          {belowBooked && (
            <p className="text-[11px] text-coral">
              ลดที่นั่งต่ำกว่าจำนวนที่จองแล้วไม่ได้ ({tour.booked_seats})
            </p>
          )}

          <StaffField label="เหตุผล (บังคับ) / Reason (required)">
            <StaffTextarea
              rows={2}
              maxLength={400}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="เช่น เพิ่มที่นั่งพิเศษให้ลูกค้า X"
              className="mt-1 w-full text-sm"
              required
            />
            {reasonTrim.length > 0 && reasonTrim.length < 8 && (
              <p className="mt-1 text-[11px] text-coral">อย่างน้อย 8 ตัวอักษร</p>
            )}
          </StaffField>

          <StaffButton type="button" disabled={!canSave || saving} onClick={() => void save()}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกที่นั่ง'}
          </StaffButton>
        </div>
      )}
    </div>
  )
}
