-- Lets an expense be tagged to the trip it was spent on (nullable — general
-- business expenses like insurance/marketing stay untagged), so revenue and
-- cost can be compared per trip instead of only as a monthly total.
alter table public.expenses
  add column if not exists trip_code text;

create index if not exists expenses_trip_code_idx on public.expenses (trip_code);

-- Day-of attendance, separate from payment status (booking_status already
-- tracks pending_payment/deposit_paid/fully_paid/cancelled/no_show — this is
-- specifically "did they actually show up", checked off by the guide).
alter table public.tour_bookings
  add column if not exists attended boolean;
