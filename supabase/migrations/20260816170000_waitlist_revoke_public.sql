-- Follow-up: first waitlist grant revoke did not stick (explicit postgres→anon
-- grants still on relacl). PUBLIC is NOT in the ACL today — REVOKE FROM PUBLIC
-- is still included so leftover PUBLIC grants cannot hide behind role revokes.
-- These objects are owned by postgres; this must run as owner/grantor.

alter view public.trip_waitlist set (security_invoker = true);

revoke all on public.waitlist_entries from public;
revoke all on public.trip_waitlist from public;
revoke all on public.waitlist_entries from anon, authenticated;
revoke all on public.trip_waitlist from anon, authenticated;

grant insert on public.waitlist_entries to anon;

revoke all on public.trip_waitlist from public;
revoke all on public.waitlist_entries from anon, authenticated;
revoke all on public.trip_waitlist from anon, authenticated;

grant insert on public.waitlist_entries to anon;
