/**
 * After `vite build`, render public routes in a headless browser and write
 * the settled HTML into dist/ so crawlers see text and head tags without
 * executing JavaScript. The same script tags stay in the file, so the SPA
 * still boots with createRoot.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const port = 4179
const origin = `http://127.0.0.1:${port}`

const STATIC_PATHS = ['/', '/trips', '/pricing', '/gallery', '/calendar', '/about']

/** Trip links the public /trips page actually renders (same catalog as the site). */
async function tripPathsFromListing(page: import('@playwright/test').Page): Promise<string[]> {
  await page.goto(`${origin}/trips`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForSelector('h1', { timeout: 25000 })
  await page.waitForTimeout(1200)
  const hrefs = await page.$$eval('a[href^="/trips/"]', (els) =>
    els
      .map((el) => el.getAttribute('href') ?? '')
      .filter((href) => /^\/trips\/[^/]+$/.test(href)),
  )
  return [...new Set(hrefs)]
}

function outFile(routePath: string): string {
  if (routePath === '/') return path.join(dist, 'index.html')
  return path.join(dist, routePath.replace(/^\//, ''), 'index.html')
}

function waitForPreview(child: ChildProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('prerender: vite preview did not start')), 30000)
    const onData = (buf: Buffer) => {
      const text = buf.toString()
      if (text.includes('Local:') || text.includes(`${port}`)) {
        clearTimeout(timer)
        resolve()
      }
    }
    child.stdout?.on('data', onData)
    child.stderr?.on('data', onData)
    child.on('exit', (code) => {
      clearTimeout(timer)
      reject(new Error(`prerender: vite preview exited ${code}`))
    })
  })
}

async function main() {
  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
  const child = spawn(process.execPath, [viteBin, 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  try {
    await waitForPreview(child)
    const browser = await chromium.launch()
    const page = await browser.newPage()
    await page.route('**/sw.js', (route) => route.abort())
    await page.route('**/registerSW.js', (route) => route.abort())
    const tripPaths = await tripPathsFromListing(page)
    if (tripPaths.length === 0) throw new Error('prerender: /trips listed no trip links')
    const unique = [...new Set([...STATIC_PATHS, ...tripPaths])]
    for (const routePath of unique) {
      await page.goto(`${origin}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await page.waitForSelector('h1', { timeout: 25000 })
      await page.waitForTimeout(400)
      const html = await page.content()
      if (!html.includes('<h1')) throw new Error(`prerender: no h1 for ${routePath}`)
      const file = outFile(routePath)
      mkdirSync(path.dirname(file), { recursive: true })
      writeFileSync(file, html)
      console.log(`prerendered ${routePath}`)
    }
    await browser.close()
  } finally {
    child.kill()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
