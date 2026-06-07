import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Profile, SchoolInfo } from '@/types/app';

// any: Database type is a placeholder until `npm run db:types` is run.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useProfile() {
  const { user } = useAuth();

  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await db
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return (data ?? null) as Profile | null;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, 'display_name' | 'school' | 'school_info'>>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await db
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

export function useUpdateSchoolInfo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (school_info: SchoolInfo) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await db
        .from('profiles')
        .update({ school_info, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

// Onboarding step save — called on each "Next" click in the wizard.
export interface OnboardingStepData {
  onboarding_step: number;
  // Step 1
  display_name?: string | null;
  school?: string | null;
  school_level?: string | null;
  // Step 2
  grade_levels?: string[];
  primary_grade?: string | null;
  subjects?: string[];
  // Step 3
  classroom_notes?: string | null;
  default_template_id?: string | null;
}

export function useSaveOnboardingStep() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardingStepData) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await db
        .from('profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

// Called on "Finish" — marks onboarding as complete.
export function useCompleteOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (finalData: Omit<OnboardingStepData, 'onboarding_step'>) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await db
        .from('profiles')
        .update({
          ...finalData,
          onboarding_step: 3,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}
