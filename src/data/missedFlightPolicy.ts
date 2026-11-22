export const POLICY_VERSION = '2026-11-v1'

export const MISSED_FLIGHT_POLICY = {
  th: {
    title: 'นโยบายกรณีตกเครื่อง',
    paragraphs: [
      'ลูกค้าต้องเช็คอินและไปถึงประตูขึ้นเครื่องตามเวลาที่สายการบินกำหนด ไม่ว่าจะจองตั๋วเองหรือให้ Trip2Talk จองให้',
      'หากตกเครื่องด้วยเหตุจากลูกค้า (เช่น มาไม่ทันเวลา เอกสารไม่ครบ) ค่าเปลี่ยนตั๋วหรือตั๋วใหม่ และค่าเดินทางมาสมทบกับกลุ่ม เป็นความรับผิดชอบของลูกค้า และไม่มีการคืนเงินสำหรับวันหรือบริการในทริปที่พลาดไป',
      'Trip2Talk ยินดีช่วยประสานจองเที่ยวบินใหม่ให้',
      'กรณีสายการบินเลื่อนหรือยกเลิกเที่ยวบิน เป็นไปตามนโยบายสายการบินและประกันการเดินทางของลูกค้า',
      'หากเกิดจากความผิดพลาดของ Trip2Talk เราจะรับผิดชอบค่าใช้จ่ายส่วนนั้นเอง',
    ],
  },
  en: {
    title: 'Missed Flight Policy',
    paragraphs: [
      'You must check in and reach the boarding gate on time as required by the airline, whether you booked your own flights or Trip2Talk booked them for you.',
      'If you miss a flight for reasons within your control (e.g. arriving late, missing documents), any change fee or new ticket, and the cost of travelling to rejoin the group, are your responsibility. Missed trip days or services are not refunded.',
      'Trip2Talk is happy to help you rebook.',
      "If the airline delays or cancels a flight, the airline's policy and your travel insurance apply.",
      'If the cause is a Trip2Talk error, we will cover that cost.',
    ],
  },
} as const

export const AIRPORT_ARRIVAL_REMINDER = {
  th: '⏰ กรุณาไปถึงสนามบินอย่างน้อย 2 ชม. ก่อนเครื่องออก (ต่างประเทศ 3 ชม.) — ตกเครื่องลูกค้ารับผิดชอบเอง',
  en: "⏰ Please arrive at least 2 hrs before departure (3 hrs international). Missed flights are the customer's responsibility.",
} as const

const FLIGHT_PREFIXES = new Set(['NZ', 'TAS', 'ULU', 'MEL', 'PER', 'WA'])

/** Multi-day trips that leave Sydney by air. Not 1-day or Sydney trips. */
export function tripIncludesFlights(tripCode: string, tripType?: string | null): boolean {
  if (tripType === 'oneday') return false
  const code = tripCode.toUpperCase()
  const prefix = code.split('-')[0] ?? ''
  if (prefix === 'SYD') return false
  if (code.includes('1DAY') || /-1D(\d|N|$)/.test(code)) return false
  return FLIGHT_PREFIXES.has(prefix)
}
