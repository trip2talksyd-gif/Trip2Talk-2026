-- Photo Spots Phase 1 — extend (or create) photo_spots for /spots map+list+detail.
-- Idempotent: safe if 20260809120000 already ran, or if table is missing.

create table if not exists public.photo_spots (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null,
  title_th text not null,
  location_en text not null,
  location_th text not null,
  latitude numeric,
  longitude numeric,
  google_maps_url text,
  best_time_morning text,
  best_time_evening text,
  best_time_night text,
  access_private_car text not null default '',
  access_public_transport text,
  gear_landscape text,
  gear_portrait text,
  drone_allowed text not null default 'restricted'
    check (drone_allowed in ('allowed', 'restricted', 'prohibited')),
  drone_notes text,
  linked_trip_code text,
  photo_id text,
  rating numeric(2,1) not null default 4.8
    check (rating >= 0 and rating <= 5),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint photo_spots_lat_lng_pair check (
    (latitude is null and longitude is null)
    or (latitude is not null and longitude is not null)
  )
);

-- Phase 1 additive columns
alter table public.photo_spots
  add column if not exists description_en text,
  add column if not exists description_th text,
  add column if not exists categories text[] not null default '{}',
  add column if not exists best_time text,
  add column if not exists best_season text,
  add column if not exists drive_time_from_sydney text,
  add column if not exists hero_image_url text,
  add column if not exists thumbnail_url text,
  add column if not exists camera_settings jsonb not null default '{}'::jsonb,
  add column if not exists tips_en text,
  add column if not exists tips_th text,
  add column if not exists warnings_en text,
  add column if not exists warnings_th text,
  add column if not exists related_trip_code text,
  add column if not exists is_featured boolean not null default false,
  add column if not exists review_notes text;

-- Keep related_trip_code in sync with linked_trip_code when only one is set.
create or replace function public.photo_spots_sync_trip_codes()
returns trigger
language plpgsql
as $$
begin
  if new.related_trip_code is null and new.linked_trip_code is not null then
    new.related_trip_code := new.linked_trip_code;
  end if;
  if new.linked_trip_code is null and new.related_trip_code is not null then
    new.linked_trip_code := new.related_trip_code;
  end if;
  return new;
end;
$$;

drop trigger if exists photo_spots_sync_trip_codes on public.photo_spots;
create trigger photo_spots_sync_trip_codes
  before insert or update on public.photo_spots
  for each row execute function public.photo_spots_sync_trip_codes();

create or replace function public.photo_spots_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists photo_spots_set_updated_at on public.photo_spots;
create trigger photo_spots_set_updated_at
  before update on public.photo_spots
  for each row execute function public.photo_spots_set_updated_at();

create index if not exists photo_spots_sort_idx
  on public.photo_spots (sort_order asc, created_at desc);

create index if not exists photo_spots_featured_idx
  on public.photo_spots (is_featured desc, sort_order asc);

create index if not exists photo_spots_categories_gin
  on public.photo_spots using gin (categories);

create index if not exists photo_spots_trip_code_idx
  on public.photo_spots (linked_trip_code);

create index if not exists photo_spots_related_trip_idx
  on public.photo_spots (related_trip_code);

alter table public.photo_spots enable row level security;

drop policy if exists "anon can read photo_spots" on public.photo_spots;
create policy "anon can read photo_spots"
  on public.photo_spots
  for select
  to anon
  using (true);

drop policy if exists "authenticated can read photo_spots" on public.photo_spots;
create policy "authenticated can read photo_spots"
  on public.photo_spots
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated staff can manage photo_spots" on public.photo_spots;
create policy "authenticated staff can manage photo_spots"
  on public.photo_spots
  for all
  to authenticated
  using (true)
  with check (true);

grant select on public.photo_spots to anon;
grant select, insert, update, delete on public.photo_spots to authenticated;

comment on table public.photo_spots is
  'Photo Spots library — map/list/detail lead-gen content. Public read; staff write.';

comment on column public.photo_spots.categories is
  'Multi-select tags e.g. Landscape, Portrait, Aurora, Coastal, Night, Milky Way.';

comment on column public.photo_spots.camera_settings is
  'JSON: { landscape|portrait: { aperture, iso, shutter, filter } }. Mark uncertain values in review_notes.';

comment on column public.photo_spots.review_notes is
  'Internal: fields that need Saen review (safety, exact times, camera numbers).';

