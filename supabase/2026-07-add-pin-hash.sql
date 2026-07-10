-- Trip2Talk V5 — Phase 1 step 1: move staff PIN auth off plaintext
-- Run once in Supabase Dashboard -> SQL Editor

alter table public.staff_profiles add column if not exists pin_hash text;

-- After running this file:
-- 1. Generate bcrypt hashes for each staff member's real PIN:
--      node scripts/hash-pins.mjs 1111 4444 9999
--    (run from the project root; prints ready-to-paste UPDATE statements)
-- 2. Run the printed UPDATE statements here in the SQL Editor to populate pin_hash
--    for each row (match by the existing pin_code value).
-- 3. Deploy the verify-pin Edge Function and confirm staff can log in using it
--    (see supabase/functions/verify-pin/index.ts).
-- 4. Only after login is confirmed working end-to-end, drop the plaintext column:
--      alter table public.staff_profiles drop column pin_code;
--    Do NOT drop it before verifying login works — it is your only fallback.
