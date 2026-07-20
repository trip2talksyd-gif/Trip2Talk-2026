-- Installment payments — customers who ask to split the trip price into 2 or
-- 4 payments (still manual PayID transfers, no payment gateway). This adds:
--   1) an informational "plan" the customer picks at booking time, and
--   2) an append-only ledger of each payment actually recorded by staff, so
--      every installment can get its own tax invoice instead of overwriting
--      a single amount_paid_aud value.

alter table public.tour_bookings
  add column if not exists payment_plan_installments int default 1;

create table if not exists public.booking_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.tour_bookings(id) on delete cascade,
  amount_aud numeric not null,
  payment_method text,
  installment_no int not null,
  created_at timestamptz not null default now()
);

create index if not exists booking_payments_booking_id_idx on public.booking_payments(booking_id);

alter table public.booking_payments enable row level security;
-- No anon/authenticated grants on purpose — staff-api (service-role key) is
-- the only path in, same pattern as tour_bookings/expenses.