-- Seed / upsert Phase 1 rows
insert into public.photo_spots (
  id, slug, title_en, title_th, location_en, location_th,
  latitude, longitude, google_maps_url,
  description_en, description_th,
  categories, best_time, best_season, drive_time_from_sydney,
  best_time_morning, best_time_evening, best_time_night,
  access_private_car, access_public_transport,
  gear_landscape, gear_portrait,
  camera_settings, tips_en, tips_th, warnings_en, warnings_th,
  drone_allowed, drone_notes,
  linked_trip_code, related_trip_code, photo_id,
  rating, sort_order, is_featured, review_notes
)
values
  (
    'a1111111-1111-4111-8111-111111111101',
    'bombo-headland',
    'Bombo Headland',
    'หน้าผาหินบะซอลต์ เมือง Kiama',
    'Kiama, NSW',
    'เกียม่า, นิวเซาท์เวลส์',
    -34.6721, 150.8590,
    'https://maps.google.com/?q=Bombo+Headland+Quarry,+Kiama+NSW',
    'East-facing basalt columns and rock platforms near Kiama — a classic NSW south coast sunrise landscape spot.',
    'หน้าผาหินบะซอลต์หันทิศตะวันออกใกล้เกียม่า — จุดวิวพระอาทิตย์ขึ้นคลาสสิกของชายฝั่งใต้ NSW',
    array['Landscape','Portrait','Coastal','Sunrise'],
    'Sunrise (east-facing cliffs)',
    'Year-round; calmer seas often easier Mar–May (verify swell)',
    '~1.5–2 hrs drive',
    'Sunrise window — east light on the columns. Exact clock time shifts with season (check sunrise for the day).',
    'Evening light is usually weaker here because the headland faces east.',
    null,
    'Park at Bombo Quarry / headland car park area and walk carefully onto uneven basalt. Surfaces can be wet and sharp.',
    'South Coast Line to Kiama, then local walk/taxi (~15–25 min depending on start point).',
    'Wide lens + tripod for seascapes; ND useful for longer exposures when swell allows safe positioning.',
    '35–50mm for people against the columns in soft morning light.',
    '{"landscape":{"aperture":"f/8–f/11","iso":"100–200","shutter":"1/60–several sec with ND","filter":"ND / CPL — REVIEW exact prefs"},"portrait":{"aperture":"f/2.8–f/4","iso":"100–400","shutter":"1/200+","filter":null}}'::jsonb,
    'Arrive before sunrise; watch the swell — never turn your back on the ocean on wet platforms.',
    'มาถึงก่อนพระอาทิตย์ขึ้น และระวังคลื่น — อย่าหันหลังให้ทะเลบนพื้นหินเปียก',
    'Uneven basalt, slippery when wet. Large swell can wash over rock platforms — check marine forecast and keep clear of the waterline. REVIEW: confirm any local access/parking notices before publishing as advice.',
    'พื้นหินบะซอลต์ไม่เรียบ ลื่นเมื่อเปียก คลื่นใหญ่ซัดขึ้นแท่นหินได้ — เช็คพยากรณ์ทะเล และอยู่ห่างแนวน้ำ [REVIEW: ยืนยันป้าย/การเข้าถึงท้องถิ่น]',
    'restricted',
    'Follow CASA rules; avoid flying over people or close to breaking surf.',
    'KIA-1DAY', 'KIA-1DAY', 'ber-001',
    4.9, 10, true,
    'Camera numbers are starting ranges only. Exact sunrise clock times and swell safety wording need Saen review.'
  ),
  (
    'a1111111-1111-4111-8111-111111111104',
    'helensburgh-tunnel',
    'Helensburgh Old Railway Tunnel',
    'อุโมงค์รถไฟร้าง เฮเลนส์เบิร์ก',
    'Helensburgh, NSW',
    'เฮเลนส์เบิร์ก, นิวเซาท์เวลส์',
    -34.1848, 150.9975,
    'https://maps.google.com/?q=Helensburgh+Tunnel+Glow+Worm',
    'Disused railway tunnel south of Sydney known for glow-worm displays in complete darkness.',
    'อุโมงค์รถไฟร้างทางใต้ซิดนีย์ที่มีหนอนเรืองแสงในความมืดสนิท',
    array['Night','Milky Way','Landscape','Portrait'],
    'After dark (glow worms)',
    'Year-round; best after full dark',
    '~50–60 min drive',
    null,
    null,
    'After sunset — glow worms show best in near-total darkness. Allow eyes to adjust (~10+ minutes). Avoid bright lights.',
    'Park near the commonly used trailhead and walk in on a bush track (~10–20 min). Track can be muddy and slippery after rain.',
    'South Coast Line to Helensburgh station, then walk (~20 min depending on route).',
    'Fast lens (f/1.8–f/2.8), high ISO, tripod. Torch for the walk only — switch off for the exposure.',
    'Avoid strong flash (disturbs glow worms). Soft light or silhouette approaches are kinder.',
    '{"landscape":{"aperture":"f/1.8–f/2.8","iso":"3200–6400","shutter":"10–25s","filter":null},"portrait":{"aperture":"f/1.8–f/2.8","iso":"1600–6400","shutter":"1/30–2s","filter":"no harsh flash"}}'::jsonb,
    'Stay on established paths; keep voices low; do not touch tunnel walls or glow-worm areas.',
    'เดินตามทางเดิม พูดเบา และอย่าแตะผนังอุโมงค์/บริเวณหนอนเรืองแสง',
    'Muddy/slippery access after rain. Confined dark space — bring a torch for walking. Access and land status can change; verify current public-access guidance before visiting. REVIEW GPS pin + access wording with Saen.',
    'ทางเข้าลื่นหลังฝน อุโมงค์มืดแคบ — พกไฟฉายเดินทาง ตรวจสถานะการเข้าถึงสาธารณะก่อนไป [REVIEW พิกัดและการเข้าถึง]',
    'restricted',
    'Not suitable — enclosed tunnel environment.',
    'KIA-1DAY', 'KIA-1DAY', 'syd-015',
    4.7, 20, true,
    'Exact tunnel pin, land-access status, and camera numbers need Saen review. Avoid claiming private-property rights.'
  ),
  (
    'a1111111-1111-4111-8111-111111111102',
    'uluru-sunset',
    'Uluru Sunset Viewing Area',
    'จุดชมพระอาทิตย์ตกอูลูรู',
    'Uluru-Kata Tjuta National Park, NT',
    'อุทยานแห่งชาติอูลูรู-กาตาจูตา, นอร์เทิร์นเทร์ริทอรี',
    -25.3444, 131.0369,
    'https://maps.google.com/?q=Uluru+Sunset+Viewing+Area',
    'Designated sunset viewing area in Uluru–Kata Tjuta National Park — rock colour shifts through golden hour.',
    'จุดชมพระอาทิตย์ตกในอุทยานอูลูรู-กาตาจูตา — สีหินเปลี่ยนชัดในช่วง golden hour',
    array['Landscape','Portrait','Sunset','Night'],
    'Golden hour / sunset',
    'Dry season evenings often clearer (still check cloud)',
    'Flight from Sydney (~3.5 hrs) + park transfer — not a Sydney day drive',
    'Sunrise is usually better from Talinguru Nyakunytjaku — separate viewing area.',
    'Golden hour into sunset — rock colour deepens; exact clock time changes with season.',
    'After full dark on clear moonless nights for Milky Way (check cloud + moon phase). Stay in designated areas.',
    'Park at the Sunset Viewing car park inside the park and stay in signed public viewing areas.',
    null,
    'Wide lens + tripod; wind can be strong at dusk.',
    'Tele/portrait lens for silhouette and people-with-rock frames — respect cultural guidelines and stay in allowed areas.',
    '{"landscape":{"aperture":"f/8–f/11","iso":"100–400","shutter":"1/60–1/125 (tripod as light falls)","filter":"CPL optional — REVIEW"},"portrait":{"aperture":"f/2.8–f/5.6","iso":"200–800","shutter":"1/160+","filter":null}}'::jsonb,
    'Book park entry as required; stay on designated viewing areas; no climbing Uluru.',
    'จองเข้าอุทยานตามกฎ อยู่ในจุดชมที่กำหนด และห้ามปีนอูลูรู',
    'Drones are prohibited in Uluru–Kata Tjuta National Park. Follow Parks Australia / park rules at all times. Extreme heat possible — carry water.',
    'ห้ามโดรนในอุทยานอูลูรู-กาตาจูตา ปฏิบัติตามกฎอุทยานเสมอ อากาศร้อนจัดได้ — พกน้ำ',
    'prohibited',
    'Legal ban — drones prohibited in Uluru–Kata Tjuta National Park.',
    'ULU-4D3N', 'ULU-4D3N', 'tas-002',
    4.9, 30, false,
    'Exact golden-hour clock windows are seasonal — confirm wording. Gallery photo_id may not be Uluru-specific — REVIEW hero media.'
  ),
  (
    'a1111111-1111-4111-8111-111111111103',
    'cradle-dove-lake',
    'Cradle Mountain — Dove Lake',
    'เครเดิลเมาน์เทน ทะเลสาบโดฟ',
    'Cradle Mountain-Lake St Clair National Park, TAS',
    'อุทยานแห่งชาติเครเดิลเมาน์เทน, แทสเมเนีย',
    -41.6398, 145.9375,
    'https://maps.google.com/?q=Dove+Lake,+Cradle+Mountain+TAS',
    'Iconic Tasmanian alpine lake with Cradle Mountain reflections on calm mornings.',
    'ทะเลสาบอัลไพน์แทสเมเนียที่มีเงาสะท้อน Cradle Mountain ในเช้าลมสงบ',
    array['Landscape','Aurora','Night','Nature'],
    'Calm sunrise for reflections',
    'Shoulder seasons often clearer; weather changes fast year-round',
    'Flight to TAS + drive/shuttle — not a Sydney day drive',
    'Calm mornings give the best lake reflections before wind rises.',
    'Golden hour on peaks when skies are clear.',
    'Aurora Australis only when geomagnetic activity + clear skies align — check forecasts; do not treat as guaranteed.',
    'Dove Lake car park (when open) or shuttle from visitor centre per Parks Tasmania rules.',
    'Cradle Mountain shuttle from the visitor centre when private vehicles are restricted.',
    'Wide lens + tripod; dress for sudden cold/wet alpine weather.',
    null,
    '{"landscape":{"aperture":"f/8–f/11","iso":"100–200","shutter":"1/60–1/125 (longer if calm + tripod)","filter":"CPL optional — REVIEW"},"portrait":null}'::jsonb,
    'Weather turns quickly — pack layers and check Parks Tasmania alerts before hiking circuits.',
    'อากาศเปลี่ยนไว — เตรียมเสื้อหนาและเช็คประกาศ Parks Tasmania ก่อนเดิน',
    'Alpine weather, cold water, and rapidly changing conditions. Stay on marked tracks. Aurora sightings are not guaranteed.',
    'อากาศอัลไพน์ น้ำเย็น สภาพอากาศเปลี่ยนไว เดินตามทางที่กำหนด ออโรร่าไม่การันตี',
    'restricted',
    'Follow Parks Tasmania rules; permits may be required.',
    'TAS-3D2N', 'TAS-3D2N', 'tas-107',
    4.8, 40, false,
    'Aurora claims must stay non-guaranteed. Camera numbers and best-season wording need Saen review.'
  )
