-- DRAFT ONLY. Review, then run by hand on bljhnelgmkulxwuhedbi.
-- Do not run the UPDATE until the SELECT shows only the two test rows.
-- Supaporn Juntarach on TAS-SU-JAN22_25 is a real customer. This script never names that booking.

-- 1) Show the rows first.
select
  b.id,
  b.first_name_en,
  b.last_name_en,
  b.trip_code,
  b.booking_status,
  b.cancelled_at,
  b.amount_paid_aud,
  b.booking_reference,
  p.id as payment_id,
  p.amount_aud as payment_amount_aud,
  p.status as payment_status,
  p.label as payment_label,
  p.receipt_invoice_number
from public.tour_bookings b
left join public.booking_payments p on p.booking_id = b.id
where
  (
    b.trip_code = 'NZ-6D5N-FEB14_19'
    and concat_ws(' ', b.first_name_en, b.last_name_en) ilike '%4 asxcsa%'
  )
  or (
    b.trip_code = 'TAS-SU-JAN22_25'
    and concat_ws(' ', b.first_name_en, b.last_name_en) ilike '%1 f%'
  )
order by b.trip_code, b.id;

-- Invoice ref to confirm in the SELECT result: MWR43UMT
-- (look in booking_reference or receipt_invoice_number).

-- 2) After you copy the two ids from the SELECT, uncomment and replace the ids.
-- Income and GST reports already skip a booking when cancelled_at is set
-- or booking_status = 'cancelled' (staff-api installment_income_summary).
-- Do not delete booking_payments.
--
-- update public.tour_bookings
-- set booking_status = 'cancelled',
--     cancelled_at = now(),
--     cancelled_by = 'staff',
--     cancel_reason = 'test booking cleanup'
-- where id in (
--   '[BOOKING_ID_4_ASXCSA]',
--   '[BOOKING_ID_1_F]'
-- )
-- and trip_code in ('NZ-6D5N-FEB14_19', 'TAS-SU-JAN22_25')
-- and id not in (
--   select id from public.tour_bookings
--   where trip_code = 'TAS-SU-JAN22_25'
--     and concat_ws(' ', first_name_en, last_name_en) ilike '%supaporn%juntarach%'
-- );
