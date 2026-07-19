-- My Trip guest lookup: persist booking_reference + secure anon RPC.
-- Apply via Supabase SQL Editor if migration runner is not used (see MEMORY.md).

alter table public.tour_bookings
  add column if not exists booking_reference text;

create unique index if not exists tour_bookings_booking_reference_uidx
  on public.tour_bookings (booking_reference)
  where booking_reference is not null;

-- Allow anon inserts to include the new column (re-grant full insert list).
grant insert (
  tour_id, trip_code, first_name_th, last_name_th, first_name_en, last_name_en,
  passport_number, email, phone, dietary_requirements, medical_conditions,
  oshc_provider, oshc_expiry, waiver_signed, waiver_signed_at,
  booking_status, amount_paid_aud, payment_method, slip_url, booking_reference
) on public.tour_bookings to anon;

create or replace function public.lookup_my_trip(
  p_reference text,
  p_email text default null,
  p_phone text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  ref_norm text;
  email_norm text;
  phone_digits text;
begin
  ref_norm := upper(trim(coalesce(p_reference, '')));
  email_norm := lower(trim(coalesce(p_email, '')));
  phone_digits := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

  if ref_norm = '' then
    return json_build_object('found', false, 'error', 'reference_required');
  end if;

  if email_norm = '' and phone_digits = '' then
    return json_build_object('found', false, 'error', 'contact_required');
  end if;

  select json_build_object(
    'found', true,
    'booking', json_build_object(
      'reference', b.booking_reference,
      'trip_code', b.trip_code,
      'booking_status', b.booking_status,
      'amount_paid_aud', b.amount_paid_aud,
      'booked_at', b.booked_at,
      'first_name_en', b.first_name_en,
      'last_name_en', b.last_name_en,
      'name_en', t.name_en,
      'name_th', t.name_th,
      'departure_date', t.departure_date,
      'price_aud', t.price_aud,
      'deposit_aud', t.deposit_aud
    )
  )
  into result
  from public.tour_bookings b
  join public.tours t on t.id = b.tour_id
  where upper(coalesce(b.booking_reference, '')) = ref_norm
    and (
      (email_norm <> '' and lower(b.email) = email_norm)
      or (
        phone_digits <> ''
        and regexp_replace(b.phone, '\D', '', 'g') = phone_digits
      )
    )
  limit 1;

  if result is null then
    return json_build_object('found', false);
  end if;

  return result;
end;
$$;

grant execute on function public.lookup_my_trip(text, text, text) to anon, authenticated;

comment on function public.lookup_my_trip(text, text, text) is
  'Guest My Trip lookup — requires booking_reference plus matching email or phone. Returns limited non-sensitive fields.';
