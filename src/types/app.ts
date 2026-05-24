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
