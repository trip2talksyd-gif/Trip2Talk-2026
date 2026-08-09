import {
  GALLERY_PHOTOS,
  TRIP_GALLERY_CATEGORY,
  type GalleryCategory,
  type GalleryPhoto,
} from './galleryPhotos'
import { CAMERA_SETTINGS } from './photoGuideContent'

export type DiscoverChip = 'all' | 'aurora' | 'portrait' | 'nature'

export type DiscoverSpot = {
  id: string
  photo: GalleryPhoto
  titleEn: string
  titleTh: string
  location: string
  goldenHourEn: string
  goldenHourTh: string
  fStop: string
  iso: string
  rating: number
  tripCode: string
  chip: Exclude<DiscoverChip, 'all'>
  timeOfDayEn: string
  timeOfDayTh: string
}

const CATEGORY_TRIP: Partial<Record<GalleryCategory, string>> = {
  'new-zealand': 'NZ-6D5N',
  tasmania: 'TAS-3D2N',
  outback: 'ULU-4D3N',
  sydney: 'SYD-1DAY',
  melbourne: 'MEL-4D3N',
  bermagui: 'BER-3D2N',
  nsw: 'CAN-2D1N',
}

const CATEGORY_CHIP: Record<GalleryCategory, Exclude<DiscoverChip, 'all'>> = {
  'new-zealand': 'nature',
  tasmania: 'aurora',
  outback: 'nature',
  sydney: 'portrait',
  melbourne: 'portrait',
  bermagui: 'portrait',
  nsw: 'nature',
}

type CameraRow = (typeof CAMERA_SETTINGS)[number]
type SceneKey = (typeof CAMERA_SETTINGS)[number]['sceneEn']

/** Per-photo lighting tags — gallery captions alone were too generic (every Uluru
 *  shot reused one trip title + one category-default “Morning golden hour”). */
const SCENE_BY_PHOTO_ID: Partial<Record<string, SceneKey>> = {
  'ulu-001': 'Night sky / stars',
  'ulu-002': 'Blue hour',
  'ulu-003': 'Evening golden hour',
  'ulu-004': 'Morning golden hour',
  'ulu-005': 'Blue hour',
  'ulu-006': 'Evening golden hour',
  'ulu-007': 'Morning golden hour',
  'ulu-008': 'Evening golden hour',
  'ulu-009': 'Night sky / stars',
  'ulu-010': 'Midday / harsh sun',
  'ulu-011': 'Midday / harsh sun',
  'ulu-012': 'Midday / harsh sun',
  'tas-002': 'Evening golden hour',
  'nz-001': 'Evening golden hour',
}

const CATEGORY_SCENE_POOL: Record<GalleryCategory, SceneKey[]> = {
  tasmania: ['Aurora Australis', 'Night sky / stars', 'Blue hour', 'Evening golden hour'],
  outback: [
    'Morning golden hour',
    'Evening golden hour',
    'Blue hour',
    'Night sky / stars',
    'Midday / harsh sun',
  ],
  sydney: ['Evening golden hour', 'Blue hour', 'Morning golden hour'],
  melbourne: ['Evening golden hour', 'Blue hour', 'Morning golden hour'],
  bermagui: ['Evening golden hour', 'Morning golden hour', 'Blue hour'],
  'new-zealand': ['Evening golden hour', 'Morning golden hour', 'Blue hour', 'Aurora Australis'],
  nsw: ['Morning golden hour', 'Evening golden hour', 'Blue hour'],
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 997
  return h
}

function cameraForPhoto(photo: GalleryPhoto): CameraRow {
  const forced = SCENE_BY_PHOTO_ID[photo.id]
  if (forced) {
    return CAMERA_SETTINGS.find((s) => s.sceneEn === forced) ?? CAMERA_SETTINGS[0]
  }
  const pool = CATEGORY_SCENE_POOL[photo.category]
  const pick = pool[hashId(photo.id) % pool.length]
  return CAMERA_SETTINGS.find((s) => s.sceneEn === pick) ?? CAMERA_SETTINGS[0]
}

function ratingFromId(id: string): number {
  return Math.round((4.6 + (hashId(id) % 5) * 0.1) * 10) / 10
}

function tripForCategory(category: GalleryCategory): string {
  const exact = Object.entries(TRIP_GALLERY_CATEGORY).find(([, c]) => c === category)
  return exact?.[0] ?? CATEGORY_TRIP[category] ?? 'TAS-3D2N'
}

