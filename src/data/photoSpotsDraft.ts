/**
 * Local draft mirror of photo_spots Phase 1 seed.
 * Used when the photo_spots table is not yet applied so /spots works pre-migration.
 */

export type DroneAllowed = 'allowed' | 'restricted' | 'prohibited'

export type CameraModeSettings = {
  aperture?: string | null
  iso?: string | null
  shutter?: string | null
  filter?: string | null
}

export type CameraSettings = {
  landscape?: CameraModeSettings | null
  portrait?: CameraModeSettings | null
}

export type PhotoSpotRow = {
  id: string
  slug: string
  title_en: string
  title_th: string
  location_en: string
  location_th: string
  description_en: string | null
  description_th: string | null
  categories: string[]
  latitude: number | null
  longitude: number | null
  google_maps_url: string | null
  best_time: string | null
  best_season: string | null
  drive_time_from_sydney: string | null
  best_time_morning: string | null
  best_time_evening: string | null
  best_time_night: string | null
  access_private_car: string
  access_public_transport: string | null
  gear_landscape: string | null
  gear_portrait: string | null
  camera_settings: CameraSettings
  tips_en: string | null
  tips_th: string | null
  warnings_en: string | null
  warnings_th: string | null
  drone_allowed: DroneAllowed
  drone_notes: string | null
  linked_trip_code: string | null
  related_trip_code: string | null
  photo_id: string | null
  hero_image_url: string | null
  thumbnail_url: string | null
  rating: number
  sort_order: number
  is_featured: boolean
  review_notes: string | null
  created_at?: string
  updated_at?: string
}

export const PHOTO_SPOT_CATEGORIES = [
  'All',
  'Landscape',
  'Portrait',
  'Aurora',
  'Coastal',
  'Sunrise',
  'Sunset',
  'Night',
  'Milky Way',
  'Nature',
] as const