on conflict (id) do update set
  slug = excluded.slug,
  title_en = excluded.title_en,
  title_th = excluded.title_th,
  location_en = excluded.location_en,
  location_th = excluded.location_th,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  google_maps_url = excluded.google_maps_url,
  description_en = excluded.description_en,
  description_th = excluded.description_th,
  categories = excluded.categories,
  best_time = excluded.best_time,
  best_season = excluded.best_season,
  drive_time_from_sydney = excluded.drive_time_from_sydney,
  best_time_morning = excluded.best_time_morning,
  best_time_evening = excluded.best_time_evening,
  best_time_night = excluded.best_time_night,
  access_private_car = excluded.access_private_car,
  access_public_transport = excluded.access_public_transport,
  gear_landscape = excluded.gear_landscape,
  gear_portrait = excluded.gear_portrait,
  camera_settings = excluded.camera_settings,
  tips_en = excluded.tips_en,
  tips_th = excluded.tips_th,
  warnings_en = excluded.warnings_en,
  warnings_th = excluded.warnings_th,
  drone_allowed = excluded.drone_allowed,
  drone_notes = excluded.drone_notes,
  linked_trip_code = excluded.linked_trip_code,
  related_trip_code = excluded.related_trip_code,
  photo_id = excluded.photo_id,
  rating = excluded.rating,
  sort_order = excluded.sort_order,
  is_featured = excluded.is_featured,
  review_notes = excluded.review_notes,
  updated_at = now();
