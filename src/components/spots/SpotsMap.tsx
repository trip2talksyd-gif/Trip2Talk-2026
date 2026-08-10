import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PhotoSpotDetail } from '../../lib/photoSpotsApi'

const TEAL = '#122f2a'
const ORANGE = '#e6935a'

function pinIcon(featured: boolean, selected: boolean) {
  const color = selected || featured ? ORANGE : TEAL
  const size = selected ? 34 : 28
  return L.divIcon({
    className: 't2t-spot-pin',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);
      background:${color};box-shadow:0 6px 14px rgba(0,0,0,.28);
      display:flex;align-items:center;justify-content:center;
      transition:transform .15s ease;
    "><span style="transform:rotate(45deg);font-size:${selected ? 14 : 12}px;line-height:1;color:#fff">◎</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
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
  const spotsByIdRef = useRef<Map<string, PhotoSpotDetail>>(new Map())
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

  // Pins track the filtered list only (keeps map ↔ list in sync).
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()
    spotsByIdRef.current = new Map(spots.map((s) => [s.id, s]))

    const withCoords = spots.filter(
      (s): s is PhotoSpotDetail & { latitude: number; longitude: number } =>
        s.latitude != null && s.longitude != null,
    )

    for (const spot of withCoords) {
      const marker = L.marker([spot.latitude, spot.longitude], {
        icon: pinIcon(spot.is_featured, spot.id === selectedId),
        title: spot.title_en,
      })
      marker.on('click', () => {
        const latest = spotsByIdRef.current.get(spot.id) ?? spot
        onSelectRef.current(latest)
      })
      marker.addTo(map)
      markersRef.current.set(spot.id, marker)
    }

    if (withCoords.length === 1) {
      map.setView([withCoords[0].latitude, withCoords[0].longitude], 11)
    } else if (withCoords.length > 1) {
      const bounds = L.latLngBounds(withCoords.map((s) => [s.latitude, s.longitude]))
      const lngSpan = Math.abs(bounds.getEast() - bounds.getWest())
      const maxZoom = lngSpan > 25 ? 5 : 10
      map.fitBounds(bounds.pad(0.18), { animate: true, maxZoom })
    }
    // selectedId intentionally omitted — icon highlight updates in the next effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((marker, id) => {
      const spot = spotsByIdRef.current.get(id)
      if (!spot) return
      marker.setIcon(pinIcon(spot.is_featured, id === selectedId))
    })

    if (!selectedId) return
    const spot = spotsByIdRef.current.get(selectedId)
    if (spot?.latitude != null && spot.longitude != null) {
      map.panTo([spot.latitude, spot.longitude], { animate: true })
    }
  }, [selectedId])

  return (
    <div className={className}>
      <div ref={containerRef} className="h-full w-full overflow-hidden rounded-[18px] bg-teal-soft" />
      <style>{`
        .t2t-spot-pin { background: transparent; border: 0; }
        .leaflet-container { font: inherit; background: #e3ece8; }
      `}</style>
    </div>
  )
}
