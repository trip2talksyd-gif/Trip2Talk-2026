import type { BilingualList } from './tripDetails'

export type PackingClimate = 'cold' | 'desert' | 'coastal' | 'general'

export type PackingGuide = {
  climate: PackingClimate
  groups: {
    key: string
    title: { en: string; th: string }
    items: BilingualList
  }[]
}

const coldWeather: PackingGuide['groups'] = [
  {
    key: 'clothing',
    title: { en: 'Cold weather clothing', th: 'เสื้อผ้ากันหนาว' },
    items: {
      en: ['Thermal base layers (top & bottom)', 'Insulated jacket', 'Waterproof outer shell', 'Warm gloves & beanie'],
      th: ['Thermal ชั้นใน (บน-ล่าง)', 'เสื้อกันหนาว', 'เสื้อกันน้ำชั้นนอก', 'ถุงมือและหมวกกันหนาว'],
    },
  },
  {
    key: 'photo',
    title: { en: 'Photography gear', th: 'อุปกรณ์ถ่ายภาพ' },
    items: {
      en: ['Sturdy tripod (wind-rated)', 'Wide-angle lens for landscapes', 'Spare batteries (cold drains fast)', 'Lens cloth & air blower'],
      th: ['ขาตั้งแข็งแรง (ทนต่อลม)', 'เลนส์ wide สำหรับทิวทัศน์', 'แบตเตอรี่สำรอง (หนาวทำให้หมดเร็ว)', 'ผ้าเช็ดเลนส์และที่เป่า'],
    },
  },
  {
    key: 'personal',
    title: { en: 'Personal items', th: 'ของใช้ส่วนตัว' },
    items: {
      en: ['OSHC card / Medicare details', 'Reusable water bottle', 'Head torch for night shoots', 'Personal medications'],
      th: ['บัตร OSHC / Medicare', 'กระติกน้ำ', 'ไฟฉายสำหรับถ่ายกลางคืน', 'ยาประจำตัว'],
    },
  },
]

const desert: PackingGuide['groups'] = [
  {
    key: 'clothing',
    title: { en: 'Desert clothing', th: 'เสื้อผ้าทะเลทราย' },
    items: {
      en: ['Wide-brim sun hat', 'SPF 50+ sunscreen', 'Light long sleeves for midday', 'Warm layers for sub-zero nights'],
      th: ['หมวกปีกกว้าง', 'ครีมกันแดด SPF 50+', 'เสื้อแขนยาวบางสำหรับกลางวัน', 'ชั้นกันหนาวสำหรับกลางคืน'],
    },
  },
  {
    key: 'photo',
    title: { en: 'Photography gear', th: 'อุปกรณ์ถ่ายภาพ' },
    items: {
      en: ['Tripod for sunrise/sunset', 'ND filters for bright skies', 'Dust protection for camera', 'Offline maps on phone'],
      th: ['ขาตั้งสำหรับพระอาทิตย์ขึ้น/ตก', 'ND filter สำหรับท้องฟ้าสว่าง', 'ป้องกันฝุ่นสำหรับกล้อง', 'แผนที่ออฟไลน์ในมือถือ'],
    },
  },
  {
    key: 'personal',
    title: { en: 'Personal items', th: 'ของใช้ส่วนตัว' },
    items: {
      en: ['Minimum 3L water capacity daily', 'Electrolyte sachets', 'Lip balm & moisturiser', 'Power bank (cabin only on Jetstar)'],
      th: ['น้ำอย่างน้อย 3 ลิตร/วัน', 'เกลือแร่', 'ลิปบาล์มและครีมบำรุง', 'Power bank (ถือขึ้นเครื่องเท่านั้นบน Jetstar)'],
    },
  },
]

