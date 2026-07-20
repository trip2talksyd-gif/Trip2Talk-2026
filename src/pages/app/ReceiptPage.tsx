import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'

/** Data handed off via router state right after a payment is recorded —
 * no extra staff-api round trip, since the caller already has everything. */
export type ReceiptData = {
  bookingReference: string | null
  customerName: string
  /** Customer's email, if on file — used to prefill the "Email receipt" mailto link. */
  customerEmail?: string | null
  tripName: string
  tripCode: string
  departureDate: string | null
  amountPaid: number
  paymentMethod: string | null
  bookingStatus: string
  source?: string | null
  /** Which installment this payment/receipt is for (1 = first payment). Omit or 1 with no plan = pay-in-full. */
  installmentNo?: number | null
  /** How many installments the customer's plan has (1 = no split). */
  installmentPlan?: number | null
  /** Full trip price (inc. GST), used to show "Installment X of Y" + balance remaining. */
  priceAud?: number | null
  /** Trip price minus everything paid so far, after this payment. */
  balanceRemaining?: number | null
}

// Tax invoice is an AU legal/customer-facing document — English + AUD only,
// regardless of what language the internal staff tools use.
const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: 'Cash',
  payid: 'PayID',
  bank_transfer: 'Bank Transfer',
  manual: 'Other',
}

const STATUS_LABEL: Record<string, string> = {
  deposit_paid: 'Deposit Paid',
  fully_paid: 'Paid in Full',
}

const SOURCE_LABEL_EN: Record<string, string> = {
  facebook: 'Facebook',
  phone: 'Phone',
  line: 'LINE',
  walk_in: 'Walk-in',
  website: 'Website',
  other: 'Other',
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

  const isInstallment = (data?.installmentPlan ?? 1) > 1

  function handleEmailReceipt() {
    if (!data) return
    const subject = `Trip2Talk Tax Invoice — ${data.bookingReference ?? ''}`.trim()
    const installmentLine = isInstallment
      ? `\nInstallment: ${data.installmentNo ?? 1} of ${data.installmentPlan}${
          typeof data.balanceRemaining === 'number'
            ? `\nBalance remaining: ${formatAudCents(data.balanceRemaining)}`
            : ''
        }`
      : ''
    const body = [
      `Hi ${data.customerName},`,
      '',
      'Here is your tax invoice for Trip2Talk:',
      '',
      `Invoice: ${data.bookingReference ?? '—'}`,
      `Trip: ${data.tripName} (${data.tripCode})`,
      data.departureDate ? `Travel Date: ${data.departureDate}` : '',
      `Amount: ${formatAudCents(data.amountPaid)}${installmentLine}`,
      '',
      '(Please attach the receipt image — tap "Download receipt image" above first, then attach it here.)',
      '',
      'Thank you for choosing Trip2Talk!',
      'Chapter99 · ABN 81 951 461 769',
    ]
      .filter((line) => line !== undefined)
      .join('\n')

    const to = data.customerEmail ?? ''
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
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
          onClick={handleEmailReceipt}
          className="block w-full rounded-editorial border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm font-medium text-gold"
        >
          📧 ส่งอีเมลใบเสร็จ{data.customerEmail ? '' : ' (ไม่มีอีเมลลูกค้าในระบบ — กรอกเองได้)'}
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
          {data.departureDate && <Row label="Travel Date" value={data.departureDate} />}
          <Row label="Status" value={STATUS_LABEL[data.bookingStatus] ?? data.bookingStatus} />
          <Row
            label="Payment Method"
            value={data.paymentMethod ? PAYMENT_METHOD_LABEL[data.paymentMethod] ?? data.paymentMethod : '—'}
          />
          {data.source && (
            <Row label="Referred Via" value={SOURCE_LABEL_EN[data.source] ?? data.source} />
          )}
          {isInstallment && (
            <Row
              label="Installment"
              value={`${data.installmentNo ?? 1} of ${data.installmentPlan}`}
            />
          )}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-dashed border-black/20 pt-4 text-sm">
          <Row label="Subtotal (ex. GST)" value={formatAudCents(data.amountPaid / (1 + GST_RATE))} />
          <Row label="GST (10%)" value={formatAudCents(data.amountPaid - data.amountPaid / (1 + GST_RATE))} />
          <div className="flex items-center justify-between pt-2 text-base font-bold">
            <span>{isInstallment ? `This Payment (Installment ${data.installmentNo ?? 1})` : 'Total (inc. GST)'}</span>
            <span>{formatAudCents(data.amountPaid)}</span>
          </div>
          {isInstallment && typeof data.priceAud === 'number' && (
            <Row label="Trip Total (inc. GST)" value={formatAudCents(data.priceAud)} />
          )}
          {isInstallment && typeof data.balanceRemaining === 'number' && (
            <Row
              label="Balance Remaining"
              value={data.balanceRemaining > 0 ? formatAudCents(data.balanceRemaining) : 'Paid in Full'}
            />
          )}
        </div>

        <div className="mt-5 border-t border-dashed border-black/20 pt-4 text-center text-xs text-black/60">
          <p>Issued by Chapter99</p>
          <p className="mt-1">Thank you for choosing Trip2Talk 🙏</p>
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
