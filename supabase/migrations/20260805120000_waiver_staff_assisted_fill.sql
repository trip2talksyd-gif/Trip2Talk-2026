-- Staff-assisted waiver authorization (audit trail).
-- Table: public.waiver_signatures (dedicated waiver audit — not tour_bookings).
-- DO NOT auto-deploy: owner reviews and applies via Supabase Dashboard SQL or CLI.

alter table public.waiver_signatures
  add column if not exists filled_by_staff boolean not null default false;

alter table public.waiver_signatures
  add column if not exists staff_fill_staff_id uuid null
    references public.staff_profiles (id) on delete set null;

alter table public.waiver_signatures
  add column if not exists staff_fill_authorized_at timestamptz null;

alter table public.waiver_signatures
  add column if not exists staff_fill_authorization_note text null;

alter table public.waiver_signatures
  add column if not exists staff_fill_evidence_url text null;

-- Optional link to the booking this waiver covers (staff-assisted path).
alter table public.waiver_signatures
  add column if not exists booking_id uuid null
    references public.tour_bookings (id) on delete set null;

-- Denormalized staff display name at time of authorization (survives profile edits).
alter table public.waiver_signatures
  add column if not exists staff_fill_staff_name text null;

create index if not exists waiver_signatures_booking_id_idx
  on public.waiver_signatures (booking_id)
  where booking_id is not null;

create index if not exists waiver_signatures_filled_by_staff_idx
  on public.waiver_signatures (filled_by_staff)
  where filled_by_staff = true;

comment on column public.waiver_signatures.filled_by_staff is
  'True when staff filled the waiver on the customer''s explicit request (audit trail).';
comment on column public.waiver_signatures.staff_fill_staff_id is
  'staff_profiles.id of the staff member who submitted the assisted waiver.';
comment on column public.waiver_signatures.staff_fill_authorized_at is
  'When staff recorded customer authorization to fill on their behalf.';
comment on column public.waiver_signatures.staff_fill_authorization_note is
  'Free-text record of how the customer requested assistance (e.g. Facebook Messenger).';
comment on column public.waiver_signatures.staff_fill_evidence_url is
  'Optional Storage path or URL to screenshot/message proving the request.';
comment on column public.waiver_signatures.booking_id is
  'Optional tour_bookings.id this signature is attached to.';
comment on column public.waiver_signatures.staff_fill_staff_name is
  'Staff full_name snapshot at authorization time for display badges.';
