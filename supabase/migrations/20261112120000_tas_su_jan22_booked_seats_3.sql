-- Staff asked to show 3 seats taken on TAS-SU-JAN22_25 (max 5).
-- Idempotent: only writes when the counter is still below 3.

update public.tours
set booked_seats = 3
where id = 'e875911e-541d-44d6-8165-4e4339da5fab'
  and trip_code = 'TAS-SU-JAN22_25'
  and booked_seats < 3
  and max_seats >= 3;
