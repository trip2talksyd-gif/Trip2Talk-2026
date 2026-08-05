-- Combined Phase D extension + Phase F installment columns.
-- DO NOT auto-deploy — owner reviews and applies via Dashboard SQL or CLI.
--
-- Part 1: Safety / insurance / flight fields on tour_bookings
-- (allergies/insurance_provider/other_notes may already exist from
--  20260805130000_booking_safety_info.sql — IF NOT EXISTS is safe.)
-- Part 2: Extend booking_payments for labeled installment lifecycle.

-- ─── Part 1: tour_bookings safety + flights ─────────────────────────────────

alter table public.tour_bookings
  add column if not exists allergies text null;

alter table public.tour_bookings
  add column if not exists other_notes text null;

-- Insurance type: oshc (default for Thai student-visa majority) | travel_insurance | none
alter table public.tour_bookings
  add column if not exists insurance_type text null default 'oshc';

alter table public.tour_bookings
  add column if not exists oshc_membership_number text null;

alter table public.tour_bookings
  add column if not exists oshc_risk_acknowledged boolean null default false;

-- Prefer travel_insurance_* names; keep legacy insurance_provider/policy if present
alter table public.tour_bookings
  add column if not exists insurance_provider text null;

alter table public.tour_bookings
  add column if not exists insurance_policy_number text null;

alter table public.tour_bookings
  add column if not exists travel_insurance_provider text null;

alter table public.tour_bookings
  add column if not exists travel_insurance_policy_number text null;

-- Opt-in flight booking assist (sensitive — staff-api only for reads beyond own insert)
alter table public.tour_bookings
  add column if not exists flight_booking_requested boolean not null default false;

alter table public.tour_bookings
  add column if not exists flight_legal_first_name text null;

alter table public.tour_bookings
  add column if not exists flight_legal_last_name text null;

alter table public.tour_bookings
  add column if not exists flight_date_of_birth date null;

alter table public.tour_bookings
  add column if not exists flight_passport_number text null;

alter table public.tour_bookings
  add column if not exists flight_nationality text null;

alter table public.tour_bookings
  add column if not exists flight_frequent_flyer_number text null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'tour_bookings_insurance_type_check'
  ) then
    alter table public.tour_bookings
      add constraint tour_bookings_insurance_type_check
      check (insurance_type is null or insurance_type in ('oshc', 'travel_insurance', 'none'));
  end if;
end $$;

comment on column public.tour_bookings.insurance_type is
  'oshc | travel_insurance | none — default oshc for Thai student-visa customers.';
comment on column public.tour_bookings.oshc_risk_acknowledged is
  'Customer acknowledged OSHC does not cover repatriation of remains.';
comment on column public.tour_bookings.flight_passport_number is
  'SENSITIVE — required for NZ flights only; staff-api read path only after insert.';
comment on column public.tour_bookings.flight_booking_requested is
  'Customer opted in for Trip2Talk to book flights on their behalf.';

-- ─── Part 2: booking_payments installment lifecycle ─────────────────────────
-- Existing table uses installment_no (= sequence_no) and amount_aud.
-- Extend with label/status/due_date/paid_at/receipt/staff.

alter table public.booking_payments
  add column if not exists label text null;

alter table public.booking_payments
  add column if not exists status text null default 'paid';

alter table public.booking_payments
  add column if not exists due_date date null;

alter table public.booking_payments
  add column if not exists paid_at timestamptz null;

alter table public.booking_payments
  add column if not exists receipt_invoice_number text null;

alter table public.booking_payments
  add column if not exists recorded_by_staff_id uuid null
    references public.staff_profiles (id) on delete set null;

-- Backfill: existing rows were recorded as paid payments
update public.booking_payments
set status = 'paid',
    paid_at = coalesce(paid_at, created_at),
    label = coalesce(label, case when installment_no = 1 then 'Deposit' else 'Installment ' || installment_no::text end)
where status is null or paid_at is null or label is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'booking_payments_status_check'
  ) then
    alter table public.booking_payments
      add constraint booking_payments_status_check
      check (status in ('pending', 'paid', 'overdue'));
  end if;
end $$;

comment on column public.booking_payments.label is
  'Display label e.g. Deposit, Installment 2/3.';
comment on column public.booking_payments.status is
  'pending | paid | overdue — deposit is sequence/installment_no = 1.';
comment on column public.booking_payments.receipt_invoice_number is
  'Tax invoice number generated for this installment when marked paid.';
