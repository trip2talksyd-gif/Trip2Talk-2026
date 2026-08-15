-- Customer self-serve waiver links: unguessable token per booking.
-- Token is NOT booking_reference (that appears on receipts). Staff copy
-- https://www.trip2talk.com.au/waiver/<token>. Lookup/submit go through
-- the public-waiver Edge Function (service role) — anon never SELECTs this column.

alter table public.tour_bookings
  add column if not exists waiver_token text;

create unique index if not exists tour_bookings_waiver_token_uidx
  on public.tour_bookings (waiver_token)
  where waiver_token is not null;

comment on column public.tour_bookings.waiver_token is
  'Cryptographically random opaque token for /waiver/:token customer self-serve. Never equal to booking_reference.';
