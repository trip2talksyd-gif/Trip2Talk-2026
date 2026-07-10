/**
 * Compress base64 gallery photos in src/data/galleryPhotos.ts
 * - Max 1600px longest edge, JPEG quality 75–80, target ≤150KB base64 per photo
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GALLERY_FILE = path.join(__dirname, '../src/data/galleryPhotos.ts')

const MAX_EDGE = 1600
const TARGET_B64_BYTES = 150 * 1024
const INITIAL_QUALITY = 78

function escapeTs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function parsePhotos(content) {
  const blocks = [...content.matchAll(
    /\{\s*\n\s*id: '([^']+)',\s*\n\s*base64: '([^']+)',\s*\n\s*category: '([^']+)',\s*\n\s*caption_en: '([^']*)',\s*\n\s*caption_th: '([^']*)',\s*\n\s*location: '([^']*)',\s*\n\s*\}/g,
  )]
  return blocks.map((m) => ({
    id: m[1],
    base64: m[2],
    category: m[3],
    caption_en: m[4],
    caption_th: m[5],
    location: m[6],
  }))
}

function decodeBuffer(dataUri) {
  const raw = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri
  return Buffer.from(raw, 'base64')
}

async function compressPhoto(buffer) {
  let quality = INITIAL_QUALITY
  let result = await sharp(buffer)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer()

  while (result.length > TARGET_B64_BYTES * 0.75 && quality > 55) {
    quality -= 5
    result = await sharp(buffer)
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()
  }

  const dataUri = `data:image/jpeg;base64,${result.toString('base64')}`
  return { dataUri, jpegBytes: result.length, b64Bytes: dataUri.length, quality }
}

function buildFile(photos) {
  const photoBlocks = photos
    .map(
      (e) => `  {
    id: '${e.id}',
    base64: '${escapeTs(e.base64)}',
    category: '${e.category}',
    caption_en: '${escapeTs(e.caption_en)}',
    caption_th: '${escapeTs(e.caption_th)}',
    location: '${escapeTs(e.location)}',
  }`,
    )
    .join(',\n')

  return `export type GalleryCategory = 'new-zealand' | 'tasmania' | 'nsw' | 'sydney'

export interface GalleryPhoto {
  id: string
  base64: string
  category: GalleryCategory
  caption_th: string
  caption_en: string
  location: string
}

/** Gallery photos — compressed JPEG base64 (max ${MAX_EDGE}px, q${INITIAL_QUALITY}) */
export const GALLERY_PHOTOS: GalleryPhoto[] = [
${photoBlocks},
]

/** Map trip codes to gallery category for hero/thumbnail lookup */
export const TRIP_GALLERY_CATEGORY: Record<string, GalleryCategory> = {
  'NZ-6D5N': 'new-zealand',
  'TAS-3D2N': 'tasmania',
  'TAS-LH-4D3N': 'tasmania',
  'TAS-SU-4D3N': 'tasmania',
  'ULU-4D3N': 'nsw',
  'MEL-4D3N': 'nsw',
  'BER-3D2N': 'nsw',
  'CAN-2D1N': 'nsw',
  'KIA-1DAY': 'nsw',
  'PSP-1DAY': 'nsw',
  'LAV-ANB-1D': 'nsw',
  'SYD-MW-WIN': 'sydney',
  'SYD-1DAY': 'sydney',
}

export type GalleryFilter = 'all' | GalleryCategory

export function filterGalleryPhotos(filter: GalleryFilter): GalleryPhoto[] {
  if (filter === 'all') return GALLERY_PHOTOS
  return GALLERY_PHOTOS.filter((p) => p.category === filter)
}

export function getHeroPhotoForTrip(tripCode: string): GalleryPhoto | undefined {
  const category = TRIP_GALLERY_CATEGORY[tripCode.toUpperCase()]
  if (!category) return GALLERY_PHOTOS[0]
  return GALLERY_PHOTOS.find((p) => p.category === category)
}

const _photoSrcCache = new Map<string, string>()

export function photoSrc(photo: GalleryPhoto): string {
  const cached = _photoSrcCache.get(photo.id)
  if (cached) return cached
  const src = photo.base64.startsWith('data:')
    ? photo.base64
    : \`data:image/jpeg;base64,\${photo.base64}\`
  _photoSrcCache.set(photo.id, src)
  return src
}
`
}

const content = fs.readFileSync(GALLERY_FILE, 'utf8')
const beforeBytes = fs.statSync(GALLERY_FILE).size
const photos = parsePhotos(content)

console.log(`Found ${photos.length} photos. Compressing…`)

const compressed = []
for (const photo of photos) {
  const input = decodeBuffer(photo.base64)
  const beforeJpeg = input.length
  const { dataUri, jpegBytes, b64Bytes, quality } = await compressPhoto(input)
  compressed.push({ ...photo, base64: dataUri })
  console.log(
    `  ${photo.id}: ${Math.round(beforeJpeg / 1024)}KB → ${Math.round(jpegBytes / 1024)}KB JPEG, ${Math.round(b64Bytes / 1024)}KB base64 (q${quality})`,
  )
}

fs.writeFileSync(GALLERY_FILE, buildFile(compressed), 'utf8')
const afterBytes = fs.statSync(GALLERY_FILE).size

console.log('\nDone.')
console.log(`  galleryPhotos.ts: ${Math.round(beforeBytes / 1024)}KB → ${Math.round(afterBytes / 1024)}KB`)
console.log(`  Saved: ${Math.round((beforeBytes - afterBytes) / 1024)}KB (${Math.round((1 - afterBytes / beforeBytes) * 100)}%)`)
