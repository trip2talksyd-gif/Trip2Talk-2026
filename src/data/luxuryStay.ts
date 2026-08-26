import { resolveTemplateTripCode } from '../lib/tripCode'

export type StayTier = 'standard' | 'luxury'

export type StayCopy = {
  standard: { en: string; th: string }
  luxury: { en: string; th: string }
  luxuryUpgradeNote: { en: string; th: string }
}

const STAY_COPY: Record<string, StayCopy> = {
  'MEL-4D3N': {
    standard: {
      en: 'Stay included at Standard / shared-or-motel equivalent (we coordinate booking).',
      th: 'รวมที่พักระดับมาตรฐาน (ห้องร่วมหรือโมเทลเทียบเท่า — เราช่วยจอง)',
    },
    luxury: {
      en: 'Luxury: private ensuite room for the 3 nights (subject to hotel availability).',
      th: 'พรีเมียม: ห้องส่วนตัวพร้อมห้องน้ำในตัว 3 คืน (ตามห้องว่างของโรงแรม)',
    },
    luxuryUpgradeNote: {
      en: 'Fixed Luxury total includes private ensuite for 3 nights (pay in full at this price).',
      th: 'เรทพรีเมียมคงที่ รวมห้องส่วนตัวพร้อมห้องน้ำในตัว 3 คืน (จ่ายเต็มตามราคานี้)',
    },
  },
  'ULU-4D3N': {
    standard: {
      en: 'Stay at the Outback Lodge — clean, safe, backpacker-style dorm rooms (shared).',
      th: 'พักที่ Outback Lodge สไตล์ Backpackers สะอาด ปลอดภัย ห้องพักรวม (Dormitory)',
    },
    luxury: {
      en: 'Luxury: private ensuite (or private room) for 3 nights — still request before departure.',
      th: 'พรีเมียม: ห้องส่วนตัวพร้อมห้องน้ำในตัว (หรือห้องส่วนตัว) 3 คืน — ยังต้องแจ้งก่อนออกเดินทาง',
    },
    luxuryUpgradeNote: {
      en: 'Fixed Luxury total includes private ensuite (or private room) for 3 nights.',
      th: 'เรทพรีเมียมคงที่ รวมห้องส่วนตัวพร้อมห้องน้ำในตัว (หรือห้องส่วนตัว) 3 คืน',
    },
  },
  'NZ-6D5N': {
    standard: {
      en: 'Standard stay: backpackers/motels, shared dormitory-style (clean & safe).',
      th: 'ที่พักมาตรฐาน: Backpackers/Motels ห้องรวม (Dormitory) สะอาดปลอดภัย',
    },
    luxury: {
      en: 'Luxury: private ensuite where available for the 5 nights.',
      th: 'พรีเมียม: ห้องส่วนตัวพร้อมห้องน้ำในตัว 5 คืน ตามที่มี',
    },
    luxuryUpgradeNote: {
      en: 'Fixed Luxury total includes private ensuite where available for the 5 nights.',
      th: 'เรทพรีเมียมคงที่ รวมห้องส่วนตัวพร้อมห้องน้ำในตัว 5 คืน ตามที่มี',
    },
  },
  'TAS-3D2N': {
    standard: {
      en: 'Stay included — Standard shared or motel-style for 2 nights (we coordinate).',
      th: 'รวมที่พักมาตรฐาน 2 คืน แบบร่วมหรือโมเทล (เราช่วยจอง)',
    },
    luxury: {
      en: 'Luxury: private ensuite for 2 nights (subject to availability).',
      th: 'พรีเมียม: ห้องส่วนตัวพร้อมห้องน้ำในตัว 2 คืน (ตามห้องว่าง)',
    },
    luxuryUpgradeNote: {
      en: 'Fixed Luxury total includes private ensuite for 2 nights.',
      th: 'เรทพรีเมียมคงที่ รวมห้องส่วนตัวพร้อมห้องน้ำในตัว 2 คืน',
    },
  },
  'CAN-2D1N': {
    standard: {
      en: '1 night shared dorm / backpacker-motel (clean & safe).',
      th: 'ที่พัก 1 คืน ห้องรวม Backpackers/Motel สะอาดปลอดภัย',
    },
    luxury: {
      en: 'Luxury: private ensuite for 1 night.',
      th: 'พรีเมียม: ห้องส่วนตัวพร้อมห้องน้ำในตัว 1 คืน',
    },
    luxuryUpgradeNote: {
      en: 'Fixed Luxury total includes private ensuite for 1 night.',
      th: 'เรทพรีเมียมคงที่ รวมห้องส่วนตัวพร้อมห้องน้ำในตัว 1 คืน',
    },
  },
  'TAS-LH-4D3N': {
    standard: {
      en: 'Stay included — Standard shared or motel-style for 3 nights (we coordinate).',
      th: 'รวมที่พักมาตรฐาน 3 คืน แบบร่วมหรือโมเทล (เราช่วยจอง)',
    },
    luxury: {
      en: 'Luxury: private ensuite for 3 nights (subject to availability).',
      th: 'พรีเมียม: ห้องส่วนตัวพร้อมห้องน้ำในตัว 3 คืน (ตามห้องว่าง)',
    },
    luxuryUpgradeNote: {
      en: '+$1,200 vs intended Standard list for private ensuite, 3 nights (no live TAS-LH-4D3N row yet).',
      th: 'แพงกว่าเรทมาตรฐานที่ตั้งไว้ $1,200 สำหรับห้องส่วนตัว 3 คืน (ยังไม่มีแถว TAS-LH-4D3N บนระบบ)',
    },
  },
  'NZ-10D9N': {
    standard: {
      en: 'Standard stay: shared dorm / backpacker-motel. Dates and public price TBA.',
      th: 'ที่พักมาตรฐาน: ห้องรวม / Backpackers-Motel วันเดินทางและราคารอประกาศ',
    },
    luxury: {
      en: 'Luxury: private ensuite for 9 nights when the trip opens for booking.',
      th: 'พรีเมียม: ห้องส่วนตัวพร้อมห้องน้ำในตัว 9 คืน เมื่อเปิดจอง',
    },
    luxuryUpgradeNote: {
      en: 'Indicative Luxury list $6,100 — not open for online booking until dates are confirmed.',
      th: 'เรทพรีเมียมโดยประมาณ $6,100 — ยังไม่เปิดจองออนไลน์จนกว่าจะมีวันเดินทาง',
    },
  },
}

export function getStayCopy(tripCode: string): StayCopy | undefined {
  const template = resolveTemplateTripCode(tripCode, Object.keys(STAY_COPY)) ?? tripCode.toUpperCase()
  return STAY_COPY[template]
}
