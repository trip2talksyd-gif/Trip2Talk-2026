-- Photo Spot Library (Phase 2) — owner-editable spot detail for Discover.
-- Repo migration only until Saen confirms — do NOT apply to production yet.

create table if not exists public.photo_spots (
  id uuid primary key default gen_random_uuid(),

  -- URL segment for /discover/spot/:id (stable, human-readable).
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

  -- Drone policy for beginners (Uluru = hard legal ban — surface prominently in UI).
  drone_allowed text not null default 'restricted'
    check (drone_allowed in ('allowed', 'restricted', 'prohibited')),
  drone_notes text,

  -- Soft link to trip package CTA (matches tours.trip_code).
  linked_trip_code text,

  -- Soft link to src/data/galleryPhotos.ts id for hero image.
  photo_id text,

  -- Display rating on Spot Detail (not in original product brief; needed by UI).
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

create index if not exists photo_spots_sort_idx
  on public.photo_spots (sort_order asc, created_at desc);

create index if not exists photo_spots_trip_code_idx
  on public.photo_spots (linked_trip_code);

create index if not exists photo_spots_photo_id_idx
  on public.photo_spots (photo_id);

comment on table public.photo_spots is
  'Discover Photo Spot Library — beginner-facing spot detail (times, access, gear). Public read; staff write.';

comment on column public.photo_spots.slug is
  'URL segment for /discover/spot/:slug';

comment on column public.photo_spots.photo_id is
  'Matches GalleryPhoto.id in galleryPhotos.ts for hero image URLs.';

comment on column public.photo_spots.linked_trip_code is
  'Trip package code for soft-sell CTA (e.g. ULU-4D3N, KIA-1DAY).';

comment on column public.photo_spots.drone_allowed is
  'allowed | restricted | prohibited — prohibited must be flagged prominently (e.g. Uluru legal ban).';

comment on column public.photo_spots.drone_notes is
  'Human-readable drone guidance for beginners at this spot.';

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

alter table public.photo_spots enable row level security;

-- Public-facing content: anon can read all rows (same spirit as published tours).
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

-- Writes: authenticated staff only (mirrors tours manage policy). Anon has no write.
drop policy if exists "authenticated staff can manage photo_spots" on public.photo_spots;
create policy "authenticated staff can manage photo_spots"
  on public.photo_spots
  for all
  to authenticated
  using (true)
  with check (true);

grant select on public.photo_spots to anon;
grant select, insert, update, delete on public.photo_spots to authenticated;
