-- Safety info for trip-day guide quick view.
-- Table: public.tour_bookings (booking already holds emergency + medical columns).
-- DO NOT auto-deploy: owner reviews and applies via Supabase Dashboard SQL or CLI.
--
-- Already present (no change):
--   emergency_contact_name, emergency_contact_phone, medical_conditions,
--   dietary_requirements, oshc_provider, oshc_expiry
-- New columns below only.

alter table public.tour_bookings
  add column if not exists allergies text null;

alter table public.tour_bookings
  add column if not exists insurance_provider text null;

alter table public.tour_bookings
  add column if not exists insurance_policy_number text null;

alter table public.tour_bookings
  add column if not exists other_notes text null;

comment on column public.tour_bookings.allergies is
  'Free-text allergies for trip-day guide view; empty/none if none.';
comment on column public.tour_bookings.insurance_provider is
  'Travel insurance provider (separate from OSHC student cover).';
comment on column public.tour_bookings.insurance_policy_number is
  'Travel insurance policy number for emergencies.';
comment on column public.tour_bookings.other_notes is
  'Catch-all for guides: fear of heights, cannot swim, mobility needs, etc.';
