/**
 * Writes public/sitemap.xml and public/llms.txt before Vite copies `public/` into dist.
 * Active trips: published/confirmed/active, with a departure date that has not passed in Sydney.
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://www.trip2talk.com.au'

const STATIC = [
  { path: '/', priority: '1.0' },
  { path: '/trips', priority: '0.9' },
  { path: '/pricing', priority: '0.7' },
  { path: '/gallery', priority: '0.7' },
  { path: '/calendar', priority: '0.6' },
  { path: '/about', priority: '0.6' },
  { path: '/discover', priority: '0.5' },
  { path: '/photo-guide', priority: '0.4' },
  { path: '/line-guide', priority: '0.4' },
]

function sydneyToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function str(value) {
  if (value == null) return ''
  return String(value).trim()
}

function activeTrips(rows, today) {
  return rows
    .map((row) => {
      const departure = str(row.departure_date) || str(row.next_date)
      const price = Number(row.price_aud ?? row.price_standard)
      return {
        code: str(row.trip_code),
        name: str(row.name_en) || str(row.trip_code),
        status: str(row.status).toLowerCase(),
        departure,
        price: Number.isFinite(price) ? price : 0,
        updated: str(row.updated_at) || str(row.created_at),
      }
    })
    .filter((trip) => {
      if (!trip.code) return false
      if (!['confirmed', 'published', 'active'].includes(trip.status)) return false
      if (!/^\d{4}-\d{2}-\d{2}/.test(trip.departure)) return false
      return trip.departure.slice(0, 10) >= today
    })
    .sort((a, b) => a.departure.localeCompare(b.departure))
}

function xmlEscape(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function main() {
  const env = loadEnv('production', root, '')
  const url = env.VITE_SUPABASE_URL?.trim()
  const key = env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) throw new Error('generate-public-seo: missing Supabase env')

  const res = await fetch(`${url}/rest/v1/tours?select=*`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  if (!res.ok) throw new Error(`generate-public-seo: tours ${res.status}`)
  const trips = activeTrips(await res.json(), sydneyToday())
  const today = sydneyToday()

  const urls = [
    ...STATIC.map((item) => ({ loc: `${ORIGIN}${item.path === '/' ? '/' : item.path}`, lastmod: today, priority: item.priority })),
    ...trips.map((trip) => ({
      loc: `${ORIGIN}/trips/${encodeURIComponent(trip.code)}`,
      lastmod: trip.updated.slice(0, 10) || today,
      priority: '0.8',
    })),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url><loc>${xmlEscape(item.loc)}</loc><lastmod>${item.lastmod}</lastmod><priority>${item.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>
`
  const lines = [
    '# Trip2Talk',
    '',
    'Trip2Talk runs small-group photo trips in Australia and New Zealand for up to 6 guests, with a professional photographer leading and driving.',
    `Website: ${ORIGIN}/`,
    '',
    '## Open trips',
    ...trips.map((trip) => {
      const price = trip.price > 0 ? `from AUD ${trip.price}` : 'price on the trip page'
      return `- [${trip.name}](${ORIGIN}/trips/${encodeURIComponent(trip.code)}) — ${price}, departs ${trip.departure.slice(0, 10)}`
    }),
    '',
    '## How to book',
    `- See dates and prices: ${ORIGIN}/trips and ${ORIGIN}/pricing`,
    '- Message: https://m.me/TriptoTalk',
    '- Email: trip2talksyd@gmail.com',
    '- Phone: +61 452 044 382',
    '- A deposit holds a seat. Card, Afterpay, and PayID are on the booking page.',
    '',
  ]
  writeFileSync(path.join(root, 'public', 'sitemap.xml'), sitemap)
  writeFileSync(path.join(root, 'public', 'llms.txt'), lines.join('\n'))
  console.log(`seo files: ${trips.length} trips`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
