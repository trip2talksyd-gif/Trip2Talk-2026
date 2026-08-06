import { resolveTemplateTripCode } from '../lib/tripCode'

/** Budget trips: friendly peer-to-peer tone (price_standard < $500) */
export const BUDGET_TRIP_CODES = [
  'SYD-MW-WIN',
  'KIA-1DAY',
  'SYD-1DAY',
  'PSP-1DAY',
  'LAV-ANB-1D',
  'CAN-2D1N',
  'BER-3D2N',
] as const

/** Premium trips: polished, fully-handled tone (price_standard >= $1,350) */
export const PREMIUM_TRIP_CODES = [
  'TAS-3D2N',
  'TAS-LH-4D3N',
  'TAS-SU-4D3N',
  'TAS-SP-3D2N',
  'MEL-4D3N',
  'ULU-4D3N',
  'NZ-6D5N',
] as const

/** Premium trips where guests self-book flights (pack callout must not say we arrange flights). */
export const PREMIUM_SELF_FLIGHT_CODES = ['TAS-SP-3D2N'] as const

export function isPremiumTrip(tripCode: string): boolean {
  const template =
    resolveTemplateTripCode(tripCode, PREMIUM_TRIP_CODES) ?? tripCode.toUpperCase()
  return PREMIUM_TRIP_CODES.includes(template as (typeof PREMIUM_TRIP_CODES)[number])
}

export function isBudgetTrip(tripCode: string): boolean {
  const template =
    resolveTemplateTripCode(tripCode, BUDGET_TRIP_CODES) ?? tripCode.toUpperCase()
  return BUDGET_TRIP_CODES.includes(template as (typeof BUDGET_TRIP_CODES)[number])
}

export const PREMIUM_MODEL_CALLOUT = {
  en: 'Special! Want to be the model on this trip? Our professional photographer is ready to create stunning portraits of you.',
  th: 'พิเศษ! สำหรับผู้ที่ต้องการเป็นนางแบบในทริป เรามีช่างภาพมืออาชีพที่พร้อมจะเนรมิตภาพสวยๆ ให้คุณ',
}

export const PREMIUM_PACK_CALLOUT = {
  en: 'We arrange flights and accommodation for you — just pack your bag and go. See baggage details on Trip Preparation.',
  th: 'เราช่วยจองตั๋วเครื่องบินและที่พักให้ — คุณแค่เตรียมกระเป๋าแล้วออกเดินทาง (ดูรายละเอียดสัมภาระที่หน้าเตรียมตัวก่อนเดินทาง)',
}

export const PREMIUM_PACK_CALLOUT_SELF_FLIGHT = {
  en: 'Accommodation is included on this trip — book your own flights using the timing guidance on the trip page. Pack light and check Trip Preparation.',
  th: 'ทริปนี้รวมที่พักแล้ว — จองตั๋วเครื่องบินเองตามคำแนะนำเวลาในหน้าทริป เตรียมกระเป๋าเบาๆ และดูหน้าเตรียมตัวก่อนเดินทาง',
}

export function premiumPackCalloutFor(tripCode: string): { en: string; th: string } {
  const template =
    resolveTemplateTripCode(tripCode, PREMIUM_SELF_FLIGHT_CODES) ?? tripCode.toUpperCase()
  if (PREMIUM_SELF_FLIGHT_CODES.includes(template as (typeof PREMIUM_SELF_FLIGHT_CODES)[number])) {
    return PREMIUM_PACK_CALLOUT_SELF_FLIGHT
  }
  return PREMIUM_PACK_CALLOUT
}
