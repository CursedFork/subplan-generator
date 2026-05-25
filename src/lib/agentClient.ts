import { supabase } from './supabase';
import type { AgentTurnResponse } from '@/types/app';

export async function sendAgentMessage(
  sessionId: string | null,
  userMessage: string,
): Promise<AgentTurnResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const body: Record<string, string> = { user_message: userMessage };
  if (sessionId) body['session_id'] = sessionId;

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-turn`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const err = await response.json() as { error?: string };
    throw new Error(err.error ?? `Agent request failed (${response.status})`);
  }

  return response.json() as Promise<AgentTurnResponse>;
}
