import type {
  RoomConfig,
  StudentSeatingProfile,
  SeatingLayout,
  SeatAssignment,
  ConstraintViolation,
  WallSide,
} from './types';

// Greedy scored placement + swap repair. Same overall strategy as the
// grouping solver: place the most-constrained students first, score every
// open seat, then repair remaining cannot_sit_near conflicts with clean swaps.

interface Seat {
  row: number;
  col: number;
  nearDoor: number;    // 0..1 proximity weight
  nearWindow: number;  // 0..1
  nearTraffic: number; // 0..1
}

const cheb = (r1: number, c1: number, r2: number, c2: number) =>
  Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));

// Grid coordinate of the middle of a wall, one step outside the grid.
// Row 0 = front; the front wall is "north" in grid space regardless of
// the room's physical compass orientation.
function wallAnchor(wall: WallSide, rows: number, cols: number): { row: number; col: number } {
  switch (wall) {
    case 'north': return { row: -1, col: (cols - 1) / 2 };
    case 'south': return { row: rows, col: (cols - 1) / 2 };
    case 'west':  return { row: (rows - 1) / 2, col: -1 };
    case 'east':  return { row: (rows - 1) / 2, col: cols };
  }
}

// 1 on the line of seats touching the wall, fading to 0 two lines in.
function wallProximity(wall: WallSide, row: number, col: number, rows: number, cols: number): number {
  const dist =
    wall === 'north' ? row :
    wall === 'south' ? rows - 1 - row :
    wall === 'west' ? col :
    cols - 1 - col;
  return Math.max(0, 1 - dist / 2);
}