function shortTimeLabel(sceneEn: string, sceneTh: string): { en: string; th: string } {
  // Nearby cards show a compact tag (Sunrise / Blue hour), not the full camera-guide title.
  if (sceneEn.startsWith('Morning')) return { en: 'Sunrise', th: 'พระอาทิตย์ขึ้น' }
  if (sceneEn.startsWith('Evening')) return { en: 'Golden hour', th: 'แสงทอง' }
  if (sceneEn.startsWith('Blue')) return { en: 'Blue hour', th: 'ฟ้าคราม' }
  if (sceneEn.startsWith('Night') || sceneEn.startsWith('Milky'))
    return { en: 'Night', th: 'กลางคืน' }
  if (sceneEn.startsWith('Aurora')) return { en: 'Aurora', th: 'ออโรร่า' }
  if (sceneEn.startsWith('Midday')) return { en: 'Daylight', th: 'กลางวัน' }
  return { en: sceneEn, th: sceneTh }
}

function toSpot(photo: GalleryPhoto): DiscoverSpot {
  const cam = cameraForPhoto(photo)
  const chip = CATEGORY_CHIP[photo.category]
  const time = shortTimeLabel(cam.sceneEn, cam.sceneTh)
  return {
    id: photo.id,
    photo,
    titleEn: photo.caption_en,
    titleTh: photo.caption_th,
    location: photo.location,
    goldenHourEn: cam.sceneEn,
    goldenHourTh: cam.sceneTh,
    fStop: cam.f,
    iso: cam.iso,
    rating: ratingFromId(photo.id),
    tripCode: tripForCategory(photo.category),
    chip,
    timeOfDayEn: time.en,
    timeOfDayTh: time.th,
  }
}

/** Round-robin across categories so Nearby isn’t 12 identical Uluru trip titles in a row. */
function interleaveByCategory(photos: GalleryPhoto[]): GalleryPhoto[] {
  const buckets = new Map<GalleryCategory, GalleryPhoto[]>()
  for (const p of photos) {
    const list = buckets.get(p.category) ?? []
    list.push(p)
    buckets.set(p.category, list)
  }
  const queues = [...buckets.values()].map((list) => [...list])
  const out: GalleryPhoto[] = []
  let progress = true
  while (progress) {
    progress = false
    for (const q of queues) {
      const next = q.shift()
      if (next) {
        out.push(next)
        progress = true
      }
    }
  }
  return out
}

/** Curated Discover feed from existing gallery + camera-guide settings (no mock photos).
 *  Photo Spot Library detail lives in photoSpotsApi / photo_spots — keep this slicer stable. */
export function getDiscoverSpots(): DiscoverSpot[] {
  // Prefer Storage-hosted photos so thumb transforms work; keep a stable order.
  const preferred = GALLERY_PHOTOS.filter((p) => Boolean(p.url))
  const pool = preferred.length > 0 ? preferred : GALLERY_PHOTOS
  return interleaveByCategory(pool).map(toSpot)
}

export function getMasterpiece(spots: DiscoverSpot[]): DiscoverSpot | null {
  if (spots.length === 0) return null
  // Prefer a strong NZ / Tasmania landscape as the hero card.
  return (
    spots.find((s) => s.photo.id === 'nz-001') ??
    spots.find((s) => s.photo.category === 'new-zealand') ??
    spots.find((s) => s.photo.category === 'tasmania') ??
    spots[0]
  )
}

export function filterDiscoverSpots(spots: DiscoverSpot[], chip: DiscoverChip): DiscoverSpot[] {
  if (chip === 'all') return spots
  return spots.filter((s) => s.chip === chip)
}

/** Nearby row first-paint page size (~12 cards after Masterpiece). */
export const DISCOVER_NEARBY_PAGE_SIZE = 12

/** Soft cap for total Discover cards considered on first paint (hero + nearby). */
export const DISCOVER_INITIAL_FEED_CAP = 15

export type DiscoverPageSlice = {
  items: DiscoverSpot[]
  hasMore: boolean
  nextOffset: number
}

/** Slice a spot list for Nearby pagination / lazy-append. */
export function sliceDiscoverSpots(
  spots: DiscoverSpot[],
  offset: number,
  limit: number = DISCOVER_NEARBY_PAGE_SIZE,
): DiscoverPageSlice {
  const safeOffset = Math.max(0, offset)
  const safeLimit = Math.max(1, limit)
  const items = spots.slice(safeOffset, safeOffset + safeLimit)
  const nextOffset = safeOffset + items.length
  return {
    items,
    hasMore: nextOffset < spots.length,
    nextOffset,
  }
}
