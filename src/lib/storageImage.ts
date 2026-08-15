/**
 * Resize public Supabase Storage images via `/render/image/` (WebP).
 *
 * Raw `/object/public/` URLs are served with `Cache-Control: no-cache` and
 * include full-resolution JPEGs plus multi-MB PNGs. Transforms are typically
 * tens–hundreds of KB with `max-age=3600`, so repeat visits within an hour
 * reuse the browser cache instead of re-downloading originals.
 *
 * Idempotent: already-transformed render URLs are rewritten to the requested size.
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
  /** Fallback `src` for heroes — 1920 covers ~1280 CSS px at 1.5x and most 2x layouts. */
  hero: { width: 1920, quality: 70, format: 'webp' as const },
  lightbox: { width: 1920, quality: 72, format: 'webp' as const },
}

/** Responsive transform widths. Browser picks via `srcset` + `sizes` + DPR. */
export const STORAGE_SRCSET = {
  hero: [960, 1440, 1920],
  album: [720, 1200, 1600],
  lightbox: [1280, 1600, 1920],
} as const

export const STORAGE_SIZES = {
  /** Trip detail / calendar / slideshow inside `max-w-[1280px]` (full-bleed on mobile). */
  hero: '(min-width: 768px) min(1200px, calc(100vw - 80px)), 100vw',
  /** Home picker, category panels, spot story hero. */
  fullBleed: '100vw',
  /** Three-up category columns on md+. */
  third: '(min-width: 768px) 33vw, 100vw',
  /** About hero — half column on lg. */
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

export function storageImageSrc(
  url: string | null | undefined,
  opts: StorageImageOpts,
): string {
  const src = url?.trim() ?? ''
  if (!src || src.startsWith('data:')) return src

  const parsed = publicStoragePath(src)
  if (!parsed) return src

  const width = opts.width
  const quality = opts.quality ?? 70
  const format = opts.format ?? 'webp'
  const resize = opts.resize ?? 'contain'
  return `${parsed.origin}${RENDER_PUBLIC}${parsed.path}?width=${width}&quality=${quality}&resize=${resize}&format=${format}`
}

export function storageImageSrcSet(
  url: string | null | undefined,
  widths: readonly number[],
  opts: Omit<StorageImageOpts, 'width'> = {},
): string {
  const src = url?.trim() ?? ''
  if (!src || src.startsWith('data:')) return ''
  return widths
    .map((width) => `${storageImageSrc(src, { ...opts, width })} ${width}w`)
    .join(', ')
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
  const widths = STORAGE_SRCSET[kind]
  const quality = kind === 'lightbox' || kind === 'album' ? 72 : 70
  const fallback = widths[widths.length - 1] ?? STORAGE_IMG.hero.width
  return {
    src: storageImageSrc(url, { width: fallback, quality, format: 'webp' }),
    srcSet: storageImageSrcSet(url, widths, { quality, format: 'webp' }),
    sizes,
  }
}
