import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, FilePlus2, Link2 } from 'lucide-react'
import {
  cancelExtensionQuote,
  createExtensionQuote,
  formatAud,
  formatDate,
  listExtensionQuotes,
  markExtensionQuotePaid,
} from '../../lib/toursApi'
import { StaffSessionExpiredError } from '../../lib/supabaseStaff'
import type { ExtensionQuoteStatus, TripExtensionQuote } from '../../types/tour'
import { useToast } from '../ui/Toast'
import { StaffButton, StaffField, StaffInput, StaffTextarea } from './staffUi'

function addCalendarDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + days))
  return dt.toISOString().slice(0, 10)
}

function statusClass(status: ExtensionQuoteStatus): string {
  if (status === 'paid') return 'bg-teal-500/20 text-teal-300'
  if (status === 'pending') return 'bg-amber/20 text-amber'
  if (status === 'expired') return 'bg-coral/20 text-coral'
  return 'bg-white/10 text-cream-muted'
}

function statusLabel(status: ExtensionQuoteStatus): string {
  if (status === 'paid') return 'Paid / ชำระแล้ว'
  if (status === 'pending') return 'Pending / รอชำระ'
  if (status === 'expired') return 'Expired / เลยกำหนด'
  return 'Cancelled / ยกเลิก'
}

type Props = {
  bookingId: string
  travelDate?: string | null
  tourDepartureDate?: string | null
  extraDaysPaid?: number | null
  durationDays?: number | null
  canIssue?: boolean
  canMarkPaid?: boolean
  onSessionExpired?: () => void
  onChanged?: () => void
}

