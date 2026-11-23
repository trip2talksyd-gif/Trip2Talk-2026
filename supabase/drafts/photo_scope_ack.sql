-- DRAFT ONLY. Do not apply until the photo-scope PR is approved.
-- Adds acknowledgement columns. Does not change anon-insert RLS
-- (pending_payment and amount_paid_aud = 0 stay as they are).

alter table public.tour_bookings
  add column if not exists photo_scope_ack_at timestamptz null;

alter table public.tour_bookings
  add column if not exists photo_scope_version text null;
