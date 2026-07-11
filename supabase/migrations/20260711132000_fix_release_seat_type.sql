-- Trip2Talk V7 — fix release_seat boolean/integer type error + waiver anon SELECT
-- Project: bljhnelgmkulxwuhedbi (trip2talk-official)
-- Run manually in Supabase SQL Editor (not via CLI).
--
-- Root cause of 42883 "operator does not exist: boolean > integer":
--   GET DIAGNOSTICS <boolean_var> = ROW_COUNT assigns an INTEGER into a BOOLEAN,
--   then `<boolean_var> > 0` fails. Use an INTEGER for row_count instead.
-- Also align book_seat / release_seat to return json { success, message }.

-- ----------------------------------------------------------------------------
-- 1. book_seat — same contract as release_seat (json), correct row_count type
-- ----------------------------------------------------------------------------
drop function if exists public.book_seat(uuid, integer);

create function public.book_seat(p_tour_id uuid, p_seats_requested integer default 1)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  if p_seats_requested is null or p_seats_requested < 1 then
    return json_build_object(
      'success', false,
      'message', 'invalid seats requested'
    );
  end if;

  update public.tours
  set booked_seats = booked_seats + p_seats_requested,
      updated_at = now()
  where id = p_tour_id
    and booked_seats + p_seats_requested <= max_seats
    and status in ('published', 'confirmed');

  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    return json_build_object(
      'success', true,
      'message', 'seat reserved'
    );
  end if;

  return json_build_object(
    'success', false,
    'message', 'seats full or tour not bookable'
  );
end;
$$;

grant execute on function public.book_seat(uuid, integer) to anon, authenticated;

comment on function public.book_seat(uuid, integer) is
  'Atomic seat hold — increments tours.booked_seats. Returns json {success, message}. Does not insert tour_bookings.';


-- ----------------------------------------------------------------------------
-- 2. release_seat — fix boolean > integer; return same json shape as book_seat
-- ----------------------------------------------------------------------------
drop function if exists public.release_seat(uuid, integer);

create function public.release_seat(p_tour_id uuid, p_seats_to_release integer default 1)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  if p_seats_to_release is null or p_seats_to_release < 1 then
    return json_build_object(
      'success', false,
      'message', 'invalid seats to release'
    );
  end if;

  update public.tours
  set booked_seats = greatest(0, booked_seats - p_seats_to_release),
      updated_at = now()
  where id = p_tour_id;

  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    return json_build_object(
      'success', true,
      'message', 'seat released'
    );
  end if;

  return json_build_object(
    'success', false,
    'message', 'tour not found'
  );
end;
$$;

grant execute on function public.release_seat(uuid, integer) to anon, authenticated;

comment on function public.release_seat(uuid, integer) is
  'Rollback seat hold — decrements tours.booked_seats (never below 0). Returns json {success, message}.';


-- ----------------------------------------------------------------------------
-- 3. waiver_signatures — anon SELECT for .insert().select() readback
-- ----------------------------------------------------------------------------
drop policy if exists "anon can read own waiver signature after insert"
  on public.waiver_signatures;

drop policy if exists "anon read back safe waiver columns"
  on public.waiver_signatures;

create policy "anon can read own waiver signature after insert"
  on public.waiver_signatures
  for select
  to anon
  using (true);

-- Column grant must match frontend .select('id, trip_code, signed_at')
grant select (id, trip_code, signed_at) on public.waiver_signatures to anon;
