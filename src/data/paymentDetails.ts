/** Canonical deposit / PayID details — update only here. */

export type PayIdOption = {
  id: 'anz' | 'nab'
  bankEn: string
  bankTh: string
  /** Digits only — for clipboard / PayID lookup */
  payId: string
  /** Spaced for display */
  payIdDisplay: string
  accountName: string
}

export const BUSINESS_ENTITY = {
  tradingAsEn: 'Trip2Talk · Chapter 99 Photography',
  tradingAsTh: 'Trip2Talk · Chapter 99 Photography',
  accountName: 'Saard Saenmuang',
  abn: '81 951 461 769',
  abnDigits: '81951461769',
  addressEn: '33/14 Jubilee Ave, Warriewood NSW 2102',
  addressTh: '33/14 Jubilee Ave, Warriewood NSW 2102',
  phoneDisplay: '+61 452 044 382',
  phoneTel: '+61452044382',
  email: 'trip2talksyd@gmail.com',
} as const

/** Preferred PayID targets for customer deposit transfers. */
export const PAYID_OPTIONS: PayIdOption[] = [
  {
    id: 'anz',
    bankEn: 'ANZ Bank',
    bankTh: 'ธนาคาร ANZ',
    payId: '0489169876',
    payIdDisplay: '0489 169 876',
    accountName: 'Saard Saenmuang',
  },
  {
    id: 'nab',
    bankEn: 'NAB Bank',
    bankTh: 'ธนาคาร NAB',
    payId: '0452044382',
    payIdDisplay: '0452 044 382',
    accountName: 'Saard Saenmuang',
  },
]

export const DEFAULT_PAYID = PAYID_OPTIONS[0]
