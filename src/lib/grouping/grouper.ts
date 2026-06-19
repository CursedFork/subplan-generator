import type { GroupingRequest, GroupingResult } from './types';

// Reads the same StudentAttributes JSONB as the Seating Chart Maker.
// No separate profile table — see types.ts header comment for details.
export function generateGroups(
  request: GroupingRequest,
  // Students come from the `students` table query filtered to request.student_ids.
  // Pass names alongside so the result can be displayed without a second lookup.
  students: { id: string; name: string; attributes: Record<string, unknown> }[],
): GroupingResult {
  // TODO: grouping algorithm
  //
  // Random mode:
  //   1. Shuffle student_ids (Fisher-Yates).
  //   2. Slice into groups per size_spec (by_size or by_count).
  //   3. Return result with empty warnings/violations.
  //
  // Thoughtful mode — suggested order:
  //   1. Resolve size_spec → exact group count and target sizes.
  //   2. Pre-assign required keep_together pairs to the same provisional group.
  //      Conflict (pair already in different required groups) → violation.
  //   3. Pre-assign required keep_apart pairs to different provisional groups.
  //      Conflict → violation.
  //   4. For 'one_leader_per_group': collect group_leader:true students and
  //      spread them across groups first (one per group, remainder as members).
  //   5. For each 'balance_attribute' constraint: sort remaining students by
  //      attribute value and distribute round-robin across groups so each group
  //      gets a mix of high/low values.
  //   6. Fill remaining empty slots randomly.
  //   7. Post-assignment: evaluate preferred (soft) constraints and emit warnings
  //      for any that aren't met.
  //   8. Label groups ("Group 1", "Group 2", …).

  void request;
  void students;
  throw new Error('Grouping algorithm not yet implemented');
}
