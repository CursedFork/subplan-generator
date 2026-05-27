-- =====================================================================
-- Link draft sub_plans back to their originating agent session
-- so users can resume in-progress plans.
-- =====================================================================

ALTER TABLE public.sub_plans
  ADD COLUMN IF NOT EXISTS agent_session_id uuid;

-- Fast lookup by session when upserting drafts each turn
CREATE INDEX IF NOT EXISTS sub_plans_agent_session_id_idx
  ON public.sub_plans (agent_session_id)
  WHERE agent_session_id IS NOT NULL;
