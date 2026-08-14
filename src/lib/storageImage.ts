/**
 * Resize public Supabase Storage images via `/render/image/` (WebP).
 *
 * Raw `/object/public/` URLs are served with `Cache-Control: no-cache` and
 * include full-resolution JPEGs plus multi-MB PNGs. Transforms are typically
 * 20–150KB with `max-age=3600`, so repeat visits within an hour reuse the
 * browser cache instead of re-downloading originals.
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
  hero: { width: 1200, quality: 70, format: 'webp' as const },
  lightbox: { width: 1600, quality: 72, format: 'webp' as const },
}

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
