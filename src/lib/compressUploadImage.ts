/** Client-side resize + WebP encode before Storage upload (Free plan has no image transforms). */

export type UploadImagePreset = 'hero' | 'cover' | 'gallery'

type PresetConfig = {
  maxEdge: number
  quality: number
  maxBytes: number
}

export const UPLOAD_IMAGE_PRESETS: Record<UploadImagePreset, PresetConfig> = {
  /** Full-bleed / photo-spot hero */
  hero: { maxEdge: 1920, quality: 0.78, maxBytes: 2 * 1024 * 1024 },
  /** Trip card cover + social/content photos */
  cover: { maxEdge: 1200, quality: 0.78, maxBytes: 1.5 * 1024 * 1024 },
  /** Gallery / thumbnail */
  gallery: { maxEdge: 800, quality: 0.72, maxBytes: 1 * 1024 * 1024 },
}

const SOURCE_MAX_BYTES = 15 * 1024 * 1024
const MIN_QUALITY = 0.45
const QUALITY_STEP = 0.08
const SHRINK_STEP = 0.85
const MAX_ATTEMPTS = 10

export type CompressedUploadImage = {
  blob: Blob
  contentType: 'image/webp' | 'image/jpeg'
  ext: 'webp' | 'jpg'
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality)
  })
}

async function encodeCanvas(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<CompressedUploadImage | null> {
  const webp = await canvasToBlob(canvas, 'image/webp', quality)
  if (webp && webp.size > 0) {
    return { blob: webp, contentType: 'image/webp', ext: 'webp' }
  }
  const jpeg = await canvasToBlob(canvas, 'image/jpeg', quality)
  if (jpeg && jpeg.size > 0) {
    return { blob: jpeg, contentType: 'image/jpeg', ext: 'jpg' }
  }
  return null
}

function drawToCanvas(
  bitmap: ImageBitmap,
  maxEdge: number,
): HTMLCanvasElement {
  const longest = Math.max(bitmap.width, bitmap.height)
  const scale = longest > maxEdge ? maxEdge / longest : 1
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not compress image')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  return canvas
}

/**
 * Resize longest edge + re-encode WebP (JPEG fallback).
 * If still over the preset cap, quality then dimensions are reduced until it fits.
 */
export async function compressUploadImage(
  file: File,
  preset: UploadImagePreset,
): Promise<CompressedUploadImage> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    throw new Error('File must be a photo (JPEG, PNG, WebP, or HEIC)')
  }
  if (file.size > SOURCE_MAX_BYTES) {
    throw new Error('Image must be under 15 MB before compression')
  }

  const cfg = UPLOAD_IMAGE_PRESETS[preset]
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('Could not read this image — try JPEG or PNG')
  }

  try {
    let maxEdge = cfg.maxEdge
    let quality = cfg.quality

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const canvas = drawToCanvas(bitmap, maxEdge)
      const encoded = await encodeCanvas(canvas, quality)
      if (!encoded) throw new Error('Could not compress image')
      if (encoded.blob.size <= cfg.maxBytes) return encoded

      if (quality - QUALITY_STEP >= MIN_QUALITY) {
        quality = Math.round((quality - QUALITY_STEP) * 100) / 100
      } else {
        quality = MIN_QUALITY
        maxEdge = Math.max(480, Math.round(maxEdge * SHRINK_STEP))
      }
    }

    throw new Error(
      `Compressed image still exceeds ${Math.round(cfg.maxBytes / (1024 * 1024))} MB — try a simpler photo`,
    )
  } finally {
    bitmap.close()
  }
}
