import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import { PAYID_OPTIONS } from '../../data/paymentDetails'

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
  email: 'trip2talksyd@gmail.com',
  logoSrc:
    'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/Photos/Logo/Trip2talk%20(1).png',
}

// Bank details shown in the invoice footer — the NAB PayID matches the
// contact phone number shown elsewhere on the invoice (0452 044 382).
const PAYMENT_BANK = PAYID_OPTIONS.find((p) => p.id === 'nab') ?? PAYID_OPTIONS[0]

// Invoice accent color — deliberately a formal blue rather than the app's
// gold/teal theme, since this is a printable legal document, not in-app UI.
const ACCENT = '#1d4ed8'

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

  function buildEmailParts(d: ReceiptData) {
    const subject = `Trip2Talk Tax Invoice — ${d.bookingReference ?? ''}`.trim()
    const installmentLine = isInstallment
      ? `\nInstallment: ${d.installmentNo ?? 1} of ${d.installmentPlan}${
          typeof d.balanceRemaining === 'number'
            ? `\nBalance remaining: ${formatAudCents(d.balanceRemaining)}`
            : ''
        }`
      : ''
    const body = [
      `Hi ${d.customerName},`,
      '',
      'Here is your tax invoice for Trip2Talk:',
      '',
      `Invoice: ${d.bookingReference ?? '—'}`,
      `Trip: ${d.tripName} (${d.tripCode})`,
      d.departureDate ? `Travel Date: ${d.departureDate}` : '',
      `Amount: ${formatAudCents(d.amountPaid)}${installmentLine}`,
      '',
      '(Please attach the receipt image — download it above first, then attach it here.)',
      '',
      'Thank you for choosing Trip2Talk!',
      'Chapter99 · ABN 81 951 461 769',
    ]
      .filter((line) => line !== undefined)
      .join('\n')
    return { subject, body }
  }

  // Gmail's web compose URL instead of mailto: — mailto only works if the
  // browser/OS has a default mail app registered, which most Chrome/Windows
  // setups don't have out of the box. This opens Gmail directly (matches
  // trip2talksyd@gmail.com, the account used to run Trip2Talk) and works
  // reliably as long as staff are logged into that Gmail account in the
  // browser. authuser=<email> tells Gmail which signed-in account to compose
  // from if more than one Google account is logged into the same browser.
  function handleEmailReceipt() {
    if (!data) return
    const { subject, body } = buildEmailParts(data)
    const to = data.customerEmail ?? ''
    const url = `https://mail.google.com/mail/?view=cm&fs=1&authuser=${encodeURIComponent(
      SELLER.email,
    )}&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Fallback that always works regardless of mail app/login state — copies
  // the same subject/body so staff can paste it into any email client.
  async function handleCopyEmailText() {
    if (!data) return
    const { subject, body } = buildEmailParts(data)
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
      toast('คัดลอกข้อความอีเมลแล้ว', 'success')
    } catch {
      toast('คัดลอกไม่สำเร็จ', 'error')
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleEmailReceipt}
            className="flex-1 rounded-editorial border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm font-medium text-gold"
          >
            📧 เปิด Gmail ส่งใบเสร็จ
          </button>
          <button
            type="button"
            onClick={handleCopyEmailText}
            className="rounded-editorial border border-gold/40 bg-gold/10 px-3 py-3 text-center text-sm font-medium text-gold"
            title="คัดลอกข้อความอีเมล (เผื่อ Gmail เปิดไม่ได้)"
          >
            📋
          </button>
        </div>
        {!data.customerEmail && (
          <p className="text-center text-xs text-cream-muted">
            ไม่มีอีเมลลูกค้าในระบบ — Gmail จะเปิดแบบไม่กรอกผู้รับ ใส่เองได้
          </p>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="block w-full rounded-editorial border border-gold/40 bg-gold/10 px-4 py-3 text-center text-sm font-medium text-gold"
        >
          🖨️ พิมพ์ใบเสร็จ
        </button>
      </div>

      <div
        ref={cardRef}
        className="mx-auto mt-6 max-w-md overflow-hidden rounded-editorial bg-white text-black print:mt-0 print:max-w-none print:rounded-none"
      >
        <div className="p-6">
          {/* Logo + brand */}
          <div className="flex items-start justify-between gap-4">
            <img
              src={SELLER.logoSrc}
              alt="Chapter99"
              crossOrigin="anonymous"
              className="h-14 w-14 shrink-0 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div className="text-right">
              <p className="text-lg font-bold leading-tight" style={{ color: ACCENT }}>
                {SELLER.legalName}
              </p>
              <p className="text-xs text-black/50">{SELLER.tradingAs}</p>
              <p className="text-xs text-black/50">{SELLER.email}</p>
            </div>
          </div>

          {/* Client + invoice meta */}
          <div className="mt-5 flex items-start justify-between gap-4 border-t border-black/10 pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/40">Client</p>
              <p className="mt-0.5 font-semibold text-black">{data.customerName}</p>
              {data.source && (
                <p className="text-xs text-black/50">via {SOURCE_LABEL_EN[data.source] ?? data.source}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-base font-bold tracking-wide" style={{ color: ACCENT }}>
                TAX INVOICE
              </p>
              <p className="text-xs text-black/60">Invoice: {data.bookingReference ?? '—'}</p>
              <p className="text-xs text-black/60">{issuedAt.toLocaleDateString('en-AU')}</p>
            </div>
          </div>

          {/* Line item table */}
          <table className="mt-5 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/15 text-left text-[10px] font-semibold uppercase tracking-wide text-black/40">
                <th className="pb-2 font-semibold">Description</th>
                <th className="pb-2 font-semibold">Travel Date</th>
                <th className="pb-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black/10">
                <td className="py-2.5 pr-2 align-top">
                  <p className="font-medium text-black">{data.tripName}</p>
                  <p className="text-xs text-black/50">{data.tripCode}</p>
                  {isInstallment && (
                    <p className="mt-0.5 text-xs text-black/50">
                      Installment {data.installmentNo ?? 1} of {data.installmentPlan}
                    </p>
                  )}
                </td>
                <td className="py-2.5 pr-2 align-top text-xs text-black/70">{data.departureDate ?? '—'}</td>
                <td className="py-2.5 text-right align-top font-medium text-black">
                  {formatAudCents(data.amountPaid)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-3 space-y-1.5 text-sm">
            <Row label="Subtotal (ex. GST)" value={formatAudCents(data.amountPaid / (1 + GST_RATE))} />
            <Row label="GST (10%)" value={formatAudCents(data.amountPaid - data.amountPaid / (1 + GST_RATE))} />
            <div
              className="flex items-center justify-between border-t border-black/15 pt-2 text-base font-bold"
              style={{ color: ACCENT }}
            >
              <span>{isInstallment ? `This Payment (Installment ${data.installmentNo ?? 1})` : 'Total Amount (inc. GST)'}</span>
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

          {/* Status / payment method */}
          <div className="mt-4 space-y-1 border-t border-black/10 pt-3 text-xs">
            <Row label="Status" value={STATUS_LABEL[data.bookingStatus] ?? data.bookingStatus} />
            <Row
              label="Payment Method"
              value={data.paymentMethod ? PAYMENT_METHOD_LABEL[data.paymentMethod] ?? data.paymentMethod : '—'}
            />
          </div>
        </div>

        {/* Footer — payment details + contact info, two columns */}
        <div className="grid grid-cols-2 gap-4 px-6 py-5 text-xs" style={{ backgroundColor: '#eef2ff' }}>
          <div>
            <p className="font-bold" style={{ color: ACCENT }}>
              Payment Details
            </p>
            <p className="mt-1 text-black/70">{PAYMENT_BANK.bankEn}</p>
            <p className="text-black/70">PayID: {PAYMENT_BANK.payIdDisplay}</p>
            <p className="text-black/70">Account Name: {PAYMENT_BANK.accountName}</p>
          </div>
          <div className="text-right">
            <p className="font-bold" style={{ color: ACCENT }}>
              Contact Info
            </p>
            <p className="mt-1 text-black/70">ABN: {SELLER.abn}</p>
            <p className="text-black/70">{SELLER.address}</p>
            <p className="text-black/70">{SELLER.phone}</p>
            <p className="text-black/70">{SELLER.email}</p>
          </div>
        </div>

        <div className="border-t border-black/10 px-6 py-3 text-center text-xs text-black/50">
          Thank you for choosing Trip2Talk 🙏
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
