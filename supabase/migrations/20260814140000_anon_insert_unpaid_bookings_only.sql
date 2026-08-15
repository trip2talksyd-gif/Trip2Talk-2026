-- Tighten anon INSERT on tour_bookings so guests cannot fake a paid booking.
-- Project: bljhnelgmkulxwuhedbi (trip2talk-official)
--
-- Do NOT run against xwdtjwzjkqunewxjpimm.
-- Apply via SQL Editor after review. This file does not auto-deploy.
--
-- Before: anon INSERT policies used WITH CHECK (true), so a browser with the
-- public anon key could insert booking_status = 'deposit_paid' / 'fully_paid'
-- and any amount_paid_aud.
-- After: anon may only insert unpaid rows (pending_payment + $0).
-- Paid status is set only by service-role (staff-api, apply_square_payment).

alter table public.tour_bookings enable row level security;

-- Known insert-policy names from git + one-off SQL (lockdown / V5 / V7).
drop policy if exists "anon can insert bookings" on public.tour_bookings;
drop policy if exists "Public insert bookings" on public.tour_bookings;
drop policy if exists "anon insert tour_bookings" on public.tour_bookings;
drop policy if exists "anon insert unpaid bookings only" on public.tour_bookings;

create policy "anon insert unpaid bookings only"
  on public.tour_bookings
  for insert
  to anon
  with check (
    booking_status = 'pending_payment'
    and amount_paid_aud is not distinct from 0
  );

comment on policy "anon insert unpaid bookings only" on public.tour_bookings is
  'Public booking form only: unpaid hold. Paid status is service-role (staff-api / apply_square_payment).';
