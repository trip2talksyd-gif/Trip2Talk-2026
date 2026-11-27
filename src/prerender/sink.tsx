import { createContext } from 'react'
import type { Tour } from '../types/tour'

/** Filled during renderToString. Null in the browser. */
export type HeadSink = {
  title?: string
  description?: string
  canonical?: string
  image?: string
  noindex?: boolean
  jsonLd: { id: string; json: string }[]
}

export const HeadSinkContext = createContext<HeadSink | null>(null)

/** Tours fetched at build time. Null in the browser, so pages still load from Supabase. */
export const PrerenderToursContext = createContext<Tour[] | null>(null)
