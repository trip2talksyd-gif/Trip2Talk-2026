-- DRAFT ONLY — do not apply via CI.
-- Review in Supabase SQL Editor, then run manually if approved.
-- Project: bljhnelgmkulxwuhedbi
--
-- Live `tours` already has luxury_price_aud (numeric, Phase 1).
-- This adds price_luxury_aud (integer, nullable) as requested and
-- keeps luxury_price_aud in sync so existing app readers still work.

alter table public.tours
  add column if not exists price_luxury_aud integer;

comment on column public.tours.price_luxury_aud is
  'Fixed Luxury stay total AUD / person. Null = no Luxury option. Checkout must look this up server-side when tour_bookings.selected_tier = luxury.';
