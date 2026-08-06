-- Manual travel date override on bookings (staff-editable).
-- When set, invoices/receipts prefer this over tours.departure_date / trip-code derivation.

alter table public.tour_bookings
  add column if not exists travel_date date null;

comment on column public.tour_bookings.travel_date is
  'Staff-set travel/departure date for invoices. Overrides auto-derived tour/trip-code dates when present.';
