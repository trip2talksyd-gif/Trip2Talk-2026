import { useState } from 'react'
import { Building2, Check, Copy, ShieldCheck } from 'lucide-react'
import {
  BUSINESS_ENTITY,
  DEFAULT_PAYID,
  PAYID_OPTIONS,
  type PayIdOption,
} from '../../data/paymentDetails'
import { useLang } from '../../hooks/useLang'

type Props = {
  /** Compact for booking form; full for Payment Methods page */
  variant?: 'booking' | 'page'
}

export default function PayIdDepositPanel({ variant = 'booking' }: Props) {
  const { lang } = useLang()
  const [selected, setSelected] = useState<PayIdOption>(DEFAULT_PAYID)
  const [copied, setCopied] = useState(false)

  /** Copies bank + PayID + account name together — not just the raw number —
   * so staff/customers can paste one block with everything a bank transfer
   * needs, instead of having to type the bank/name in separately. */
  async function copyPayId(option: PayIdOption) {
    const bank = lang === 'th' ? option.bankTh : option.bankEn
    const text =
      lang === 'th'
        ? `${bank}\nPayID: ${option.payIdDisplay}\nชื่อบัญชี: ${option.accountName}`
        : `${bank}\nPayID: ${option.payIdDisplay}\nAccount name: ${option.accountName}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const isPage = variant === 'page'

  return (
    <section
      className={
        isPage
          ? 'space-y-4'
          : 'rounded-xl border border-line bg-cream p-4'
      }
    >
      <div className={isPage ? '' : ''}>
        <h2 className={`font-semibold text-ink ${isPage ? 'font-serif text-lg' : 'text-sm'}`}>
          {lang === 'th' ? 'โอนมัดจำผ่าน PayID' : 'Pay deposit via PayID'}
        </h2>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
          {lang === 'th'
            ? 'เลือก PayID ด้านล่าง → โอนในแอปธนาคาร → อัปโหลดสลิปเพื่อยืนยันที่นั่ง'
            : 'Pick a PayID below → transfer in your banking app → upload the slip to secure your seat.'}
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {PAYID_OPTIONS.map((opt) => {
          const active = selected.id === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelected(opt)}
              className={`flex w-full items-start gap-3 rounded-[12px] border px-3 py-2.5 text-left transition-colors ${
                active
                  ? 'border-teal-600 bg-mint-100'
                  : 'border-line bg-card hover:border-teal-600/40'
              }`}
            >
              <span
                className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                  active ? 'border-teal-700 bg-teal-600' : 'border-line bg-cream'
                }`}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-ink">
                  {lang === 'th' ? opt.bankTh : opt.bankEn}
                </span>
                <span className="mt-0.5 block font-mono text-[13px] font-extrabold tracking-wide text-teal-800">
                  {opt.payIdDisplay}
                </span>
                <span className="mt-0.5 block text-[10px] text-ink-soft">
                  {lang === 'th' ? 'ชื่อบัญชี' : 'Account name'}: {opt.accountName}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-mint-100 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">
            {lang === 'th' ? 'PayID ที่เลือก' : 'Selected PayID'}
          </p>
          <p className="font-mono text-sm font-bold text-ink">{selected.payIdDisplay}</p>
        </div>
        <button
          type="button"
          onClick={() => copyPayId(selected)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-900 px-3 py-2 text-[11px] font-semibold text-cream"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied
            ? lang === 'th'
              ? 'คัดลอกแล้ว'
              : 'Copied'
            : lang === 'th'
              ? 'คัดลอก'
              : 'Copy'}
        </button>
      </div>

      <div className="mt-3 rounded-[12px] border border-line bg-card px-3 py-3">
        <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-teal-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          {lang === 'th' ? 'ยืนยันธุรกิจในออสเตรเลีย' : 'Australian business verification'}
        </p>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-ink-soft">
          <li>
            <span className="font-semibold text-ink">
              {lang === 'th' ? 'กิจการ' : 'Business'}:
            </span>{' '}
            {lang === 'th' ? BUSINESS_ENTITY.tradingAsTh : BUSINESS_ENTITY.tradingAsEn}
          </li>
          <li>
            <span className="font-semibold text-ink">
              {lang === 'th' ? 'ชื่อบัญชีโอน' : 'Pay to'}:
            </span>{' '}
            {BUSINESS_ENTITY.accountName}
          </li>
          <li>
            <span className="font-semibold text-ink">ABN:</span> {BUSINESS_ENTITY.abn}
          </li>
          <li className="flex gap-1.5">
            <Building2 className="mt-0.5 h-3 w-3 shrink-0 text-teal-700" />
            <span>
              {lang === 'th' ? BUSINESS_ENTITY.addressTh : BUSINESS_ENTITY.addressEn}
            </span>
          </li>
          <li>
            <span className="font-semibold text-ink">
              {lang === 'th' ? 'โทร' : 'Phone'}:
            </span>{' '}
            <a href={`tel:${BUSINESS_ENTITY.phoneTel}`} className="text-teal-800 underline">
              {BUSINESS_ENTITY.phoneDisplay}
            </a>
          </li>
          <li>
            <span className="font-semibold text-ink">Email:</span>{' '}
            <a
              href={`mailto:${BUSINESS_ENTITY.email}`}
              className="text-teal-800 underline"
            >
              {BUSINESS_ENTITY.email}
            </a>
          </li>
        </ul>
        <p className="mt-2 text-[9.5px] leading-relaxed text-ink-soft">
          {lang === 'th'
            ? 'ตรวจสอบ ABN ได้ที่ abr.business.gov.au — โอนเฉพาะไปยังชื่อบัญชี Saard Saenmuang ตาม PayID ด้านบนเท่านั้น'
            : 'Verify our ABN at abr.business.gov.au — transfer only to Saard Saenmuang via the PayID numbers above.'}
        </p>
      </div>
    </section>
  )
}
