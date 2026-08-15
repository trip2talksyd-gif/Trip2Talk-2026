-- Staff follow-up note on pending PayID bookings (flag slip / chase customer).
-- Does not change booking_status — row stays pending_payment until Verify / record_payment.

alter table public.tour_bookings
  add column if not exists staff_follow_up_note text null;

comment on column public.tour_bookings.staff_follow_up_note is
  'Cashier flag on unpaid bookings (e.g. bad/missing PayID slip). Not a payment status.';
