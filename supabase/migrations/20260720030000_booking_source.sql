-- Where a booking came from — most customers message via Facebook rather
-- than booking on the website, so staff-entered bookings need a way to note
-- that instead of the email field being (ab)used for it.
alter table public.tour_bookings
  add column if not exists source text;