export default function BookingExtensionQuotes({
  bookingId,
  travelDate,
  tourDepartureDate,
  extraDaysPaid = 0,
  durationDays,
  canIssue = false,
  canMarkPaid = false,
  onSessionExpired,
  onChanged,
}: Props) {
  const { toast } = useToast()
  const [quotes, setQuotes] = useState<TripExtensionQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const departure = (travelDate || tourDepartureDate || '').slice(0, 10)
  const defaultDeadline = useMemo(
    () => (departure ? addCalendarDays(departure, -10) : ''),
    [departure],
  )

  const [extraDays, setExtraDays] = useState('1')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [deadline, setDeadline] = useState(defaultDeadline)

  useEffect(() => {
    setDeadline(defaultDeadline)
  }, [defaultDeadline])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await listExtensionQuotes({ bookingId })
      setQuotes(rows)
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired?.()
        return
      }
      toast('โหลดใบเสนอราคาไม่สำเร็จ', 'error')
    } finally {
      setLoading(false)
    }
  }, [bookingId, onSessionExpired, toast])

  useEffect(() => {
    void load()
  }, [load])

  const latest = quotes[0] ?? null
  const paidExtra = Number(extraDaysPaid ?? 0)

  async function copyPath(quote: TripExtensionQuote) {
    const path = quote.path || (quote.quote_token ? `/quote/${quote.quote_token}` : '')
    if (!path) {
      toast('ยังไม่มีลิงก์', 'error')
      return
    }
    await navigator.clipboard.writeText(`${window.location.origin}${path}`)
    setCopiedId(quote.id)
    toast('คัดลอกลิงก์ใบเสนอราคาแล้ว — วางใน Messenger ได้', 'success')
    window.setTimeout(() => setCopiedId(null), 2000)
  }

  async function submitQuote() {
    const days = Math.floor(Number(extraDays))
    const aud = Number(price)
    const trimmed = note.trim()
    if (!Number.isFinite(days) || days < 1 || !Number.isFinite(aud) || aud <= 0 || !trimmed) {
      toast('กรอกวันเพิ่ม ยอดเงิน และรายละเอียดให้ครบ', 'error')
      return
    }
    setBusyId('create')
    try {
      const created = await createExtensionQuote({
        bookingId,
        extraDays: days,
        priceDifferenceAud: aud,
        quoteNote: trimmed,
        paymentDeadline: deadline.trim() || null,
      })
      setQuotes((prev) => [created, ...prev.filter((q) => q.status !== 'pending')])
      setOpenForm(false)
      setExtraDays('1')
      setPrice('')
      setNote('')
      await copyPath(created)
      onChanged?.()
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired?.()
        return
      }
      const msg = err instanceof Error ? err.message : ''
      toast(
        msg.includes('need_departure_date')
          ? 'ตั้งวันเดินทางก่อน แล้วค่อยออกใบเสนอราคา'
          : 'ออกใบเสนอราคาไม่สำเร็จ',
        'error',
      )
    } finally {
      setBusyId(null)
    }
  }

  async function cancelQuote(id: string) {
    setBusyId(id)
    try {
      await cancelExtensionQuote(id)
      await load()
      toast('ยกเลิกใบเสนอราคาแล้ว', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired?.()
        return
      }
      toast('ยกเลิกไม่สำเร็จ', 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function markPaid(id: string) {
    setBusyId(id)
    try {
      await markExtensionQuotePaid(id, 'payid')
      await load()
      onChanged?.()
      toast('บันทึกว่าชำระแล้ว — ทริปขยายตามใบเสนอราคา', 'success')
    } catch (err) {
      if (err instanceof StaffSessionExpiredError) {
        onSessionExpired?.()
        return
      }
      const msg = err instanceof Error ? err.message : ''
      toast(
        msg.includes('quote_expired')
          ? 'เลยกำหนดแล้ว — ไม่สามารถรับชำระส่วนขยายได้'
          : 'บันทึกชำระไม่สำเร็จ',
        'error',
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {paidExtra > 0 ? (
          <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-300">
            +{paidExtra} extra day{paidExtra === 1 ? '' : 's'} paid
            {durationDays != null ? ` · ${durationDays + paidExtra}D` : ''}
          </span>
        ) : durationDays != null ? (
          <span className="text-[10px] text-cream-muted">{durationDays}D booked</span>
        ) : null}
        {latest ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusClass(latest.status)}`}
          >
            Ext: {statusLabel(latest.status)}
          </span>
        ) : (
          <span className="text-[10px] text-cream-muted">No extra-day quote</span>
        )}
        {canIssue ? (
          <StaffButton
            type="button"
            variant="secondary"
            className="!w-auto gap-1.5 px-3 py-1.5 text-[11px]"
            onClick={() => setOpenForm(true)}
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            ออกใบเสนอราคาวันเพิ่ม
          </StaffButton>
        ) : null}
      </div>

      {loading && quotes.length === 0 ? (
        <p className="text-[10px] text-cream-muted">Loading quotes…</p>
      ) : null}

      {quotes.length > 0 ? (
        <ul className="space-y-1.5">
          {quotes.map((q) => (
            <li
              key={q.id}
              className="rounded-lg bg-near-black-green/50 px-2.5 py-2 text-[11px] text-cream"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <p className="font-semibold">
                  +{q.extra_days} day{q.extra_days === 1 ? '' : 's'} · {formatAud(Number(q.price_difference_aud))}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusClass(q.status)}`}>
                  {q.status}
                </span>
              </div>
              <p className="mt-0.5 text-cream-muted">
                Deadline {formatDate(q.payment_deadline)}
                {q.paid_at ? ` · paid ${formatDate(q.paid_at)}` : ''}
              </p>
              {q.quote_note ? (
                <p className="mt-0.5 line-clamp-2 text-cream-muted">{q.quote_note}</p>
              ) : null}
              {q.status === 'pending' ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <StaffButton
                    type="button"
                    variant="secondary"
                    className="!w-auto gap-1 px-2.5 py-1 text-[10px]"
                    onClick={() => void copyPath(q)}
                  >
                    {copiedId === q.id ? <Copy className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                    {copiedId === q.id ? 'Copied' : 'Copy quote link'}
                  </StaffButton>
                  {canMarkPaid ? (
                    <StaffButton
                      type="button"
                      className="!w-auto px-2.5 py-1 text-[10px] uppercase"
                      disabled={busyId === q.id}
                      onClick={() => void markPaid(q.id)}
                    >
                      {busyId === q.id ? '…' : 'Mark paid (PayID)'}
                    </StaffButton>
                  ) : null}
                  {canIssue ? (
                    <StaffButton
                      type="button"
                      variant="danger"
                      className="!w-auto px-2.5 py-1 text-[10px]"
                      disabled={busyId === q.id}
                      onClick={() => void cancelQuote(q.id)}
                    >
                      Cancel quote
                    </StaffButton>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {openForm && canIssue ? (
        <div
          className="staff-shell fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 text-cream sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ext-quote-title"
          onClick={() => setOpenForm(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-near-black-green p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="ext-quote-title" className="font-serif text-lg text-cream">
              ออกใบเสนอราคาวันเพิ่ม
            </h2>
            <p className="mt-1 text-xs text-cream-muted">
              Written quotation for extra days. Customer must pay in full at least 10 days before
              departure — unpaid quotes expire automatically (no on-site negotiation).
            </p>
            <div className="mt-3 space-y-2">
              <StaffField label="Extra days / จำนวนวันเพิ่ม">
                <StaffInput
                  type="number"
                  min={1}
                  step={1}
                  value={extraDays}
                  onChange={(e) => setExtraDays(e.target.value)}
                />
              </StaffField>
              <StaffField label="Price difference AUD / ส่วนต่างราคา">
                <StaffInput
                  type="number"
                  min={1}
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </StaffField>
              <StaffField label="What extra days include / รายละเอียด">
                <StaffTextarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={2000}
                  placeholder="e.g. extra night in Hobart + dawn shoot at Wineglass Bay"
                  className="resize-none"
                />
              </StaffField>
              <StaffField label="Payment deadline (auto = departure − 10 days)">
                <StaffInput
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </StaffField>
              {departure ? (
                <p className="text-[10px] text-cream-muted">
                  Departure {formatDate(departure)} → default deadline {formatDate(defaultDeadline)}
                </p>
              ) : (
                <p className="text-[10px] text-amber">
                  No departure date on this booking — set a deadline manually or save travel date
                  first.
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <StaffButton
                type="button"
                disabled={busyId === 'create'}
                onClick={() => void submitQuote()}
                className="flex-1"
              >
                {busyId === 'create' ? 'กำลังบันทึก…' : 'สร้างและคัดลอกลิงก์'}
              </StaffButton>
              <StaffButton type="button" variant="secondary" onClick={() => setOpenForm(false)}>
                ปิด
              </StaffButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
