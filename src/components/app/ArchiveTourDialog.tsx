import type { Tour } from '../../types/tour'
import { StaffButton } from './staffUi'

type Mode = 'archive' | 'unarchive' | 'delete'

type Props = {
  tour: Tour
  mode: Mode
  submitting: boolean
  onConfirm: () => void
  onClose: () => void
}

const COPY: Record<
  Mode,
  { title: string; body: string; confirm: string; confirmBusy: string; danger: boolean }
> = {
  archive: {
    title: 'Archive this trip?',
    body: 'ซ่อนจาก Upcoming และหน้าเว็บ — ข้อมูลจอง/การเงินยังอยู่ครบ กู้คืนได้จากแท็บ Archived',
    confirm: 'Archive trip',
    confirmBusy: 'Archiving…',
    danger: false,
  },
  unarchive: {
    title: 'Restore this trip?',
    body: 'เปิดทริปกลับเข้า Upcoming (status → confirmed) — จะเห็นในลิสต์ staff และหน้าเว็บอีกครั้งถ้าเป็นทริปที่เปิดจองได้',
    confirm: 'Restore trip',
    confirmBusy: 'Restoring…',
    danger: false,
  },
  delete: {
    title: 'Delete permanently?',
    body: 'ลบถาวรได้เฉพาะทริปที่ยังไม่เคยมีคนจอง (0 bookings) — ใช้กับทริปทดสอบ/ซ้ำเท่านั้น ไม่สามารถกู้คืนได้',
    confirm: 'Delete forever',
    confirmBusy: 'Deleting…',
    danger: true,
  },
}

/** OWNER confirmation sheet for archive / unarchive / hard-delete of a tour. */
export default function ArchiveTourDialog({ tour, mode, submitting, onConfirm, onClose }: Props) {
  const copy = COPY[mode]

  return (
    <div
      className="staff-shell fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 text-cream sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-tour-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#2a4249] via-surface-card to-near-black-green p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.75)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="archive-tour-title" className="font-serif text-lg text-cream">
          {copy.title}
        </h2>
        <p className="mt-1 text-sm text-cream">
          {tour.name_en}
          <span className="text-cream-muted">
            {' '}
            · {tour.trip_code}
            {tour.departure_date ? ` · ${tour.departure_date}` : ''}
          </span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-cream-muted">{copy.body}</p>

        <div className="mt-4 flex gap-2">
          <StaffButton
            type="button"
            variant={copy.danger ? 'danger' : 'primary'}
            disabled={submitting}
            onClick={onConfirm}
            className={
              copy.danger
                ? 'min-h-11 flex-1 bg-coral px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-coral/90'
                : 'min-h-11 flex-1 text-xs font-bold uppercase tracking-wider'
            }
          >
            {submitting ? copy.confirmBusy : copy.confirm}
          </StaffButton>
          <StaffButton type="button" variant="secondary" disabled={submitting} onClick={onClose}>
            Cancel
          </StaffButton>
        </div>
      </div>
    </div>
  )
}
