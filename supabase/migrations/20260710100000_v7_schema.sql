-- Trip2Talk v7 — Supabase Postgres schema

-- ─── trip_templates ───────────────────────────────────────────────────────────
create table if not exists trip_templates (
  id uuid primary key default gen_random_uuid(),
  trip_code text unique not null,
  category text not null,
  departure_type text not null,
  name_th text not null,
  tagline text not null,
  duration_days int,
  max_members_text text,
  max_seats_bookable int,
  max_seats_flag text,
  season_note text,
  seasonal_window_text text,
  travel_time text,
  highlights jsonb not null default '[]'::jsonb,
  itinerary jsonb not null default '[]'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  base_price_aud numeric(10,2) not null default 0,
  deposit_required_aud numeric(10,2) not null default 100,
  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  accommodation_policy text,
  cancellation_policy jsonb,
  deposit_policy text,
  safety_notes jsonb,
  sub_packages jsonb,
  seasonal_itineraries jsonb,
  additional_note text,
  hashtags jsonb,
  flight_info jsonb,
  promo_image_ref text,
  gallery_url text default '',
  match_tags jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── trip_departures ──────────────────────────────────────────────────────────
create table if not exists trip_departures (
  id uuid primary key default gen_random_uuid(),
  trip_code text not null references trip_templates(trip_code) on delete cascade,
  start_date date,
  end_date date,
  max_seats int not null,
  seats_booked int not null default 0,
  status text not null default 'upcoming',
  note text,
  assigned_trip_leader_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_departures_trip_code on trip_departures(trip_code);
create index if not exists idx_trip_departures_start_date on trip_departures(start_date);

-- ─── bookings ─────────────────────────────────────────────────────────────────
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  trip_code text not null,
  departure_id uuid not null references trip_departures(id),
  customer_name text not null,
  phone text not null,
  email text not null,
  seats_booked int not null,
  payment_method text not null,
  payment_status text not null,
  stripe_payment_intent_id text,
  slip_url text,
  waiver_accepted boolean not null default false,
  waiver_accepted_at timestamptz,
  waiver_accepted_ip text,
  sub_package text,
  total_price_aud numeric(10,2),
  confirmation_pdf_path text,
  compliance_docs_uploaded boolean not null default false,
  docs_deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_departure_id on bookings(departure_id);
create index if not exists idx_bookings_payment_status on bookings(payment_status);

-- ─── staff_profiles ───────────────────────────────────────────────────────────
create table if not exists staff_profiles (
  id uuid primary key default gen_random_uuid(),
  pin_code text,
  pin_hash text,
  full_name text not null,
  role text not null,
  phone text,
  email text,
  commission_rate_pct numeric(5,2),
  created_at timestamptz not null default now()
);

-- ─── staff_commission_ledger ──────────────────────────────────────────────────
create table if not exists staff_commission_ledger (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references staff_profiles(id),
  trip_code text,
  departure_id uuid references trip_departures(id),
  amount_aud numeric(10,2) not null,
  note text,
  created_at timestamptz not null default now()
);

-- ─── expenses ─────────────────────────────────────────────────────────────────
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  trip_code text,
  expense_date date not null,
  amount_aud numeric(10,2) not null,
  description text not null,
  receipt_storage_url text,
  entered_by text,
  ato_category text,
  vendor_name text,
  has_gst boolean,
  gst_amount_aud numeric(10,2),
  created_at timestamptz not null default now()
);

-- ─── company_documents ────────────────────────────────────────────────────────
create table if not exists company_documents (
  id uuid primary key default gen_random_uuid(),
  doc_type text not null,
  document_label text not null,
  expiry_date date not null,
  owner_note text,
  active boolean not null default true,
  last_alert_sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── insurance_alerts ─────────────────────────────────────────────────────────
create table if not exists insurance_alerts (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  item_type text not null,
  expiry_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── booking_inquiries ────────────────────────────────────────────────────────
create table if not exists booking_inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text not null,
  preferred_route int not null,
  preferred_date_range text not null default '',
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- ─── reviews ──────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  trip_code text,
  rating int not null,
  review_text text not null,
  photo_url text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_approved_created on reviews(approved, created_at desc);

-- ─── contact_messages ─────────────────────────────────────────────────────────
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text default '',
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- ─── site_config (company + private trip config) ──────────────────────────────
create table if not exists site_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─── Seat-lock functions ──────────────────────────────────────────────────────
create or replace function reserve_seats(p_departure_id uuid, p_seats int)
returns trip_departures
language plpgsql
as $$
declare
  result trip_departures;
begin
  if p_seats <= 0 then
    raise exception 'INVALID_SEATS: seat count must be at least 1';
  end if;

  update trip_departures
  set
    seats_booked = seats_booked + p_seats,
    status = case
      when seats_booked + p_seats >= max_seats then 'full'
      when status = 'cancelled' then status
      when status = 'completed' then status
      else 'upcoming'
    end
  where id = p_departure_id
    and start_date is not null
    and status <> 'cancelled'
    and seats_booked + p_seats <= max_seats
  returning * into result;

  if result is null then
    if exists (
      select 1 from trip_departures d
      where d.id = p_departure_id and d.start_date is null
    ) then
      raise exception 'NOT_BOOKABLE: departure has no confirmed start date';
    end if;
    if exists (
      select 1 from trip_departures d
      where d.id = p_departure_id and d.status = 'cancelled'
    ) then
      raise exception 'DEPARTURE_CANCELLED: departure is cancelled';
    end if;
    raise exception 'SEAT_LOCK_FAILED: not enough capacity';
  end if;

  return result;
end;
$$;

create or replace function release_seats(p_departure_id uuid, p_seats int)
returns trip_departures
language plpgsql
as $$
declare
  result trip_departures;
begin
  if p_seats <= 0 then
    raise exception 'INVALID_SEATS: release count must be at least 1';
  end if;

  update trip_departures
  set
    seats_booked = greatest(0, seats_booked - p_seats),
    status = case
      when status = 'cancelled' then status
      when status = 'completed' then status
      when greatest(0, seats_booked - p_seats) < max_seats then 'upcoming'
      else status
    end
  where id = p_departure_id
  returning * into result;

  if result is null then
    raise exception 'DEPARTURE_NOT_FOUND: departure not found';
  end if;

  return result;
end;
$$;

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table trip_templates enable row level security;
alter table trip_departures enable row level security;
alter table bookings enable row level security;
alter table staff_profiles enable row level security;
alter table staff_commission_ledger enable row level security;
alter table expenses enable row level security;
alter table company_documents enable row level security;
alter table insurance_alerts enable row level security;
alter table booking_inquiries enable row level security;
alter table reviews enable row level security;
alter table contact_messages enable row level security;
alter table site_config enable row level security;

-- Public read: active trip templates
create policy "public_read_active_trip_templates"
  on trip_templates for select
  to anon, authenticated
  using (active = true);

-- Public read: all departures (catalog filtering happens in app)
create policy "public_read_trip_departures"
  on trip_departures for select
  to anon, authenticated
  using (true);

-- Public read: approved reviews only
create policy "public_read_approved_reviews"
  on reviews for select
  to anon, authenticated
  using (approved = true);

-- Service role bypasses RLS by default in Supabase
