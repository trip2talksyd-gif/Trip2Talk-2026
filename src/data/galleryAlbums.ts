import type { GalleryCategory, GalleryPhoto } from './galleryPhotos'
import { GALLERY_PHOTOS } from './galleryPhotos'

export type GalleryAlbum = {
  id: GalleryCategory
  nameEn: string
  nameTh: string
  /** Short destination line under the name (e.g. AUSTRALIA) */
  placeEn: string
  placeTh: string
  taglineEn: string
  taglineTh: string
  hero: GalleryPhoto
  photoCount: number
}

const ALBUM_META: Record<
  GalleryCategory,
  {
    nameEn: string
    nameTh: string
    placeEn: string
    placeTh: string
    taglineEn: string
    taglineTh: string
    /** Prefer this photo id as the carousel hero when present */
    preferId?: string
  }
> = {
  outback: {
    nameEn: 'Uluru',
    nameTh: 'อุลูรู',
    placeEn: 'Northern Territory, Australia',
    placeTh: 'นอร์เทิร์นเทร์ริทอรี ออสเตรเลีย',
    taglineEn: 'Red rock, golden hour, and the clearest Milky Way',
    taglineTh: 'หินแดง แสงทอง และทางช้างเผือกที่ชัดที่สุด',
    preferId: 'ulu-001',
  },
  tasmania: {
    nameEn: 'Tasmania',
    nameTh: 'แทสเมเนีย',
    placeEn: 'Australia',
    placeTh: 'ออสเตรเลีย',
    taglineEn: 'Aurora nights, still lakes, and wild southern light',
    taglineTh: 'คืนออโรรา ทะเลสาบนิ่ง และแสงใต้สุดขั้ว',
  },
  'new-zealand': {
    nameEn: 'New Zealand',
    nameTh: 'นิวซีแลนด์',
    placeEn: 'South Island',
    placeTh: 'เกาะใต้',
    taglineEn: 'Adventure is never far away',
    taglineTh: 'การผจญภัยอยู่ใกล้แค่เอื้อม',
    preferId: 'nz-001',
  },
  melbourne: {
    nameEn: 'Melbourne',
    nameTh: 'เมลเบิร์น',
    placeEn: 'Victoria, Australia',
    placeTh: 'วิกตอเรีย ออสเตรเลีย',
    taglineEn: 'Laneways, coast light, and city golden hour',
    taglineTh: 'ซอยศิลปะ แสงชายฝั่ง และชั่วโมงทองของเมือง',
  },
  sydney: {
    nameEn: 'Sydney',
    nameTh: 'ซิดนีย์',
    placeEn: 'New South Wales, Australia',
    placeTh: 'นิวเซาท์เวลส์ ออสเตรเลีย',
    taglineEn: 'Harbour glow and weekend walk light',
    taglineTh: 'แสงอ่าวและทริปเดินเล่นวันหยุด',
  },
  nsw: {
    nameEn: 'NSW Escapes',
    nameTh: 'ทริป NSW',
    placeEn: 'New South Wales, Australia',
    placeTh: 'นิวเซาท์เวลส์ ออสเตรเลีย',
    taglineEn: 'Coast, canola fields, and day-trip frames',
    taglineTh: 'ชายฝั่ง ทุ่งคาโนลา และเฟรมทริปวันเดียว',
  },
  bermagui: {
    nameEn: 'Bermagui',
    nameTh: 'เบอร์มากุย',
    placeEn: 'NSW South Coast',
    placeTh: 'ชายฝั่งใต้ NSW',
    taglineEn: 'Quiet coast mornings and soft ocean light',
    taglineTh: 'เช้าชายฝั่งเงียบ ๆ และแสงทะเลนุ่ม',
  },
}

/** Preferred carousel order — destinations with strongest photo stories first. */
const ALBUM_ORDER: GalleryCategory[] = [
  'outback',
  'tasmania',
  'new-zealand',
  'melbourne',
  'sydney',
  'nsw',
  'bermagui',
]

/** One featured album per gallery category that has photos. */
export function getGalleryAlbums(): GalleryAlbum[] {
  const byCat = new Map<GalleryCategory, GalleryPhoto[]>()
  for (const photo of GALLERY_PHOTOS) {
    const list = byCat.get(photo.category)
    if (list) list.push(photo)
    else byCat.set(photo.category, [photo])
  }

  const albums: GalleryAlbum[] = []
  for (const id of ALBUM_ORDER) {
    const photos = byCat.get(id)
    if (!photos?.length) continue
    const meta = ALBUM_META[id]
    const preferred = meta.preferId
      ? photos.find((p) => p.id === meta.preferId)
      : undefined
    albums.push({
      id,
      nameEn: meta.nameEn,
      nameTh: meta.nameTh,
      placeEn: meta.placeEn,
      placeTh: meta.placeTh,
      taglineEn: meta.taglineEn,
      taglineTh: meta.taglineTh,
      hero: preferred ?? photos[0],
      photoCount: photos.length,
    })
  }
  return albums
}
