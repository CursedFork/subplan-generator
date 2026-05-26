import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface AdminStats {
  total_users: number;
  total_plans: number;
  final_plans: number;
  draft_plans: number;
  plans_today: number;
}

export interface AdminPlanRow {
  plan_id:    string;
  title:      string;
  grade:      string | null;
  subject:    string | null;
  status:     string;
  created_at: string;
  user_name:  string;
  user_email: string;
}

export function useIsAdmin(): boolean {
  const { data: profile } = useProfile();
  return (profile as (typeof profile & { is_admin?: boolean }) | null)?.is_admin === true;
}

export function useAdminStats() {
  const isAdmin = useIsAdmin();

  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data, error } = await db.rpc('admin_stats');
      if (error) throw error;
      return data as AdminStats;
    },
    enabled: isAdmin,
    refetchInterval: 30_000, // refresh every 30 s during a demo session
  });
}

export function useAdminRecentPlans(limit = 20) {
  const isAdmin = useIsAdmin();

  return useQuery<AdminPlanRow[]>({
    queryKey: ['admin', 'recent-plans', limit],
    queryFn: async () => {
      const { data, error } = await db.rpc('admin_recent_plans', { limit_n: limit });
      if (error) throw error;
      return (data ?? []) as AdminPlanRow[];
    },
    enabled: isAdmin,
    refetchInterval: 30_000,
  });
}
