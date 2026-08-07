import { CreditCard, Landmark } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import { formatAud } from '../../lib/toursApi'

export type CustomerPaymentChoice = 'payid' | 'square'

type Props = {
  value: CustomerPaymentChoice
  onChange: (next: CustomerPaymentChoice) => void
  depositAud: number
  disabled?: boolean
}

/** PayID is primary (no fees); Square card/Afterpay is secondary. */
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
  }[] = [
    {
      id: 'payid',
      titleEn: 'Pay by PayID — no fees, recommended',
      titleTh: 'โอน PayID — ไม่มีค่าธรรมเนียม (แนะนำ)',
      subEn: 'Bank transfer to our Australian PayID. Upload slip after transfer.',
      subTh: 'โอนผ่านแอปธนาคารไปยัง PayID ของเรา แล้วอัปโหลดสลิป',
      icon: Landmark,
      recommended: true,
    },
    {
      id: 'square',
      titleEn: 'Pay by card / Afterpay',
      titleTh: 'จ่ายด้วยบัตร / Afterpay',
      subEn: `Secure Square checkout for ${formatAud(depositAud)}. Card processing fees apply.`,
      subTh: `ชำระผ่าน Square ${formatAud(depositAud)} — บัตรเครดิต/เดบิต หรือ Afterpay (มีค่าธรรมเนียม)`,
      icon: CreditCard,
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
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
