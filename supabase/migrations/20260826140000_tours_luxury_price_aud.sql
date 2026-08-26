-- DRAFT ONLY — do not apply via CI.
-- Phase 1: display-only Luxury list price. Checkout still uses tours.price_aud.
-- Review in Supabase SQL Editor, then run manually if approved.
-- Project: bljhnelgmkulxwuhedbi
--
-- Phase 2 (do NOT add in this migration):
--   alter table public.tour_bookings
--     add column if not exists stay_tier text
--       check (stay_tier is null or stay_tier in ('standard','luxury')),
--     add column if not exists quoted_price_aud numeric(10,2);
-- Square / POS / BookingPage must keep charging Standard until Phase 2.

alter table public.tours
  add column if not exists luxury_price_aud numeric(10,2);

comment on column public.tours.luxury_price_aud is
  'Optional Luxury stay list price (AUD / person). Null = no Luxury tier. Phase 1 display only; bookings still use price_aud.';
