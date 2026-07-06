import type {
  GroupingRequest,
  GroupingResult,
  GroupingViolation,
  StudentGroup,
  GroupingConstraint,
} from './types';

// Reads the same StudentAttributes JSONB as the Seating Chart Maker.
// No separate profile table — see types.ts header comment for details.

export interface RosterStudent {
  id: string;
  name: string;
  attributes: Record<string, unknown>;
}

// ── Helpers ──────────────────────────────────────────────────────────

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

// Even split of n students into k groups: r groups of base+1, k-r of base.
function targetSizes(n: number, k: number): number[] {
  const base = Math.floor(n / k);
  const r = n % k;
  return Array.from({ length: k }, (_, i) => (i < r ? base + 1 : base));
}

function isLeader(s: RosterStudent): boolean {
  return s.attributes['group_leader'] === true;
}

// Attribute value for balancing. Numbers sort numerically; strings
// lexicographically; missing values sort last (they get spread evenly
// by virtue of being placed after the sorted block).
function attrSortKey(s: RosterStudent, attribute: string): number | string | null {
  const v = s.attributes[attribute];
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string' && v.trim() !== '') return v;
  return null;
}

// Pair list from student attributes, restricted to students in this run.
function pairsFromAttribute(
  students: RosterStudent[],
  key: 'cannot_sit_near' | 'works_well_with',
): [string, string][] {
  const inRun = new Set(students.map((s) => s.id));
  const pairs: [string, string][] = [];
  const seen = new Set<string>();
  for (const s of students) {
    const targets = s.attributes[key];
    if (!Array.isArray(targets)) continue;
    for (const t of targets) {
      if (typeof t !== 'string' || !inRun.has(t) || t === s.id) continue;
      const pairKey = [s.id, t].sort().join('|');
      if (seen.has(pairKey)) continue;
      seen.add(pairKey);
      pairs.push([s.id, t]);
    }
  }
  return pairs;
}

