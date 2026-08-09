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

function cameraForCategory(category: GalleryCategory): CameraRow {
  if (category === 'tasmania') {
    return CAMERA_SETTINGS.find((s) => s.sceneEn.toLowerCase().includes('aurora')) ?? CAMERA_SETTINGS[0]
  }
  if (category === 'sydney' || category === 'bermagui' || category === 'melbourne') {
    return CAMERA_SETTINGS.find((s) => s.sceneEn.includes('Evening golden')) ?? CAMERA_SETTINGS[0]
  }
  if (category === 'outback') {
    return CAMERA_SETTINGS.find((s) => s.sceneEn.includes('Morning golden')) ?? CAMERA_SETTINGS[0]
  }
  return CAMERA_SETTINGS.find((s) => s.sceneEn.includes('Evening golden')) ?? CAMERA_SETTINGS[0]
}

function ratingFromId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 17
  return Math.round((4.6 + (h % 5) * 0.1) * 10) / 10
}

function tripForCategory(category: GalleryCategory): string {
  const exact = Object.entries(TRIP_GALLERY_CATEGORY).find(([, c]) => c === category)
  return exact?.[0] ?? CATEGORY_TRIP[category] ?? 'TAS-3D2N'
}

function toSpot(photo: GalleryPhoto): DiscoverSpot {
  const cam = cameraForCategory(photo.category)
  const chip = CATEGORY_CHIP[photo.category]
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
    timeOfDayEn: cam.sceneEn,
    timeOfDayTh: cam.sceneTh,
  }
}

/** Curated Discover feed from existing gallery + camera-guide settings (no mock photos). */
export function getDiscoverSpots(): DiscoverSpot[] {
  // Prefer Storage-hosted photos so thumb transforms work; keep a stable order.
  const preferred = GALLERY_PHOTOS.filter((p) => Boolean(p.url))
  const pool = preferred.length > 0 ? preferred : GALLERY_PHOTOS
  return pool.map(toSpot)
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
