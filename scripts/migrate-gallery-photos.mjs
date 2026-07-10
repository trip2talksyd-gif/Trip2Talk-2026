/**
 * Migrate PHOTOS from V4 PhotoFeedFull.jsx → V5 galleryPhotos.ts
 * Source: C:\Users\Saen Man\Downloads\PhotoFeedFull.jsx
 */
import fs from 'node:fs'
import vm from 'node:vm'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE = 'C:/Users/Saen Man/Downloads/PhotoFeedFull.jsx'
const OUT = path.join(__dirname, '../src/data/galleryPhotos.ts')

const DEST_MAP = {
  NZ: 'new-zealand',
  TAS: 'tasmania',
  AUS: 'nsw',
  SYD: 'sydney',
}

function parsePhotos(content) {
  const start = content.indexOf('const PHOTOS = [')
  let depth = 0
  let end = start
  for (let i = start + 'const PHOTOS = '.length; i < content.length; i++) {
    if (content[i] === '[') depth++
    else if (content[i] === ']') {
      depth--
      if (depth === 0) {
        end = i + 1
        break
      }
    }
  }
  const arrCode = content.slice(start, end)
  const sandbox = {}
  vm.runInNewContext(`${arrCode}; this.PHOTOS = PHOTOS;`, sandbox)
  return sandbox.PHOTOS
}

function escapeTs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

const content = fs.readFileSync(SOURCE, 'utf8')
const photos = parsePhotos(content)

const counts = { 'new-zealand': 0, tasmania: 0, nsw: 0, sydney: 0 }
const entries = []

photos.forEach((p, idx) => {
  let captionEn = p.en || ''
  let captionTh = p.th || captionEn
  let location = p.loc || captionEn
  let category = DEST_MAP[p.dest] || 'nsw'

  // Fix mislabeled Church of Good Shepherd → Camel Rock, Bermagui NSW
  if (/Church of Good Shepherd/i.test(captionEn) || /Church of Good Shepherd/i.test(location)) {
    captionEn = 'Camel Rock, Bermagui NSW'
    captionTh = 'Camel Rock · Bermagui NSW — โขดหินอายุ 470 ล้านปี'
    location = 'Camel Rock · Bermagui NSW'
    category = 'nsw'
  }

  const prefix = category === 'new-zealand' ? 'nz' : category === 'tasmania' ? 'tas' : category === 'sydney' ? 'syd' : 'nsw'
  counts[category]++

  entries.push({
    id: `${prefix}-${String(idx + 1).padStart(3, '0')}`,
    base64: p.src,
    category,
    caption_en: captionEn,
    caption_th: captionTh,
    location,
  })
})

const photoBlocks = entries
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

const output = `export type GalleryCategory = 'new-zealand' | 'tasmania' | 'nsw' | 'sydney'

export interface GalleryPhoto {
  id: string
  base64: string
  category: GalleryCategory
  caption_th: string
  caption_en: string
  location: string
}

/** Migrated from V4 PhotoFeedFull.jsx (${photos.length} photos) */
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

export function photoSrc(photo: GalleryPhoto): string {
  if (photo.base64.startsWith('data:')) return photo.base64
  return \`data:image/jpeg;base64,\${photo.base64}\`
}
`

fs.writeFileSync(OUT, output, 'utf8')
console.log('Wrote', OUT)
console.log('Counts:', counts)
console.log('Total:', entries.length)
