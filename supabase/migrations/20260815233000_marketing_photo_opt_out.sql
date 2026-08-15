-- Guest marketing photo/video opt-out (waiver: email before departure).
-- Non-destructive. Staff toggle via staff-api set_marketing_photo_opt_out.
--
-- Later (step 2/3, not this migration): 60-day sensitive wipe should NULL:
-- medical_conditions, allergies, emergency_contact_name, emergency_contact_phone,
-- emergency_contact_relationship, medications, dietary_requirements,
-- and insurance/OSHC fields. Do not drop booking/payment rows.

alter table public.tour_bookings
  add column if not exists marketing_photo_opt_out boolean not null default false;

alter table public.tour_bookings
  add column if not exists marketing_photo_opt_out_at timestamptz null;

alter table public.tour_bookings
  add column if not exists marketing_photo_opt_out_note text null;

comment on column public.tour_bookings.marketing_photo_opt_out is
  'True when the guest emailed to opt out of marketing use of trip photos/video.';

comment on column public.tour_bookings.marketing_photo_opt_out_at is
  'When staff recorded the marketing photo opt-out (or last confirmed it).';

comment on column public.tour_bookings.marketing_photo_opt_out_note is
  'Staff note: who emailed, booking ref, and who recorded the opt-out.';
