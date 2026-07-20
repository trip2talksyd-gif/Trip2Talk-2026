/** Per-trip prep-page video, hosted in the `trip-photos` Storage bucket under /VDO.
 * Not every trip has one yet — getTripVideoUrl returns null until a file is uploaded
 * for that destination, and the page simply hides the video block in that case. */

const STORAGE_VIDEO_BASE =
  'https://bljhnelgmkulxwuhedbi.supabase.co/storage/v1/object/public/trip-photos/VDO'

const TRIP_VIDEO_FILE: Record<string, string> = {
  ULU: 'Uluru.mp4',
}

export function getTripVideoUrl(tripCode: string): string | null {
  const prefix = tripCode.split('-')[0]?.toUpperCase() ?? ''
  const file = TRIP_VIDEO_FILE[prefix]
  return file ? `${STORAGE_VIDEO_BASE}/${file}` : null
}

/** Hero/cover video shown at the top of the Trip Detail page instead of the static
 * photo, for destinations that have one. Falls back to the photo hero otherwise. */
const TRIP_COVER_VIDEO_FILE: Record<string, string> = {
  NZ: 'NZ/NZ02.mp4',
}

export function getTripCoverVideoUrl(tripCode: string): string | null {
  const prefix = tripCode.split('-')[0]?.toUpperCase() ?? ''
  const file = TRIP_COVER_VIDEO_FILE[prefix]
  return file ? `${STORAGE_VIDEO_BASE}/${file}` : null
}
