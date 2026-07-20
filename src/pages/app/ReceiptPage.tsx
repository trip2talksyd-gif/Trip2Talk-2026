import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { formatAud } from '../../lib/toursApi'
import { useToast } from '../../components/ui/Toast'

/** Data handed off via router state right after a payment is recorded —
 * no extra staff-api round trip, since the caller already has everything. */
export type ReceiptData = {
  bookingReference: string | null
  customerName: string
  tripName: string
  tripCode: string
  departureDate: string | null
  amountPaid: number
  paymentMethod: string | null
  bookingStatus: string
  source?: string | null
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'เงินสด',
  payid: 'PayID',
  bank_transfer: 'โอนธนาคาร',
  manual: 'อื่นๆ',
}

const STATUS_LABEL: Record<string, string> = {
  deposit_paid: 'มัดจำแล้ว',
  fully_paid: 'ชำระเต็มจำนวน',
}

export default function ReceiptPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const data = location.state as ReceiptData | null
  const staffName = sessionStorage.getItem('staff_name') ?? 'Staff'
  const issuedAt = new Date()
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadImage() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#ffffff', scale: 2 })
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `receipt-${data?.bookingReference ?? Date.now()}.png`
      a.click()
    } catch {
      toast('ดาวน์โหลดไม่สำเร็จ', 'error')
    } finally {
      setDownloading(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-svh bg-near-black-green px-4 py-6 text-cream">
        <p className="text-sm text-cream-muted">ไม่พบข้อมูลใบเสร็จ</p>
        <Link to="/app/cashier" className="mt-3 inline-block text-sm text-gold">
          ← กลับไป Cashier POS
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-near-black-green px-4 py-6 text-cream print:bg-white print:text-black">
      <div className="mx-auto max-w-md space-y-3 print:hidden">
        <button type="button" onClick={() => navigate(-1)} className="text-sm text-gold">
          ← ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={downloading}
          className="block w-full rounded-editorial bg-gold px-4 py-3 text-center text-sm font-bold text-near-black-green disabled:opacity-60"
        >
          {downloading ? 'กำลังสร้างรูป...' : '📥 ดาวน์โหลดรูปใบเสร็จ (ส่ง FB ได้เลย)'}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="block w-full rounded-editorial border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm font-medium text-gold"
        >
          🖨️ พิมพ์ใบเสร็จ
        </button>
      </div>

      <div ref={cardRef} className="mx-auto mt-6 max-w-md rounded-editorial bg-white p-6 text-black print:mt-0 print:max-w-none print:rounded-none">
        <div className="text-center">
          <h1 className="font-serif text-xl text-black">Trip2Talk</h1>
          <p className="text-xs text-black/60">ใบเสร็จรับเงิน / Receipt</p>
        </div>

        <div className="mt-5 space-y-2 border-t border-dashed border-black/20 pt-4 text-sm">
          <Row label="เลขที่อ้างอิง" value={data.bookingReference ?? '—'} />
          <Row label="วันที่ออกใบเสร็จ" value={issuedAt.toLocaleString('en-AU')} />
          <Row label="ลูกค้า" value={data.customerName} />
          <Row label="ทริป" value={`${data.tripName} (${data.tripCode})`} />
          {data.departureDate && <Row label="วันเดินทาง" value={data.departureDate} />}
          {data.source && <Row label="ช่องทางติดต่อ" value={data.source} />}
        </div>

        <div className="mt-4 space-y-2 border-t border-dashed border-black/20 pt-4 text-sm">
          <Row label="สถานะ" value={STATUS_LABEL[data.bookingStatus] ?? data.bookingStatus} />
          <Row
            label="ช่องทางชำระเงิน"
            value={data.paymentMethod ? PAYMENT_METHOD_LABEL[data.paymentMethod] ?? data.paymentMethod : '—'}
          />
          <div className="flex items-center justify-between pt-2 text-base font-bold">
            <span>ยอดที่รับ</span>
            <span>{formatAud(data.amountPaid)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-dashed border-black/20 pt-4 text-center text-xs text-black/60">
          <p>ออกใบเสร็จโดย {staffName}</p>
          <p className="mt-1">ขอบคุณที่ใช้บริการ Trip2Talk 🙏</p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-black/60">{label}</span>
      <span className="text-right text-black">{value}</span>
    </div>
  )
}
