/**
 * Generates PWA icon PNGs from SVG — run: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
mkdirSync(publicDir, { recursive: true })

const BRAND = '#1a7a4a'

function svg(size, maskable = false) {
  const pad = maskable ? Math.round(size * 0.12) : 0
  const inner = size - pad * 2
  const fontSize = Math.round(inner * 0.28)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BRAND}"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui,sans-serif" font-weight="700" font-size="${fontSize}" fill="#ffffff">T2T</text>
</svg>`
}

async function png(size, filename, maskable = false) {
  const buf = await sharp(Buffer.from(svg(size, maskable))).png().toBuffer()
  writeFileSync(join(publicDir, filename), buf)
  console.log('Wrote', filename)
}

await png(192, 'icon-192.png')
await png(512, 'icon-512.png')
await png(512, 'icon-512-maskable.png', true)
await png(180, 'apple-touch-icon.png')

const favicon = await sharp(Buffer.from(svg(32))).png().toBuffer()
writeFileSync(join(publicDir, 'favicon.ico'), favicon)
console.log('Wrote favicon.ico')