const coastal: PackingGuide['groups'] = [
  {
    key: 'clothing',
    title: { en: 'Coastal clothing', th: 'เสื้อผ้าริมชายฝั่ง' },
    items: {
      en: ['Non-slip rock shoes (mandatory on rocks)', 'Quick-dry clothing', 'Windbreaker jacket', 'Change of socks'],
      th: ['รองเท้าปีนหินกันลื่ (บังคับบนหิน)', 'เสื้อผ้าแห้งเร็ว', 'เสื้อกันลม', 'ถุงเท้าสำรอง'],
    },
  },
  {
    key: 'photo',
    title: { en: 'Photography gear', th: 'อุปกรณ์ถ่ายภาพ' },
    items: {
      en: ['Polarising filter for water/sky', 'Waterproof camera bag', 'Microfiber cloth for sea spray', 'Remote shutter or intervalometer'],
      th: ['Polarising filter สำหรับน้ำ/ท้องฟ้า', 'กระเป๋ากล้องกันน้ำ', 'ผ้าไมโครไฟเบอร์เช็ดละอองทะเล', 'Remote shutter หรือ intervalometer'],
    },
  },
  {
    key: 'personal',
    title: { en: 'Personal items', th: 'ของใช้ส่วนตัว' },
    items: {
      en: ['Reef-safe sunscreen', 'Small first-aid kit', 'Snacks for long drives', 'Dry bag for electronics'],
      th: ['ครีมกันแดด reef-safe', 'ชุดปฐมพยาบาลเล็ก', 'ขนมสำหรับขับรถไกล', 'Dry bag สำหรับอุปกรณ์อิเล็ก'],
    },
  },
]

const general: PackingGuide['groups'] = [
  {
    key: 'clothing',
    title: { en: 'Day trip clothing', th: 'เสื้อผ้าทริปวันเดียว' },
    items: {
      en: ['Comfortable walking shoes', 'Layered clothing', 'Sun hat & sunglasses', 'Light rain jacket'],
      th: ['รองเท้าเดินสบาย', 'เสื้อผ้าหลายชั้น', 'หมวกและแว่นกันแดด', 'เสื้อกันฝนบาง'],
    },
  },
  {
    key: 'photo',
    title: { en: 'Photography gear', th: 'อุปกรณ์ถ่ายภาพ' },
    items: {
      en: ['Camera + charged batteries', 'Tripod (if Milky Way package)', 'Memory cards formatted', 'Phone for backup shots'],
      th: ['กล้อง + แบตเตอรี่ชาร์จเต็ม', 'ขาตั้ง (แพ็กล่าทางช้างเผือก)', 'การ์ดหน่วยความจำฟอร์แมตแล้ว', 'มือถือสำรอง'],
    },
  },
  {
    key: 'personal',
    title: { en: 'Personal items', th: 'ของใช้ส่วนตัว' },
    items: {
      en: ['Water bottle', 'OSHC / ID', 'Cash for meals', 'Personal medications'],
      th: ['กระติกน้ำ', 'OSHC / บัตรประจำตัว', 'เงินสดสำหรับอาหาร', 'ยาประจำตัว'],
    },
  },
]

export const PACKING_GUIDES: Record<string, PackingGuide> = {
  'NZ-6D5N': { climate: 'cold', groups: coldWeather },
  'TAS-3D2N': { climate: 'cold', groups: coldWeather },
  'TAS-LH-4D3N': { climate: 'cold', groups: coldWeather },
  'TAS-SU-4D3N': { climate: 'cold', groups: coldWeather },
  'ULU-4D3N': { climate: 'desert', groups: desert },
  'MEL-4D3N': { climate: 'coastal', groups: coastal },
  'BER-3D2N': { climate: 'coastal', groups: coastal },
  'CAN-2D1N': { climate: 'general', groups: general },
  'KIA-1DAY': { climate: 'coastal', groups: coastal },
  'PSP-1DAY': { climate: 'general', groups: general },
  'LAV-ANB-1D': { climate: 'coastal', groups: coastal },
  'SYD-MW-WIN': { climate: 'cold', groups: coldWeather },
  'SYD-1DAY': { climate: 'general', groups: general },
  'SYD-INFLU-3H': { climate: 'general', groups: general },
}

export function getPackingGuide(tripCode: string): PackingGuide {
  return PACKING_GUIDES[tripCode.toUpperCase()] ?? { climate: 'general', groups: general }
}
