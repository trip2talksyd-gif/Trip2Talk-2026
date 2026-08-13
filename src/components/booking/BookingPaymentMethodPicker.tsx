import { CreditCard, Landmark } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { formatAud } from '../../lib/toursApi'
import SquareAcceptedPaymentIcons from './SquareAcceptedPaymentIcons'

export type CustomerPaymentChoice = 'payid' | 'square'

type Props = {
  value: CustomerPaymentChoice
  onChange: (next: CustomerPaymentChoice) => void
  depositAud: number
  disabled?: boolean
}

/** PayID is primary (no fees); Square Web Payments card is secondary. */
export default function BookingPaymentMethodPicker({
  value,
  onChange,
  depositAud,
  disabled,
}: Props) {
  const { lang } = useLang()

  const options: {
    id: CustomerPaymentChoice
    titleEn: string
    titleTh: string
    subEn: string
    subTh: string
    icon: typeof Landmark
    recommended?: boolean
    showBrandIcons?: boolean
  }[] = [
    {
      id: 'payid',
      titleEn: 'Bank Transfer (PayID)',
      titleTh: 'โอนผ่านธนาคาร (PayID)',
      subEn: 'Australian PayID — no fees. Upload slip after transfer.',
      subTh: 'โอน PayID ในออสเตรเลีย — ไม่มีค่าธรรมเนียม แล้วอัปโหลดสลิป',
      icon: Landmark,
      recommended: true,
    },
    {
      id: 'square',
      titleEn: 'Credit/Debit Card (Visa/Mastercard — international OK, via Square)',
      titleTh: 'บัตรเครดิต/เดบิต (Visa/Mastercard — ใช้บัตรต่างประเทศได้ ผ่าน Square)',
      subEn: `Pay ${formatAud(depositAud)} on this page. Thai-issued and other non-AU cards welcome. Card fees apply.`,
      subTh: `ชำระ ${formatAud(depositAud)} บนหน้านี้ รวมบัตรที่ออกในไทย/ต่างประเทศ (มีค่าธรรมเนียมบัตร)`,
      icon: CreditCard,
      showBrandIcons: true,
    },
  ]

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-semibold text-ink">
        {lang === 'th' ? 'วิธีชำระมัดจำ' : 'Deposit payment method'}
        <span className="text-coral"> *</span>
      </legend>
      <ul className="space-y-2">
        {options.map((opt) => {
          const active = value === opt.id
          const Icon = opt.icon
          return (
            <li key={opt.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-colors ${
                  active
                    ? opt.recommended
                      ? 'border-teal-600 bg-mint-100 ring-1 ring-teal-600/30'
                      : 'border-teal-600 bg-white ring-1 ring-teal-600/20'
                    : 'border-line bg-white hover:border-teal-600/40'
                }`}
              >
                <input
                  type="radio"
                  name="deposit_payment_method"
                  value={opt.id}
                  checked={active}
                  onChange={() => onChange(opt.id)}
                  className="mt-1 shrink-0 accent-teal-700"
                />
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-900/8 text-teal-800">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[12px] font-bold text-ink">
                      {lang === 'th' ? opt.titleTh : opt.titleEn}
                    </span>
                    {opt.recommended && (
                      <span className="rounded-full bg-teal-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-cream">
                        {lang === 'th' ? 'แนะนำ' : 'Recommended'}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] leading-snug text-ink-soft">
                    {lang === 'th' ? opt.subTh : opt.subEn}
                  </span>
                  {opt.showBrandIcons ? <SquareAcceptedPaymentIcons /> : null}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
