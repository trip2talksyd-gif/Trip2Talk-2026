-- Allow soft-archive of tours (hide from listings, keep bookings/history).
-- Distinct from 'cancelled' (trip will not run) — archived = ops housekeeping.

alter table public.tours
  drop constraint if exists tours_status_check;

alter table public.tours
  add constraint tours_status_check
  check (status in ('draft', 'published', 'confirmed', 'completed', 'cancelled', 'archived'));
