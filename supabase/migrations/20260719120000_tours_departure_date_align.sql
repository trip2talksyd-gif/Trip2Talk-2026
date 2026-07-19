-- Optional schema alignment: production tours use `next_date` (V5 base schema).
-- App code expects `departure_date`. Frontend now normalizes either name, but
-- run this when ready so DB and code share one column.
-- Safe to re-run (IF NOT EXISTS / guarded update).

alter table public.tours
  add column if not exists departure_date date;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tours'
      and column_name = 'next_date'
  ) then
    update public.tours
    set departure_date = next_date
    where departure_date is null
      and next_date is not null;
  end if;
end $$;

create index if not exists tours_departure_date_idx on public.tours (departure_date);

comment on column public.tours.departure_date is
  'Canonical departure date. Live DB historically used next_date; keep both in sync until next_date is dropped.';
