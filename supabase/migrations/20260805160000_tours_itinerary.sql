-- Day-by-day itinerary override on tours (nullable JSONB).
-- Shape: array of { day, title_en, title_th, description_en, description_th }
-- When null/empty, the public site falls back to local CMS (src/data/itineraries.ts)
-- via template trip-code resolution (e.g. ULU-4D3N-SEP26_29 → ULU-4D3N).

alter table public.tours
  add column if not exists itinerary jsonb default null;

comment on column public.tours.itinerary is
  'Optional day-by-day itinerary override: [{day, title_en, title_th, description_en, description_th}]. Null = use CMS template.';
