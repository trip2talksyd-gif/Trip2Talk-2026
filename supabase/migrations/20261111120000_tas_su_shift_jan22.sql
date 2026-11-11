-- Tasmania Summer photo trip: customer asked to move 24–27 Jan 2027 → 22–25 Jan 2027.
-- 4-day duration is unchanged, so departure 2027-01-22 ends 2027-01-25.
-- Idempotent: no-op once the row already has the new code and date.

update public.tours
set
  departure_date = '2027-01-22',
  trip_code = 'TAS-SU-JAN22_25'
where id = 'e875911e-541d-44d6-8165-4e4339da5fab'
  and trip_code = 'TAS-SU-JAN24_27'
  and departure_date = '2027-01-24';