export const PHOTO_SPOTS_DRAFT: PhotoSpotRow[] = [
  {
    id: 'a1111111-1111-4111-8111-111111111101',
    slug: 'bombo-headland',
    title_en: 'Bombo Headland',
    title_th: 'หน้าผาหินบะซอลต์ เมือง Kiama',
    location_en: 'Kiama, NSW',
    location_th: 'เกียม่า, นิวเซาท์เวลส์',
    description_en:
      'East-facing basalt columns and rock platforms near Kiama — a classic NSW south coast sunrise landscape spot.',
    description_th:
      'หน้าผาหินบะซอลต์หันทิศตะวันออกใกล้เกียม่า — จุดวิวพระอาทิตย์ขึ้นคลาสสิกของชายฝั่งใต้ NSW',
    categories: ['Landscape', 'Portrait', 'Coastal', 'Sunrise'],
    latitude: -34.6721,
    longitude: 150.859,
    google_maps_url: 'https://maps.google.com/?q=Bombo+Headland+Quarry,+Kiama+NSW',
    best_time: 'Sunrise (east-facing cliffs)',
    best_season: 'Year-round; calmer seas often easier Mar–May (verify swell)',
    drive_time_from_sydney: '~1.5–2 hrs drive',
    best_time_morning:
      'Sunrise window — east light on the columns. Exact clock time shifts with season (check sunrise for the day).',
    best_time_evening: 'Evening light is usually weaker here because the headland faces east.',
    best_time_night: null,
    access_private_car:
      'Park at Bombo Quarry / headland car park area and walk carefully onto uneven basalt. Surfaces can be wet and sharp.',
    access_public_transport:
      'South Coast Line to Kiama, then local walk/taxi (~15–25 min depending on start point).',
    gear_landscape:
      'Wide lens + tripod for seascapes; ND useful for longer exposures when swell allows safe positioning.',
    gear_portrait: '35–50mm for people against the columns in soft morning light.',
    camera_settings: {
      landscape: {
        aperture: 'f/8–f/11',
        iso: '100–200',
        shutter: '1/60–several sec with ND',
        filter: 'ND / CPL — REVIEW exact prefs',
      },
      portrait: {
        aperture: 'f/2.8–f/4',
        iso: '100–400',
        shutter: '1/200+',
        filter: null,
      },
    },
    tips_en: 'Arrive before sunrise; watch the swell — never turn your back on the ocean on wet platforms.',
    tips_th: 'มาถึงก่อนพระอาทิตย์ขึ้น และระวังคลื่น — อย่าหันหลังให้ทะเลบนพื้นหินเปียก',
    warnings_en:
      'Uneven basalt, slippery when wet. Large swell can wash over rock platforms — check marine forecast and keep clear of the waterline. REVIEW: confirm any local access/parking notices before publishing as advice.',
    warnings_th:
      'พื้นหินบะซอลต์ไม่เรียบ ลื่นเมื่อเปียก คลื่นใหญ่ซัดขึ้นแท่นหินได้ — เช็คพยากรณ์ทะเล และอยู่ห่างแนวน้ำ [REVIEW: ยืนยันป้าย/การเข้าถึงท้องถิ่น]',
    drone_allowed: 'restricted',
    drone_notes: 'Follow CASA rules; avoid flying over people or close to breaking surf.',
    linked_trip_code: 'KIA-1DAY',
    related_trip_code: 'KIA-1DAY',
    photo_id: 'ber-001',
    hero_image_url: null,
    thumbnail_url: null,
    rating: 4.9,
    sort_order: 10,
    is_featured: true,
    review_notes:
      'Camera numbers are starting ranges only. Exact sunrise clock times and swell safety wording need Saen review.',
  },
  {
    id: 'a1111111-1111-4111-8111-111111111104',
    slug: 'helensburgh-tunnel',
    title_en: 'Helensburgh Old Railway Tunnel',
    title_th: 'อุโมงค์รถไฟร้าง เฮเลนส์เบิร์ก',
    location_en: 'Helensburgh, NSW',
    location_th: 'เฮเลนส์เบิร์ก, นิวเซาท์เวลส์',
    description_en:
      'Disused railway tunnel south of Sydney known for glow-worm displays in complete darkness.',
    description_th: 'อุโมงค์รถไฟร้างทางใต้ซิดนีย์ที่มีหนอนเรืองแสงในความมืดสนิท',
    categories: ['Night', 'Milky Way', 'Landscape', 'Portrait'],
    latitude: -34.1848,
    longitude: 150.9975,
    google_maps_url: 'https://maps.google.com/?q=Helensburgh+Tunnel+Glow+Worm',
    best_time: 'After dark (glow worms)',
    best_season: 'Year-round; best after full dark',
    drive_time_from_sydney: '~50–60 min drive',
    best_time_morning: null,
    best_time_evening: null,
    best_time_night:
      'After sunset — glow worms show best in near-total darkness. Allow eyes to adjust (~10+ minutes). Avoid bright lights.',
    access_private_car:
      'Park near the commonly used trailhead and walk in on a bush track (~10–20 min). Track can be muddy and slippery after rain.',
    access_public_transport:
      'South Coast Line to Helensburgh station, then walk (~20 min depending on route).',
    gear_landscape:
      'Fast lens (f/1.8–f/2.8), high ISO, tripod. Torch for the walk only — switch off for the exposure.',
    gear_portrait: 'Avoid strong flash (disturbs glow worms). Soft light or silhouette approaches are kinder.',
    camera_settings: {
      landscape: {
        aperture: 'f/1.8–f/2.8',
        iso: '3200–6400',
        shutter: '10–25s',
        filter: null,
      },
      portrait: {
        aperture: 'f/1.8–f/2.8',
        iso: '1600–6400',
        shutter: '1/30–2s',
        filter: 'no harsh flash',
      },
    },
    tips_en: 'Stay on established paths; keep voices low; do not touch tunnel walls or glow-worm areas.',
    tips_th: 'เดินตามทางเดิม พูดเบา และอย่าแตะผนังอุโมงค์/บริเวณหนอนเรืองแสง',
    warnings_en:
      'Muddy/slippery access after rain. Confined dark space — bring a torch for walking. Access and land status can change; verify current public-access guidance before visiting. REVIEW GPS pin + access wording with Saen.',
    warnings_th:
      'ทางเข้าลื่นหลังฝน อุโมงค์มืดแคบ — พกไฟฉายเดินทาง ตรวจสถานะการเข้าถึงสาธารณะก่อนไป [REVIEW พิกัดและการเข้าถึง]',
    drone_allowed: 'restricted',
    drone_notes: 'Not suitable — enclosed tunnel environment.',
    linked_trip_code: 'KIA-1DAY',
    related_trip_code: 'KIA-1DAY',
    photo_id: 'syd-015',
    hero_image_url: null,
    thumbnail_url: null,
    rating: 4.7,
    sort_order: 20,
    is_featured: true,
    review_notes:
      'Exact tunnel pin, land-access status, and camera numbers need Saen review. Avoid claiming private-property rights.',
  },
  {
    id: 'a1111111-1111-4111-8111-111111111102',
    slug: 'uluru-sunset',
    title_en: 'Uluru Sunset Viewing Area',
    title_th: 'จุดชมพระอาทิตย์ตกอูลูรู',
    location_en: 'Uluru-Kata Tjuta National Park, NT',
    location_th: 'อุทยานแห่งชาติอูลูรู-กาตาจูตา, นอร์เทิร์นเทร์ริทอรี',
    description_en:
      'Designated sunset viewing area in Uluru–Kata Tjuta National Park — rock colour shifts through golden hour.',
    description_th:
      'จุดชมพระอาทิตย์ตกในอุทยานอูลูรู-กาตาจูตา — สีหินเปลี่ยนชัดในช่วง golden hour',
    categories: ['Landscape', 'Portrait', 'Sunset', 'Night'],
    latitude: -25.3444,
    longitude: 131.0369,
    google_maps_url: 'https://maps.google.com/?q=Uluru+Sunset+Viewing+Area',
    best_time: 'Golden hour / sunset',
    best_season: 'Dry season evenings often clearer (still check cloud)',
    drive_time_from_sydney: 'Flight from Sydney (~3.5 hrs) + park transfer — not a Sydney day drive',
    best_time_morning:
      'Sunrise is usually better from Talinguru Nyakunytjaku — separate viewing area.',
    best_time_evening:
      'Golden hour into sunset — rock colour deepens; exact clock time changes with season.',
    best_time_night:
      'After full dark on clear moonless nights for Milky Way (check cloud + moon phase). Stay in designated areas.',
    access_private_car:
      'Park at the Sunset Viewing car park inside the park and stay in signed public viewing areas.',
    access_public_transport: null,
    gear_landscape: 'Wide lens + tripod; wind can be strong at dusk.',
    gear_portrait:
      'Tele/portrait lens for silhouette and people-with-rock frames — respect cultural guidelines and stay in allowed areas.',
    camera_settings: {
      landscape: {
        aperture: 'f/8–f/11',
        iso: '100–400',
        shutter: '1/60–1/125 (tripod as light falls)',
        filter: 'CPL optional — REVIEW',
      },
      portrait: {
        aperture: 'f/2.8–f/5.6',
        iso: '200–800',
        shutter: '1/160+',
        filter: null,
      },
    },
    tips_en: 'Book park entry as required; stay on designated viewing areas; no climbing Uluru.',
    tips_th: 'จองเข้าอุทยานตามกฎ อยู่ในจุดชมที่กำหนด และห้ามปีนอูลูรู',
    warnings_en:
      'Drones are prohibited in Uluru–Kata Tjuta National Park. Follow Parks Australia / park rules at all times. Extreme heat possible — carry water.',
    warnings_th:
      'ห้ามโดรนในอุทยานอูลูรู-กาตาจูตา ปฏิบัติตามกฎอุทยานเสมอ อากาศร้อนจัดได้ — พกน้ำ',
    drone_allowed: 'prohibited',
    drone_notes: 'Legal ban — drones prohibited in Uluru–Kata Tjuta National Park.',
    linked_trip_code: 'ULU-4D3N',
    related_trip_code: 'ULU-4D3N',
    photo_id: 'tas-002',
    hero_image_url: null,
    thumbnail_url: null,
    rating: 4.9,
    sort_order: 30,
    is_featured: false,
    review_notes:
      'Exact golden-hour clock windows are seasonal — confirm wording. Gallery photo_id may not be Uluru-specific — REVIEW hero media.',
  },
  {
    id: 'a1111111-1111-4111-8111-111111111103',
    slug: 'cradle-dove-lake',
    title_en: 'Cradle Mountain — Dove Lake',
    title_th: 'เครเดิลเมาน์เทน ทะเลสาบโดฟ',
    location_en: 'Cradle Mountain-Lake St Clair National Park, TAS',
    location_th: 'อุทยานแห่งชาติเครเดิลเมาน์เทน, แทสเมเนีย',
    description_en:
      'Iconic Tasmanian alpine lake with Cradle Mountain reflections on calm mornings.',
    description_th:
      'ทะเลสาบอัลไพน์แทสเมเนียที่มีเงาสะท้อน Cradle Mountain ในเช้าลมสงบ',
    categories: ['Landscape', 'Aurora', 'Night', 'Nature'],
    latitude: -41.6398,
    longitude: 145.9375,
    google_maps_url: 'https://maps.google.com/?q=Dove+Lake,+Cradle+Mountain+TAS',
    best_time: 'Calm sunrise for reflections',
    best_season: 'Shoulder seasons often clearer; weather changes fast year-round',
    drive_time_from_sydney: 'Flight to TAS + drive/shuttle — not a Sydney day drive',
    best_time_morning: 'Calm mornings give the best lake reflections before wind rises.',
    best_time_evening: 'Golden hour on peaks when skies are clear.',
    best_time_night:
      'Aurora Australis only when geomagnetic activity + clear skies align — check forecasts; do not treat as guaranteed.',
    access_private_car:
      'Dove Lake car park (when open) or shuttle from visitor centre per Parks Tasmania rules.',
    access_public_transport:
      'Cradle Mountain shuttle from the visitor centre when private vehicles are restricted.',
    gear_landscape: 'Wide lens + tripod; dress for sudden cold/wet alpine weather.',
    gear_portrait: null,
    camera_settings: {
      landscape: {
        aperture: 'f/8–f/11',
        iso: '100–200',
        shutter: '1/60–1/125 (longer if calm + tripod)',
        filter: 'CPL optional — REVIEW',
      },
      portrait: null,
    },
    tips_en:
      'Weather turns quickly — pack layers and check Parks Tasmania alerts before hiking circuits.',
    tips_th: 'อากาศเปลี่ยนไว — เตรียมเสื้อหนาและเช็คประกาศ Parks Tasmania ก่อนเดิน',
    warnings_en:
      'Alpine weather, cold water, and rapidly changing conditions. Stay on marked tracks. Aurora sightings are not guaranteed.',
    warnings_th:
      'อากาศอัลไพน์ น้ำเย็น สภาพอากาศเปลี่ยนไว เดินตามทางที่กำหนด ออโรร่าไม่การันตี',
    drone_allowed: 'restricted',
    drone_notes: 'Follow Parks Tasmania rules; permits may be required.',
    linked_trip_code: 'TAS-3D2N',
    related_trip_code: 'TAS-3D2N',
    photo_id: 'tas-107',
    hero_image_url: null,
    thumbnail_url: null,
    rating: 4.8,
    sort_order: 40,
    is_featured: false,
    review_notes:
      'Aurora claims must stay non-guaranteed. Camera numbers and best-season wording need Saen review.',
  },
]

export function findDraftPhotoSpot(key: string): PhotoSpotRow | null {
  const k = key.trim().toLowerCase()
  if (!k) return null
  return (
    PHOTO_SPOTS_DRAFT.find(
      (s) =>
        s.id.toLowerCase() === k ||
        s.slug.toLowerCase() === k ||
        (s.photo_id != null && s.photo_id.toLowerCase() === k),
    ) ?? null
  )
}

export function tripCtaHref(spot: Pick<PhotoSpotRow, 'related_trip_code' | 'linked_trip_code'>): string {
  const code = spot.related_trip_code ?? spot.linked_trip_code
  return code ? `/trips/${encodeURIComponent(code)}` : '/trips'
}