// Union-find for keep_together clustering.
class UnionFind {
  private parent = new Map<string, string>();

  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let root = x;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    // Path compression
    let cur = x;
    while (cur !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  union(a: string, b: string): void {
    this.parent.set(this.find(a), this.find(b));
  }
}

interface Unit {
  members: RosterStudent[];
  hasLeader: boolean;
  // Average numeric sort key, for snake-draft balancing (null = no data).
  balanceKey: number | string | null;
}

// ── Main entry point ─────────────────────────────────────────────────

export function generateGroups(
  request: GroupingRequest,
  students: RosterStudent[],
): GroupingResult {
  const roster = students.filter((s) => request.student_ids.includes(s.id));
  const n = roster.length;
  const warnings: string[] = [];
  const violations: GroupingViolation[] = [];

  if (n === 0) {
    return emptyResult(request, ['No students selected.'], []);
  }

  // Resolve group count.
  let k: number;
  if (request.size_spec.type === 'by_count') {
    k = Math.max(1, Math.min(request.size_spec.group_count, n));
    if (k < request.size_spec.group_count) {
      warnings.push(`Only ${n} students — created ${k} groups instead of ${request.size_spec.group_count}.`);
    }
  } else {
    const size = Math.max(1, request.size_spec.group_size);
    k = Math.max(1, Math.ceil(n / size));
  }
  const sizes = targetSizes(n, k);

  const groups: RosterStudent[][] = Array.from({ length: k }, () => []);

  if (request.mode === 'random') {
    // Pure shuffle, sliced to the target sizes.
    const shuffled = shuffle(roster);
    let idx = 0;
    for (let g = 0; g < k; g++) {
      groups[g] = shuffled.slice(idx, idx + sizes[g]!);
      idx += sizes[g]!;
    }
    return buildResult(request, groups, warnings, violations);
  }

  // ── Thoughtful mode ────────────────────────────────────────────────
  const active = (kind: GroupingConstraint['kind']) =>
    request.constraints.find((c) => c.kind === kind) ?? null;

  const keepTogether = active('keep_together');
  const keepApart = active('keep_apart');
  const oneLeader = active('one_leader_per_group');
  const balancers = request.constraints.filter(
    (c) => c.kind === 'balance_attribute' && c.attribute,
  );

  const togetherPairs = keepTogether ? pairsFromAttribute(roster, 'works_well_with') : [];
  const apartPairs = keepApart ? pairsFromAttribute(roster, 'cannot_sit_near') : [];
  const apartSet = new Set(apartPairs.map(([a, b]) => [a, b].sort().join('|')));

  // 1. Cluster keep_together students into units.
  const uf = new UnionFind();
  for (const [a, b] of togetherPairs) uf.union(a, b);

  const clusters = new Map<string, RosterStudent[]>();
  for (const s of shuffle(roster)) {
    const root = uf.find(s.id);
    const list = clusters.get(root) ?? [];
    list.push(s);
    clusters.set(root, list);
  }

  // Split oversized clusters (bigger than the largest group).
  const maxGroupSize = Math.max(...sizes);
  const primaryBalancer = balancers[0]?.attribute ?? null;
  const units: Unit[] = [];
  for (const members of clusters.values()) {
    const chunks: RosterStudent[][] = [];
    if (members.length > maxGroupSize) {
      for (let i = 0; i < members.length; i += maxGroupSize) {
        chunks.push(members.slice(i, i + maxGroupSize));
      }
      const msg = `A "works well with" cluster of ${members.length} students is larger than a group — it was split.`;
      if (keepTogether!.weight === 'required') {
        violations.push({ kind: 'keep_together', student_ids: members.map((m) => m.id), reason: msg });
      } else {
        warnings.push(msg);
      }
    } else {
      chunks.push(members);
    }
    for (const chunk of chunks) {
      const keys = primaryBalancer
        ? chunk.map((m) => attrSortKey(m, primaryBalancer)).filter((v) => v !== null)
        : [];
      const numeric = keys.filter((v): v is number => typeof v === 'number');
      units.push({
        members: chunk,
        hasLeader: chunk.some(isLeader),
        balanceKey: numeric.length
          ? numeric.reduce((a, b) => a + b, 0) / numeric.length
          : (keys[0] ?? null),
      });
    }
  }

  // 2. Order units: leader units first (so they land in distinct groups),
  //    then by balance key (snake draft spreads high/low evenly), then rest.
  const leaderUnits = units.filter((u) => u.hasLeader);
  const nonLeader = units.filter((u) => !u.hasLeader);
  nonLeader.sort((a, b) => {
    if (a.balanceKey === null && b.balanceKey === null) return 0;
    if (a.balanceKey === null) return 1;
    if (b.balanceKey === null) return -1;
    if (typeof a.balanceKey === 'number' && typeof b.balanceKey === 'number') {
      return b.balanceKey - a.balanceKey;
    }
    return String(a.balanceKey).localeCompare(String(b.balanceKey));
  });
  const ordered = oneLeader ? [...leaderUnits, ...nonLeader] : [...units];

  // 3. Place each unit into the best group.
  const groupHasLeader: boolean[] = Array.from({ length: k }, () => false);
  let draftDir = 1;
  let draftPos = 0;

  for (const unit of ordered) {
    let bestGroup = -1;
    let bestScore = Infinity;

    for (let step = 0; step < k; step++) {
      // Snake order: 0..k-1 then k-1..0, so balanced units alternate ends.
      const g = draftPos;
      const capacityLeft = sizes[g]! - groups[g]!.length;
      let score = 0;

      if (capacityLeft < unit.members.length) score += 1000 - capacityLeft * 10;
      if (oneLeader && unit.hasLeader && groupHasLeader[g]) score += 500;

      // keep_apart conflicts with students already in this group.
      let conflicts = 0;
      for (const m of unit.members) {
        for (const placed of groups[g]!) {
          if (apartSet.has([m.id, placed.id].sort().join('|'))) conflicts++;
        }
      }
      score += conflicts * (keepApart?.weight === 'required' ? 300 : 50);

      // Prefer emptier groups as a tiebreak.
      score += groups[g]!.length;

      if (score < bestScore) {
        bestScore = score;
        bestGroup = g;
      }
      draftPos += draftDir;
      if (draftPos === k || draftPos === -1) {
        draftDir *= -1;
        draftPos += draftDir;
      }
    }

    groups[bestGroup]!.push(...unit.members);
    if (unit.hasLeader) groupHasLeader[bestGroup] = true;
  }

  // 4. Swap repair pass: greedy placement can corner the last few students
  //    into a conflicting group even when a clean swap exists.
  const inCluster = new Set(togetherPairs.flat());
  const conflictsInGroup = (sid: string, g: RosterStudent[], excludeId?: string) =>
    g.filter((p) => p.id !== sid && p.id !== excludeId &&
      apartSet.has([sid, p.id].sort().join('|'))).length;

  for (let pass = 0; pass < 2; pass++) {
    for (const [a, b] of apartPairs) {
      const gi = groups.findIndex((g) => g.some((s) => s.id === a));
      if (gi === -1 || !groups[gi]!.some((s) => s.id === b)) continue;

      // Move whichever of the pair isn't glued to a works-well-with cluster.
      const moveId = !inCluster.has(a) ? a : !inCluster.has(b) ? b : null;
      if (!moveId) continue;
      const mover = groups[gi]!.find((s) => s.id === moveId)!;

      outer:
      for (let gj = 0; gj < k; gj++) {
        if (gj === gi) continue;
        for (const candidate of groups[gj]!) {
          if (inCluster.has(candidate.id)) continue;
          if (oneLeader && isLeader(candidate) !== isLeader(mover)) continue;
          // Swap is clean if neither side gains a conflict.
          const moverOk = conflictsInGroup(mover.id, groups[gj]!, candidate.id) === 0;
          const candOk = conflictsInGroup(candidate.id, groups[gi]!, mover.id) === 0;
          if (moverOk && candOk) {
            groups[gi] = groups[gi]!.map((s) => (s.id === mover.id ? candidate : s));
            groups[gj] = groups[gj]!.map((s) => (s.id === candidate.id ? mover : s));
            break outer;
          }
        }
      }
    }
  }

  // 5. Post-placement reporting.
  const groupOf = new Map<string, number>();
  groups.forEach((g, i) => g.forEach((s) => groupOf.set(s.id, i)));
  const nameOf = new Map(roster.map((s) => [s.id, s.name]));

  for (const [a, b] of apartPairs) {
    if (groupOf.get(a) === groupOf.get(b)) {
      const reason = `${nameOf.get(a)} and ${nameOf.get(b)} are marked "keep apart" but ended up in the same group.`;
      if (keepApart!.weight === 'required') {
        violations.push({ kind: 'keep_apart', student_ids: [a, b], reason });
      } else {
        warnings.push(reason);
      }
    }
  }
  for (const [a, b] of togetherPairs) {
    if (groupOf.get(a) !== groupOf.get(b)) {
      const reason = `${nameOf.get(a)} and ${nameOf.get(b)} work well together but landed in different groups.`;
      if (keepTogether!.weight === 'required') {
        violations.push({ kind: 'keep_together', student_ids: [a, b], reason });
      } else {
        warnings.push(reason);
      }
    }
  }
  if (oneLeader) {
    groups.forEach((g, i) => {
      const leaders = g.filter(isLeader);
      if (leaders.length > 1) {
        const reason = `Group ${i + 1} has ${leaders.length} group leaders.`;
        if (oneLeader.weight === 'required') {
          violations.push({ kind: 'one_leader_per_group', student_ids: leaders.map((l) => l.id), reason });
        } else {
          warnings.push(reason);
        }
      }
    });
    if (leaderUnits.length < k) {
      warnings.push(`Only ${leaderUnits.length} group leaders for ${k} groups — some groups have none.`);
    }
  }

  return buildResult(request, groups, warnings, violations);
}

// ── Result assembly ──────────────────────────────────────────────────

function buildResult(
  request: GroupingRequest,
  groups: RosterStudent[][],
  warnings: string[],
  violations: GroupingViolation[],
): GroupingResult {
  const studentGroups: StudentGroup[] = groups.map((g, i) => ({
    group_index: i,
    label: `Group ${i + 1}`,
    student_ids: g.map((s) => s.id),
  }));
  return {
    run_id: crypto.randomUUID(),
    class_id: request.class_id,
    generated_at: new Date().toISOString(),
    mode: request.mode,
    groups: studentGroups,
    warnings,
    violations,
  };
}

function emptyResult(
  request: GroupingRequest,
  warnings: string[],
  violations: GroupingViolation[],
): GroupingResult {
  return {
    run_id: crypto.randomUUID(),
    class_id: request.class_id,
    generated_at: new Date().toISOString(),
    mode: request.mode,
    groups: [],
    warnings,
    violations,
  };
}
