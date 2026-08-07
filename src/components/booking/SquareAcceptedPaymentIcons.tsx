import type { ReactNode } from 'react'
import { Landmark } from 'lucide-react'

/** Shared compact payment brand marks (booking + footer). */

type Tone = 'light' | 'dark'

function BrandShell({
  className = '',
  title,
  tone = 'light',
  children,
}: {
  className?: string
  title: string
  tone?: Tone
  children: ReactNode
}) {
  const shell =
    tone === 'dark'
      ? 'border-white/20 bg-white/95 shadow-none'
      : 'border-line bg-white shadow-[0_1px_0_rgba(15,28,30,0.04)]'
  return (
    <span
      className={`inline-flex h-5 min-w-[2rem] items-center justify-center overflow-hidden rounded-[3px] border px-1 sm:h-6 sm:min-w-[2.35rem] sm:rounded-[4px] sm:px-1.5 ${shell} ${className}`.trim()}
      title={title}
      aria-label={title}
    >
      {children}
    </span>
  )
}

function PayIdIcon({ tone = 'light' }: { tone?: Tone }) {
  return (
    <BrandShell title="PayID" tone={tone} className="gap-0.5 !px-1">
      <Landmark className="h-3 w-3 text-teal-800" aria-hidden strokeWidth={2.25} />
      <svg viewBox="0 0 36 16" className="h-3 w-[1.85rem]" aria-hidden>
        <text
          x="18"
          y="11.5"
          textAnchor="middle"
          fill="#16262b"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="7"
          fontWeight="800"
          letterSpacing="-0.2"
        >
          PayID
        </text>
      </svg>
    </BrandShell>
  )
}

function VisaIcon({ tone = 'light' }: { tone?: Tone }) {
  return (
    <BrandShell title="Visa" tone={tone}>
      <svg viewBox="0 0 42 16" className="h-3 w-[2.1rem] sm:h-3.5 sm:w-[2.35rem]" aria-hidden>
        <text
          x="21"
          y="11.5"
          textAnchor="middle"
          fill="#1A1F71"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="9"
          fontWeight="800"
          fontStyle="italic"
          letterSpacing="0.5"
        >
          VISA
        </text>
      </svg>
    </BrandShell>
  )
}

function MastercardIcon({ tone = 'light' }: { tone?: Tone }) {
  return (
    <BrandShell title="Mastercard" tone={tone}>
      <svg viewBox="0 0 38 24" className="h-3.5 w-6 sm:h-4 sm:w-[1.85rem]" aria-hidden>
        <circle cx="14.5" cy="12" r="7.2" fill="#EB001B" />
        <circle cx="23.5" cy="12" r="7.2" fill="#F79E1B" />
        <path
          fill="#FF5F00"
          d="M19 6.9c1.4 1.3 2.3 3.1 2.3 5.1S20.4 15.8 19 17.1c-1.4-1.3-2.3-3.1-2.3-5.1S17.6 8.2 19 6.9z"
        />
      </svg>
    </BrandShell>
  )
}

function AmexIcon({ tone = 'light' }: { tone?: Tone }) {
  return (
    <BrandShell className="!border-[#2E77BC] !bg-[#2E77BC]" title="American Express" tone={tone}>
      <svg viewBox="0 0 48 16" className="h-2.5 w-8 sm:h-3 sm:w-10" aria-hidden>
        <text
          x="24"
          y="11.2"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="7.5"
          fontWeight="800"
          letterSpacing="0.6"
        >
          AMEX
        </text>
      </svg>
    </BrandShell>
  )
}

function AfterpayIcon({ tone = 'light' }: { tone?: Tone }) {
  return (
    <BrandShell className="!border-[#b2fce4] !bg-[#b2fce4]" title="Afterpay" tone={tone}>
      <svg viewBox="0 0 72 16" className="h-2.5 w-[3rem] sm:h-3 sm:w-[3.6rem]" aria-hidden>
        <text
          x="36"
          y="11.2"
          textAnchor="middle"
          fill="#000"
          fontFamily="Inter, Arial, Helvetica, sans-serif"
          fontSize="7.2"
          fontWeight="800"
          letterSpacing="-0.15"
        >
          afterpay
        </text>
      </svg>
    </BrandShell>
  )
}

export type PaymentBrandId = 'payid' | 'visa' | 'mastercard' | 'amex' | 'afterpay'

const DEFAULT_SQUARE: PaymentBrandId[] = ['visa', 'mastercard', 'amex', 'afterpay']
const DEFAULT_FOOTER: PaymentBrandId[] = ['payid', 'visa', 'mastercard', 'afterpay']

function renderBrand(id: PaymentBrandId, tone: Tone) {
  switch (id) {
    case 'payid':
      return <PayIdIcon key={id} tone={tone} />
    case 'visa':
      return <VisaIcon key={id} tone={tone} />
    case 'mastercard':
      return <MastercardIcon key={id} tone={tone} />
    case 'amex':
      return <AmexIcon key={id} tone={tone} />
    case 'afterpay':
      return <AfterpayIcon key={id} tone={tone} />
  }
}

type Props = {
  brands?: PaymentBrandId[]
  tone?: Tone
  className?: string
  label?: string
}

/** Booking Square option — cards + Afterpay. */
export default function SquareAcceptedPaymentIcons({
  className = '',
  tone = 'light',
}: {
  className?: string
  tone?: Tone
}) {
  return (
    <AcceptedPaymentIcons
      brands={DEFAULT_SQUARE}
      tone={tone}
      className={`mt-1.5 ${className}`.trim()}
      label="Accepted: Visa, Mastercard, American Express, Afterpay"
    />
  )
}

/** Footer trust row — PayID + cards + Afterpay. */
export function FooterPaymentIcons({ className = '' }: { className?: string }) {
  return (
    <AcceptedPaymentIcons
      brands={DEFAULT_FOOTER}
      tone="dark"
      className={className}
      label="Accepted payments: PayID, Visa, Mastercard, Afterpay"
    />
  )
}

export function AcceptedPaymentIcons({
  brands = DEFAULT_SQUARE,
  tone = 'light',
  className = '',
  label,
}: Props) {
  return (
    <span
      className={`flex flex-wrap items-center gap-1 sm:gap-1.5 ${className}`.trim()}
      aria-label={label ?? `Accepted: ${brands.join(', ')}`}
    >
      {brands.map((id) => renderBrand(id, tone))}
    </span>
  )
}
