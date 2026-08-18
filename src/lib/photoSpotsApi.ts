import {
  PHOTO_SPOTS_DRAFT,
  PHOTO_SPOT_MAX_GALLERY,
  PHOTO_SPOT_MAX_IMAGES,
  PHOTO_SPOT_MAX_EXAMPLE_PER_ORIENTATION,
  findDraftPhotoSpot,
  tripCtaHref,
  type CameraModeSettings,
  type CameraSettings,
  type DroneAllowed,
  type ExampleShotOrientation,
  type PhotoSpotExampleShot,
  type PhotoSpotRow,
} from '../data/photoSpotsDraft'
import { GALLERY_PHOTOS, photoSrc, type GalleryPhoto } from '../data/galleryPhotos'
import { storageImageSrc, STORAGE_IMG } from './storageImage'
import { supabase } from './supabase'
import { callStaffApi } from './supabaseStaff'
import {
  compressUploadImage,
  type UploadImagePreset,
} from './compressUploadImage'

export type { CameraModeSettings, CameraSettings, DroneAllowed, ExampleShotOrientation, PhotoSpotExampleShot, PhotoSpotRow }
export { tripCtaHref, PHOTO_SPOT_MAX_EXAMPLE_PER_ORIENTATION }

export type PhotoSpotDetail = PhotoSpotRow & {
  photo: GalleryPhoto | null
  heroSrc: string | null
  thumbSrc: string | null
  mapsUrl: string | null
  tripHref: string
}

export type SpotSort = 'nearest' | 'popular' | 'newest'

function logSupabaseError(context: string, error: unknown): void {
  if (error && typeof error === 'object') {
    const e = error as { message?: string; code?: string; details?: string; hint?: string }
    console.error(
      `[photoSpotsApi] ${context}: ${e.message ?? String(error)}${e.code ? ` [${e.code}]` : ''}${
        e.details ? ` — ${e.details}` : ''
      }`,
    )
    return
  }
  console.error(`[photoSpotsApi] ${context}:`, error)
}

function strOrNull(value: unknown): string | null {
  if (value == null) return null
  const s = String(value).trim()
  return s.length ? s : null
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function boolOrFalse(value: unknown): boolean {
  return value === true || value === 'true' || value === 1
}

function parseExampleShots(value: unknown): PhotoSpotExampleShot[] {
  if (!Array.isArray(value)) return []
  const out: PhotoSpotExampleShot[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = strOrNull(o.id)
    const image_url = strOrNull(o.image_url)
    const orientation = o.orientation === 'portrait' ? 'portrait' : o.orientation === 'landscape' ? 'landscape' : null
    if (!id || !image_url || !orientation) continue
    out.push({
      id,
      spot_id: strOrNull(o.spot_id) ?? undefined,
      orientation,
      image_url,
      sort_order: numOrNull(o.sort_order) ?? 0,
      created_at: strOrNull(o.created_at) ?? undefined,
    })
  }
  return out.sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id))
}

function parseUrlList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const item of value) {
    const s = strOrNull(item)
    if (s) out.push(s)
  }
  return out.slice(0, 4)
}

function parseDroneAllowed(value: unknown): DroneAllowed {
  const s = strOrNull(value)
  if (s === 'allowed' || s === 'restricted' || s === 'prohibited') return s
  return 'restricted'
}

function parseCategories(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}

function parseModeSettings(raw: unknown): CameraModeSettings | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const aperture = strOrNull(o.aperture)
  const iso = strOrNull(o.iso)
  const shutter = strOrNull(o.shutter)
  const filter = strOrNull(o.filter)
  if (!aperture && !iso && !shutter && !filter) return null
  return { aperture, iso, shutter, filter }
}

function parseCameraSettings(value: unknown): CameraSettings {
  if (!value || typeof value !== 'object') return {}
  const o = value as Record<string, unknown>
  return {
    landscape: parseModeSettings(o.landscape),
    portrait: parseModeSettings(o.portrait),
  }
}

