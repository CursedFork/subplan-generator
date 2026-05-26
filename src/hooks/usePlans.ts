import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { AgentState } from '@/types/app';

export interface Plan {
  id: string;
  title: string;
  grade: string | null;
  subject: string | null;
  template_id: string;
  status: 'draft' | 'final';
  content: AgentState;
  created_at: string;
  finalized_at: string | null;
}

export function usePlans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['plans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_plans')
        .select('id, title, grade, subject, template_id, status, content, created_at, finalized_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Plan[];
    },
    enabled: Boolean(user),
  });
}

export function useDeletePlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('sub_plans')
        .delete()
        .eq('id', planId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['plans', user?.id] });
    },
  });
}
