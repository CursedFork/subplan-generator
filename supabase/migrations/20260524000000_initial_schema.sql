-- =====================================================================
-- SubPlan Generator — initial schema
-- Migration: 20260524000000_initial_schema.sql
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";
create extension if not exists "pg_cron";
create extension if not exists "pg_net";

-- ---------- Enums ----------
create type subscription_tier as enum ('basic', 'pro');
create type subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled',
  'incomplete', 'incomplete_expired', 'unpaid', 'paused'
);
create type plan_status as enum ('draft', 'final');
create type referral_status as enum ('pending', 'qualified', 'credited');
create type attachment_role as enum ('worksheet', 'reference', 'image', 'answer_key', 'reading');

-- =====================================================================
-- profiles
-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  school text,
  grade_levels text[] not null default '{}',
  subjects text[] not null default '{}',
  referral_code text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)),
  referral_credits integer not null default 0 check (referral_credits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Profile auto-creation on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- subscriptions
-- =====================================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status subscription_status not null,
  tier subscription_tier not null,
  billing_period text not null check (billing_period in ('monthly', 'annual')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  plans_used_this_period integer not null default 0 check (plans_used_this_period >= 0),
  period_started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_stripe_customer_idx on public.subscriptions(stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Users read their own subscription. Writes happen only via service-role
-- (stripe-webhook Edge Function and increment-usage RPC).
create policy "subscriptions_select_own"
  on public.subscriptions for select using (auth.uid() = user_id);

-- =====================================================================
-- templates
-- =====================================================================
create table public.templates (
  id text primary key,
  name text not null,
  description text not null,
  schema jsonb not null,
  is_default boolean not null default false,
  creator_user_id uuid references auth.users(id) on delete set null,
  -- null = built-in template; non-null = user-uploaded (deferred to v2)
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;

-- All authenticated users see built-in templates. User-uploaded templates
-- (when we add them) will be visible only to their creator. Written via
-- service-role only.
create policy "templates_select_visible"
  on public.templates for select
  to authenticated
  using (creator_user_id is null or creator_user_id = auth.uid());

-- =====================================================================
-- sub_plans
-- =====================================================================
create table public.sub_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  grade text,
  subject text,
  unit text,
  template_id text not null references public.templates(id),
  content jsonb not null default '{}'::jsonb,
  status plan_status not null default 'draft',
  finalized_at timestamptz,
  -- For 90-day attachment-cleanup scheduling.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sub_plans_user_id_idx on public.sub_plans(user_id);
create index sub_plans_status_idx on public.sub_plans(user_id, status);
create index sub_plans_finalized_at_idx on public.sub_plans(finalized_at)
  where finalized_at is not null;

alter table public.sub_plans enable row level security;

create policy "sub_plans_select_own"
  on public.sub_plans for select using (auth.uid() = user_id);
create policy "sub_plans_insert_own"
  on public.sub_plans for insert with check (auth.uid() = user_id);
create policy "sub_plans_update_own"
  on public.sub_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sub_plans_delete_own"
  on public.sub_plans for delete using (auth.uid() = user_id);

-- =====================================================================
-- attachments
-- =====================================================================
create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  sub_plan_id uuid references public.sub_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  original_filename text not null,
  size_bytes bigint not null check (size_bytes > 0),
  parsed_text text,
  role attachment_role,
  created_at timestamptz not null default now()
);

create index attachments_user_id_idx on public.attachments(user_id);
create index attachments_sub_plan_id_idx on public.attachments(sub_plan_id);

alter table public.attachments enable row level security;

create policy "attachments_select_own"
  on public.attachments for select using (auth.uid() = user_id);
create policy "attachments_insert_own"
  on public.attachments for insert with check (auth.uid() = user_id);
create policy "attachments_update_own"
  on public.attachments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attachments_delete_own"
  on public.attachments for delete using (auth.uid() = user_id);

-- =====================================================================
-- agent_sessions
-- =====================================================================
create table public.agent_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sub_plan_id uuid references public.sub_plans(id) on delete set null,
  messages jsonb not null default '[]'::jsonb,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agent_sessions_user_id_idx on public.agent_sessions(user_id);

alter table public.agent_sessions enable row level security;

create policy "agent_sessions_select_own"
  on public.agent_sessions for select using (auth.uid() = user_id);
create policy "agent_sessions_insert_own"
  on public.agent_sessions for insert with check (auth.uid() = user_id);
create policy "agent_sessions_update_own"
  on public.agent_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "agent_sessions_delete_own"
  on public.agent_sessions for delete using (auth.uid() = user_id);

-- =====================================================================
-- referrals
-- =====================================================================
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references auth.users(id) on delete cascade,
  referee_user_id uuid not null unique references auth.users(id) on delete cascade,
  referral_code_used text not null,
  status referral_status not null default 'pending',
  qualified_at timestamptz,
  referrer_credited_at timestamptz,
  referee_credited_at timestamptz,
  created_at timestamptz not null default now(),
  check (referrer_user_id <> referee_user_id)
);

create index referrals_referrer_idx on public.referrals(referrer_user_id);
create index referrals_status_idx on public.referrals(status);

alter table public.referrals enable row level security;

create policy "referrals_select_involved"
  on public.referrals for select
  using (auth.uid() = referrer_user_id or auth.uid() = referee_user_id);

-- =====================================================================
-- disposable_email_domains
-- =====================================================================
create table public.disposable_email_domains (
  domain text primary key,
  added_at timestamptz not null default now()
);

alter table public.disposable_email_domains enable row level security;
-- No select policy = no client access. Edge Functions use service role.

-- =====================================================================
-- updated_at trigger helper
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_set_updated_at      before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger sub_plans_set_updated_at     before update on public.sub_plans
  for each row execute function public.set_updated_at();
create trigger agent_sessions_set_updated_at before update on public.agent_sessions
  for each row execute function public.set_updated_at();

-- =====================================================================
-- finalized_at trigger on sub_plans
-- =====================================================================
create or replace function public.handle_sub_plan_finalization()
returns trigger language plpgsql as $$
begin
  if new.status = 'final' and (old.status is distinct from 'final') then
    new.finalized_at = now();
  elsif new.status = 'draft' and old.status = 'final' then
    new.finalized_at = null;
  end if;
  return new;
end;
$$;

create trigger sub_plans_finalization
  before update on public.sub_plans
  for each row execute function public.handle_sub_plan_finalization();

-- =====================================================================
-- Usage-cap RPC: increment_plan_usage
-- =====================================================================
create or replace function public.increment_plan_usage(p_user_id uuid)
returns table (
  allowed boolean,
  new_count integer,
  cap integer,
  tier subscription_tier,
  used_referral_credit boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub record;
  v_cap integer;
  v_profile record;
begin
  select * into v_sub from public.subscriptions where user_id = p_user_id;
  select * into v_profile from public.profiles where id = p_user_id;

  if v_sub is null then
    return query select false, 0, 0, null::subscription_tier, false;
    return;
  end if;

  if v_sub.status not in ('active', 'trialing') then
    return query select false, v_sub.plans_used_this_period, 0, v_sub.tier, false;
    return;
  end if;

  v_cap := case v_sub.tier
    when 'basic' then 30
    when 'pro'   then 45
  end;

  if v_profile.referral_credits > 0 then
    update public.profiles
      set referral_credits = referral_credits - 1
      where id = p_user_id;
    return query select true, v_sub.plans_used_this_period, v_cap, v_sub.tier, true;
    return;
  end if;

  if v_sub.plans_used_this_period >= v_cap then
    return query select false, v_sub.plans_used_this_period, v_cap, v_sub.tier, false;
    return;
  end if;

  update public.subscriptions
    set plans_used_this_period = plans_used_this_period + 1
    where user_id = p_user_id
    returning plans_used_this_period into v_sub.plans_used_this_period;

  return query select true, v_sub.plans_used_this_period, v_cap, v_sub.tier, false;
end;
$$;

revoke all on function public.increment_plan_usage(uuid) from public;

-- =====================================================================
-- Scheduled job: clean up attachments 90 days after parent finalization
-- =====================================================================
create or replace function public.cleanup_old_attachments()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attachment record;
begin
  for v_attachment in
    select a.id, a.storage_path
    from public.attachments a
    join public.sub_plans p on p.id = a.sub_plan_id
    where p.finalized_at is not null
      and p.finalized_at < now() - interval '90 days'
  loop
    -- Storage object deletion will be added in a later increment via
    -- an Edge Function call. For now we only delete the DB row.
    delete from public.attachments where id = v_attachment.id;
  end loop;
end;
$$;

select cron.schedule(
  'cleanup-old-attachments',
  '0 3 * * *',
  $$select public.cleanup_old_attachments();$$
);

-- =====================================================================
-- Storage bucket policies (run separately if storage bucket isn't yet created)
-- =====================================================================
-- Bucket: 'attachments' (private). Path convention:
--   {user_id}/{sub_plan_id_or_pending}/{uuid}-{filename}
--
-- Storage RLS policies — the user can only touch files under their own UUID prefix.
-- Note: storage.objects already has RLS enabled by default in Supabase.
-- Uncomment these after creating the 'attachments' bucket:
--
-- create policy "attachments_storage_select_own"
--   on storage.objects for select to authenticated
--   using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
--
-- create policy "attachments_storage_insert_own"
--   on storage.objects for insert to authenticated
--   with check (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);
--
-- create policy "attachments_storage_delete_own"
--   on storage.objects for delete to authenticated
--   using (bucket_id = 'attachments' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- Comments for posterity
-- =====================================================================
comment on table public.profiles is
  'Extends auth.users. One row per user, created via on_auth_user_created trigger.';
comment on table public.subscriptions is
  'One row per user. Writes only via stripe-webhook Edge Function using service role.';
comment on table public.templates is
  'Built-in templates have creator_user_id = null. User-uploaded templates (v2) set creator_user_id.';
comment on table public.disposable_email_domains is
  'Refreshed weekly by Edge Function. Used by signup hook to reject disposable emails.';
comment on function public.increment_plan_usage(uuid) is
  'Atomically checks cap and increments. Returns whether generation is allowed. Service-role only.';
