-- Financial action audit trail (installment deletes, etc.).
-- Staff-api (service role) writes; no anon/authenticated grants.

create table if not exists public.staff_financial_audit (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  staff_id uuid null references public.staff_profiles (id) on delete set null,
  staff_role text null,
  staff_name text null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  booking_id uuid null references public.tour_bookings (id) on delete set null,
  amount_aud numeric null,
  installment_no int null,
  receipt_invoice_number text null,
  detail jsonb null
);

create index if not exists staff_financial_audit_created_at_idx
  on public.staff_financial_audit (created_at desc);

create index if not exists staff_financial_audit_booking_id_idx
  on public.staff_financial_audit (booking_id);

alter table public.staff_financial_audit enable row level security;
-- Intentionally no public policies — service role only via staff-api.
