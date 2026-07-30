/**
 * Simulates a stale installed PWA and verifies the one-shot force-clear.
 * Run: npx vite preview --port 4173 & node scripts/_verify-pwa-update.mjs
 */
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = join(process.cwd(), 'dist')
const PORT = 4177

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
}

function serveDist() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let path = (req.url || '/').split('?')[0]
      if (path === '/') path = '/index.html'
      // SPA fallback for navigations without file extension
      let file = join(ROOT, path)
      if (!existsSync(file) || statSync(file).isDirectory()) {
        file = join(ROOT, 'index.html')
      }
      try {
        const body = readFileSync(file)
        res.writeHead(200, {
          'Content-Type': MIME[extname(file)] || 'application/octet-stream',
          'Cache-Control': 'no-cache',
        })
        res.end(body)
      } catch {
        res.writeHead(404)
        res.end('missing')
      }
    })
    server.listen(PORT, () => resolve(server))
  })
}

const server = await serveDist()
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
const page = await context.newPage()

const results = {}

// --- Fresh load: force-clear should fire once then settle ---
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2500)
results.afterFirstLoad = await page.evaluate(async () => ({
  forceKey: localStorage.getItem('t2t_sw_force_clear_v3'),
  regs: (await navigator.serviceWorker.getRegistrations()).length,
  caches: (await caches.keys()).length,
  hasRoot: !!document.getElementById('root')?.childNodes.length,
}))

// --- Simulate stale install: clear key, plant fake SW + caches ---
await page.evaluate(async () => {
  localStorage.removeItem('t2t_sw_force_clear_v3')
  await caches.open('workbox-precache-v2-STALE-SUMMER-2025')
  const cache = await caches.open('pages-cache')
  await cache.put(
    '/',
    new Response('<html><body>STALE_SUMMER_2025</body></html>', {
      headers: { 'Content-Type': 'text/html' },
    }),
  )
})

// Register a minimal SW via blob (same origin)
const swRegistered = await page.evaluate(async () => {
  const src = `
    self.addEventListener('install', (e) => self.skipWaiting());
    self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
    self.addEventListener('fetch', (e) => {
      // intentionally do nothing special
    });
  `
  const blob = new Blob([src], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  try {
    await navigator.serviceWorker.register(url, { scope: '/' })
    await navigator.serviceWorker.ready
    return true
  } catch (e) {
    return String(e)
  }
})
results.staleSetup = {
  swRegistered,
  ...(await page.evaluate(async () => ({
    forceKey: localStorage.getItem('t2t_sw_force_clear_v3'),
    regs: (await navigator.serviceWorker.getRegistrations()).length,
    caches: await caches.keys(),
  }))),
}

// Reload — index.html one-shot should clear everything and set key
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3000)
results.afterStaleReload = await page.evaluate(async () => ({
  forceKey: localStorage.getItem('t2t_sw_force_clear_v3'),
  regs: (await navigator.serviceWorker.getRegistrations()).length,
  caches: await caches.keys(),
  bodyHasStale: document.body?.innerText?.includes('STALE_SUMMER_2025') ?? false,
}))

// Second reload — must NOT clear again (key already set); no loop
const beforeRegs = results.afterStaleReload.regs
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)
results.afterSecondReload = await page.evaluate(async () => ({
  forceKey: localStorage.getItem('t2t_sw_force_clear_v3'),
  regs: (await navigator.serviceWorker.getRegistrations()).length,
}))

results.noLoop = results.afterSecondReload.forceKey === '1'
results.clearedStaleCache =
  Array.isArray(results.afterStaleReload.caches) &&
  !results.afterStaleReload.caches.includes('workbox-precache-v2-STALE-SUMMER-2025')
results.htmlHasForceClear = readFileSync(join(ROOT, 'index.html'), 'utf8').includes(
  't2t_sw_force_clear_v3',
)
results.swHasNewSupabase = readFileSync(join(ROOT, 'sw.js'), 'utf8').includes(
  'bljhnelgmkulxwuhedbi',
)
results.swHasOldSupabase = readFileSync(join(ROOT, 'sw.js'), 'utf8').includes(
  'xwdtjwzjkqunewxjpimm',
)
results.swHasBoundToURL = readFileSync(join(ROOT, 'sw.js'), 'utf8').includes(
  'createHandlerBoundToURL',
)

console.log(JSON.stringify(results, null, 2))

await browser.close()
server.close()
process.exit(
  results.clearedStaleCache &&
    results.noLoop &&
    results.htmlHasForceClear &&
    results.swHasNewSupabase &&
    !results.swHasOldSupabase &&
    !results.swHasBoundToURL
    ? 0
    : 1,
)
