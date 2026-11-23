export const PHOTO_SCOPE_VERSION = '2026-11-v1'

export const DELIVERY = {
  highlightsDays: 3,
  fullAlbumDays: 30,
  confirmed: false,
} as const

export const PHOTO_DELIVERY_PENDING = {
  th: 'ระยะเวลาส่งภาพจะแจ้งในอีเมลยืนยันการจอง',
  en: 'Delivery timeline will be confirmed in your booking email',
} as const

export function formatPhotoDelivery(
  delivery: { highlightsDays: number; fullAlbumDays: number; confirmed: boolean },
  lang: 'th' | 'en',
): string {
  if (!delivery.confirmed) return PHOTO_DELIVERY_PENDING[lang]
  if (lang === 'th') {
    return `ส่งภาพ: ไฮไลต์ภายใน ${delivery.highlightsDays} วัน · อัลบั้มเต็มภายใน ${delivery.fullAlbumDays} วัน`
  }
  return `Delivery: highlights within ${delivery.highlightsDays} days · full album within ${delivery.fullAlbumDays} days`
}

/** Customer-facing delivery line. Days stay hidden until DELIVERY.confirmed is true. */
export function photoDeliveryLine(lang: 'th' | 'en'): string {
  return formatPhotoDelivery(DELIVERY, lang)
}

export function requiresPhotoScopeAck(): boolean {
  return true
}

/** One column until md (768px), so a 375px screen stacks. */
export const PHOTO_SCOPE_CARD_CLASS =
  'grid grid-cols-1 gap-4 rounded-2xl border border-line bg-cream p-4 md:grid-cols-2'

export const PHOTO_SCOPE_POLICY = {
  th: {
    title: 'ขอบเขตการถ่ายภาพในทริป',
    paragraphs: [
      'ช่างภาพถ่ายให้ที่จุดถ่ายรูปตามแผนแต่ละวัน ไม่ได้ตามถ่ายตลอด 24 ชั่วโมง',
      'ช่างภาพถ่ายให้: ภาพที่จุดถ่ายรูปตามแผนแต่ละวัน · ภาพเดี่ยวรายท่าน · ภาพกลุ่ม · ภาพโปรไฟล์',
      'เวลาส่วนตัว (ไม่รวมในการถ่าย): ช่วงเดินทางในรถ · มื้ออาหาร · เวลาพักที่ที่พัก',
      'ต้องการภาพเพิ่ม แจ้งช่างภาพ ณ จุดนั้น',
    ],
  },
  en: {
    title: 'Photography scope on the trip',
    paragraphs: [
      "Our photographer shoots at the planned photo spots each day — not 24/7 coverage.",
      'Included: photos at each day\'s planned spots · individual portraits · group photos · profile photos',
      'Personal time (not covered): time in the vehicle · meals · rest time at the accommodation',
      'Want extra shots? Just ask the photographer at the spot.',
    ],
  },
} as const
