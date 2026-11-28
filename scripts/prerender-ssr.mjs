/**
 * After the client build and `vite build --ssr`, render public routes with
 * renderToString and write dist/<route>/index.html. No browser.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const STATIC = ['/', '/trips', '/pricing', '/gallery', '/calendar', '/about', '/line-guide']

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

function upsertMeta(html, attr, key, content) {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`)
  if (re.test(html)) return html.replace(re, tag)
  return html.replace('</head>', `    ${tag}\n  </head>`)
}

function applyHead(template, head) {
  let html = template
  if (head.title) html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(head.title)}</title>`)
  if (head.description) html = upsertMeta(html, 'name', 'description', head.description)
  if (head.canonical) {
    const link = `<link rel="canonical" href="${escapeAttr(head.canonical)}" />`
    if (/<link rel="canonical"[^>]*>/.test(html)) html = html.replace(/<link rel="canonical"[^>]*>/, link)
    else html = html.replace('</head>', `    ${link}\n  </head>`)
    html = upsertMeta(html, 'property', 'og:url', head.canonical)
  }
  if (head.title) {
    html = upsertMeta(html, 'property', 'og:title', head.title)
    html = upsertMeta(html, 'name', 'twitter:title', head.title)
  }
  if (head.description) {
    html = upsertMeta(html, 'property', 'og:description', head.description)
    html = upsertMeta(html, 'name', 'twitter:description', head.description.slice(0, 160))
  }
  if (head.image) {
    html = upsertMeta(html, 'property', 'og:image', head.image)
    html = upsertMeta(html, 'name', 'twitter:image', head.image)
  }
  if (head.noindex) html = upsertMeta(html, 'name', 'robots', 'noindex')
  const blocks = (head.jsonLd ?? [])
    .map((block) => `<script type="application/ld+json" id="${block.id}">${block.json}</script>`)
    .join('')
  if (blocks) html = html.replace('</head>', `    ${blocks}\n  </head>`)
  return html
}

function outFile(routePath) {
  if (routePath === '/') return path.join(dist, 'index.html')
  return path.join(dist, routePath.replace(/^\//, ''), 'index.html')
}

function sydneyToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

async function activeRows() {
  const env = loadEnv('production', root, '')
  const url = env.VITE_SUPABASE_URL?.trim()
  const key = env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) {
    throw new Error('prerender: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required. Refusing to ship empty pages.')
  }
  const res = await fetch(`${url}/rest/v1/tours?select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  if (!res.ok) {
    throw new Error(`prerender: Supabase tours fetch failed (${res.status}). Refusing to ship empty pages.`)
  }
  const rows = await res.json()
  if (!Array.isArray(rows)) throw new Error('prerender: tours response was not a list')
  const today = sydneyToday()
  const active = rows.filter((row) => {
    const status = String(row.status ?? '').toLowerCase()
    const departure = String(row.departure_date ?? row.next_date ?? '')
    if (!['confirmed', 'published', 'active'].includes(status)) return false
    if (!/^\d{4}-\d{2}-\d{2}/.test(departure)) return false
    return departure.slice(0, 10) >= today
  })
  if (active.length === 0) {
    throw new Error('prerender: no active trips returned from Supabase. Refusing to ship empty pages.')
  }
  return active
}

async function main() {
  const rows = await activeRows()
  const template = readFileSync(path.join(dist, 'index.html'), 'utf8')
  const serverEntry = pathToFileURL(path.join(dist, 'server', 'entry-server.js')).href
  const { render } = await import(serverEntry)
  const paths = [...STATIC, ...rows.map((row) => `/trips/${encodeURIComponent(String(row.trip_code))}`)]
  const ordered = [...new Set(paths.filter((p) => p !== '/')), '/']
  for (const routePath of ordered) {
    const { html, head } = render(routePath, rows)
    if (!html.includes('<h1')) throw new Error(`prerender: no h1 for ${routePath}`)
    if (!head.title || !head.canonical) throw new Error(`prerender: missing head tags for ${routePath}`)
    const page = applyHead(template, head).replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    const file = outFile(routePath)
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, page)
    console.log(`prerendered ${routePath}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
