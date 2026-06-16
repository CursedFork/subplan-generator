// Worksheet Generator — shared request/response contract.
// WorksheetRequest is validated by Zod in the generate-worksheet Edge Function
// and mirrored here as plain TypeScript for the frontend.

export type WorksheetCategory =
  | 'math-facts'
  | 'word-problems'
  | 'reading-comprehension'
  | 'vocabulary-matching'
  | 'fill-in-the-blank'
  | 'graphic-organizer'
  | 'short-answer'
  | 'multiple-choice';

export type WorksheetTone =
  | 'engaging'    // story framing, characters, fun context
  | 'plain'       // clean, no-frills, skill-focused
  | 'assessment'; // neutral, test-like, no decoration

export type GradeBand = 'K-2' | '3-5' | '6-8' | '9-12';

export interface WorksheetRequest {
  subject: string;            // e.g. "Math", "ELA", "Science"
  grade_band: GradeBand;
  skill: string;              // e.g. "two-digit multiplication", "main idea vs. detail"
  category: WorksheetCategory;
  tone: WorksheetTone;
  item_count: number;         // 5–30
  include_answer_key: boolean;
  theme: string | null;       // only meaningful when tone === 'engaging', e.g. "space exploration"
}

// ── Response contract ────────────────────────────────────────────────────────

export interface WorksheetItem {
  prompt: string;
  answer: string | null;    // null when include_answer_key is false
  options: string[] | null; // non-null only for 'multiple-choice'
}

export interface WorksheetResponse {
  request_echo: WorksheetRequest;
  title: string;
  instructions: string;
  items: WorksheetItem[];
  generated_at: string; // ISO timestamp
}
