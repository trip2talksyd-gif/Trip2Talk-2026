-- Singleton app settings. staff-api (service role) reads/writes; no public grants.

create table if not exists public.app_settings (
  id text primary key default 'default',
  ai_content_generation_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid null references public.staff_profiles (id) on delete set null
);

insert into public.app_settings (id, ai_content_generation_enabled)
values ('default', true)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

comment on table public.app_settings is
  'Owner-controlled feature flags. Service role / staff-api only.';
comment on column public.app_settings.ai_content_generation_enabled is
  'When false, generate-trip-post and generate-caption refuse Anthropic calls.';
