import type { CustomerPaymentChoice } from '../components/booking/BookingPaymentMethodPicker'

const STORAGE_KEY = 't2t-preferred-payment'

/** Remember Square card so /waiver → /booking opens the existing SquareCardElement. */
export function preferSquareCardCheckout() {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'square')
  } catch {
    /* private mode */
  }
}

export function readPreferredCustomerPayment(
  searchPay?: string | null,
): CustomerPaymentChoice {
  if (searchPay === 'square') {
    preferSquareCardCheckout()
    return 'square'
  }
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === 'square') return 'square'
  } catch {
    /* private mode */
  }
  return 'payid'
}

/** Append to waiver/booking links when the customer chose card on /pricing. */
export function squarePayQuerySuffix(): string {
  return readPreferredCustomerPayment() === 'square' ? '&pay=square' : ''
}
