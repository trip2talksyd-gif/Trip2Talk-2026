/** Public site origin. Apex redirects to www. */
export const SITE_ORIGIN = 'https://www.trip2talk.com.au'

export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/brand/trip2talk-og.jpg`

export function canonicalUrl(path: string): string {
  const clean = path.split('?')[0]?.split('#')[0] ?? '/'
  if (clean === '/' || clean === '') return `${SITE_ORIGIN}/`
  return `${SITE_ORIGIN}${clean.startsWith('/') ? clean : `/${clean}`}`
}
