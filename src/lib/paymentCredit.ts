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

export function isSquareGatewayMethod(method?: string | null): boolean {
  const m = (method ?? '').trim().toLowerCase()
  return m === 'square' || m === 'afterpay'
}
