/**
 * One-shot PWA icons + iOS splash screens (sharp).
 * Run: node scripts/generate-pwa-assets.mjs
 */
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const splashDir = join(publicDir, 'splash')
const BG = '#16262b'
const badge = join(publicDir, 'brand', 'trip2talk-badge.png')
const maskableSrc = join(publicDir, 'icon-512-maskable.png')
const appleSrc = join(publicDir, 'apple-touch-icon.png')

mkdirSync(splashDir, { recursive: true })

async function splash({ w, h, name }) {
  const logo = Math.round(Math.min(w, h) * 0.22)
  const buf = await sharp(badge).resize(logo, logo, { fit: 'contain' }).png().toBuffer()
  const left = Math.round((w - logo) / 2)
  const top = Math.round((h - logo) / 2)
  await sharp({
    create: { width: w, height: h, channels: 3, background: BG },
  })
    .composite([{ input: buf, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(join(splashDir, name))
}

await sharp(maskableSrc)
  .resize(192, 192)
  .png()
  .toFile(join(publicDir, 'icon-192-maskable.png'))

await sharp(appleSrc).resize(152, 152).png().toFile(join(publicDir, 'apple-touch-icon-152.png'))
await sharp(appleSrc).resize(120, 120).png().toFile(join(publicDir, 'apple-touch-icon-120.png'))

const splashes = [
  { w: 1290, h: 2796, name: 'apple-splash-1290x2796.png' },
  { w: 1179, h: 2556, name: 'apple-splash-1179x2556.png' },
  { w: 1170, h: 2532, name: 'apple-splash-1170x2532.png' },
  { w: 1284, h: 2778, name: 'apple-splash-1284x2778.png' },
  { w: 1125, h: 2436, name: 'apple-splash-1125x2436.png' },
  { w: 1242, h: 2688, name: 'apple-splash-1242x2688.png' },
  { w: 828, h: 1792, name: 'apple-splash-828x1792.png' },
  { w: 750, h: 1334, name: 'apple-splash-750x1334.png' },
  { w: 1242, h: 2208, name: 'apple-splash-1242x2208.png' },
]

for (const s of splashes) await splash(s)
console.log('Wrote maskable 192, apple-touch 120/152, and', splashes.length, 'splash screens')
