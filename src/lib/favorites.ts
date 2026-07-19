const STORAGE_KEY = 'trip2talk_favorites'

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0)
  } catch {
    return []
  }
}

function writeIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]))
}

/** Favorites are stored as trip_code values (e.g. TAS-3D2N). */
export function getFavoriteTripCodes(): string[] {
  return readIds()
}

export function isFavoriteTrip(tripCode: string): boolean {
  const code = tripCode.toUpperCase()
  return readIds().some((id) => id.toUpperCase() === code)
}

export function toggleFavoriteTrip(tripCode: string): boolean {
  const code = tripCode.toUpperCase()
  const current = readIds()
  const exists = current.some((id) => id.toUpperCase() === code)
  if (exists) {
    writeIds(current.filter((id) => id.toUpperCase() !== code))
    return false
  }
  writeIds([...current, code])
  return true
}

export function removeFavoriteTrip(tripCode: string): void {
  const code = tripCode.toUpperCase()
  writeIds(readIds().filter((id) => id.toUpperCase() !== code))
}
