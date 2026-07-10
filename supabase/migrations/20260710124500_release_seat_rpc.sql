-- Trip2Talk V7 — rollback companion to book_seat()
-- Run after 20260710120000_full_schema_fresh_start.sql
-- Decrements booked_seats when a tour_bookings insert fails after a successful seat hold.

create or replace function public.release_seat(p_tour_id uuid, p_seats_requested int default 1)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_success boolean;
begin
  update public.tours
  set booked_seats = greatest(0, booked_seats - p_seats_requested),
      updated_at = now()
  where id = p_tour_id;

  get diagnostics v_success = row_count;
  return v_success > 0;
end;
$$;

grant execute on function public.release_seat(uuid, int) to anon;

comment on function public.release_seat is
  'Rollback seat hold after failed booking insert — decrements booked_seats, never below 0.';
