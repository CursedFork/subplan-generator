// Hand-written app-level types. Do not put DB row types here — those come
// from src/types/database.ts (generated).

import type { User } from '@supabase/supabase-js';

export type AuthUser = User;

export type SubscriptionTier = 'basic' | 'pro';

export interface UsageLimits {
  cap: number;
  used: number;
  referralCredits: number;
  tier: SubscriptionTier;
}

export interface Profile {
  id: string;
  display_name: string | null;
  school: string | null;
  grade_levels: string[];
  subjects: string[];
  referral_code: string;
  referral_credits: number;
  created_at: string;
  updated_at: string;
}

export interface AgentActivity {
  title: string;
  duration_min: number;
  instructions: string;
  materials: string[];
  period_key: string | null;
}

export interface AgentAttachment {
  file_id: string;
  role: string;
  note_for_sub: string | null;
}

export interface AgentState {
  template_id: string;
  grade: string | null;
  subject: string | null;
  unit: { unit_name: string; standard_codes: string[] } | null;
  activities: AgentActivity[];
  attachments: AgentAttachment[];
  finalized: boolean;
  sub_plan_id: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentTurnResponse {
  session_id: string;
  assistant_message: string;
  tool_calls: string[];
  state: AgentState;
}
