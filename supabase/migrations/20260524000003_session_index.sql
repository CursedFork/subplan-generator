-- Index for querying agent_sessions by sub_plan_id (e.g. plan detail pages).
-- Partial index — only rows where the plan has been linked.
create index if not exists agent_sessions_sub_plan_id_idx
  on public.agent_sessions(sub_plan_id)
  where sub_plan_id is not null;
