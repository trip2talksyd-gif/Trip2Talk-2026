/** Shared hooks/constants for homepage v7 (kept separate for React fast refresh). */
import { useEffect, useState } from 'react'
import { useLang } from '../../hooks/useLang'
import type { Bi } from '../../data/homeContent'
import { SOCIAL_PROFILES } from '../../data/contactChannels'
import { fetchAllTours, sortToursForListing } from '../../lib/toursApi'
import type { Tour } from '../../types/tour'

export const YOUTUBE_URL =
  SOCIAL_PROFILES.find((s) => s.id === 'youtube')?.href ?? 'https://www.youtube.com/@trip2talksyd960'

/** Pick the active language string. */
export function useBi() {
  const { lang } = useLang()
  return (b: Bi) => (lang === 'th' ? b.th : b.en)
}

/** Today as YYYY-MM-DD (local). */
export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** A departure date only counts if it is today or later; past dates are treated as "ask us". */
export function upcomingDate(t: Tour, today = todayIso()): string | null {
  const d = t.departure_date?.slice(0, 10)
  return d && d >= today ? d : null
}

/**
 * Same catalog as /trips, minus duplicates: one card per trip name
 * (several dated rounds share a name), preferring the soonest upcoming round.
 * Trips with an upcoming date come first.
 */
function homeTripList(rows: Tour[]): Tour[] {
  const today = todayIso()
  const byName = new Map<string, Tour>()
  for (const t of sortToursForListing(rows)) {
    const key = (t.name_en || t.trip_code).trim().toLowerCase()
    const prev = byName.get(key)
    if (!prev) {
      byName.set(key, t)
      continue
    }
    const a = upcomingDate(prev, today)
    const b = upcomingDate(t, today)
    if ((!a && b) || (a && b && b < a)) byName.set(key, t)
  }
  const list = [...byName.values()]
  return [...list.filter((t) => upcomingDate(t, today)), ...list.filter((t) => !upcomingDate(t, today))]
}

/** Loads public catalog trips once; shared by Trips + stats. */
export function useHomeTours() {
  const [tours, setTours] = useState<Tour[] | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let cancelled = false
    fetchAllTours()
      .then((rows) => {
        if (cancelled) return
        setTours(homeTripList(rows))
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])
  return { tours, failed }
}
