-- Adds date of birth (required for domestic flight ticketing — must match
-- passport) and emergency contact fields to the booking form.
alter table public.tour_bookings
  add column if not exists date_of_birth date,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text;
