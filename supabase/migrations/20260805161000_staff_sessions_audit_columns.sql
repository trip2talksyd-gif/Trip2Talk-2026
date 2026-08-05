-- Sync: staff_sessions audit columns (verify-pin Phase N / production hotfix).
--
-- Live change (intended / applied out-of-band on project bljhnelgmkulxwuhedbi):
--   public.staff_sessions.ip_address  text null
--   public.staff_sessions.user_agent  text null
--
-- This file records that schema in git so migration history matches production.
-- Safe to re-run (IF NOT EXISTS). Also present in 20260805150000_phases_g_to_n.sql.
-- Do NOT treat a second apply as a new feature — it is idempotent bookkeeping.

alter table public.staff_sessions
  add column if not exists ip_address text null;

alter table public.staff_sessions
  add column if not exists user_agent text null;

comment on column public.staff_sessions.ip_address is
  'Best-effort client IP from verify-pin request headers.';
comment on column public.staff_sessions.user_agent is
  'Best-effort User-Agent from verify-pin request.';
