import type { RoomConfig, StudentSeatingProfile, SeatingLayout } from './types';

export function generateLayout(
  room: RoomConfig,
  students: StudentSeatingProfile[],
): SeatingLayout {
  // TODO: constraint-satisfaction solver
  //
  // Suggested order of operations:
  // 1. Build the set of available seats from RoomConfig (enabled_seats or full grid).
  //    Tag each seat with proximity scores: is_front, near_door_wall, near_window_wall,
  //    near_high_traffic — derived from room features and grid coordinates.
  //
  // 2. Place fixed_seat students first. If two students share a fixed_seat, emit a
  //    ConstraintViolation and skip the second student's override.
  //
  // 3. Place iep_seating + needs_front students into front rows (row 0, then row 1).
  //    If there are more IEP/front-required students than front-row seats, emit a warning
  //    and spill into row 2, flagging it as a ConstraintViolation.
  //
  // 4. Enforce cannot_sit_near pairs across all already-placed students using a
  //    backtracking pass. Emit ConstraintViolation for any pair that cannot be separated
  //    given the remaining seats.
  //
  // 5. Score remaining open seats for each unplaced student (lower score = better fit):
  //    + 10 if near_door_wall  and student.avoid_door
  //    + 10 if near_window_wall and student.avoid_window
  //    + 10 if near_high_traffic and student.avoid_high_traffic
  //    - 5  if is_front         and student.needs_front (soft — already handled above)
  //    + 5  if behavior_rating <= 2 and seat has neighbors with behavior_rating <= 2
  //    Place each student greedily into their lowest-score available seat.
  //
  // 6. Post-placement swap pass: for each works_well_with pair not already adjacent,
  //    attempt a cost-neutral swap to bring them closer.
  //
  // 7. Collect unresolved issues into warnings[] and constraint_violations[].

  void room;
  void students;
  throw new Error('Seating solver not yet implemented');
}
