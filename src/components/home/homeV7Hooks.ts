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

function isUpcoming(t: Tour, today: string): boolean {
  if (!t.departure_date) return true
  return t.departure_date.slice(0, 10) >= today
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
        const today = new Date().toISOString().slice(0, 10)
        setTours(sortToursForListing(rows.filter((t) => isUpcoming(t, today))))
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
