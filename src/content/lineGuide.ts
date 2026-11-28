/** Copy for /line-guide. Edit text here, not in the page layout. */

// TODO: set the number of days the team keeps backup files after delivery.
export const BACKUP_DAYS: number | null = null

export const LINE_GUIDE_LOGO = '/brand/trip2talk-logo-photo-circle.png'

export const LINE_GUIDE = {
  title: 'คู่มือดูและเก็บรูปทริป Trip2Talk',
  seoTitle: 'คู่มือดูและเก็บรูปทริป | Trip2Talk',
  seoDescription:
    'วิธีดูอัลบั้ม LINE ของ Trip2Talk เก็บรูปลงมือถือ และขอไฟล์ต้นฉบับสำหรับพิมพ์ครับ',
  facebookUrl: 'https://www.facebook.com/TriptoTalk',
  sections: {
    view: {
      heading: 'วิธีดูรูป',
      steps: [
        'แตะ "View album" ในแชท LINE ครับ',
        'แตะรูปเพื่อดูเต็มจอครับ',
        'ดูย้อนหลัง: กด ≡ มุมขวาบนของแชท แล้วเลือก Albums ครับ',
      ],
    },
    save: {
      heading: 'วิธีเก็บรูปลงมือถือ',
      steps: [
        'ทีละรูป: แตะรูป แล้วกดปุ่มดาวน์โหลด ⬇ มุมขวาล่างครับ',
        'ทั้งอัลบั้ม: เปิดอัลบั้ม แล้วกด ⋮ มุมขวาบน แล้วเลือก Download album ครับ',
        'รูปจะอยู่ในแอป "รูปภาพ" (iPhone) หรือ "Gallery" (Samsung) ครับ',
      ],
    },
    time: {
      heading: 'เรื่องเวลา',
      steps: [
        'อัลบั้มอยู่ในแชทตลอดครับ ขออย่าออกจากแชทหรือลบแชทครับ',
        'รีลวิดีโอที่ส่งเป็นไฟล์ในแชท กรุณาดาวน์โหลดเก็บทันทีครับ เพราะไฟล์ในแชท LINE หมดอายุได้ครับ',
      ],
    },
    print: {
      heading: 'อยากพิมพ์รูปใหญ่',
      body: 'รูปในอัลบั้มเป็นขนาดสำหรับดูในมือถือครับ ถ้าจะพิมพ์ใส่กรอบ ทักขอไฟล์ต้นฉบับครับ ทีมงานจะส่งให้ทาง Google Drive ครับ',
    },
    use: {
      heading: 'การใช้รูป',
      steps: [
        'ใช้ส่วนตัวได้เต็มที่ครับ เก็บไว้ดู ตั้งโปรไฟล์ ส่งครอบครัว หรือโพสต์ Facebook และ IG ได้ครับ',
        'ถ้าโพสต์ ฝากแท็ก Trip2Talk หรือ #Trip2Talk ครับ',
        'ใช้เชิงการค้า เช่น ขายหรือโฆษณา ขออนุญาตทีมงานก่อนครับ',
        'ทีมงานขอเลือกบางรูปไปโปรโมท Trip2Talk ครับ ถ้าไม่สะดวกแจ้งทีมงานได้ครับ ทีมงานจะไม่ใช้รูปที่เห็นหน้าคุณครับ',
      ],
    },
    like: {
      heading: 'ชอบรูปทริปไหมครับ',
      button: 'กดไลก์/ติดตามเพจ Facebook',
    },
    footer: {
      body: 'ติดปัญหา ทักแชท LINE Trip2Talk Gallery ได้เลยครับ',
      button: 'ดูทริปถัดไป',
    },
  },
} as const

export function backupDaysText(): string {
  return BACKUP_DAYS == null ? '[__]' : String(BACKUP_DAYS)
}
