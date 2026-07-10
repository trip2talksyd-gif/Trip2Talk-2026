-- Trip2Talk V5 — base schema for a fresh Supabase project
-- Run this FIRST, before any other file in supabase/, on a brand-new project.
--
-- This never existed as a migration file before (the original project's
-- tables were created by hand in the dashboard and that project was later
-- deleted) — reconstructed here to match src/types/tour.ts and the columns
-- already referenced by insert-syd-influ-3h.sql exactly.
--
-- Run once in Supabase Dashboard -> SQL Editor on the new project.

-- ─── tours ──────────────────────────────────────────────────────────────────
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  trip_code text not null unique,
  name_en text not null,
  name_th text not null,
  destination text not null,
  duration_label text not null,
  trip_type text not null check (trip_type in ('oneday', 'overnight', 'multiday')),
  price_standard numeric(10,2) not null,
  price_private numeric(10,2),
  max_pax int not null default 6,
  min_pax int not null default 1,
  current_pax int not null default 0,
  deposit_amount numeric(10,2) not null default 100,
  next_date date,
  status text not null default 'PLANNING' check (status in ('PLANNING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  season text[] not null default '{}',
  aurora_trip boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── tour_bookings ──────────────────────────────────────────────────────────
create table if not exists public.tour_bookings (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  trip_code text not null,
  first_name_th text,
  last_name_th text,
  first_name_en text not null,
  last_name_en text not null,
  passport_number text,
  email text not null,
  phone text not null,
  dietary_requirements text,
  medical_conditions text,
  oshc_provider text,
  oshc_expiry date,
  waiver_signed boolean not null default false,
  waiver_signed_at timestamptz,
  booking_status text not null default 'PENDING' check (booking_status in ('PENDING', 'DEPOSIT_PAID', 'FULLY_PAID', 'CANCELLED')),
  amount_paid_aud numeric(10,2) not null default 0,
  payment_method text not null default 'PayID',
  slip_url text,
  booked_at timestamptz not null default now()
);

create index if not exists tour_bookings_tour_id_idx on public.tour_bookings (tour_id);
create index if not exists tour_bookings_status_idx on public.tour_bookings (booking_status);

-- ─── staff_profiles ─────────────────────────────────────────────────────────
create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  pin_code text,
  pin_hash text,
  full_name text not null,
  role text not null check (role in ('OWNER', 'MANAGER', 'GUIDE', 'CASHIER')),
  phone text,
  email text
);

-- ─── expenses ───────────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  amount_aud numeric(10,2) not null,
  ato_category text not null,
  vendor_name text not null,
  has_gst boolean not null default false,
  gst_amount_aud numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ─── staff_commission_ledger (referenced by owner dashboard RLS; no UI writes it yet) ──
create table if not exists public.staff_commission_ledger (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references public.staff_profiles(id),
  tour_id uuid references public.tours(id),
  amount_aud numeric(10,2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);

-- ─── insurance_alerts ───────────────────────────────────────────────────────
create table if not exists public.insurance_alerts (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  item_type text not null,
  expiry_date date not null,
  is_active boolean not null default true
);

-- ─── storage bucket for PayID payment slip uploads ─────────────────────────
insert into storage.buckets (id, name, public)
values ('payment-slips', 'payment-slips', true)
on conflict (id) do nothing;

-- Public can upload slips (booking flow has no login) and the URL is public
-- so staff dashboards can display them; no public listing/delete.
drop policy if exists "Public upload payment slips" on storage.objects;
create policy "Public upload payment slips"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'payment-slips');

drop policy if exists "Public read payment slips" on storage.objects;
create policy "Public read payment slips"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'payment-slips');

-- Next: run apply-all-policies.sql is superseded — skip straight to
-- 2026-07-add-pin-hash.sql, then the rest of the 2026-07-*.sql files in order,
-- then re-seed the 13 tours (see insert-syd-influ-3h.sql for the pattern —
-- ask the assistant for the full 13-tour INSERT if you don't have it handy).
