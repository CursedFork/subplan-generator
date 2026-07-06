-- =====================================================================
-- Free tier + billing hardening
-- Migration: 20260705000000_free_tier_billing.sql
--
-- Before Stripe launch, increment_plan_usage returned allowed=false /
-- cap=0 for users with no subscription row, and agent-turn bypassed the
-- check when cap=0. This migration makes the RPC authoritative:
--   - No subscription row  → free tier: 3 finalized plans total (lifetime).
--   - Referral credits are usable on the free tier too.
--   - agent-turn no longer needs a bypass (updated in the same commit).
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
  v_free_used integer;
begin
  select * into v_sub from public.subscriptions where user_id = p_user_id;
  select * into v_profile from public.profiles where id = p_user_id;

  -- ── Free tier: no subscription row ──────────────────────────────
  if v_sub is null then
    -- Referral credits work on the free tier as bonus plans.
    if v_profile.referral_credits > 0 then
      update public.profiles
        set referral_credits = referral_credits - 1
        where id = p_user_id;
      return query select true, 0, 3, null::subscription_tier, true;
      return;
    end if;

    select count(*)::integer into v_free_used
      from public.sub_plans
      where user_id = p_user_id and status = 'final';

    if v_free_used >= 3 then
      return query select false, v_free_used, 3, null::subscription_tier, false;
      return;
    end if;

    return query select true, v_free_used + 1, 3, null::subscription_tier, false;
    return;
  end if;

  -- ── Paid tiers ───────────────────────────────────────────────────
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

comment on function public.increment_plan_usage(uuid) is
  'Atomically checks cap and increments. Free tier (no subscription row) = 3 finalized plans lifetime. Service-role only.';

-- =====================================================================
-- Reset plans_used_this_period at the start of each billing period.
-- Called by the stripe-webhook edge function on invoice.paid /
-- customer.subscription.updated when a new period begins.
-- =====================================================================
create or replace function public.reset_period_usage(p_stripe_subscription_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.subscriptions
    set plans_used_this_period = 0,
        period_started_at = now()
    where stripe_subscription_id = p_stripe_subscription_id;
end;
$$;

revoke all on function public.reset_period_usage(text) from public;
