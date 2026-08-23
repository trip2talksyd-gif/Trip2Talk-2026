-- Recurring expenses: one stored row can expand across months/years in Tax Summary.
-- Draft only — apply manually in the Supabase SQL editor after review.
-- Table: public.expenses (staff-api insert_expense).
-- frequency: once | monthly | yearly. ended_iso: stop date (inclusive), null = still running.

alter table public.expenses
  add column if not exists frequency text not null default 'once';

alter table public.expenses
  add column if not exists ended_iso date;

alter table public.expenses
  drop constraint if exists expenses_frequency_check;

alter table public.expenses
  add constraint expenses_frequency_check
  check (frequency in ('once', 'monthly', 'yearly'));

comment on column public.expenses.frequency is
  'once = single payment; monthly/yearly expand in tax-year totals until ended_iso';
comment on column public.expenses.ended_iso is
  'Inclusive last occurrence date for monthly/yearly; null means still recurring';
