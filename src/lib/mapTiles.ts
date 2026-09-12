import L from 'leaflet'

/**
 * Light basemap that does not require an API key.
 * CartoCDN `light_all` now watermarks "API KEY REQUIRED" without a token.
 * Esri World Light Gray is a close visual match for the old Carto style.
 */
export const LIGHT_TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'

export const LIGHT_TILE_OPTIONS: L.TileLayerOptions = {
  attribution:
    'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  maxZoom: 16,
}

export function addLightBasemap(map: L.Map) {
  return L.tileLayer(LIGHT_TILE_URL, LIGHT_TILE_OPTIONS).addTo(map)
}
