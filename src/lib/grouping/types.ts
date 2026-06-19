// ─── Shared roster note ───────────────────────────────────────────────────────
// GroupMate Maker reads from the same `students` table and `StudentAttributes`
// JSONB as the Seating Chart Maker. There is intentionally no separate
// "grouping profile" table — `cannot_sit_near`, `works_well_with`,
// `behavior_rating`, `focus_level`, `reading_level`, `iep`, and `group_leader`
// are all written once on the student record and consumed by both tools.
// ─────────────────────────────────────────────────────────────────────────────

// Exactly one must be provided; the other must be undefined.
export type GroupSizeSpec =
  | { type: 'by_size';  group_size: number }   // target N students per group (may vary ±1)
  | { type: 'by_count'; group_count: number };  // exact number of groups, filled as evenly as possible

export type GroupingMode =
  | 'thoughtful'  // respects constraints, balances attributes
  | 'random';     // pure shuffle — all constraints ignored

// Open string so custom StudentAttributes keys work without migrations.
// Known values are listed for autocomplete/documentation purposes.
export type BalanceAttribute =
  | 'behavior_rating'   // spread 1–5 challenge ratings evenly
  | 'focus_level'       // spread 1–5 focus ratings evenly
  | 'reading_level'     // spread string reading levels evenly
  | 'iep'               // no group gets all IEP students
  | (string & Record<never, never>); // open for custom keys

export type ConstraintKind =
  | 'keep_apart'            // reads cannot_sit_near from StudentAttributes (no separate data)
  | 'keep_together'         // reads works_well_with from StudentAttributes (no separate data)
  | 'balance_attribute'     // spread a numeric or string attribute evenly across groups
  | 'one_leader_per_group'; // max one group_leader:true student per group

export interface GroupingConstraint {
  kind: ConstraintKind;
  // Required when kind === 'balance_attribute'; ignored otherwise.
  attribute?: BalanceAttribute;
  weight: 'required' | 'preferred'; // required = hard violation; preferred = warning only
}

export interface GroupingRequest {
  class_id: string;

  // Subset of the class roster for this run — teacher can exclude absent students
  // without modifying the roster. Reads StudentAttributes from the students table.
  student_ids: string[];

  size_spec: GroupSizeSpec;
  mode: GroupingMode;

  // Ignored entirely when mode === 'random'.
  constraints: GroupingConstraint[];
}

// ─── Result ───────────────────────────────────────────────────────────────────

export interface StudentGroup {
  group_index: number;
  // Human-readable label generated at runtime ("Group 1", "Group 2").
  // Ephemeral — not persisted. Teacher can rename in UI without re-running.
  label: string;
  student_ids: string[];
}

export interface GroupingViolation {
  kind: ConstraintKind;
  student_ids: string[]; // the involved students
  reason: string;        // human-readable explanation
}

export interface GroupingResult {
  // UUID generated per run so the UI can track successive re-runs in a session.
  run_id: string;
  class_id: string;
  generated_at: string;  // ISO timestamp
  mode: GroupingMode;
  groups: StudentGroup[];
  warnings: string[];           // soft constraints that weren't fully met
  violations: GroupingViolation[]; // hard constraints that failed
}
