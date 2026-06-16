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

export interface AdminContact {
  name: string;
  extension: string | null;
}

export interface HelpfulStaff {
  name: string;
  role: string;
}

export interface ScheduleBlock {
  period: string;     // e.g. "Reading Block", "Period 1", "Lunch"
  start_time: string; // e.g. "8:15"
  end_time: string;   // e.g. "9:00"
}

// Fields stored on the profile that pre-fill every new plan.
export interface SchoolInfo {
  school_name: string | null;
  school_year: string | null;
  grade: string | null;
  subject: string | null;
  grades_covered: string[];
  principal: AdminContact | null;
  assistant_principal: AdminContact | null;
  school_counselor: AdminContact | null;
  school_psychologist: AdminContact | null;
  helpful_staff: HelpfulStaff[];
  schedule: ScheduleBlock[];
  emergency_procedures: string | null;
  health_concerns: string | null;
  bathroom_rules: string | null;
  behavior_management: string | null;
  nurses_office: string | null;
  special_instructions: string | null;
  notes: string | null;
}

export interface Profile {
  id: string;
  display_name: string | null;
  school: string | null;
  grade_levels: string[];
  subjects: string[];
  referral_code: string;
  referral_credits: number;
  school_info: SchoolInfo;
  // Onboarding wizard columns (migration 20260526120000)
  onboarding_step: number;
  onboarding_completed_at: string | null;
  school_level: string | null;
  primary_grade: string | null;
  classroom_notes: string | null;
  default_template_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentActivity {
  title: string;
  duration_min: number;
  start_time: string | null;
  end_time: string | null;
  instructions: string;
  materials: string[];
  period_key: string | null;
  grade_label: string | null;
}

export interface AgentAttachment {
  file_id: string;
  role: string;
  note_for_sub: string | null;
}

export interface AgentState {
  template_id: string;

  // School info
  school_name: string | null;
  school_year: string | null;
  date: string | null;

  // Teacher info
  grade: string | null;
  subject: string | null;
  grades_covered: string[];

  // Admin contacts
  principal: AdminContact | null;
  assistant_principal: AdminContact | null;
  school_counselor: AdminContact | null;
  school_psychologist: AdminContact | null;

  // Helpful staff
  helpful_staff: HelpfulStaff[];

  // Classroom logistics
  emergency_procedures: string | null;
  health_concerns: string | null;
  bathroom_rules: string | null;
  behavior_management: string | null;
  special_instructions: string | null;
  nurses_office: string | null;

  // Lesson content
  unit: { unit_name: string; standard_codes: string[] } | null;
  activities: AgentActivity[];
  attachments: AgentAttachment[];

  // Closing
  sign_off: string | null;

  // Meta
  finalized: boolean;
  sub_plan_id: string | null;
}

// =====================================================================
// Roster types — shared by Seating Chart and Group Mate tools
// =====================================================================

export interface Class {
  id: string;
  user_id: string;
  name: string;
  grade: string | null;
  created_at: string;
  updated_at: string;
}

// Known keys written by each tool. Both tools read the full attributes
// object and ignore keys they don't own.
export interface StudentAttributes {
  // Seating Chart Maker
  seating_preference?: 'front' | 'back' | 'window' | 'aisle' | null;
  cannot_sit_near?: string[]; // student ids

  // Group Mate Maker
  reading_level?: string | null;
  group_leader?: boolean;
  iep?: boolean;
  notes?: string | null;

  // Open for future tools — don't narrow with never.
  [key: string]: unknown;
}

export interface Student {
  id: string;
  class_id: string;
  name: string;
  attributes: StudentAttributes;
  created_at: string;
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
