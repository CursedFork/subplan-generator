-- =====================================================================
-- Admin support
-- =====================================================================

-- Add is_admin flag to profiles (false for everyone by default).
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- =====================================================================
-- admin_stats() — returns aggregate metrics.
-- Callable only by authenticated users with is_admin = true.
-- =====================================================================
create or replace function public.admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
begin
  select is_admin into v_is_admin
    from public.profiles
   where id = auth.uid();

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized';
  end if;

  return jsonb_build_object(
    'total_users',    (select count(*) from public.profiles),
    'total_plans',    (select count(*) from public.sub_plans),
    'final_plans',    (select count(*) from public.sub_plans where status = 'final'),
    'draft_plans',    (select count(*) from public.sub_plans where status = 'draft'),
    'plans_today',    (select count(*) from public.sub_plans
                        where created_at >= now() - interval '24 hours')
  );
end;
$$;

-- =====================================================================
-- admin_recent_plans() — last N plans across all users.
-- =====================================================================
create or replace function public.admin_recent_plans(limit_n integer default 20)
returns table (
  plan_id    uuid,
  title      text,
  grade      text,
  subject    text,
  status     text,
  created_at timestamptz,
  user_name  text,
  user_email text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
begin
  select is_admin into v_is_admin
    from public.profiles
   where id = auth.uid();

  if not coalesce(v_is_admin, false) then
    raise exception 'Not authorized';
  end if;

  return query
    select
      p.id                            as plan_id,
      p.title,
      p.grade,
      p.subject,
      p.status::text,
      p.created_at,
      coalesce(pr.display_name, '—') as user_name,
      coalesce(u.email, '—')         as user_email
    from public.sub_plans p
    join public.profiles  pr on pr.id = p.user_id
    join auth.users       u  on u.id  = p.user_id
   order by p.created_at desc
   limit limit_n;
end;
$$;

comment on function public.admin_stats()                    is 'Admin-only aggregate metrics.';
comment on function public.admin_recent_plans(integer)      is 'Admin-only recent plan list.';
