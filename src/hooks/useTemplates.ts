import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Template {
  id: string;
  name: string;
  description: string;
  schema: Record<string, unknown>;
  is_default: boolean;
}

function getSectionTitles(schema: Record<string, unknown>): string[] {
  if (!Array.isArray(schema.sections)) return [];
  return (schema.sections as Array<{ title?: string }>)
    .map(s => s.title ?? '')
    .filter(Boolean);
}

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('id, name, description, schema, is_default')
        .order('is_default', { ascending: false })
        .order('name');
      if (error) throw error;
      return (data ?? []) as Template[];
    },
    staleTime: 10 * 60 * 1000, // templates rarely change
  });
}

export { getSectionTitles };
