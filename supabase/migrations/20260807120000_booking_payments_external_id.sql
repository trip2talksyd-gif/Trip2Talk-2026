-- External gateway payment id (Square payment id) for idempotent webhook mark-paid.
alter table public.booking_payments
  add column if not exists external_payment_id text null;

create unique index if not exists booking_payments_external_payment_id_uidx
  on public.booking_payments (external_payment_id)
  where external_payment_id is not null;

comment on column public.booking_payments.external_payment_id is
  'Square (or other gateway) payment id — unique so webhooks are idempotent.';
