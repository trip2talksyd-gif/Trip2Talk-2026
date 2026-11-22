-- Booking flights + missed-flight policy acknowledgement. DRAFT ONLY.
-- Run manually on bljhnelgmkulxwuhedbi. Idempotent. No DROP.
-- lookup-my-trip uses the service role key (role service_role), not anon.
-- Grant SELECT on the customer view and EXECUTE on rebook only to service_role.

create table if not exists public.booking_flights (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.tour_bookings (id) on delete cascade,
  leg text not null,
  booked_by text not null,
  airline text not null,
  flight_no text not null,
  from_airport text not null,
  to_airport text not null,
  depart_at timestamptz not null,
  arrive_at timestamptz not null,
  depart_tz text not null,
  arrive_tz text not null,
  pnr text null,
  status text not null default 'scheduled',
  missed_reason text null,
  replaces_flight_id uuid null references public.booking_flights (id) on delete set null,
  staff_note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by_staff_id uuid null references public.staff_profiles (id) on delete set null
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'booking_flights_leg_chk') then
    alter table public.booking_flights
      add constraint booking_flights_leg_chk check (leg in ('outbound', 'return'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'booking_flights_booked_by_chk') then
    alter table public.booking_flights
      add constraint booking_flights_booked_by_chk check (booked_by in ('customer', 'trip2talk'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'booking_flights_status_chk') then
    alter table public.booking_flights
      add constraint booking_flights_status_chk
      check (status in ('scheduled', 'missed', 'rebooked', 'cancelled'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'booking_flights_missed_reason_chk') then
    alter table public.booking_flights
      add constraint booking_flights_missed_reason_chk
      check (missed_reason is null or missed_reason in ('customer', 'airline', 'trip2talk', 'other'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'booking_flights_from_iata_chk') then
    alter table public.booking_flights
      add constraint booking_flights_from_iata_chk check (from_airport ~ '^[A-Z]{3}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'booking_flights_to_iata_chk') then
    alter table public.booking_flights
      add constraint booking_flights_to_iata_chk check (to_airport ~ '^[A-Z]{3}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'booking_flights_flight_no_chk') then
    alter table public.booking_flights
      add constraint booking_flights_flight_no_chk check (flight_no ~ '^[A-Z0-9]{2,10}$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'booking_flights_arrive_after_depart_chk') then
    alter table public.booking_flights
      add constraint booking_flights_arrive_after_depart_chk check (arrive_at > depart_at);
  end if;
end $$;

create index if not exists booking_flights_booking_leg_idx
  on public.booking_flights (booking_id, leg);

create index if not exists booking_flights_replaces_idx
  on public.booking_flights (replaces_flight_id);

comment on column public.booking_flights.pnr is 'STAFF ONLY.';
comment on column public.booking_flights.staff_note is 'STAFF ONLY.';
comment on column public.booking_flights.missed_reason is 'STAFF ONLY. customer | airline | trip2talk | other.';

alter table public.booking_flights enable row level security;
revoke all on public.booking_flights from public;
revoke all on public.booking_flights from anon, authenticated;
grant select, insert, update on public.booking_flights to service_role;

create or replace view public.booking_flights_customer
with (security_invoker = true) as
select
  f.id,
  f.booking_id,
  f.leg,
  f.booked_by,
  f.airline,
  f.flight_no,
  f.from_airport,
  f.to_airport,
  f.depart_at,
  f.arrive_at,
  f.depart_tz,
  f.arrive_tz,
  f.status,
  f.created_at
from public.booking_flights f
where f.status not in ('missed', 'cancelled')
  and not exists (
    select 1
    from public.booking_flights newer
    where newer.booking_id = f.booking_id
      and newer.leg = f.leg
      and newer.status not in ('missed', 'cancelled')
      and newer.created_at > f.created_at
  );

revoke all on public.booking_flights_customer from public;
revoke all on public.booking_flights_customer from anon, authenticated;
grant select on public.booking_flights_customer to service_role;

comment on view public.booking_flights_customer is
  'Current flight per leg. No pnr, staff_note, or missed_reason. SELECT granted only to service_role (lookup-my-trip).';

alter table public.tour_bookings
  add column if not exists flight_policy_ack_at timestamptz null;

alter table public.tour_bookings
  add column if not exists flight_policy_version text null;

create or replace function public.rebook_booking_flight(
  p_old_id uuid,
  p_missed_reason text,
  p_airline text,
  p_flight_no text,
  p_from_airport text,
  p_to_airport text,
  p_depart_at timestamptz,
  p_arrive_at timestamptz,
  p_depart_tz text,
  p_arrive_tz text,
  p_pnr text,
  p_staff_note text,
  p_staff_id uuid,
  p_booked_by text
) returns public.booking_flights
language plpgsql
security definer
set search_path = public
as $$
declare
  old_row public.booking_flights;
  new_row public.booking_flights;
begin
  if p_missed_reason is null or p_missed_reason not in ('customer', 'airline', 'trip2talk', 'other') then
    raise exception 'invalid_missed_reason' using errcode = '22023';
  end if;
  if p_booked_by is null or p_booked_by not in ('customer', 'trip2talk') then
    raise exception 'invalid_booked_by' using errcode = '22023';
  end if;

  select * into old_row from public.booking_flights where id = p_old_id for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if old_row.status not in ('scheduled', 'rebooked') then
    raise exception 'flight_already_closed' using errcode = '22023';
  end if;

  update public.booking_flights
  set status = 'missed',
      missed_reason = p_missed_reason,
      updated_at = now(),
      updated_by_staff_id = p_staff_id
  where id = p_old_id;

  insert into public.booking_flights (
    booking_id, leg, booked_by, airline, flight_no, from_airport, to_airport,
    depart_at, arrive_at, depart_tz, arrive_tz, pnr, status,
    replaces_flight_id, staff_note, updated_by_staff_id
  ) values (
    old_row.booking_id, old_row.leg, p_booked_by, p_airline, p_flight_no, p_from_airport, p_to_airport,
    p_depart_at, p_arrive_at, p_depart_tz, p_arrive_tz, p_pnr, 'rebooked',
    p_old_id, p_staff_note, p_staff_id
  )
  returning * into new_row;

  return new_row;
end;
$$;

revoke all on function public.rebook_booking_flight(
  uuid, text, text, text, text, text, timestamptz, timestamptz, text, text, text, text, uuid, text
) from public;
revoke all on function public.rebook_booking_flight(
  uuid, text, text, text, text, text, timestamptz, timestamptz, text, text, text, text, uuid, text
) from anon, authenticated;
grant execute on function public.rebook_booking_flight(
  uuid, text, text, text, text, text, timestamptz, timestamptz, text, text, text, text, uuid, text
) to service_role;

do $$
begin
  if has_table_privilege('anon', 'public.booking_flights', 'select')
     or has_table_privilege('anon', 'public.booking_flights_customer', 'select') then
    raise exception 'anon must not select booking_flights or booking_flights_customer';
  end if;
end $$;

-- Manual anon test (expect 42501, no rows):
--   set role anon;
--   select * from public.booking_flights;
--   select * from public.booking_flights_customer;
--   reset role;
