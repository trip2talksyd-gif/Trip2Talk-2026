/**
 * Local draft mirror of supabase/migrations/20260809120100_photo_spots_seed_draft.sql
 * Used when the photo_spots table is not yet applied to the linked Supabase project
 * so Spot Detail can be reviewed on device before production migration.
 */

export type DroneAllowed = 'allowed' | 'restricted' | 'prohibited'

export type PhotoSpotRow = {
  id: string
  slug: string
  title_en: string
  title_th: string
  location_en: string
  location_th: string
  latitude: number | null
  longitude: number | null
  google_maps_url: string | null
  best_time_morning: string | null
  best_time_evening: string | null
  best_time_night: string | null
  access_private_car: string
  access_public_transport: string | null
  gear_landscape: string | null
  gear_portrait: string | null
  drone_allowed: DroneAllowed
  drone_notes: string | null
  linked_trip_code: string | null
  photo_id: string | null
  rating: number
  sort_order: number
  created_at?: string
  updated_at?: string
}

export const PHOTO_SPOTS_DRAFT: PhotoSpotRow[] = [
  {
    id: 'a1111111-1111-4111-8111-111111111101',
    slug: 'bombo-headland',
    title_en: 'Bombo Headland',
    title_th: 'หน้าผาหินบะซอลต์ เมือง Kiama',
    location_en: 'Kiama, NSW',
    location_th: 'เกียม่า, นิวเซาท์เวลส์',
    latitude: -34.6721,
    longitude: 150.859,
    google_maps_url: 'https://maps.google.com/?q=Bombo+Headland+Quarry,+Kiama+NSW',
    best_time_morning:
      'Sunrise 05:30–06:30 — แสงส้มทองกระทบหน้าผาโดยตรง ช่วง มี.ค.–พ.ค. คลื่นเบาที่สุด',
    best_time_evening: 'ไม่แนะนำ — หน้าผาหันทิศตะวันออก แสงเย็นไม่กระทบผิวหิน',
    best_time_night: null,
    access_private_car:
      'จอดรถที่ Bombo Quarry Car Park เดินเท้า 5 นาทีถึงจุดถ่าย พื้นเป็นหินไม่เรียบ',
    access_public_transport: 'รถไฟสาย South Coast Line ลงสถานี Kiama เดินต่อ 15 นาที',
    gear_landscape:
      'เลนส์มุมกว้าง (14–24mm), ขาตั้งกล้อง, ND filter สำหรับ Long Exposure จับจังหวะคลื่น',
    gear_portrait:
      'เลนส์ 35–50mm, ไม่จำเป็นต้องมีรีเฟล็กเตอร์ถ้าถ่ายตอนเช้า แสงนุ่มอยู่แล้ว',
    drone_allowed: 'restricted',
    drone_notes:
      'จำกัด — ตรวจกฎ CASA และพื้นที่ใกล้เคียงก่อนบิน อย่าบินเหนือคน / ใกล้คลื่นแรง',
    linked_trip_code: 'KIA-1DAY',
    photo_id: 'ber-001',
    rating: 4.9,
    sort_order: 10,
  },
  {
    id: 'a1111111-1111-4111-8111-111111111102',
    slug: 'uluru-sunset',
    title_en: 'Uluru Sunset Viewing Area',
    title_th: 'จุดชมพระอาทิตย์ตกอูลูรู',
    location_en: 'Uluru-Kata Tjuta National Park, NT',
    location_th: 'อุทยานแห่งชาติอูลูรู-กาตาจูตา, นอร์เทิร์นเทร์ริทอรี',
    latitude: -25.3444,
    longitude: 131.0369,
    google_maps_url: 'https://maps.google.com/?q=Uluru+Sunset+Viewing+Area',
    best_time_morning:
      'Sunrise ที่จุด Talinguru Nyakunytjaku ดีกว่าจุดนี้ — ดูพิกัด "Uluru Sunrise" แยก',
    best_time_evening:
      'Golden Hour 17:30–18:15 (หน้าร้อน) / 17:00–17:45 (หน้าหนาว) — หินเปลี่ยนจากส้มเป็นแดงเข้ม',
    best_time_night:
      'หลัง 20:00 ท้องฟ้ามืดสนิท — เช็คเมฆที่ BOM Radar และเช็คเฟสดวงจันทร์ที่ PhotoPills ก่อนไปเสมอ ควรเลือกคืนจันทร์แรม/ใกล้จันทร์ดับเพื่อเห็นทางช้างเผือกชัดสุด',
    access_private_car:
      'จอดที่ Sunset Viewing Car Park ในอุทยาน เดินเท้าเกือบไม่ต้องเดิน (จอดติดจุดชม)',
    access_public_transport: null,
    gear_landscape:
      'เลนส์มุมกว้าง 16–35mm, ขาตั้งกล้อง (ลมแรงตอนเย็น), โพลาไรซ์ฟิลเตอร์ตัดแสงสะท้อน',
    gear_portrait:
      'เลนส์ 85mm ถ่ายย้อนแสง silhouette กับหินอูลูรู, รีเฟล็กเตอร์สีทองช่วยเสริมแสง',
    drone_allowed: 'prohibited',
    drone_notes:
      'ห้ามเด็ดขาดตามกฎหมาย — โดรนถูกแบนในอุทยานแห่งชาติอูลูรู-กาตาจูตา มีโทษปรับ ห้ามบินโดยเด็ดขาด',
    linked_trip_code: 'ULU-4D3N',
    photo_id: 'tas-002',
    rating: 4.9,
    sort_order: 20,
  },
  {
    id: 'a1111111-1111-4111-8111-111111111103',
    slug: 'cradle-dove-lake',
    title_en: 'Cradle Mountain — Dove Lake',
    title_th: 'เครเดิลเมาน์เทน ทะเลสาบโดฟ',
    location_en: 'Cradle Mountain-Lake St Clair National Park, TAS',
    location_th: 'อุทยานแห่งชาติเครเดิลเมาน์เทน, แทสเมเนีย',
    latitude: -41.6398,
    longitude: 145.9375,
    google_maps_url: 'https://maps.google.com/?q=Dove+Lake,+Cradle+Mountain+TAS',
    best_time_morning:
      'Sunrise 06:00–07:00 (หน้าร้อน) — น้ำนิ่งสะท้อนภูเขาชัดที่สุดก่อนลมแรง',
    best_time_evening: 'Golden Hour 17:30–18:30 — แสงทองกระทบยอดเขา',
    best_time_night:
      'Aurora Australis เฉพาะคืนที่ KP Index สูง — เช็คเมฆที่ BOM Radar และเช็คเฟสดวงจันทร์ที่ PhotoPills ก่อนเสมอ (จันทร์เต็มดวงจะกลบแสงเหนือ/ใต้ให้จางลงมาก)',
    access_private_car:
      'จอดที่ Dove Lake Car Park เดินรอบทะเลสาบ 6 กม. (2 ชม.) หรือถ่ายจากจุดจอดรถได้เลยถ้าเวลาจำกัด',
    access_public_transport:
      'Cradle Mountain Shuttle Bus จากศูนย์บริการนักท่องเที่ยว (ไม่มีรถไฟ/รถเมล์ทั่วไปเข้าถึง)',
    gear_landscape: 'เลนส์มุมกว้าง 14–24mm, ขาตั้งกล้อง, เสื้อกันหนาวหนา (อากาศเปลี่ยนไวมาก)',
    gear_portrait: null,
    drone_allowed: 'restricted',
    drone_notes:
      'จำกัด — ต้องปฏิบัติตามกฎ Parks Tasmania / ขออนุญาตก่อนบินในพื้นที่อุทยาน',
    linked_trip_code: 'TAS-3D2N',
    photo_id: 'tas-107',
    rating: 4.8,
    sort_order: 30,
  },
  {
    id: 'a1111111-1111-4111-8111-111111111104',
    slug: 'helensburgh-tunnel',
    title_en: 'Helensburgh Old Railway Tunnel',
    title_th: 'อุโมงค์รถไฟร้าง เฮเลนส์เบิร์ก',
    location_en: 'Helensburgh, NSW',
    location_th: 'เฮเลนส์เบิร์ก, นิวเซาท์เวลส์',
    latitude: -34.1848,
    longitude: 150.9975,
    google_maps_url: 'https://maps.google.com/?q=Helensburgh+Tunnel+Glow+Worm',
    best_time_morning: null,
    best_time_evening: null,
    best_time_night:
      'หลังพระอาทิตย์ตก — หนอนเรืองแสง (glow worms) เห็นชัดสุดในความมืดสนิท ต้องรอตาปรับแสงอย่างน้อย 10 นาที',
    access_private_car:
      'จอดที่ลานจอดใกล้ทางเข้า เดินเท้าในป่าประมาณ 15 นาทีถึงปากอุโมงค์ พื้นดินลื่นเมื่อฝนตก',
    access_public_transport: 'รถไฟสาย South Coast Line ลงสถานี Helensburgh เดินต่อ 20 นาที',
    gear_landscape:
      'เลนส์รูรับแสงกว้าง f/1.8–f/2.8, ISO สูง 3200+, ไฟฉายส่องทางเดิน (ปิดก่อนถ่าย)',
    gear_portrait:
      'ไม่แนะนำแฟลชแรง (รบกวนหนอนเรืองแสง), ใช้ไฟนวลอ่อนหรือถ่ายแบบ silhouette แทน',
    drone_allowed: 'restricted',
    drone_notes: 'ไม่เหมาะ — อุโมงค์ปิดทึบ (enclosed space) โดรนใช้ไม่ได้ในจุดนี้',
    linked_trip_code: 'KIA-1DAY',
    photo_id: 'syd-015',
    rating: 4.7,
    sort_order: 40,
  },
]

export function findDraftPhotoSpot(key: string): PhotoSpotRow | null {
  const k = key.trim().toLowerCase()
  if (!k) return null
  return (
    PHOTO_SPOTS_DRAFT.find(
      (s) =>
        s.id.toLowerCase() === k ||
        s.slug.toLowerCase() === k ||
        (s.photo_id != null && s.photo_id.toLowerCase() === k),
    ) ?? null
  )
}
