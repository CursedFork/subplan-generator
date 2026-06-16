import { supabase } from './supabase';
import type { WorksheetRequest, WorksheetResponse } from '@/types/worksheet';

export async function generateWorksheet(
  request: WorksheetRequest,
): Promise<WorksheetResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-worksheet`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    const err = await response.json() as { error?: string };
    throw new Error(err.error ?? `Worksheet generation failed (${response.status})`);
  }

  return response.json() as Promise<WorksheetResponse>;
}
