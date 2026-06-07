alter table public.profiles
  add column if not exists onboarding_step smallint not null default 0,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists school_level text,
  add column if not exists primary_grade text,
  add column if not exists classroom_notes text,
  add column if not exists default_template_id text;
