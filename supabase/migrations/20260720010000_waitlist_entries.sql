-- Waitlist capture for full trips. Public (anon) can insert; nobody can
-- read/update/delete except staff-api (service role), same pattern as
-- tour_bookings insert-only access.
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours(id) on delete set null,
  trip_code text not null,
  name text not null,
  phone text not null,
  email text,
  note text,
  contacted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_entries_trip_code_idx on public.waitlist_entries (trip_code);
create index if not exists waitlist_entries_tour_id_idx on public.waitlist_entries (tour_id);

alter table public.waitlist_entries enable row level security;

drop policy if exists "anon can insert waitlist entries" on public.waitlist_entries;
create policy "anon can insert waitlist entries"
  on public.waitlist_entries for insert
  to anon
  with check (true);

-- No anon/authenticated select/update/delete grants — staff-api (service role)
-- is the only read/write path for listing or marking entries as contacted.
