-- DRAFT ONLY — do not apply via CI.
-- Review in Supabase SQL Editor, then run manually if approved.
-- Project: bljhnelgmkulxwuhedbi
--
-- Remembers Standard vs Luxury at insert time. Charge amount must still
-- be derived server-side from tours.price_luxury_aud / price_aud.
-- Anon insert: ignore any client-supplied dollar amount (none is stored here).

alter table public.tour_bookings
  add column if not exists selected_tier text;

alter table public.tour_bookings
  drop constraint if exists tour_bookings_selected_tier_check;

alter table public.tour_bookings
  add constraint tour_bookings_selected_tier_check
  check (selected_tier is null or selected_tier in ('standard', 'luxury'));

comment on column public.tour_bookings.selected_tier is
  'standard | luxury. Null on pre-Phase-2 rows = treat as standard.';
