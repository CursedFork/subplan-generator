-- =====================================================================
-- Referral recording + crediting
-- Migration: 20260706000000_referral_crediting.sql
--
-- Completes the referral system whose tables shipped in the initial
-- schema. Reward (locked decision D-11): 3 credits to the referrer and
-- 1 to the referee, granted when the referee's FIRST paid subscription
-- lands. Credits are consumed as bonus plans by increment_plan_usage.
-- =====================================================================

-- ── record_referral: called by the signed-in referee after signup ─────
-- Derives the referee from auth.uid() so the caller cannot spoof it.
create or replace function public.record_referral(p_code text)
returns table (ok boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referee uuid := auth.uid();
  v_referrer uuid;
begin
  if v_referee is null then
    return query select false, 'not_authenticated';
    return;
  end if;

  select id into v_referrer
    from public.profiles
    where referral_code = upper(trim(p_code));

  if v_referrer is null then
    return query select false, 'invalid_code';
    return;
  end if;

  if v_referrer = v_referee then
    return query select false, 'self_referral';
    return;
  end if;

  -- One referral per referee, ever (unique constraint backs this up).
  if exists (select 1 from public.referrals where referee_user_id = v_referee) then
    return query select false, 'already_referred';
    return;
  end if;

  -- Only accounts created in the last 7 days can attach a referral —
  -- prevents long-standing users from retroactively farming credits.
  if (select created_at from public.profiles where id = v_referee)
       < now() - interval '7 days' then
    return query select false, 'account_too_old';
    return;
  end if;

  insert into public.referrals (referrer_user_id, referee_user_id, referral_code_used, status)
  values (v_referrer, v_referee, upper(trim(p_code)), 'pending');

  return query select true, 'recorded';
end;
$$;

revoke all on function public.record_referral(text) from public;
grant execute on function public.record_referral(text) to authenticated;

-- ── credit_referral: called by stripe-webhook on first paid invoice ──
create or replace function public.credit_referral(p_referee uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref record;
begin
  select * into v_ref
    from public.referrals
    where referee_user_id = p_referee and status = 'pending'
    for update;

  if v_ref is null then
    return false;
  end if;

  update public.referrals
    set status = 'credited',
        qualified_at = now(),
        referrer_credited_at = now(),
        referee_credited_at = now()
    where id = v_ref.id;

  update public.profiles
    set referral_credits = referral_credits + 3
    where id = v_ref.referrer_user_id;

  update public.profiles
    set referral_credits = referral_credits + 1
    where id = p_referee;

  return true;
end;
$$;

revoke all on function public.credit_referral(uuid) from public;

comment on function public.record_referral(text) is
  'Attach a referral code to the calling user (referee derived from auth.uid). Pending until first paid invoice.';
comment on function public.credit_referral(uuid) is
  'Credit a pending referral: +3 plans referrer, +1 referee. Service-role only, called by stripe-webhook.';