function parseRow(raw: Record<string, unknown>): PhotoSpotRow | null {
  const id = strOrNull(raw.id)
  const slug = strOrNull(raw.slug)
  const title_en = strOrNull(raw.title_en)
  const title_th = strOrNull(raw.title_th)
  const location_en = strOrNull(raw.location_en)
  const location_th = strOrNull(raw.location_th)
  if (!id || !slug || !title_en || !title_th || !location_en || !location_th) return null

  const ratingRaw = numOrNull(raw.rating)
  const linked = strOrNull(raw.linked_trip_code)
  const related = strOrNull(raw.related_trip_code) ?? linked

  return {
    id,
    slug,
    title_en,
    title_th,
    location_en,
    location_th,
    description_en: strOrNull(raw.description_en),
    description_th: strOrNull(raw.description_th),
    categories: parseCategories(raw.categories),
    latitude: numOrNull(raw.latitude),
    longitude: numOrNull(raw.longitude),
    google_maps_url: strOrNull(raw.google_maps_url),
    best_time: strOrNull(raw.best_time),
    best_season: strOrNull(raw.best_season),
    drive_time_from_sydney: strOrNull(raw.drive_time_from_sydney),
    best_time_morning: strOrNull(raw.best_time_morning),
    best_time_evening: strOrNull(raw.best_time_evening),
    best_time_night: strOrNull(raw.best_time_night),
    access_private_car: strOrNull(raw.access_private_car) ?? '',
    access_public_transport: strOrNull(raw.access_public_transport),
    gear_landscape: strOrNull(raw.gear_landscape),
    gear_portrait: strOrNull(raw.gear_portrait),
    camera_settings: parseCameraSettings(raw.camera_settings),
    tips_en: strOrNull(raw.tips_en),
    tips_th: strOrNull(raw.tips_th),
    warnings_en: strOrNull(raw.warnings_en),
    warnings_th: strOrNull(raw.warnings_th),
    drone_allowed: parseDroneAllowed(raw.drone_allowed),
    drone_notes: strOrNull(raw.drone_notes),
    linked_trip_code: linked ?? related,
    related_trip_code: related,
    photo_id: strOrNull(raw.photo_id),
    hero_image_url: strOrNull(raw.hero_image_url),
    thumbnail_url: strOrNull(raw.thumbnail_url),
    gallery_image_urls: parseUrlList(raw.gallery_image_urls),
    example_shots: parseExampleShots(raw.example_shots),
    video_url: strOrNull(raw.video_url),
    rating: ratingRaw ?? 0,
    sort_order: numOrNull(raw.sort_order) ?? 0,
    is_featured: boolOrFalse(raw.is_featured),
    collection_101_frames: boolOrFalse(raw.collection_101_frames),
    collection_rank: numOrNull(raw.collection_rank),
    review_notes: strOrNull(raw.review_notes),
    created_at: strOrNull(raw.created_at) ?? undefined,
    updated_at: strOrNull(raw.updated_at) ?? undefined,
  }
}

function galleryForPhotoId(photoId: string | null): GalleryPhoto | null {
  if (!photoId) return null
  return GALLERY_PHOTOS.find((p) => p.id === photoId) ?? null
}

export function mapsUrlForSpot(
  row: Pick<PhotoSpotRow, 'google_maps_url' | 'latitude' | 'longitude'>,
): string | null {
  if (row.google_maps_url) return row.google_maps_url
  if (row.latitude != null && row.longitude != null) {
    return `https://maps.google.com/?q=${row.latitude},${row.longitude}`
  }
  return null
}

