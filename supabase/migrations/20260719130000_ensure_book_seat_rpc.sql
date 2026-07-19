-- Trip2Talk V7 — ensure book_seat + release_seat exist on live DB
-- Project: bljhnelgmkulxwuhedbi (trip2talk-official)
--
-- WHY: Frontend calls supabase.rpc('book_seat', { p_tour_id, p_seats_requested })
-- but the function was never created on production (migrations exist only in git —
-- see MEMORY.md). Symptom: POST /rpc/book_seat → 404 / PGRST202.
--
-- PASTE THIS ENTIRE FILE into Supabase Dashboard → SQL Editor → Run.
-- Then (optional but recommended):  notify pgrst, 'reload schema';

-- ----------------------------------------------------------------------------
-- 1. book_seat — atomic seat hold (matches client param names exactly)
-- ----------------------------------------------------------------------------
drop function if exists public.book_seat(uuid, integer);
drop function if exists public.book_seat(uuid, int);

create function public.book_seat(p_tour_id uuid, p_seats_requested integer default 1)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer := 0;
  v_use_v7 boolean;
  v_has_updated_at boolean;
begin
  if p_tour_id is null then
    return json_build_object('success', false, 'message', 'tour id required');
  end if;

  if p_seats_requested is null or p_seats_requested < 1 then
    return json_build_object('success', false, 'message', 'invalid seats requested');
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tours'
      and column_name = 'booked_seats'
  )
  into v_use_v7;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tours'
      and column_name = 'updated_at'
  )
  into v_has_updated_at;

  if v_use_v7 then
    -- V7 schema: booked_seats / max_seats
    if v_has_updated_at then
      update public.tours
      set
        booked_seats = booked_seats + p_seats_requested,
        updated_at = now()
      where id = p_tour_id
        and booked_seats + p_seats_requested <= max_seats
        and lower(status) in ('published', 'confirmed', 'active');
    else
      update public.tours
      set booked_seats = booked_seats + p_seats_requested
      where id = p_tour_id
        and booked_seats + p_seats_requested <= max_seats
        and lower(status) in ('published', 'confirmed', 'active');
    end if;
  else
    -- V5 / live base schema: current_pax / max_pax
    update public.tours
    set current_pax = current_pax + p_seats_requested
    where id = p_tour_id
      and current_pax + p_seats_requested <= max_pax
      and lower(status) in ('published', 'confirmed', 'active');
  end if;

  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    return json_build_object('success', true, 'message', 'seat reserved');
  end if;

  return json_build_object(
    'success', false,
    'message', 'seats full or tour not bookable'
  );
end;
$$;

grant execute on function public.book_seat(uuid, integer) to anon, authenticated;

comment on function public.book_seat(uuid, integer) is
  'Atomic seat hold. Params: p_tour_id, p_seats_requested. Returns json {success, message}. Does not insert tour_bookings.';


-- ----------------------------------------------------------------------------
-- 2. release_seat — rollback companion (same dual-schema support)
-- ----------------------------------------------------------------------------
drop function if exists public.release_seat(uuid, integer);
drop function if exists public.release_seat(uuid, int);

create function public.release_seat(p_tour_id uuid, p_seats_to_release integer default 1)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer := 0;
  v_use_v7 boolean;
  v_has_updated_at boolean;
begin
  if p_tour_id is null then
    return json_build_object('success', false, 'message', 'tour id required');
  end if;

  if p_seats_to_release is null or p_seats_to_release < 1 then
    return json_build_object('success', false, 'message', 'invalid seats to release');
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tours'
      and column_name = 'booked_seats'
  )
  into v_use_v7;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tours'
      and column_name = 'updated_at'
  )
  into v_has_updated_at;

  if v_use_v7 then
    if v_has_updated_at then
      update public.tours
      set
        booked_seats = greatest(0, booked_seats - p_seats_to_release),
        updated_at = now()
      where id = p_tour_id;
    else
      update public.tours
      set booked_seats = greatest(0, booked_seats - p_seats_to_release)
      where id = p_tour_id;
    end if;
  else
    update public.tours
    set current_pax = greatest(0, current_pax - p_seats_to_release)
    where id = p_tour_id;
  end if;

  get diagnostics v_rows = row_count;

  if v_rows > 0 then
    return json_build_object('success', true, 'message', 'seat released');
  end if;

  return json_build_object('success', false, 'message', 'tour not found');
end;
$$;

grant execute on function public.release_seat(uuid, integer) to anon, authenticated;

comment on function public.release_seat(uuid, integer) is
  'Rollback seat hold. Params: p_tour_id, p_seats_to_release. Returns json {success, message}.';


-- Reload PostgREST schema cache so /rpc/book_seat resolves immediately
notify pgrst, 'reload schema';
