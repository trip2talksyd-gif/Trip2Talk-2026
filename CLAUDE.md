# Trip2Talk — agent / ops notes

Production Supabase project: `bljhnelgmkulxwuhedbi` (trip2talk-official).
Production site: https://www.trip2talk.com.au

## MERGE TO MAIN — HARD RULE

ก่อน git push ขึ้น main หรือ deploy Edge Function ทุกครั้ง — ต้องสรุปสิ่งที่เปลี่ยนแล้วขอ confirm จากพี่แสนก่อนเสมอ ห้าม push/deploy เองอัตโนมัติ

Before merging **ANY** pull request or pushing directly to `main`, summarize the change and get **explicit confirmation from Saen in chat first**. This applies every time, with **no exceptions** for "small" or "obviously safe" changes.

The same confirmation is required before deploying any Edge Function to production (`bljhnelgmkulxwuhedbi`).

Pushing a **feature branch** (not `main`) is allowed when Saen asked to commit + push that branch. Merging that branch into `main` (including `gh pr merge`) is **not** allowed until Saen confirms.

**ONE exception:** if production (trip2talk.com.au) is confirmed **actively broken RIGHT NOW** for real customers (e.g. a page 404s, checkout is down, a previous deploy introduced a live-breaking bug) — a hotfix may be merged immediately to restore service, but:

1. State clearly in your response that this is an emergency merge under the exception, **BEFORE** merging (not after).
2. Immediately after merging, report exactly what was merged and why, so Saen can review after the fact.
3. This exception covers **ONLY** the minimal fix needed to restore service — never bundle unrelated changes into an emergency merge.

If you are unsure whether something qualifies as a genuine emergency, **it does not** — ask first.

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
