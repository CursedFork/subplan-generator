export type WallSide = 'north' | 'south' | 'east' | 'west';

export interface WallFeature {
  wall: WallSide;
}

// Grid-based room layout. Row 0 = front (near board), col 0 = left when facing the board.
export interface RoomConfig {
  id: string;
  name: string;

  rows: number; // front-to-back desk count (typical: 4–7)
  cols: number; // side-to-side desk count (typical: 4–7)

  front_wall: WallSide; // physical wall the board/teacher faces — maps row 0

  door: WallFeature;
  windows: WallFeature[];
  high_traffic_spots: { row: number; col: number }[]; // sharpener, cubbies, pass hook, etc.

  // null = teacher desk is outside the student grid (most common)
  teacher_desk: { row: number; col: number } | null;

  // Empty array = all rows×cols are active desk positions.
  // Populate only for irregular rooms (L-shape, reading corner removed, etc.)
  enabled_seats: { row: number; col: number }[];
}

// Per-student seating preferences and constraints.
// Stored as fields within StudentAttributes JSONB; this type is the projection
// the solver reads (with missing fields defaulting to false / null / []).
export interface StudentSeatingProfile {
  student_id: string;
  name: string;

  // Spatial constraints
  needs_front: boolean; // vision/hearing accommodation → place in row 0 or 1
  avoid_door: boolean; // elopement risk or high distraction near exit
  avoid_window: boolean; // distraction from outside
  avoid_high_traffic: boolean; // sensory sensitivity or focus issues near busy spots
  preferred_side: 'left' | 'right' | null; // dominant hand (e.g., left-handed → rightmost aisle)

  // Teacher override — solver must honor this; cannot be moved by any other constraint
  fixed_seat: { row: number; col: number } | null;

  // Behavioral scoring (null = not assessed; no solver penalty applied)
  behavior_rating: 1 | 2 | 3 | 4 | 5 | null; // 1=very challenging, 5=no concerns
  focus_level: 1 | 2 | 3 | 4 | 5 | null; // 1=easily distracted, 5=highly focused

  // Relationship constraints
  cannot_sit_near: string[]; // student ids — HARD constraint the solver cannot violate
  works_well_with: string[]; // student ids — soft preference (adjacency bonus)

  // When true, needs_front becomes a legally required hard constraint (IEP/504 mandate)
  iep_seating: boolean;
}

export interface SeatAssignment {
  student_id: string;
  row: number;
  col: number;
}

export interface ConstraintViolation {
  type: 'cannot_sit_near' | 'fixed_seat' | 'iep_front';
  student_ids: string[];
  reason: string;
}

export interface SeatingLayout {
  room_config_id: string;
  generated_at: string; // ISO timestamp — teacher can regenerate and compare
  assignments: SeatAssignment[];
  warnings: string[]; // soft issues, e.g. "Not enough front seats for all IEP students"
  constraint_violations: ConstraintViolation[]; // hard constraints that could not be satisfied
}
