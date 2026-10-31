/**
 * Pre-rendered "Route by พี่แสน" maps (self-contained HTML in /public/maps).
 * Key = trip_code, value = map group file prefix.
 * A trip without an entry simply shows no route map.
 */
const ROUTE_MAP_FILES: Record<string, string> = {
  'NZ-10D9N': 'NZ-10D9N',
  'NZ-6D5N-NOV15_20': 'NZ-6D5N-NOV15_20',
  'TAS-SP-3D2N-OCT11_13': 'TAS-SP-3D2N',
  'TAS-SP-3D2N-OCT18_20': 'TAS-SP-3D2N',
  'TAS-3D2N': 'TAS-3D2N',
  'TAS-LH-3D2N-WIN': 'TAS-LH-3D2N-WIN',
  'MEL-4D3N': 'MEL-4D3N',
  'CAN-2D1N-SEP5_6': 'CAN-2D1N-SEP5_6',
  'ULU-4D3N-SEP26_29': 'ULU-4D3N-SEP26_29',
  'TUL-1DAY-SEP11_1': 'TUL-1DAY',
  'TUL-1DAY-SEP13_1': 'TUL-1DAY',
  'TUL-1DAY-SEP16_1': 'TUL-1DAY',
  'KIA-1DAY-OCT1_1': 'KIA-1DAY-OCT1_1',
  'PSP-1DAY-SEP1_1': 'PSP-1DAY-SEP1_1',
}

/** URL of the route-map page for a trip, or null when none exists. */
export function getRouteMapUrl(tripCode: string): string | null {
  const file = ROUTE_MAP_FILES[tripCode]
  return file ? `/maps/${file}_route_map_web.html` : null
}
