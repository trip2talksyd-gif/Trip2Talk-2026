-- Minimal hotfix: staff_sessions audit columns required by verify-pin Phase N.
-- Safe to re-run. Also covered by 20260805150000_phases_g_to_n.sql.

alter table public.staff_sessions
  add column if not exists ip_address text null;

alter table public.staff_sessions
  add column if not exists user_agent text null;
