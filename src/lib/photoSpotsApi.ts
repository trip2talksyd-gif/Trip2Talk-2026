import { PHOTO_SPOTS_DRAFT, findDraftPhotoSpot, type DroneAllowed, type PhotoSpotRow } from '../data/photoSpotsDraft'
import { GALLERY_PHOTOS, photoSrc, photoThumbSrc, type GalleryPhoto } from '../data/galleryPhotos'
import { supabase } from './supabase'

export type { DroneAllowed, PhotoSpotRow }

export type PhotoSpotDetail = PhotoSpotRow & {
  photo: GalleryPhoto | null
  heroSrc: string | null
  thumbSrc: string | null
  mapsUrl: string | null
}

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

function parseDroneAllowed(value: unknown): DroneAllowed {
  const s = strOrNull(value)
  if (s === 'allowed' || s === 'restricted' || s === 'prohibited') return s
  return 'restricted'
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
  return {
    id,
    slug,
    title_en,
    title_th,
    location_en,
    location_th,
    latitude: numOrNull(raw.latitude),
    longitude: numOrNull(raw.longitude),
    google_maps_url: strOrNull(raw.google_maps_url),
    best_time_morning: strOrNull(raw.best_time_morning),
    best_time_evening: strOrNull(raw.best_time_evening),
    best_time_night: strOrNull(raw.best_time_night),
    access_private_car: strOrNull(raw.access_private_car) ?? '',
    access_public_transport: strOrNull(raw.access_public_transport),
    gear_landscape: strOrNull(raw.gear_landscape),
    gear_portrait: strOrNull(raw.gear_portrait),
    drone_allowed: parseDroneAllowed(raw.drone_allowed),
    drone_notes: strOrNull(raw.drone_notes),
    linked_trip_code: strOrNull(raw.linked_trip_code),
    photo_id: strOrNull(raw.photo_id),
    rating: ratingRaw ?? 4.8,
    sort_order: numOrNull(raw.sort_order) ?? 0,
    created_at: strOrNull(raw.created_at) ?? undefined,
    updated_at: strOrNull(raw.updated_at) ?? undefined,
  }
}

function galleryForPhotoId(photoId: string | null): GalleryPhoto | null {
  if (!photoId) return null
  return GALLERY_PHOTOS.find((p) => p.id === photoId) ?? null
}

export function mapsUrlForSpot(row: Pick<PhotoSpotRow, 'google_maps_url' | 'latitude' | 'longitude'>): string | null {
  if (row.google_maps_url) return row.google_maps_url
  if (row.latitude != null && row.longitude != null) {
    return `https://maps.google.com/?q=${row.latitude},${row.longitude}`
  }
  return null
}

export function mergePhotoSpot(row: PhotoSpotRow): PhotoSpotDetail {
  const photo = galleryForPhotoId(row.photo_id)
  return {
    ...row,
    photo,
    heroSrc: photo ? photoSrc(photo) : null,
    thumbSrc: photo
      ? photoThumbSrc(photo, { width: 960, quality: 72, format: 'webp' })
      : null,
    mapsUrl: mapsUrlForSpot(row),
  }
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

    return rows.map(mergePhotoSpot)
  } catch (err) {
    logSupabaseError('fetchPhotoSpots', err)
    return PHOTO_SPOTS_DRAFT.map(mergePhotoSpot)
  }
}

/**
 * Resolve /discover/spot/:id by uuid, slug, or gallery photo_id.
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
