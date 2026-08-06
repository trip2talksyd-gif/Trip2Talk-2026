import { useMemo, useRef, useState } from 'react'
import { Check, Copy, Download, Mail, MessageCircle } from 'lucide-react'
import type { WaiverSignature } from '../../types/tour'
import { WAIVER_CLAUSES } from '../../data/risks'
import { buildWaiverStaffConfirmation } from '../../lib/notifyService'
import { useToast } from '../ui/Toast'
import { StaffButton } from './staffUi'

type Props = {
  waiver: WaiverSignature
  tripName?: string | null
  customerEmail?: string | null
}

function clauseIds(clauses: WaiverSignature['clauses']): string[] {
  if (Array.isArray(clauses)) return clauses.map(String)
  if (clauses && typeof clauses === 'object') return Object.keys(clauses)
  return []
}

function titlesFor(locale: 'en' | 'th', ids: string[]): string[] {
  const set = WAIVER_CLAUSES[locale]
  return ids.map((id) => set.find((c) => c.id === id)?.title ?? id)
}

/**
 * Free-tier proof for staff-filled waivers: copy bilingual text → paste in Messenger,
 * optional Gmail compose, optional PNG card to attach (same pattern as Receipt).
 */
export default function StaffWaiverConfirmActions({
  waiver,
  tripName,
  customerEmail,
}: Props) {
  const { toast } = useToast()
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const draft = useMemo(() => {
    const ids = clauseIds(waiver.clauses)
    return buildWaiverStaffConfirmation({
      customerName: waiver.signed_name,
      tripCode: waiver.trip_code,
      tripName,
      signedAt: waiver.staff_fill_authorized_at ?? waiver.signed_at,
      filledByStaffName: waiver.staff_fill_staff_name,
      clauseTitlesEn: titlesFor('en', ids),
      clauseTitlesTh: titlesFor('th', ids),
      authorizationNote: waiver.staff_fill_authorization_note,
      customerEmail,
    })
  }, [waiver, tripName, customerEmail])

  const whenLabel = useMemo(() => {
    try {
      return new Date(waiver.staff_fill_authorized_at ?? waiver.signed_at).toLocaleString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return waiver.signed_at
    }
  }, [waiver])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draft.clipboardText)
      setCopied(true)
      toast('คัดลอกข้อความยืนยันแล้ว — วางใน Messenger ได้เลย', 'success')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('คัดลอกไม่สำเร็จ', 'error')
    }
  }

  async function handleDownloadPng() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `waiver-confirm-${waiver.trip_code}-${waiver.signed_name.replace(/\s+/g, '_')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast('ดาวน์โหลดรูปยืนยันแล้ว — แนบใน Messenger ได้', 'success')
    } catch {
      toast('สร้างรูปไม่สำเร็จ', 'error')
    } finally {
      setDownloading(false)
    }
  }

  const clauseLinesEn = titlesFor('en', clauseIds(waiver.clauses))
  const staff = waiver.staff_fill_staff_name?.trim() || 'Trip2Talk staff'

  return (
    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-cream-muted">
        Send confirmation / ส่งหลักฐานให้ลูกค้า
      </p>
      <p className="text-[11px] leading-relaxed text-cream-muted">
        Free channel — copy text, open Messenger, paste. Optional PNG to attach.
        <span className="mt-0.5 block font-thai">
          ช่องทางฟรี — คัดลอกข้อความ เปิด Messenger แล้ววาง (หรือดาวน์โหลดรูปแนบ)
        </span>
      </p>

      <div className="flex flex-wrap gap-2">
        <StaffButton
          type="button"
          variant="secondary"
          className="!w-auto gap-1.5 px-3 text-[11px]"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy for Messenger'}
        </StaffButton>
        <a
          href={draft.messengerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-gradient-to-b from-white/[0.08] to-surface-card/70 px-3 py-2 text-[11px] font-medium text-cream"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Open Messenger
        </a>
        <a
          href={draft.gmailUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-white/15 bg-gradient-to-b from-white/[0.08] to-surface-card/70 px-3 py-2 text-[11px] font-medium text-cream"
        >
          <Mail className="h-3.5 w-3.5" />
          Open Gmail
        </a>
        <StaffButton
          type="button"
          variant="secondary"
          className="!w-auto gap-1.5 px-3 text-[11px]"
          onClick={handleDownloadPng}
          disabled={downloading}
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? 'Creating…' : 'Download PNG'}
        </StaffButton>
      </div>

      {/* Off-screen-ish card for PNG capture — kept in layout but compact */}
      <div className="overflow-hidden rounded-xl bg-white text-black">
        <div ref={cardRef} className="p-4 text-[12px] leading-relaxed">
          <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800">
            Trip2Talk — Waiver confirmation
          </p>
          <p className="mt-2 font-semibold">{waiver.signed_name}</p>
          <p className="mt-1 text-[11px] text-black/70">
            Trip: {tripName ? `${tripName} (${waiver.trip_code})` : waiver.trip_code}
          </p>
          <p className="text-[11px] text-black/70">Completed: {whenLabel}</p>
          <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] text-amber-950">
            Filled by staff on customer request: {staff}
            <span className="mt-0.5 block font-thai text-[10px]">
              กรอกโดยเจ้าหน้าที่ตามที่ลูกค้าขอ
            </span>
          </p>
          <p className="mt-2 text-[11px] font-semibold">Agreed terms / ข้อตกลง:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-black/80">
            {clauseLinesEn.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {waiver.staff_fill_authorization_note && (
            <p className="mt-2 text-[10px] text-black/60">
              Staff note: {waiver.staff_fill_authorization_note}
            </p>
          )}
          <p className="mt-3 text-[10px] text-black/50">
            Keep this as proof. Reply on Messenger if anything is incorrect.
          </p>
        </div>
      </div>
    </div>
  )
}
