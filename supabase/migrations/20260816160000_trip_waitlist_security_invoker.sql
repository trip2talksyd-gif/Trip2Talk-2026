-- Close the unused trip_waitlist SECURITY DEFINER hole.
-- View is a naming alias over waitlist_entries; no app code queries it.
-- Postgres 15+ (Supabase): ALTER VIEW SET (security_invoker = true) is enough
-- — no CREATE OR REPLACE required.

alter view public.trip_waitlist set (security_invoker = true);

revoke all on public.trip_waitlist from anon, authenticated;

-- Table: drop leftover default grants. Public join form only needs INSERT.
-- RLS policy "anon can insert waitlist entries" is unchanged.
revoke all on public.waitlist_entries from anon, authenticated;
grant insert on public.waitlist_entries to anon;
