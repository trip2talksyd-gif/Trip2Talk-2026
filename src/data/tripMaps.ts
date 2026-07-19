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
    center: '-44.35,169.65',
    zoom: 7,
    markers:
      '-43.5320,172.6306,lightblue1|-45.0312,168.6626,lightblue1|-44.6414,167.9256,orange1',
    path: 'color:0xe2734add|weight:4|-43.5320,172.6306|-45.0312,168.6626|-44.6414,167.9256',
    caption: {
      en: 'Christchurch → Queenstown → Milford Sound',
      th: 'ไครสต์เชิร์ช → ควีนส์ทาวน์ → มิลฟอร์ดซาวด์',
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
