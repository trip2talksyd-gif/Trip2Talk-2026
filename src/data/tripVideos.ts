/**
 * Per-trip prep / cover videos — hosted on Vercel (`public/trip-videos/`),
 * NOT Supabase Storage (Cached Egress quota).
 *
 * Source masters remain in trip-photos/VDO for archival; the site only
 * references the compressed H.264 `_web.mp4` copies below.
 */

const TRIP_VIDEO_FILE: Record<string, string> = {
  ULU: '/trip-videos/Uluru_web.mp4',
}

export function getTripVideoUrl(tripCode: string): string | null {
  const prefix = tripCode.split('-')[0]?.toUpperCase() ?? ''
  return TRIP_VIDEO_FILE[prefix] ?? null
}

/** Hero/cover video on Trip Detail — falls back to static photo when null. */
const TRIP_COVER_VIDEO_FILE: Record<string, string> = {
  NZ: '/trip-videos/NZ02_web.mp4',
  TAS: '/trip-videos/Tasmania_cover_web.mp4',
}

export function getTripCoverVideoUrl(tripCode: string): string | null {
  const prefix = tripCode.split('-')[0]?.toUpperCase() ?? ''
  // Tasmania spring codes are TAS-SP / TAS-LH / TAS-3D2N — all start with TAS
  return TRIP_COVER_VIDEO_FILE[prefix] ?? null
}
