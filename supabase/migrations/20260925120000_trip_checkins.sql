-- Group check-in: one shareable link per trip (/checkin/:tripCode).
-- Customers submit a fresh form (no booking lookup, nothing read back), so a
-- shared link in a Facebook group never exposes anyone else's details.
-- Rows are written and read only by Edge Functions using the service role:
--   public-trip-checkin  -> insert (rate-limited by hashed IP)
--   staff-api            -> list_trip_checkins (staff session required)
--   cron-daily           -> deletes rows 60 days after trip_end_date

create table if not exists public.trip_checkins (
  id uuid primary key default gen_random_uuid(),
  trip_code text not null,
  trip_end_date date not null,
  full_name text not null,
  phone text not null,
  email text null,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  emergency_contact_relationship text null,
  allergies text null,
  medical_conditions text null,
  dietary_requirements text null,
  other_notes text null,
  waiver_signed_name text not null,
  waiver_clauses jsonb not null default '[]'::jsonb,
  locale text null,
  ip_hash text null,
  created_at timestamptz not null default now()
);

create index if not exists trip_checkins_trip_code_idx
  on public.trip_checkins (trip_code, created_at desc);

create index if not exists trip_checkins_ip_hash_idx
  on public.trip_checkins (ip_hash, created_at desc);

create index if not exists trip_checkins_trip_end_date_idx
  on public.trip_checkins (trip_end_date);

comment on table public.trip_checkins is
  'Self-serve group check-in submissions. Service role only; purged 60 days after trip end.';

alter table public.trip_checkins enable row level security;
revoke all on public.trip_checkins from anon, authenticated;