/** Google Maps directions deep link for Navigate CTA (works on mobile + desktop). */
export function navigateMapsUrl(
  row: Pick<PhotoSpotRow, 'google_maps_url' | 'latitude' | 'longitude' | 'title_en'>,
): string | null {
  if (row.latitude != null && row.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${row.latitude},${row.longitude}&travelmode=driving`
  }
  return mapsUrlForSpot(row)
}

export function mergePhotoSpot(row: PhotoSpotRow): PhotoSpotDetail {
  const photo = galleryForPhotoId(row.photo_id)
  const galleryHero = photo ? photoSrc(photo) : null
  const rawHero = row.hero_image_url || galleryHero
  const rawThumb = row.thumbnail_url || rawHero
  return {
    ...row,
    photo,
    heroSrc: storageImageSrc(rawHero, STORAGE_IMG.hero) || null,
    thumbSrc: storageImageSrc(rawThumb, STORAGE_IMG.card) || null,
    mapsUrl: mapsUrlForSpot(row),
    tripHref: tripCtaHref(row),
  }
}

/**
 * Live count for the 101 Frames badge.
 * Does not query `collection_101_frames` until that column is applied
 * (`supabase/migrations/20260818100000_photo_spots_collection_101_frames.sql`).
 * Filtering on a missing column 400s in PostgREST — callers should hide the badge
 * when this returns null.
 */
export async function countCollection101Frames(): Promise<number | null> {
  return null
}

/** Prefer live Supabase rows; fall back to local draft seed when table missing/empty. */
export async function fetchPhotoSpots(): Promise<PhotoSpotDetail[]> {
  if (import.meta.env.DEV) {
    console.info('[photoSpotsApi] fetchPhotoSpots → photo_spots.select(*)')
  }
  try {
    const { data, error } = await supabase
      .from('photo_spots')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      logSupabaseError('fetchPhotoSpots', error)
      return PHOTO_SPOTS_DRAFT.map(mergePhotoSpot)
    }

    const rows = (data ?? [])
      .map((raw) => parseRow(raw as Record<string, unknown>))
      .filter((r): r is PhotoSpotRow => r != null)

    if (rows.length === 0) {
      return PHOTO_SPOTS_DRAFT.map(mergePhotoSpot)
    }

    // Skip photo_spot_example_shots until the table is live
    // (`supabase/migrations/20260818101000_photo_spot_example_shots.sql`).
    // A missing table 404s on every homepage load.

    return rows.map(mergePhotoSpot)
  } catch (err) {
    logSupabaseError('fetchPhotoSpots', err)
    return PHOTO_SPOTS_DRAFT.map(mergePhotoSpot)
  }
}

/**
 * Resolve spot by uuid, slug, or gallery photo_id.
 * Uses fetchPhotoSpots (live + draft fallback) so local preview works pre-migration.
 */
export async function fetchPhotoSpotByKey(key: string): Promise<PhotoSpotDetail | null> {
  const trimmed = key.trim().toLowerCase()
  if (!trimmed) return null

  if (import.meta.env.DEV) {
    console.info(`[photoSpotsApi] fetchPhotoSpotByKey(${trimmed})`)
  }

  const spots = await fetchPhotoSpots()
  const hit = spots.find(
    (s) =>
      s.id.toLowerCase() === trimmed ||
      s.slug.toLowerCase() === trimmed ||
      (s.photo_id != null && s.photo_id.toLowerCase() === trimmed),
  )
  if (hit) return hit

  const draft = findDraftPhotoSpot(trimmed)
  return draft ? mergePhotoSpot(draft) : null
}

/** Map gallery photo id → library slug for Nearby deep-links when a library row exists. */
export function librarySlugForGalleryPhotoId(photoId: string): string | null {
  const hit = PHOTO_SPOTS_DRAFT.find((s) => s.photo_id === photoId)
  return hit?.slug ?? null
}

const SYDNEY = { lat: -33.8688, lng: 151.2093 }

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Sort without geolocation: "nearest" = distance from Sydney CBD as a stable proxy. */
export function sortPhotoSpots(spots: PhotoSpotDetail[], sort: SpotSort): PhotoSpotDetail[] {
  const copy = [...spots]
  if (sort === 'popular') {
    return copy.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      return b.rating - a.rating || a.sort_order - b.sort_order
    })
  }
  if (sort === 'newest') {
    return copy.sort((a, b) => {
      const ta = a.created_at ? Date.parse(a.created_at) : 0
      const tb = b.created_at ? Date.parse(b.created_at) : 0
      if (tb !== ta) return tb - ta
      return a.sort_order - b.sort_order
    })
  }
  // nearest (Sydney proxy — geolocation deferred)
  return copy.sort((a, b) => {
    const da =
      a.latitude != null && a.longitude != null
        ? haversineKm(SYDNEY, { lat: a.latitude, lng: a.longitude })
        : Number.POSITIVE_INFINITY
    const db =
      b.latitude != null && b.longitude != null
        ? haversineKm(SYDNEY, { lat: b.latitude, lng: b.longitude })
        : Number.POSITIVE_INFINITY
    return da - db || a.sort_order - b.sort_order
  })
}

export function filterSpotsByCategory(
  spots: PhotoSpotDetail[],
  category: string,
): PhotoSpotDetail[] {
  const c = category.trim().toLowerCase()
  if (!c || c === 'all' || c === 'ทั้งหมด') return spots
  return spots.filter((s) => s.categories.some((x) => x.toLowerCase() === c))
}

export function badgeForSpot(spot: Pick<PhotoSpotDetail, 'categories'>): string {
  if (spot.categories.includes('Sunrise')) return 'Sunrise Spot'
  if (spot.categories.includes('Milky Way') || spot.categories.includes('Night')) return 'Night Spot'
  if (spot.categories.includes('Aurora')) return 'Aurora'
  if (spot.categories.includes('Sunset')) return 'Sunset'
  if (spot.categories.includes('Coastal')) return 'Coastal'
  return spot.categories[0] ?? 'Photo Spot'
}

// ── Staff admin (via staff-api service role) ───────────────────────────────

export type PhotoSpotAdminPayload = {
  id?: string
  slug?: string
  title_en: string
  title_th: string
  location_en: string
  location_th: string
  description_en?: string | null
  description_th?: string | null
  categories: string[]
  latitude: number
  longitude: number
  best_time?: string | null
  best_season?: string | null
  drive_time_from_sydney?: string | null
  best_time_morning?: string | null
  best_time_evening?: string | null
  best_time_night?: string | null
  access_private_car?: string
  access_public_transport?: string | null
  gear_landscape?: string | null
  gear_portrait?: string | null
  camera_settings?: CameraSettings
  tips_en?: string | null
  tips_th?: string | null
  warnings_en?: string | null
  warnings_th?: string | null
  drone_allowed?: DroneAllowed
  drone_notes?: string | null
  related_trip_code?: string | null
  hero_image_url?: string | null
  thumbnail_url?: string | null
  gallery_image_urls?: string[]
  video_url?: string | null
  is_featured?: boolean
  collection_101_frames?: boolean
  collection_rank?: number | null
  sort_order?: number
  review_notes?: string | null
}

export async function listPhotoSpotsAdmin(): Promise<PhotoSpotRow[]> {
  const data = await callStaffApi<Record<string, unknown>[]>('list_photo_spots_admin')
  return (data ?? [])
    .map((raw) => parseRow(raw))
    .filter((r): r is PhotoSpotRow => r != null)
}

export async function upsertPhotoSpot(payload: PhotoSpotAdminPayload): Promise<PhotoSpotRow> {
  if (!payload.title_en?.trim() || !payload.title_th?.trim()) {
    throw new Error('Name (EN + TH) is required')
  }
  if (!payload.categories?.length) {
    throw new Error('At least one category is required')
  }
  if (
    payload.latitude == null ||
    payload.longitude == null ||
    !Number.isFinite(payload.latitude) ||
    !Number.isFinite(payload.longitude)
  ) {
    throw new Error('Coordinates are required')
  }
  const gallery = (payload.gallery_image_urls ?? []).filter(Boolean).slice(0, PHOTO_SPOT_MAX_GALLERY)
  const hero = payload.hero_image_url?.trim() || null
  const total = (hero ? 1 : 0) + gallery.length
  if (total > PHOTO_SPOT_MAX_IMAGES) {
    throw new Error(`Maximum ${PHOTO_SPOT_MAX_IMAGES} images (1 hero + ${PHOTO_SPOT_MAX_GALLERY} gallery)`)
  }

  const data = await callStaffApi<Record<string, unknown>>('upsert_photo_spot', {
    ...payload,
    gallery_image_urls: gallery,
    hero_image_url: hero,
    thumbnail_url: payload.thumbnail_url?.trim() || hero,
  })
  const row = parseRow(data)
  if (!row) throw new Error('Invalid photo spot response')
  return row
}

export async function deletePhotoSpot(id: string): Promise<void> {
  await callStaffApi('delete_photo_spot', { id })
}

export async function upsertPhotoSpotExampleShot(payload: {
  id?: string
  spotId?: string
  orientation?: ExampleShotOrientation
  imageUrl?: string
  sortOrder?: number
}): Promise<PhotoSpotExampleShot> {
  const data = await callStaffApi<Record<string, unknown>>('upsert_photo_spot_example_shot', payload)
  const parsed = parseExampleShots([data])
  if (parsed.length === 0) throw new Error('Invalid example shot response')
  return parsed[0]
}

export async function deletePhotoSpotExampleShot(id: string): Promise<void> {
  await callStaffApi('delete_photo_spot_example_shot', { id })
}

export async function reorderPhotoSpotExampleShot(id: string, direction: 'up' | 'down'): Promise<void> {
  await callStaffApi('reorder_photo_spot_example_shot', { id, direction })
}

export type PhotoSpotUploadSlot = 'hero' | 'gallery'

const SLOT_PRESET: Record<PhotoSpotUploadSlot, UploadImagePreset> = {
  hero: 'hero',
  gallery: 'gallery',
}

export type PhotoSpotUploadPhase = 'compressing' | 'uploading'

/** Upload to public photo-spots/{uuid}/… after client-side WebP resize. */
export async function uploadPhotoSpotImage(
  file: File,
  slot: PhotoSpotUploadSlot = 'hero',
  onPhase?: (phase: PhotoSpotUploadPhase) => void,
): Promise<string> {
  onPhase?.('compressing')
  const compressed = await compressUploadImage(file, SLOT_PRESET[slot])
  onPhase?.('uploading')

  const uuid = crypto.randomUUID()
  const path = `${uuid}/${Date.now()}.${compressed.ext}`

  const { error } = await supabase.storage.from('photo-spots').upload(path, compressed.blob, {
    upsert: false,
    contentType: compressed.contentType,
    cacheControl: '31536000',
  })
  if (error) {
    logSupabaseError('uploadPhotoSpotImage', error)
    throw error
  }

  const { data } = supabase.storage.from('photo-spots').getPublicUrl(path)
  return data.publicUrl
}

export const PHOTO_SPOT_VIDEO_MAX_BYTES = 15 * 1024 * 1024

export const PHOTO_SPOT_VIDEO_TOO_LARGE =
  'Video too large — please compress before uploading (recommend under 15MB, short clips only) / วิดีโอใหญ่เกินไป กรุณาบีบอัดก่อนอัปโหลด (แนะนำไม่เกิน 15MB คลิปสั้นๆ)'

/** Upload one .mp4 as `{uuid}/{ts}_web.mp4` (no transcoding). */
export async function uploadPhotoSpotVideo(
  file: File,
  onPhase?: (phase: PhotoSpotUploadPhase) => void,
): Promise<string> {
  const name = file.name.toLowerCase()
  const isMp4 = file.type === 'video/mp4' || name.endsWith('.mp4')
  if (!isMp4) {
    throw new Error('Video must be an .mp4 file / ต้องเป็นไฟล์ .mp4 เท่านั้น')
  }
  if (file.size > PHOTO_SPOT_VIDEO_MAX_BYTES) {
    throw new Error(PHOTO_SPOT_VIDEO_TOO_LARGE)
  }

  onPhase?.('uploading')
  const uuid = crypto.randomUUID()
  const path = `${uuid}/${Date.now()}_web.mp4`

  const { error } = await supabase.storage.from('photo-spots').upload(path, file, {
    upsert: false,
    contentType: 'video/mp4',
    cacheControl: '31536000',
  })
  if (error) {
    logSupabaseError('uploadPhotoSpotVideo', error)
    throw error
  }

  const { data } = supabase.storage.from('photo-spots').getPublicUrl(path)
  return data.publicUrl
}
