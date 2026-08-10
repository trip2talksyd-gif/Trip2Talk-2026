import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PhotoSpotDetail } from '../../lib/photoSpotsApi'

const TEAL = '#122f2a'
const ORANGE = '#e6935a'

function pinIcon(featured: boolean) {
  const color = featured ? ORANGE : TEAL
  return L.divIcon({
    className: 't2t-spot-pin',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);
      background:${color};box-shadow:0 6px 14px rgba(0,0,0,.28);
      display:flex;align-items:center;justify-content:center;
    "><span style="transform:rotate(45deg);font-size:12px;line-height:1;color:#fff">◎</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

type Props = {
  spots: PhotoSpotDetail[]
  selectedId: string | null
  onSelect: (spot: PhotoSpotDetail) => void
  className?: string
}

export default function SpotsMap({ spots, selectedId, onSelect, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
    }).setView([-34.4, 150.9], 8)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    const withCoords = spots.filter(
      (s): s is PhotoSpotDetail & { latitude: number; longitude: number } =>
        s.latitude != null && s.longitude != null,
    )

    for (const spot of withCoords) {
      const marker = L.marker([spot.latitude, spot.longitude], {
        icon: pinIcon(spot.is_featured || spot.id === selectedId),
        title: spot.title_en,
      })
      marker.on('click', () => onSelectRef.current(spot))
      marker.addTo(map)
      markersRef.current.set(spot.id, marker)
    }

    if (withCoords.length === 1) {
      map.setView([withCoords[0].latitude, withCoords[0].longitude], 11)
    } else if (withCoords.length > 1) {
      const bounds = L.latLngBounds(withCoords.map((s) => [s.latitude, s.longitude]))
      // AU + NZ spans the Tasman — keep maxZoom low enough that both island groups stay in frame with pins visible.
      const lngSpan = Math.abs(bounds.getEast() - bounds.getWest())
      const maxZoom = lngSpan > 25 ? 5 : 10
      map.fitBounds(bounds.pad(0.18), { animate: false, maxZoom })
    }
  }, [spots, selectedId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedId) return
    const spot = spots.find((s) => s.id === selectedId)
    if (spot?.latitude != null && spot.longitude != null) {
      map.panTo([spot.latitude, spot.longitude], { animate: true })
    }
  }, [selectedId, spots])

  return (
    <div className={className}>
      <div ref={containerRef} className="h-full w-full rounded-[18px] overflow-hidden bg-teal-soft" />
      <style>{`
        .t2t-spot-pin { background: transparent; border: 0; }
        .leaflet-container { font: inherit; background: #e3ece8; }
      `}</style>
    </div>
  )
}
