import { useMemo, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import type { WaiverSignature } from '../../types/tour'
import { WAIVER_CLAUSES } from '../../data/risks'
import { useToast } from '../ui/Toast'
import { StaffButton } from './staffUi'

type Props = {
  bookingReference: string | null
  customerName: string
  tripCode: string
  tripName?: string | null
  signedAt: string
  clauses: WaiverSignature['clauses']
  filledByStaff?: boolean
  staffName?: string | null
  authorizationNote?: string | null
}

function clauseIdList(clauses: WaiverSignature['clauses']): string[] {
  if (Array.isArray(clauses)) return clauses.map(String)
  if (clauses && typeof clauses === 'object') return Object.keys(clauses)
  return []
}

function titlesFor(locale: 'en' | 'th', ids: string[]): string[] {
  const set = WAIVER_CLAUSES[locale]
  return ids.map((id) => set.find((c) => c.id === id)?.title ?? id)
}

async function canvasToPdfBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const jpeg = canvas.toDataURL('image/jpeg', 0.92)
  const { jsPDF } = await import('jspdf')
  const w = canvas.width
  const h = canvas.height
  const pdf = new jsPDF({ orientation: h >= w ? 'portrait' : 'landscape', unit: 'pt', format: 'a4' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const scale = Math.min(pageW / w, pageH / h)
  pdf.addImage(jpeg, 'JPEG', 0, 0, w * scale, h * scale)
  return pdf.output('blob')
}

/**
 * Legal waiver record card + PNG/PDF download (same html2canvas pattern as receipts).
 */
export default function WaiverRecordActions({
  bookingReference,
  customerName,
  tripCode,
  tripName,
  signedAt,
  clauses,
  filledByStaff,
  staffName,
  authorizationNote,
}: Props) {
  const { toast } = useToast()
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<'png' | 'pdf' | null>(null)
  const ids = useMemo(() => clauseIdList(clauses), [clauses])
  const titlesEn = useMemo(() => titlesFor('en', ids), [ids])
  const titlesTh = useMemo(() => titlesFor('th', ids), [ids])

  const whenLabel = useMemo(() => {
    try {
      return new Date(signedAt).toLocaleString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return signedAt
    }
  }, [signedAt])

  const fileBase = `waiver-${bookingReference || tripCode}-${customerName.replace(/\s+/g, '_')}`

  async function capture() {
    if (!cardRef.current) return null
    const { default: html2canvas } = await import('html2canvas')
    return html2canvas(cardRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    })
  }

  async function downloadPng() {
    setBusy('png')
    try {
      const canvas = await capture()
      if (!canvas) return
      const a = document.createElement('a')
      a.download = `${fileBase}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } catch {
      toast('ดาวน์โหลดไม่สำเร็จ', 'error')
    } finally {
      setBusy(null)
    }
  }

  async function downloadPdf() {
    setBusy('pdf')
    try {
      const canvas = await capture()
      if (!canvas) return
      const blob = await canvasToPdfBlob(canvas)
      const a = document.createElement('a')
      a.download = `${fileBase}.pdf`
      a.href = URL.createObjectURL(blob)
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    } catch {
      toast('สร้าง PDF ไม่สำเร็จ', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <StaffButton
          type="button"
          variant="secondary"
          className="!w-auto gap-1.5 px-3 text-[11px]"
          onClick={() => void downloadPng()}
          disabled={busy !== null}
        >
          <Download className="h-3.5 w-3.5" />
          {busy === 'png' ? 'Creating…' : 'Download PNG'}
        </StaffButton>
        <StaffButton
          type="button"
          variant="secondary"
          className="!w-auto gap-1.5 px-3 text-[11px]"
          onClick={() => void downloadPdf()}
          disabled={busy !== null}
        >
          <Download className="h-3.5 w-3.5" />
          {busy === 'pdf' ? 'Creating…' : 'Download PDF'}
        </StaffButton>
      </div>
      <div className="overflow-hidden rounded-xl bg-white text-black">
        <div ref={cardRef} className="p-5 text-[12px] leading-relaxed">
          <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800">
            Trip2Talk — Waiver record
          </p>
          <p className="mt-2 text-[15px] font-semibold">{customerName}</p>
          <p className="mt-1 text-[11px] text-black/70">
            Booking ref: {bookingReference || '—'}
          </p>
          <p className="text-[11px] text-black/70">
            Trip: {tripName ? `${tripName} (${tripCode})` : tripCode}
          </p>
          <p className="text-[11px] text-black/70">Submitted: {whenLabel}</p>
          {filledByStaff ? (
            <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] text-amber-950">
              Filled by staff on customer request
              {staffName ? `: ${staffName}` : ''}
              <span className="mt-0.5 block font-thai text-[10px]">กรอกโดยเจ้าหน้าที่ตามที่ลูกค้าขอ</span>
            </p>
          ) : (
            <p className="mt-2 rounded-md bg-teal-50 px-2 py-1.5 text-[11px] text-teal-950">
              Customer self-serve link
              <span className="mt-0.5 block font-thai text-[10px]">ลูกค้ากรอกเองผ่านลิงก์</span>
            </p>
          )}
          <p className="mt-3 text-[11px] font-semibold">Agreed clauses / ข้อตกลงที่ยอมรับ:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-black/80">
            {titlesEn.map((t, i) => (
              <li key={t}>
                {t}
                {titlesTh[i] ? ` / ${titlesTh[i]}` : ''}
              </li>
            ))}
          </ul>
          {authorizationNote ? (
            <p className="mt-3 text-[10px] text-black/60">Staff authorization note: {authorizationNote}</p>
          ) : null}
          <p className="mt-4 text-[10px] text-black/45">
            Chapter99 trading as Trip2Talk · Keep this record with the booking file.
          </p>
        </div>
      </div>
    </div>
  )
}
