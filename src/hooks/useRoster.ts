import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Class, Student, StudentAttributes } from '@/types/app';

// Shared roster hooks — used by both the Seating Chart Maker and the
// Group Mate Maker. One classes/students dataset serves both tools.

// any: Database type is a placeholder until `npm run db:types` is run.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ── Classes ──────────────────────────────────────────────────────────

export function useClasses() {
  const { user } = useAuth();

  return useQuery<Class[]>({
    queryKey: ['classes', user?.id],
    queryFn: async () => {
      const { data, error } = await db
        .from('classes')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Class[];
    },
    enabled: !!user,
  });
}

export function useCreateClass() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; grade?: string | null }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await db
        .from('classes')
        .insert({ user_id: user.id, name: input.name, grade: input.grade ?? null })
        .select('*')
        .single();
      if (error) throw error;
      return data as Class;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['classes', user?.id] });
    },
  });
}

export function useDeleteClass() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string) => {
      // Students cascade-delete via FK.
      const { error } = await db.from('classes').delete().eq('id', classId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['classes', user?.id] });
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

// ── Students ─────────────────────────────────────────────────────────

export function useStudents(classId: string | null) {
  return useQuery<Student[]>({
    queryKey: ['students', classId],
    queryFn: async () => {
      const { data, error } = await db
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Student[];
    },
    enabled: !!classId,
  });
}

export function useAddStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    // Accepts several names at once so teachers can paste a list.
    mutationFn: async (input: { classId: string; names: string[] }) => {
      const rows = input.names
        .map((n) => n.trim())
        .filter(Boolean)
        .map((name) => ({ class_id: input.classId, name, attributes: {} }));
      if (rows.length === 0) return [];
      const { data, error } = await db.from('students').insert(rows).select('*');
      if (error) throw error;
      return (data ?? []) as Student[];
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['students', vars.classId] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      studentId: string;
      classId: string;
      name?: string;
      attributes?: StudentAttributes;
    }) => {
      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates['name'] = input.name;
      if (input.attributes !== undefined) updates['attributes'] = input.attributes;
      const { error } = await db.from('students').update(updates).eq('id', input.studentId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['students', vars.classId] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { studentId: string; classId: string }) => {
      const { error } = await db.from('students').delete().eq('id', input.studentId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['students', vars.classId] });
    },
  });
}
