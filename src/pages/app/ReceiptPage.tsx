import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

// Seller details for the ATO-compliant tax invoice — issued under the
// Chapter99 ABN (Saard Saenmuang, sole trader), with Trip2Talk as the
// trading/service name. Update here if the ABN/address ever changes.
const SELLER = {
  legalName: 'Chapter99',
  tradingAs: 'trading as Trip2Talk — Saard Saenmuang',
  abn: '81 951 461 769',
  address: '11a Edinburgh Rd, Forestville, Sydney NSW 2087, Australia',
  phone: '+61 452 044 382',
  email: 'chapter99info@gmail.com',
  logoSrc:
    'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/Photos/Logo/Trip2talk%20(1).png',
}

const GST_RATE = 0.1

function formatAudCents(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
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
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
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
        <div className="flex items-start justify-between gap-4">
          <img
            src={SELLER.logoSrc}
            alt="Chapter99"
            crossOrigin="anonymous"
            className="h-16 w-16 shrink-0 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="text-right">
            <h1 className="text-lg font-bold tracking-wide text-black">TAX INVOICE</h1>
            <p className="text-xs text-black/60">Invoice: {data.bookingReference ?? '—'}</p>
            <p className="text-xs text-black/60">{issuedAt.toLocaleDateString('en-AU')}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-dashed border-black/20 pt-4 text-sm">
          <p className="font-bold text-black">{SELLER.legalName}</p>
          <p className="text-xs text-black/70">{SELLER.tradingAs}</p>
          <p className="mt-1 text-xs text-black/70">ABN: {SELLER.abn}</p>
          <p className="text-xs text-black/70">{SELLER.address}</p>
          <p className="text-xs text-black/70">
            {SELLER.phone} · {SELLER.email}
          </p>
        </div>

        <div className="mt-4 border-t border-dashed border-black/20 pt-4 text-sm">
          <p className="text-xs text-black/60">Bill to</p>
          <p className="font-medium text-black">{data.customerName}</p>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-dashed border-black/20 pt-4 text-sm">
          <Row label="Description" value={`${data.tripName} (${data.tripCode})`} />
          {data.departureDate && <Row label="วันเดินทาง" value={data.departureDate} />}
          <Row label="สถานะ" value={STATUS_LABEL[data.bookingStatus] ?? data.bookingStatus} />
          <Row
            label="ช่องทางชำระเงิน"
            value={data.paymentMethod ? PAYMENT_METHOD_LABEL[data.paymentMethod] ?? data.paymentMethod : '—'}
          />
          {data.source && <Row label="ช่องทางติดต่อ" value={data.source} />}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-dashed border-black/20 pt-4 text-sm">
          <Row label="Subtotal (ex. GST)" value={formatAudCents(data.amountPaid / (1 + GST_RATE))} />
          <Row label="GST (10%)" value={formatAudCents(data.amountPaid - data.amountPaid / (1 + GST_RATE))} />
          <div className="flex items-center justify-between pt-2 text-base font-bold">
            <span>Total (inc. GST)</span>
            <span>{formatAudCents(data.amountPaid)}</span>
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
