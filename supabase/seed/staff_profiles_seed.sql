-- Replace CHANGE_ME_x PINs and names before running manually in SQL Editor. Do not commit real PINs.
-- Requires pgcrypto (enabled in 20260710120000_full_schema_fresh_start.sql).

insert into public.staff_profiles (full_name, role, pin_hash) values
  ('Owner Name', 'OWNER', crypt('CHANGE_ME_1', gen_salt('bf'))),
  ('Manager Name', 'MANAGER', crypt('CHANGE_ME_2', gen_salt('bf')));
