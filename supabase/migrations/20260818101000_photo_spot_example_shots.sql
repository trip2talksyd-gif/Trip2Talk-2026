-- Camera-settings sample shots (portrait/landscape) per photo spot.
-- Idempotent. Not applied to production yet — public fetch skips this table until live.

create table if not exists public.photo_spot_example_shots (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.photo_spots (id) on delete cascade,
  orientation text not null
    check (orientation in ('landscape', 'portrait')),
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists photo_spot_example_shots_spot_idx
  on public.photo_spot_example_shots (spot_id, sort_order asc, created_at asc);

alter table public.photo_spot_example_shots enable row level security;

drop policy if exists "anon can read photo_spot_example_shots" on public.photo_spot_example_shots;
create policy "anon can read photo_spot_example_shots"
  on public.photo_spot_example_shots
  for select
  to anon
  using (true);

drop policy if exists "authenticated can read photo_spot_example_shots" on public.photo_spot_example_shots;
create policy "authenticated can read photo_spot_example_shots"
  on public.photo_spot_example_shots
  for select
  to authenticated
  using (true);

grant select on public.photo_spot_example_shots to anon;
grant select, insert, update, delete on public.photo_spot_example_shots to authenticated;

comment on table public.photo_spot_example_shots is
  'Sample shots for camera settings (not the hero gallery). Public read; staff write via service role.';
