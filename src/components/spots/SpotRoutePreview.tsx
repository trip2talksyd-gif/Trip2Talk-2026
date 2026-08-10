import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const TEAL = '#122f2a'
const ORANGE = '#e6935a'

/** Sydney CBD — default day-drive origin for NSW coastal spots. */
export const SYDNEY_CBD: L.LatLngExpression = [-33.8688, 151.2093]

const ORIGINS = {
  sydney: { labelEn: 'Sydney', labelTh: 'ซิดนีย์', latlng: SYDNEY_CBD as [number, number] },
  christchurch: {
    labelEn: 'Christchurch',
    labelTh: 'ไครสต์เชิร์ช',
    latlng: [-43.5321, 172.6362] as [number, number],
  },
  hobart: {
    labelEn: 'Hobart',
    labelTh: 'โฮบาร์ต',
    latlng: [-42.8821, 147.3272] as [number, number],
  },
  alice: {
    labelEn: 'Alice Springs',
    labelTh: 'อลิซสปริงส์',
    latlng: [-23.698, 133.8807] as [number, number],
  },
} as const

export type RouteOriginKey = keyof typeof ORIGINS | 'pin-only'

export type RouteOrigin = {
  key: RouteOriginKey
  labelEn: string
  labelTh: string
  latlng: [number, number] | null
}

/**
 * Pick a sensible indicative start point for the preview polyline.
 * Day-drive NSW → Sydney; SI NZ → Christchurch; TAS → Hobart; Uluru region → Alice Springs;
 * otherwise pin-only (no false “drive from Sydney” for flights).
 */
export function resolveRouteOrigin(opts: {
  latitude: number
  longitude: number
  locationEn?: string | null
  driveTimeFromSydney?: string | null
}): RouteOrigin {
  const { latitude: lat, longitude: lng } = opts
  const loc = (opts.locationEn ?? '').toLowerCase()
  const drive = (opts.driveTimeFromSydney ?? '').toLowerCase()
  const mentionsFlight = /flight|fly|airport|not a sydney day drive/.test(drive)

  // New Zealand (all current NZ seeds are South Island)
  if (lng >= 165 || /\bnz\b|new zealand|นิวซีแลนด์|otago|canterbury|mackenzie|wānaka|wanaka|aoraki|pukaki|tekapo/.test(loc)) {
    return { key: 'christchurch', ...ORIGINS.christchurch }
  }

  // Tasmania
  if ((lat < -40.5 && lng < 149) || /tasmania|cradle|dove lake|โฮบาร์ต|แทสเมเนีย/.test(loc)) {
    return { key: 'hobart', ...ORIGINS.hobart }
  }

  // Central Australia / Uluru–Kata Tjuta
  if (
    (lat > -28 && lng < 138) ||
    /uluru|kata tjuta|northern territory|\bnt\b|อูลูรู/.test(loc)
  ) {
    return { key: 'alice', ...ORIGINS.alice }
  }

  // Explicit multi-day / flight copy without a regional origin → pin only
  if (mentionsFlight) {
    return { key: 'pin-only', labelEn: '', labelTh: '', latlng: null }
  }

  return { key: 'sydney', ...ORIGINS.sydney }
}

function startDotIcon() {
  return L.divIcon({
    className: 't2t-route-start',
    html: `<div style="
      width:14px;height:14px;border-radius:999px;background:#fff;
      border:3px solid ${TEAL};box-shadow:0 2px 8px rgba(0,0,0,.25);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function spotPinIcon() {
  return L.divIcon({
    className: 't2t-route-spot',
    html: `<div style="
      width:24px;height:24px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);
      background:${ORANGE};box-shadow:0 4px 12px rgba(0,0,0,.28);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:10px;line-height:1;color:#fff">◎</span></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
}

type Props = {
  latitude: number
  longitude: number
  title: string
  locationEn?: string | null
  driveTimeFromSydney?: string | null
  className?: string
}

export default function SpotRoutePreview({
  latitude,
  longitude,
  title,
  locationEn,
  driveTimeFromSydney,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const origin = resolveRouteOrigin({ latitude, longitude, locationEn, driveTimeFromSydney })
  const showRoute = origin.latlng != null

  useEffect(() => {
    if (!containerRef.current) return

    const start = origin.latlng
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map)

    const spotLatLng: [number, number] = [latitude, longitude]
    L.marker(spotLatLng, { icon: spotPinIcon(), title, interactive: false }).addTo(map)

    if (start) {
      L.marker(start, {
        icon: startDotIcon(),
        title: origin.labelEn,
        interactive: false,
      }).addTo(map)

      // Indicative straight line (not turn-by-turn).
      L.polyline([start, spotLatLng], {
        color: TEAL,
        weight: 3,
        opacity: 0.75,
        dashArray: '8 8',
        lineCap: 'round',
      }).addTo(map)

      const bounds = L.latLngBounds([start, spotLatLng])
      const lngSpan = Math.abs(start[1] - longitude)
      const maxZoom = lngSpan > 20 ? 5 : lngSpan > 8 ? 7 : 9
      map.fitBounds(bounds.pad(0.28), { animate: false, maxZoom })
    } else {
      map.setView(spotLatLng, 10)
    }

    mapRef.current = map

    // Leaflet needs a tick after layout to size correctly in rounded boxes.
    const t = window.setTimeout(() => map.invalidateSize(), 80)

    return () => {
      window.clearTimeout(t)
      map.remove()
      mapRef.current = null
    }
    // origin.latlng is derived from origin.key — remount when key/coords change
  }, [latitude, longitude, title, origin.key, origin.labelEn, origin.latlng])

  const captionEn = showRoute
    ? `Indicative route from ${origin.labelEn}`
    : 'Spot location'
  const captionTh = showRoute ? `เส้นทางโดยประมาณจาก${origin.labelTh}` : 'ตำแหน่งจุดถ่ายภาพ'

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="h-[120px] w-full overflow-hidden rounded-[14px] bg-teal-soft sm:h-[140px]"
        role="img"
        aria-label={`${captionEn} to ${title}`}
      />
      <p className="mt-2 text-[11px] font-semibold text-ink-app/50">
        {captionEn}
        {driveTimeFromSydney && showRoute && origin.key === 'sydney' ? (
          <>
            {' · '}
            <span className="text-orange-deep">{driveTimeFromSydney}</span>
          </>
        ) : null}
        <span className="mx-1 opacity-35">·</span>
        <span className="font-thai font-medium">{captionTh}</span>
      </p>
      <style>{`
        .t2t-route-start, .t2t-route-spot { background: transparent; border: 0; }
        .leaflet-container { font: inherit; background: #e3ece8; }
      `}</style>
    </div>
  )
}
