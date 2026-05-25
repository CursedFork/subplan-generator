-- Add school_info JSONB column to profiles for storing reusable plan defaults.
alter table public.profiles
  add column if not exists school_info jsonb not null default '{}'::jsonb;
