/** Static OpenStreetMap preview per trip (no API key). Fallback handled in UI via onerror. */

export type TripMapConfig = {
  center: string
  zoom: number
  markers: string
  path?: string
  caption: { en: string; th: string }
  fallbackSeed: string
}

const MAPS: Record<string, TripMapConfig> = {
  NZ: {
    // Flights land in Queenstown only — no Christchurch leg on any NZ trip,
    // so the route (and the Google Maps embed built from these markers)
    // must start at Queenstown, not Christchurch.
    center: '-44.84,168.29',
    zoom: 8,
    markers: '-45.0312,168.6626,orange1|-44.6414,167.9256,lightblue1',
    path: 'color:0xe2734add|weight:4|-45.0312,168.6626|-44.6414,167.9256',
    caption: {
      en: 'Queenstown → Milford Sound',
      th: 'ควีนส์ทาวน์ → มิลฟอร์ดซาวด์',
    },
    fallbackSeed: 'nz-route-map',
  },
  TAS: {
    center: '-42.0,146.8',
    zoom: 7,
    markers: '-41.4332,147.1441,lightblue1|-42.8821,147.3272,orange1',
    path: 'color:0xe2734add|weight:4|-41.4332,147.1441|-42.8821,147.3272',
    caption: {
      en: 'Launceston → Hobart',
      th: 'ลอนเซสตัน → โฮบาร์ต',
    },
    fallbackSeed: 'tas-route-map',
  },
  ULU: {
    center: '-25.3444,131.0369',
    zoom: 9,
    markers: '-25.3444,131.0369,orange1|-25.3545,130.7370,lightblue1',
    caption: {
      en: 'Uluru → Kata Tjuta',
      th: 'อูลูรู → คาตาจูตา',
    },
    fallbackSeed: 'ulu-route-map',
  },
  SYD: {
    center: '-33.8688,151.2093',
    zoom: 11,
    markers: '-33.8568,151.2153,orange1|-33.8915,151.2767,lightblue1',
    caption: {
      en: 'Sydney Harbour · Bondi',
      th: 'ท่าเรือซิดนีย์ · บอนได',
    },
    fallbackSeed: 'syd-route-map',
  },
  MEL: {
    center: '-38.3,143.5',
    zoom: 7,
    markers: '-37.8136,144.9631,lightblue1|-38.6700,143.1000,orange1',
    path: 'color:0xe2734add|weight:4|-37.8136,144.9631|-38.6700,143.1000',
    caption: {
      en: 'Melbourne → Great Ocean Road',
      th: 'เมลเบิร์น → เกรทโอเชียนโรด',
    },
    fallbackSeed: 'mel-route-map',
  },
}

export function getTripMap(tripCode: string): TripMapConfig {
  const prefix = tripCode.split('-')[0]?.toUpperCase() ?? ''
  return (
    MAPS[prefix] ?? {
      center: '-25.2744,133.7751',
      zoom: 4,
      markers: '-25.2744,133.7751,orange1',
      caption: { en: 'Australia & New Zealand', th: 'ออสเตรเลียและนิวซีแลนด์' },
      fallbackSeed: 'aus-route-map',
    }
  )
}

export function staticMapUrl(cfg: TripMapConfig, size = '760x285'): string {
  const params = new URLSearchParams({
    center: cfg.center,
    zoom: String(cfg.zoom),
    size,
    maptype: 'mapnik',
    markers: cfg.markers,
  })
  if (cfg.path) params.set('path', cfg.path)
  return `https://staticmap.openstreetmap.de/staticmap.php?${params.toString()}`
}

export function staticMapFallback(cfg: TripMapConfig): string {
  return `https://picsum.photos/seed/${cfg.fallbackSeed}/760/285`
}

function parseMarkerPoints(markers: string): { lat: number; lng: number }[] {
  return markers
    .split('|')
    .map((entry) => entry.split(','))
    .filter(([lat, lng]) => lat !== undefined && lng !== undefined)
    .map(([lat, lng]) => ({ lat: Number(lat), lng: Number(lng) }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
}

/**
 * Real, interactive Google Maps embed — no API key needed (uses the classic
 * maps.google.com?output=embed iframe form, not the paid Embed API). Two
 * markers renders an actual driving route between them; one marker (or none)
 * just centers on the point/region.
 */
export function googleMapsEmbedUrl(cfg: TripMapConfig): string {
  const points = parseMarkerPoints(cfg.markers)

  if (points.length >= 2) {
    const [start, end] = points
    return `https://maps.google.com/maps?saddr=${start.lat},${start.lng}&daddr=${end.lat},${end.lng}&output=embed`
  }

  if (points.length === 1) {
    return `https://maps.google.com/maps?q=${points[0].lat},${points[0].lng}&z=${cfg.zoom}&output=embed`
  }

  return `https://maps.google.com/maps?q=${cfg.center}&z=${cfg.zoom}&output=embed`
}
