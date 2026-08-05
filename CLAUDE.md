# Trip2Talk — agent / ops notes

Production Supabase project: `bljhnelgmkulxwuhedbi` (trip2talk-official).
Production site: https://www.trip2talk.com.au

## Standing rule — never leave production and the repo out of sync

**Whenever you deploy a schema change or Edge Function fix directly to Supabase
using a stored access token, the Dashboard SQL editor, or any path that bypasses
git/CI, you MUST immediately write the matching migration file and/or function
source back into this repo and commit it in the same session.**

- Schema hotfix → add/update `supabase/migrations/YYYYMMDDHHMMSS_*.sql` that
  exactly describes what is live (`IF NOT EXISTS` / idempotent preferred).
- Edge Function hotfix → update `supabase/functions/<name>/` to the exact
  deployed code, then commit + open a PR (label it as syncing an already-live
  hotfix when production was patched first).
- Do not end the session with “fixed on Supabase” only — production and git
  must match before you stop.

This applies to all future hotfixes, not only verify-pin / staff_sessions.
