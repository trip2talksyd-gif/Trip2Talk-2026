# Trip2Talk V7 — Session handoff

**Last updated:** 2026-07-20  
**Project path:** `F:\Web PWA_App2026\Trip2Talk\Trip2Talk V7`  
**Production:** `trip2-talk-2026.vercel.app`  
**GitHub:** `trip2talksyd-gif/Trip2Talk-2026` (`main`) · Vercel team `trip2talk`  
**Supabase (ONLY):** `trip2talk-official` · ref **`bljhnelgmkulxwuhedbi`**  
**Do NOT use:** `xwdtjwzjkqunewxjpimm` (stale / wrong)  
**Mockup SoT:** `../Trip2Talk-Mockup-Teal.html`

---

## Safety gates (mandatory)

1. Never deploy Edge Functions / migrations / CLI to any Supabase ref except `bljhnelgmkulxwuhedbi`.
2. Before `git push` to `main` or any Edge Function deploy: show change summary → wait for user confirmation.
3. If unsure which Supabase project — ask; do not guess.

**Current mismatch (2026-07-20):** CLI link + `.env.local` still point at `xwdtjwzjkqunewxjpimm`. Relink / env switch needs **explicit user OK**. A mistaken `staff-api` deploy earlier today went to the wrong project.

---

## Product in one line

Thai–AU photo-tour PWA: browse trips → waiver → PayID deposit → Facebook Page for group setup. Sydney-based day/evening trips are meetup-only (no flights/stay).

---

## ✅ Live on production (through `3294781`)

| Area | Status |
|---|---|
| Pixel-fidelity pass (Home → footer vs teal mockup) | Done + deployed |
| Facebook URL consolidation → `TriptoTalk` | Done |
| ULU-4D3N content + listing | Done |
| Split-flap airport prices (tap/hover all packages) | Done |
| Trip Detail top CTA + mobile sticky book bar | Done |
| Footer CTA → FB Messenger / Page (replaced email signup) | Done |
| Sydney `SYD-*`: Thai Town / Starbucks meetup; no flights/stay; Tesla max 4 | Done |
| Trips accordion groups (oneday / overnight / dest) | Done |
| PayID / ABN panel on booking | Done |
| About team avatar slots (`public/team/`) | Slots ready; drop `saen.jpg` / `ploy.jpg` when ready |

---

## Local ahead of origin (not pushed yet)

- `5ddbaa4` — `fix(staff-api): add missing compliance_items action handler`  
  → push when ready to deploy staff fix

---

## Open / watch

1. **Staff PIN / `staff-api` 401** after fresh PIN — verify `staff_sessions` + Edge Function deployed; `5ddbaa4` may help once pushed  
2. Spot-check live mobile vs mockup  
3. Do not commit `supabase/.temp/`  
4. Anon cannot UPDATE tours — use `npx supabase db query --linked -f …`

## Env quirks

- Push as `trip2talksyd-gif` (not `chapter99info-cell` / wrong Vercel team)  
- Vercel CLI may only list `saenmans-projects`; prod is **`trip2talk`** team → `trip2-talk-2026`
