import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const src = 'public/brand/trip2talk-logo-source.png'
const outDir = 'public'
const brandDir = 'public/brand'
fs.mkdirSync(brandDir, { recursive: true })

const meta = await sharp(src).metadata()
console.log('source', meta.width, meta.height, meta.format, meta.size)

const trimmed = await sharp(src).trim({ threshold: 8 }).png().toBuffer()
const tMeta = await sharp(trimmed).metadata()
const side = Math.max(tMeta.width ?? 0, tMeta.height ?? 0)
const squared = await sharp(trimmed)
  .resize(side, side, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

async function circlePng(input, size) {
  const resized = await sharp(input)
    .resize(size, size, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { data, info } = resized
  const cx = (info.width - 1) / 2
  const cy = (info.height - 1) / 2
  const r = Math.min(cx, cy)
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const dx = x - cx
      const dy = y - cy
      const i = (y * info.width + x) * 4
      if (dx * dx + dy * dy > r * r) data[i + 3] = 0
    }
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer()
}

const master512 = await circlePng(squared, 512)
await sharp(master512)
  .png({ compressionLevel: 9 })
  .toFile(path.join(brandDir, 'trip2talk-badge.png'))
await sharp(master512).webp({ quality: 88 }).toFile(path.join(brandDir, 'trip2talk-badge.webp'))

await sharp(src)
  .resize(1200, 1200, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 1 } })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(path.join(brandDir, 'trip2talk-og.jpg'))

const sizes = [
  { file: 'favicon-16.png', size: 16 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
]
for (const { file, size } of sizes) {
  const buf = await circlePng(squared, size)
  if (size <= 32) {
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .composite([{ input: buf, gravity: 'centre' }])
      .png()
      .toFile(path.join(outDir, file))
  } else {
    await sharp(buf).png({ compressionLevel: 9 }).toFile(path.join(outDir, file))
  }
}

const maskableInner = await circlePng(squared, Math.round(512 * 0.72))
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 22, g: 38, b: 43, alpha: 1 },
  },
})
  .composite([{ input: maskableInner, gravity: 'centre' }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(outDir, 'icon-512-maskable.png'))

await sharp(path.join(outDir, 'favicon-32.png'))
  .resize(32, 32)
  .toFile(path.join(outDir, 'favicon.ico'))

const report = []
for (const f of [
  'brand/trip2talk-logo-source.png',
  'brand/trip2talk-badge.png',
  'brand/trip2talk-badge.webp',
  'brand/trip2talk-og.png',
  'favicon-16.png',
  'favicon-32.png',
  'favicon.ico',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-512-maskable.png',
]) {
  const st = fs.statSync(path.join(outDir, f))
  report.push(`${f}: ${(st.size / 1024).toFixed(1)} KB`)
}
console.log(report.join('\n'))
