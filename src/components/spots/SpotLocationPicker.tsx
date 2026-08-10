import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Props = {
  latitude: number | null
  longitude: number | null
  onChange: (lat: number, lng: number) => void
  className?: string
}

const DEFAULT_CENTER: L.LatLngExpression = [-33.8688, 151.2093]
const TEAL = '#122f2a'

function pinIcon() {
  return L.divIcon({
    className: 't2t-spot-picker-pin',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);
      background:${TEAL};box-shadow:0 6px 14px rgba(0,0,0,.28);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:12px;line-height:1;color:#fff">◎</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })
}

/** Click-to-set lat/lng map for staff Photo Spot forms. */
export default function SpotLocationPicker({
  latitude,
  longitude,
  onChange,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const hasCoords = latitude != null && longitude != null
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView(hasCoords ? [latitude, longitude] : DEFAULT_CENTER, hasCoords ? 11 : 6)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    map.on('click', (e: L.LeafletMouseEvent) => {
      onChangeRef.current(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)))
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (latitude == null || longitude == null) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }

    const latlng: L.LatLngExpression = [latitude, longitude]
    if (!markerRef.current) {
      markerRef.current = L.marker(latlng, { icon: pinIcon(), draggable: true }).addTo(map)
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current?.getLatLng()
        if (!pos) return
        onChangeRef.current(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)))
      })
    } else {
      markerRef.current.setLatLng(latlng)
    }
  }, [latitude, longitude])

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="h-56 w-full overflow-hidden rounded-xl border border-white/15 bg-teal-900/40"
        role="application"
        aria-label="Click map to set spot coordinates"
      />
      <p className="mt-1.5 text-[11px] text-cream-muted">
        Click the map (or drag the pin) to set coordinates.
      </p>
    </div>
  )
}
