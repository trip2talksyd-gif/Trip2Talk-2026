/**
 * Public Supabase Storage image URLs.
 *
 * Free plan does not include Storage Image Transformations (`/render/image/`).
 * These helpers always return the original `/object/public/` URL. Size/quality
 * options are kept on the API so callers do not need to change; they are ignored.
 */

export type StorageImageOpts = {
  width: number
  quality?: number
  format?: 'webp' | 'origin'
  resize?: 'contain' | 'cover'
}

export const STORAGE_IMG = {
  avatar: { width: 96, quality: 70, format: 'webp' as const },
  thumb: { width: 320, quality: 68, format: 'webp' as const },
  card: { width: 720, quality: 70, format: 'webp' as const },
  album: { width: 960, quality: 72, format: 'webp' as const },
  hero: { width: 1920, quality: 70, format: 'webp' as const },
  lightbox: { width: 1920, quality: 72, format: 'webp' as const },
}

/** Kept for callers; transforms are not applied on Free plan. */
export const STORAGE_SRCSET = {
  hero: [960, 1440, 1920],
  album: [720, 1200, 1600],
  lightbox: [1280, 1600, 1920],
} as const

export const STORAGE_SIZES = {
  hero: '(min-width: 768px) min(1200px, calc(100vw - 80px)), 100vw',
  fullBleed: '100vw',
  third: '(min-width: 768px) 33vw, 100vw',
  half: '(min-width: 1024px) 50vw, 100vw',
  album: '(min-width: 768px) min(42rem, 70vw), 88vw',
  lightbox: '100vw',
} as const

export type StorageSrcsetKind = keyof typeof STORAGE_SRCSET
export type StorageSizesKind = keyof typeof STORAGE_SIZES

const OBJECT_PUBLIC = '/storage/v1/object/public/'
const RENDER_PUBLIC = '/storage/v1/render/image/public/'

function publicStoragePath(src: string): { origin: string; path: string } | null {
  for (const marker of [OBJECT_PUBLIC, RENDER_PUBLIC] as const) {
    const idx = src.indexOf(marker)
    if (idx === -1) continue
    const origin = src.slice(0, idx)
    const rest = src.slice(idx + marker.length)
    const path = rest.split('?')[0] ?? ''
    if (!origin || !path) return null
    return { origin, path }
  }
  return null
}

/** Plain public object URL. `opts` are unused (no transforms on Free plan). */
export function storageImageSrc(
  url: string | null | undefined,
  _opts?: StorageImageOpts,
): string {
  const src = url?.trim() ?? ''
  if (!src || src.startsWith('data:')) return src

  const parsed = publicStoragePath(src)
  if (!parsed) return src

  return `${parsed.origin}${OBJECT_PUBLIC}${parsed.path}`
}

/** No srcset on Free plan — callers can still spread attrs. */
export function storageImageSrcSet(
  _url?: string | null,
  _widths?: readonly number[],
  _opts?: Omit<StorageImageOpts, 'width'>,
): string {
  return ''
}

const DEFAULT_SIZES: Record<StorageSrcsetKind, string> = {
  hero: STORAGE_SIZES.hero,
  album: STORAGE_SIZES.album,
  lightbox: STORAGE_SIZES.lightbox,
}

export function storageImageAttrs(
  url: string | null | undefined,
  kind: StorageSrcsetKind,
  sizes: string = DEFAULT_SIZES[kind],
): { src: string; srcSet: string; sizes: string } {
  return {
    src: storageImageSrc(url),
    srcSet: '',
    sizes,
  }
}
