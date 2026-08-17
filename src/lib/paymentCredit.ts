/**
 * Trip-credit remaining balance.
 *
 * Square card charges store the gross amount in `booking_payments.amount_aud`
 * (deposit + 2% surcharge, e.g. $51). That surcharge is NOT trip credit.
 * The ledger has no base/surcharge split, so we do not reverse 2% from $51.
 * For Square card we credit the tour's catalog `deposit_aud` while status is
 * deposit_paid. Afterpay / PayID / cash amounts are already trip credit.
 */
export function remainingTripBalanceAud(opts: {
  priceAud: number | null | undefined
  depositAud: number | null | undefined
  amountPaidAud: number | null | undefined
  paymentMethod: string | null | undefined
  bookingStatus: string | null | undefined
}): number | null {
  const price = Number(opts.priceAud)
  if (!Number.isFinite(price) || price <= 0) return null

  const status = (opts.bookingStatus ?? '').trim().toLowerCase()
  if (status === 'fully_paid') return 0

  const method = (opts.paymentMethod ?? '').trim().toLowerCase()
  const paid = Number(opts.amountPaidAud)
  const paidSafe = Number.isFinite(paid) ? paid : 0

  if (method === 'square') {
    const deposit = Number(opts.depositAud)
    if (!Number.isFinite(deposit) || deposit < 0) return null
    return Math.max(0, Math.round((price - deposit) * 100) / 100)
  }

  const credit =
    method === 'afterpay' && paidSafe <= 0
      ? Number(opts.depositAud) || 0
      : paidSafe

  return Math.max(0, Math.round((price - credit) * 100) / 100)
}

/** Online Square Web Payments (card-not-present). Not Square Reader. */
export function isSquareGatewayMethod(method?: string | null): boolean {
  const m = (method ?? '').trim().toLowerCase()
  return m === 'square' || m === 'afterpay'
}

/** Physical Square Reader / POS app, entered manually in Cashier. */
export function isInPersonCardMethod(method?: string | null): boolean {
  return (method ?? '').trim().toLowerCase() === 'card_in_person'
}

const PAYMENT_METHOD_LABEL_EN: Record<string, string> = {
  cash: 'Cash',
  payid: 'PayID',
  bank_transfer: 'Bank Transfer',
  manual: 'Other',
  square: 'Card via Square',
  afterpay: 'Afterpay via Square',
  card_in_person: 'Card (in person)',
}

export function paymentMethodLabelEn(method?: string | null): string {
  const value = (method ?? '').trim().toLowerCase()
  if (!value) return '—'
  return PAYMENT_METHOD_LABEL_EN[value] ?? method!.trim()
}

/** Compact Cashier badge — short names, case-insensitive (legacy rows used "PayID"). */
export function paymentMethodBadge(method?: string | null): string {
  const value = (method ?? '').trim().toLowerCase()
  if (!value) return '—'
  if (value === 'square' || value === 'card_in_person') return 'Square'
  if (value === 'afterpay') return 'Afterpay'
  if (value === 'payid') return 'PayID'
  if (value === 'bank_transfer') return 'Bank'
  if (value === 'cash') return 'Cash'
  if (value === 'manual') return 'Other'
  return method!.trim()
}

/** Accent used on Cashier summary cards — same tokens as existing staff badges/notes. */
export function paymentMethodAccent(method?: string | null): {
  badge: string
  border: string
} {
  const value = (method ?? '').trim().toLowerCase()
  if (value === 'payid') return { badge: 'text-amber-200', border: 'border-t-amber-200' }
  if (value === 'afterpay') return { badge: 'text-teal-500', border: 'border-t-teal-500' }
  if (value === 'cash') return { badge: 'text-cream', border: 'border-t-cream' }
  if (value === 'square' || value === 'card_in_person') {
    return { badge: 'text-teal-400', border: 'border-t-teal-400' }
  }
  return { badge: 'text-cream-muted', border: 'border-t-white/25' }
}
