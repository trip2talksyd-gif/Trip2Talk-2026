import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Landmark } from 'lucide-react'

/** Shared compact payment brand marks (booking + footer). */

type Tone = 'light' | 'dark'

export const AFTERPAY_HOW_IT_WORKS = 'https://www.afterpay.com/en-AU/how-it-works'

type BrandLink =
  | { kind: 'internal'; to: string; label: string }
  | { kind: 'external'; href: string; label: string }

function BrandShell({
  className = '',
  title,
  tone = 'light',
  labelled = true,
  children,
}: {
  className?: string
  title: string
  tone?: Tone
  labelled?: boolean
  children: ReactNode
}) {
  const shell =
    tone === 'dark'
      ? 'border-white/20 bg-white/95 shadow-none'
      : 'border-line bg-white shadow-[0_1px_0_rgba(15,28,30,0.04)]'
  return (
    <span
      className={`inline-flex h-5 min-w-[2rem] items-center justify-center overflow-hidden rounded-[3px] border px-1 sm:h-6 sm:min-w-[2.35rem] sm:rounded-[4px] sm:px-1.5 ${shell} ${className}`.trim()}
      title={labelled ? title : undefined}
      aria-label={labelled ? title : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      {children}
    </span>
  )
}

function PayIdIcon({ tone = 'light', labelled = true }: { tone?: Tone; labelled?: boolean }) {
  return (
    <BrandShell title="PayID" tone={tone} labelled={labelled} className="gap-0.5 !px-1">
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

function VisaIcon({ tone = 'light', labelled = true }: { tone?: Tone; labelled?: boolean }) {
  return (
    <BrandShell title="Visa" tone={tone} labelled={labelled}>
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

function MastercardIcon({ tone = 'light', labelled = true }: { tone?: Tone; labelled?: boolean }) {
  return (
    <BrandShell title="Mastercard" tone={tone} labelled={labelled}>
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

export function AfterpayIcon({ tone = 'light', labelled = true }: { tone?: Tone; labelled?: boolean }) {
  return (
    <BrandShell className="!border-[#b2fce4] !bg-[#b2fce4]" title="Afterpay" tone={tone} labelled={labelled}>
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

export type PaymentBrandId = 'payid' | 'visa' | 'mastercard' | 'afterpay'

const DEFAULT_SQUARE: PaymentBrandId[] = ['visa', 'mastercard', 'afterpay']
const DEFAULT_FOOTER: PaymentBrandId[] = ['payid', 'visa', 'mastercard', 'afterpay']

function renderBrand(id: PaymentBrandId, tone: Tone, link?: BrandLink) {
  // Marks are decorative; the row aria-label (and link aria-label when present) speak.
  const icon = (() => {
    switch (id) {
      case 'payid':
        return <PayIdIcon tone={tone} labelled={false} />
      case 'visa':
        return <VisaIcon tone={tone} labelled={false} />
      case 'mastercard':
        return <MastercardIcon tone={tone} labelled={false} />
      case 'afterpay':
        return <AfterpayIcon tone={tone} labelled={false} />
    }
  })()

  if (!link) {
    return (
      <span key={id} className="pointer-events-none cursor-default select-none">
        {icon}
      </span>
    )
  }

  const className =
    'inline-flex cursor-pointer rounded-[3px] outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-white/60'

  if (link.kind === 'external') {
    return (
      <a
        key={id}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={link.label}
      >
        {icon}
      </a>
    )
  }

  return (
    <Link key={id} to={link.to} className={className} aria-label={link.label}>
      {icon}
    </Link>
  )
}

type Props = {
  brands?: PaymentBrandId[]
  tone?: Tone
  className?: string
  label?: string
  brandLinks?: Partial<Record<PaymentBrandId, BrandLink>>
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
      label="Accepted: Visa, Mastercard, Afterpay"
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
      label="We accept PayID, Visa, Mastercard, Afterpay"
      brandLinks={{
        payid: {
          kind: 'internal',
          to: '/pricing#payid',
          label: 'PayID — how to pay / วิธีชำระ PayID',
        },
        afterpay: {
          kind: 'external',
          href: AFTERPAY_HOW_IT_WORKS,
          label: 'Afterpay — how it works (opens in a new tab)',
        },
      }}
    />
  )
}

export function AcceptedPaymentIcons({
  brands = DEFAULT_SQUARE,
  tone = 'light',
  className = '',
  label,
  brandLinks,
}: Props) {
  return (
    <span
      className={`flex flex-wrap items-center gap-1 sm:gap-1.5 ${className}`.trim()}
      aria-label={label ?? `Accepted: ${brands.join(', ')}`}
    >
      {brands.map((id) => renderBrand(id, tone, brandLinks?.[id]))}
    </span>
  )
}
