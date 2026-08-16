-- Health/emergency retention wipe (60 days after trip end).
-- Metadata-only log: field NAMES, never values.
-- Service role (cron-daily) only. Do not grant to anon/authenticated.

create table if not exists public.health_data_wipe_log (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid null references public.tour_bookings (id) on delete set null,
  booking_reference text null,
  trip_code text not null,
  wiped_at timestamptz not null default now(),
  fields_wiped text[] not null,
  trip_end_date date not null
);

create index if not exists health_data_wipe_log_wiped_at_idx
  on public.health_data_wipe_log (wiped_at desc);

create index if not exists health_data_wipe_log_booking_id_idx
  on public.health_data_wipe_log (booking_id);

comment on table public.health_data_wipe_log is
  'Audit of 60-day health/emergency field wipes. Stores field names only — never values.';

alter table public.health_data_wipe_log enable row level security;
revoke all on public.health_data_wipe_log from anon, authenticated;

-- One transaction: NULL the 12 target columns + insert name-only audit row.
-- Eligibility (trip ended 60+ days ago) is decided by cron-daily TypeScript
-- (same finder as health_retention_dry_run). This RPC is not a public API.
create or replace function public.apply_health_data_wipe(
  p_booking_id uuid,
  p_trip_end_date date
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.tour_bookings%rowtype;
  v_fields text[];
begin
  if p_booking_id is null or p_trip_end_date is null then
    return json_build_object('ok', false, 'error', 'invalid_params');
  end if;

  select * into v_booking
  from public.tour_bookings
  where id = p_booking_id
  for update;

  if not found then
    return json_build_object('ok', false, 'error', 'booking_not_found');
  end if;

  v_fields := array_remove(array[
    case
      when v_booking.medical_conditions is not null
        and btrim(v_booking.medical_conditions) <> ''
        then 'medical_conditions'
    end,
    case
      when v_booking.allergies is not null
        and btrim(v_booking.allergies) <> ''
        then 'allergies'
    end,
    case
      when v_booking.emergency_contact_name is not null
        and btrim(v_booking.emergency_contact_name) <> ''
        then 'emergency_contact_name'
    end,
    case
      when v_booking.emergency_contact_phone is not null
        and btrim(v_booking.emergency_contact_phone) <> ''
        then 'emergency_contact_phone'
    end,
    case
      when v_booking.emergency_contact_relationship is not null
        and btrim(v_booking.emergency_contact_relationship) <> ''
        then 'emergency_contact_relationship'
    end,
    case
      when v_booking.medications is not null
        and btrim(v_booking.medications) <> ''
        then 'medications'
    end,
    case
      when v_booking.dietary_requirements is not null
        and btrim(v_booking.dietary_requirements) <> ''
        then 'dietary_requirements'
    end,
    case
      when v_booking.oshc_provider is not null
        and btrim(v_booking.oshc_provider) <> ''
        then 'oshc_provider'
    end,
    case
      when v_booking.oshc_expiry is not null
        then 'oshc_expiry'
    end,
    case
      when v_booking.oshc_membership_number is not null
        and btrim(v_booking.oshc_membership_number) <> ''
        then 'oshc_membership_number'
    end,
    case
      when v_booking.travel_insurance_provider is not null
        and btrim(v_booking.travel_insurance_provider) <> ''
        then 'travel_insurance_provider'
    end,
    case
      when v_booking.travel_insurance_policy_number is not null
        and btrim(v_booking.travel_insurance_policy_number) <> ''
        then 'travel_insurance_policy_number'
    end
  ], null);

  if coalesce(cardinality(v_fields), 0) = 0 then
    return json_build_object('ok', true, 'skipped', true, 'fields_wiped', array[]::text[]);
  end if;

  update public.tour_bookings
  set
    medical_conditions = null,
    allergies = null,
    emergency_contact_name = null,
    emergency_contact_phone = null,
    emergency_contact_relationship = null,
    medications = null,
    dietary_requirements = null,
    oshc_provider = null,
    oshc_expiry = null,
    oshc_membership_number = null,
    travel_insurance_provider = null,
    travel_insurance_policy_number = null
  where id = p_booking_id;

  insert into public.health_data_wipe_log (
    booking_id,
    booking_reference,
    trip_code,
    fields_wiped,
    trip_end_date
  ) values (
    v_booking.id,
    v_booking.booking_reference,
    v_booking.trip_code,
    v_fields,
    p_trip_end_date
  );

  return json_build_object(
    'ok', true,
    'skipped', false,
    'booking_id', v_booking.id,
    'booking_reference', v_booking.booking_reference,
    'trip_code', v_booking.trip_code,
    'fields_wiped', to_json(v_fields)
  );
end;
$$;

revoke all on function public.apply_health_data_wipe(uuid, date) from public;
grant execute on function public.apply_health_data_wipe(uuid, date) to service_role;

comment on function public.apply_health_data_wipe(uuid, date) is
  'NULL 12 health/emergency columns and log field names only. Caller must pass an eligible booking_id.';
