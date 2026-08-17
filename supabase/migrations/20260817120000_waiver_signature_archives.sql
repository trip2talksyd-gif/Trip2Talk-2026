-- Archive copies of waiver_signatures before a staff reset.
-- Public /waiver/:token stays the same URL (tour_bookings.waiver_token is not rotated).
-- DO NOT auto-apply: owner reviews and runs this in the Supabase SQL Editor.

create table if not exists public.waiver_signature_archives (
  id uuid primary key default gen_random_uuid(),
  original_signature_id uuid null,
  booking_id uuid null references public.tour_bookings (id) on delete set null,
  trip_code text not null default '',
  signed_name text not null default '',
  signed_at timestamptz null,
  clauses jsonb null,
  locale text null,
  -- Full original waiver_signatures row (or booking-flag snapshot if no row).
  snapshot jsonb not null default '{}'::jsonb,
  reset_by_staff_id uuid null references public.staff_profiles (id) on delete set null,
  reset_by_staff_name text null,
  reset_by_role text null,
  reset_reason text null,
  reset_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists waiver_signature_archives_booking_id_idx
  on public.waiver_signature_archives (booking_id);

create index if not exists waiver_signature_archives_reset_at_idx
  on public.waiver_signature_archives (reset_at desc);

alter table public.waiver_signature_archives enable row level security;
-- Service role (staff-api) only — no anon / authenticated grants.

comment on table public.waiver_signature_archives is
  'Archived waiver submissions after staff reset_waiver. Current live row is waiver_signatures; this table is history only.';
