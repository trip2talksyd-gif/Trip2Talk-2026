import type { ReactNode } from 'react'

/** Compact accepted-payment brand marks for Square checkout (AU). */

function BrandShell({
  className = '',
  title,
  children,
}: {
  className?: string
  title: string
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex h-6 min-w-[2.35rem] items-center justify-center overflow-hidden rounded-[4px] border border-line bg-white px-1.5 shadow-[0_1px_0_rgba(15,28,30,0.04)] ${className}`.trim()}
      title={title}
      aria-label={title}
    >
      {children}
    </span>
  )
}

function VisaIcon() {
  return (
    <BrandShell title="Visa">
      <svg viewBox="0 0 42 16" className="h-3.5 w-[2.35rem]" aria-hidden>
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

function MastercardIcon() {
  return (
    <BrandShell title="Mastercard">
      <svg viewBox="0 0 38 24" className="h-4 w-[1.85rem]" aria-hidden>
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

function AmexIcon() {
  return (
    <BrandShell className="!border-[#2E77BC] !bg-[#2E77BC]" title="American Express">
      <svg viewBox="0 0 48 16" className="h-3 w-10" aria-hidden>
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

function AfterpayIcon() {
  return (
    <BrandShell className="!border-[#b2fce4] !bg-[#b2fce4]" title="Afterpay">
      <svg viewBox="0 0 72 16" className="h-3 w-[3.6rem]" aria-hidden>
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

/**
 * Brands for Trip2Talk Square Online (AU): Visa / Mastercard / Amex + Afterpay.
 * Matches Payment Link `accepted_payment_methods.afterpay_clearpay` + default cards.
 */
export default function SquareAcceptedPaymentIcons({ className = '' }: { className?: string }) {
  return (
    <span
      className={`mt-1.5 flex flex-wrap items-center gap-1.5 ${className}`.trim()}
      aria-label="Accepted: Visa, Mastercard, American Express, Afterpay"
    >
      <VisaIcon />
      <MastercardIcon />
      <AmexIcon />
      <AfterpayIcon />
    </span>
  )
}