function buildSeats(room: RoomConfig): Seat[] {
  const enabled = room.enabled_seats.length > 0
    ? new Set(room.enabled_seats.map((s) => `${s.row},${s.col}`))
    : null;

  const door = wallAnchor(room.door.wall, room.rows, room.cols);
  const seats: Seat[] = [];

  for (let row = 0; row < room.rows; row++) {
    for (let col = 0; col < room.cols; col++) {
      if (enabled && !enabled.has(`${row},${col}`)) continue;
      if (room.teacher_desk && room.teacher_desk.row === row && room.teacher_desk.col === col) continue;

      const doorDist = Math.max(Math.abs(row - door.row), Math.abs(col - door.col));
      const nearDoor = Math.max(0, 1 - (doorDist - 1) / 2);

      const nearWindow = Math.max(
        0,
        ...room.windows.map((w) => wallProximity(w.wall, row, col, room.rows, room.cols)),
      );

      const nearTraffic = room.high_traffic_spots.length
        ? Math.max(
            0,
            ...room.high_traffic_spots.map((t) => Math.max(0, 1 - cheb(row, col, t.row, t.col) / 2)),
          )
        : 0;

      seats.push({ row, col, nearDoor, nearWindow, nearTraffic });
    }
  }
  return seats;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function generateLayout(
  room: RoomConfig,
  students: StudentSeatingProfile[],
): SeatingLayout {
  const warnings: string[] = [];
  const violations: ConstraintViolation[] = [];
  const seats = buildSeats(room);

  if (students.length > seats.length) {
    warnings.push(
      `${students.length} students but only ${seats.length} desks — ${students.length - seats.length} left unseated.`,
    );
  }

  const nameOf = new Map(students.map((s) => [s.student_id, s.name]));
  const open = new Map(seats.map((s) => [`${s.row},${s.col}`, s]));
  const placed = new Map<string, Seat>(); // student_id → seat

  // Pair sets restricted to this roster.
  const inRun = new Set(students.map((s) => s.student_id));
  const apartSet = new Set<string>();
  const togetherSet = new Set<string>();
  for (const s of students) {
    for (const t of s.cannot_sit_near) {
      if (inRun.has(t)) apartSet.add([s.student_id, t].sort().join('|'));
    }
    for (const t of s.works_well_with) {
      if (inRun.has(t)) togetherSet.add([s.student_id, t].sort().join('|'));
    }
  }
  const isApart = (a: string, b: string) => apartSet.has([a, b].sort().join('|'));
  const isTogether = (a: string, b: string) => togetherSet.has([a, b].sort().join('|'));

  // 1. Fixed seats first — nothing can displace them.
  const rest: StudentSeatingProfile[] = [];
  for (const s of students) {
    if (!s.fixed_seat) { rest.push(s); continue; }
    const key = `${s.fixed_seat.row},${s.fixed_seat.col}`;
    const seat = open.get(key);
    if (seat) {
      placed.set(s.student_id, seat);
      open.delete(key);
    } else {
      violations.push({
        type: 'fixed_seat',
        student_ids: [s.student_id],
        reason: `${s.name}'s pinned seat (row ${s.fixed_seat.row + 1}, col ${s.fixed_seat.col + 1}) doesn't exist or is already taken.`,
      });
      rest.push({ ...s, fixed_seat: null });
    }
  }

  // 2. Order: IEP front-required, then soft needs_front, then everyone else.
  const order = [
    ...shuffle(rest.filter((s) => s.iep_seating && s.needs_front)),
    ...shuffle(rest.filter((s) => !(s.iep_seating && s.needs_front) && s.needs_front)),
    ...shuffle(rest.filter((s) => !s.needs_front)),
  ];

  const scoreSeat = (s: StudentSeatingProfile, seat: Seat): number => {
    let score = 0;

    if (s.needs_front) {
      // IEP: rows beyond 1 are effectively forbidden. Soft: linear penalty.
      score += s.iep_seating ? (seat.row <= 1 ? seat.row * 5 : 5000 + seat.row * 100) : seat.row * 12;
    }
    if (s.avoid_door) score += seat.nearDoor * 40;
    if (s.avoid_window) score += seat.nearWindow * 35;
    if (s.avoid_high_traffic) score += seat.nearTraffic * 35;

    if (s.preferred_side) {
      const mid = (room.cols - 1) / 2;
      const onPreferred = s.preferred_side === 'left' ? seat.col < mid : seat.col > mid;
      if (!onPreferred) score += 8;
    }

    // Low behavior/focus students drift toward the front-ish rows where
    // the teacher can reach them, and away from windows.
    if (s.behavior_rating !== null && s.behavior_rating <= 2) score += (room.rows - 1 - seat.row) * 4;
    if (s.focus_level !== null && s.focus_level <= 2) score += seat.nearWindow * 20 + seat.row * 4;

    // Neighbors already placed.
    for (const [otherId, otherSeat] of placed) {
      const adjacent = cheb(seat.row, seat.col, otherSeat.row, otherSeat.col) <= 1;
      if (!adjacent) continue;
      if (isApart(s.student_id, otherId)) score += 400;
      if (isTogether(s.student_id, otherId)) score -= 30;
    }

    return score + Math.random() * 2; // jitter for regeneration variety
  };

  // 3. Greedy placement.
  const unseated: string[] = [];
  for (const s of order) {
    if (open.size === 0) { unseated.push(s.student_id); continue; }
    let best: Seat | null = null;
    let bestScore = Infinity;
    for (const seat of open.values()) {
      const sc = scoreSeat(s, seat);
      if (sc < bestScore) { bestScore = sc; best = seat; }
    }
    placed.set(s.student_id, best!);
    open.delete(`${best!.row},${best!.col}`);
  }

  // 4. Swap repair for remaining cannot_sit_near adjacencies.
  const profileOf = new Map(students.map((s) => [s.student_id, s]));
  const conflictCount = (sid: string, seat: Seat, ignoreId?: string): number => {
    let n = 0;
    for (const [otherId, otherSeat] of placed) {
      if (otherId === sid || otherId === ignoreId) continue;
      if (cheb(seat.row, seat.col, otherSeat.row, otherSeat.col) <= 1 && isApart(sid, otherId)) n++;
    }
    return n;
  };
  const seatOk = (sid: string, seat: Seat): boolean => {
    const p = profileOf.get(sid)!;
    if (p.fixed_seat) return false;
    if (p.iep_seating && p.needs_front && seat.row > 1) return false;
    return true;
  };

  for (let pass = 0; pass < 2; pass++) {
    for (const [sid, seat] of placed) {
      if (conflictCount(sid, seat) === 0 || !seatOk(sid, seat)) continue;
      for (const [otherId, otherSeat] of placed) {
        if (otherId === sid || profileOf.get(otherId)!.fixed_seat) continue;
        if (!seatOk(sid, otherSeat) || !seatOk(otherId, seat)) continue;
        if (conflictCount(sid, otherSeat, otherId) === 0 && conflictCount(otherId, seat, sid) === 0) {
          placed.set(sid, otherSeat);
          placed.set(otherId, seat);
          break;
        }
      }
    }
  }

  // 5. Reporting.
  for (const pair of apartSet) {
    const [a, b] = pair.split('|') as [string, string];
    const sa = placed.get(a);
    const sb = placed.get(b);
    if (sa && sb && cheb(sa.row, sa.col, sb.row, sb.col) <= 1) {
      violations.push({
        type: 'cannot_sit_near',
        student_ids: [a, b],
        reason: `${nameOf.get(a)} and ${nameOf.get(b)} are marked "keep apart" but ended up next to each other.`,
      });
    }
  }
  for (const s of students) {
    if (s.iep_seating && s.needs_front) {
      const seat = placed.get(s.student_id);
      if (seat && seat.row > 1) {
        violations.push({
          type: 'iep_front',
          student_ids: [s.student_id],
          reason: `${s.name} requires a front seat (IEP) but could only be placed in row ${seat.row + 1}.`,
        });
      }
    }
  }
  for (const pair of togetherSet) {
    const [a, b] = pair.split('|') as [string, string];
    const sa = placed.get(a);
    const sb = placed.get(b);
    if (sa && sb && cheb(sa.row, sa.col, sb.row, sb.col) > 1) {
      warnings.push(`${nameOf.get(a)} and ${nameOf.get(b)} work well together but aren't adjacent.`);
    }
  }
  if (unseated.length > 0) {
    warnings.push(`No desks left for: ${unseated.map((id) => nameOf.get(id)).join(', ')}.`);
  }

  const assignments: SeatAssignment[] = [...placed.entries()].map(([student_id, seat]) => ({
    student_id,
    row: seat.row,
    col: seat.col,
  }));

  return {
    room_config_id: room.id,
    generated_at: new Date().toISOString(),
    assignments,
    warnings,
    constraint_violations: violations,
  };
}
