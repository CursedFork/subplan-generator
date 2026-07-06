import { useEffect, useMemo, useState } from 'react';
import {
  LayoutGrid, Plus, Trash2, Eye, DoorOpen, Sun, Printer, RotateCcw,
  AlertTriangle, XCircle, Link2, Ban,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ClassPicker } from '@/components/roster/ClassPicker';
import {
  useClasses, useStudents, useAddStudents, useUpdateStudent, useDeleteStudent,
} from '@/hooks/useRoster';
import { generateLayout } from '@/lib/seating/solver';
import { printSeating } from '@/lib/seating/printSeating';
import type { RoomConfig, SeatingLayout, StudentSeatingProfile, WallSide } from '@/lib/seating/types';
import type { Student } from '@/types/app';

// ─── Room config (persisted per class in localStorage — no server table yet) ──

interface StoredRoom {
  rows: number;
  cols: number;
  doorWall: WallSide;
  windowWalls: WallSide[];
}

const DEFAULT_ROOM: StoredRoom = { rows: 4, cols: 6, doorWall: 'south', windowWalls: ['east'] };
const roomKey = (classId: string) => `teacherspet-room-${classId}`;

function loadRoom(classId: string): StoredRoom {
  try {
    const raw = localStorage.getItem(roomKey(classId));
    if (raw) return { ...DEFAULT_ROOM, ...(JSON.parse(raw) as StoredRoom) };
  } catch { /* corrupted config falls back to default */ }
  return DEFAULT_ROOM;
}

const WALL_LABELS: Record<WallSide, string> = {
  north: 'Front (board)',
  south: 'Back',
  west: 'Left',
  east: 'Right',
};

// ─── Profile projection from StudentAttributes ───────────────────────

function buildProfile(s: Student): StudentSeatingProfile {
  const a = s.attributes;
  return {
    student_id: s.id,
    name: s.name,
    needs_front: a.needs_front === true,
    avoid_door: a.avoid_door === true,
    avoid_window: a.avoid_window === true,
    avoid_high_traffic: a.avoid_high_traffic === true,
    preferred_side: a.preferred_side === 'left' || a.preferred_side === 'right' ? a.preferred_side : null,
    fixed_seat: a.fixed_seat && typeof a.fixed_seat === 'object' ? a.fixed_seat as { row: number; col: number } : null,
    behavior_rating: typeof a.behavior_rating === 'number' ? a.behavior_rating as 1 | 2 | 3 | 4 | 5 : null,
    focus_level: typeof a.focus_level === 'number' ? a.focus_level as 1 | 2 | 3 | 4 | 5 : null,
    cannot_sit_near: Array.isArray(a.cannot_sit_near) ? a.cannot_sit_near.filter((x): x is string => typeof x === 'string') : [],
    works_well_with: Array.isArray(a.works_well_with) ? a.works_well_with.filter((x): x is string => typeof x === 'string') : [],
    iep_seating: a.iep_seating === true,
  };
}

// ─── Page ────────────────────────────────────────────────────────────

export default function SeatingChartPage() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const activeClassId = selectedClassId ?? classes?.[0]?.id ?? null;
  const activeClass = classes?.find((c) => c.id === activeClassId) ?? null;
  const { data: students } = useStudents(activeClassId);

  const [room, setRoom] = useState<StoredRoom>(DEFAULT_ROOM);
  const [layout, setLayout] = useState<SeatingLayout | null>(null);

  useEffect(() => {
    if (activeClassId) {
      setRoom(loadRoom(activeClassId));
      setLayout(null);
    }
  }, [activeClassId]);

  function updateRoom(patch: Partial<StoredRoom>) {
    setRoom((prev) => {
      const next = { ...prev, ...patch };
      if (activeClassId) localStorage.setItem(roomKey(activeClassId), JSON.stringify(next));
      return next;
    });
  }

  const roomConfig: RoomConfig | null = activeClassId ? {
    id: activeClassId,
    name: activeClass?.name ?? 'Room',
    rows: room.rows,
    cols: room.cols,
    front_wall: 'north',
    door: { wall: room.doorWall },
    windows: room.windowWalls.map((wall) => ({ wall })),
    high_traffic_spots: [],
    teacher_desk: null,
    enabled_seats: [],
  } : null;

  function handleGenerate() {
    if (!roomConfig || !students) return;
    setLayout(generateLayout(roomConfig, students.map(buildProfile)));
  }

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-md bg-terracotta-soft text-terracotta shrink-0">
            <LayoutGrid className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-sans font-semibold text-sage bg-sage/10 px-2.5 py-1 rounded-full">
            Active
          </span>
        </div>
        <h1 className="font-display text-display-lg text-ink">Seating Chart Maker</h1>
        <p className="font-sans text-base text-ink-soft mt-3 max-w-2xl leading-relaxed">
          Describe your room, tag student needs, and generate a seating chart in one click.
          IEP front-row placements are always honored; conflicts are flagged, never hidden.
          Same roster as the Group Mate Maker.
        </p>
      </div>

      <ClassPicker
        classes={classes ?? []}
        loading={classesLoading}
        activeClassId={activeClassId}
        onSelect={(id) => setSelectedClassId(id)}
      />

      {activeClassId && (
        <>
          <SeatingRoster classId={activeClassId} students={students ?? []} />
          <PairEditor classId={activeClassId} students={students ?? []} />

          {/* Room config */}
          <Card>
            <h2 className="font-display text-display-md text-ink mb-5 rule-ornament">Your room</h2>
            <div className="flex flex-wrap gap-8">
              {([['rows', 'Rows of desks'], ['cols', 'Desks per row']] as const).map(([key, label]) => (
                <div key={key}>
                  <p className="font-sans text-sm font-semibold text-ink mb-2">{label}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateRoom({ [key]: Math.max(2, room[key] - 1) } as Partial<StoredRoom>)}
                      className="w-7 h-7 rounded border border-rule bg-paper text-ink-soft hover:text-ink font-sans text-sm flex items-center justify-center"
                    >−</button>
                    <span className="font-display text-display-md text-ink w-6 text-center">{room[key]}</span>
                    <button
                      onClick={() => updateRoom({ [key]: Math.min(10, room[key] + 1) } as Partial<StoredRoom>)}
                      className="w-7 h-7 rounded border border-rule bg-paper text-ink-soft hover:text-ink font-sans text-sm flex items-center justify-center"
                    >+</button>
                  </div>
                </div>
              ))}

              <div>
                <p className="font-sans text-sm font-semibold text-ink mb-2">Door is at the…</p>
                <select
                  value={room.doorWall}
                  onChange={(e) => updateRoom({ doorWall: e.target.value as WallSide })}
                  className="rounded-md border border-rule bg-paper px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/40 theme-aware"
                >
                  {(Object.keys(WALL_LABELS) as WallSide[]).map((w) => (
                    <option key={w} value={w}>{WALL_LABELS[w]}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="font-sans text-sm font-semibold text-ink mb-2">Windows on the…</p>
                <div className="flex gap-2">
                  {(Object.keys(WALL_LABELS) as WallSide[]).map((w) => {
                    const on = room.windowWalls.includes(w);
                    return (
                      <button
                        key={w}
                        onClick={() => updateRoom({
                          windowWalls: on
                            ? room.windowWalls.filter((x) => x !== w)
                            : [...room.windowWalls, w],
                        })}
                        className={[
                          'px-3 py-1.5 rounded-md border text-xs font-sans font-medium transition-colors duration-150',
                          on
                            ? 'bg-terracotta text-paper border-terracotta'
                            : 'bg-paper text-ink-soft border-rule hover:border-ink-faint',
                        ].join(' ')}
                      >
                        {WALL_LABELS[w].split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <Button size="lg" onClick={handleGenerate} disabled={(students ?? []).length < 1}>
                {layout ? 'Regenerate chart' : 'Generate seating chart'}
              </Button>
              <span className="font-sans text-xs text-ink-faint">
                {room.rows * room.cols} desks · {(students ?? []).length} students
              </span>
            </div>
          </Card>

          {layout && roomConfig && (
            <ChartView
              layout={layout}
              room={roomConfig}
              students={students ?? []}
              className={activeClass?.name ?? 'Class'}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Roster with seating attributes ──────────────────────────────────

function SeatingRoster({ classId, students }: { classId: string; students: Student[] }) {
  const addStudents = useAddStudents();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const [namesInput, setNamesInput] = useState('');

  function handleAdd() {
    const names = namesInput.split(/[\n,]/).map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    addStudents.mutate({ classId, names }, { onSuccess: () => setNamesInput('') });
  }

  function toggle(s: Student, key: 'needs_front' | 'iep_seating' | 'avoid_door' | 'avoid_window') {
    const attributes = { ...s.attributes, [key]: !s.attributes[key] };
    // An IEP seating mandate implies a front-row requirement.
    if (key === 'iep_seating' && attributes.iep_seating) attributes.needs_front = true;
    updateStudent.mutate({ studentId: s.id, classId, attributes });
  }

  const toggleBtn = (active: boolean | unknown) =>
    active === true ? 'text-terracotta' : 'text-ink-faint hover:text-ink';

  return (
    <Card>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-display text-display-md text-ink rule-ornament">Roster &amp; needs</h2>
        <span className="font-sans text-sm text-ink-faint">{students.length} students</span>
      </div>

      <div className="flex items-start gap-2 mt-5">
        <textarea
          value={namesInput}
          onChange={(e) => setNamesInput(e.target.value)}
          placeholder={'Add students — one per line or comma-separated.'}
          rows={2}
          className="flex-1 rounded-md border border-rule bg-paper px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-terracotta/40 theme-aware resize-y"
        />
        <Button variant="outline" onClick={handleAdd} disabled={!namesInput.trim() || addStudents.isPending}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>

      {students.length > 0 && (
        <>
          <div className="flex gap-5 mt-5 mb-2 font-sans text-xs text-ink-faint flex-wrap">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> needs front</span>
            <span>IEP = front row required</span>
            <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" /> keep from door</span>
            <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> keep from windows</span>
          </div>
          <div className="divide-y divide-rule border border-rule rounded-md overflow-hidden">
            {students.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 bg-paper theme-aware">
                <span className="flex-1 font-sans text-sm text-ink">{s.name}</span>

                <button onClick={() => toggle(s, 'needs_front')} title="Needs front row (vision/hearing)"
                  className={toggleBtn(s.attributes.needs_front)}>
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggle(s, 'iep_seating')}
                  title="IEP/504 seating mandate — front row becomes a hard requirement"
                  className={[
                    'text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-full border transition-colors',
                    s.attributes.iep_seating
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-paper text-ink-faint border-rule hover:text-ink',
                  ].join(' ')}
                >
                  IEP
                </button>
                <button onClick={() => toggle(s, 'avoid_door')} title="Keep away from the door"
                  className={toggleBtn(s.attributes.avoid_door)}>
                  <DoorOpen className="w-4 h-4" />
                </button>
                <button onClick={() => toggle(s, 'avoid_window')} title="Keep away from windows"
                  className={toggleBtn(s.attributes.avoid_window)}>
                  <Sun className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteStudent.mutate({ studentId: s.id, classId })}
                  title="Remove student"
                  className="text-ink-faint hover:text-terracotta transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

// ─── Pair editor (keep apart / works well with) ──────────────────────

function PairEditor({ classId, students }: { classId: string; students: Student[] }) {
  const updateStudent = useUpdateStudent();
  const [aId, setAId] = useState('');
  const [bId, setBId] = useState('');
  const [kind, setKind] = useState<'cannot_sit_near' | 'works_well_with'>('cannot_sit_near');

  const nameOf = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);

  // Derive the deduped pair list from student attributes (either direction).
  const pairs = useMemo(() => {
    const seen = new Set<string>();
    const list: { a: string; b: string; kind: 'cannot_sit_near' | 'works_well_with' }[] = [];
    for (const s of students) {
      for (const key of ['cannot_sit_near', 'works_well_with'] as const) {
        const arr = s.attributes[key];
        if (!Array.isArray(arr)) continue;
        for (const t of arr) {
          if (typeof t !== 'string' || !nameOf.has(t)) continue;
          const pk = `${key}:${[s.id, t].sort().join('|')}`;
          if (seen.has(pk)) continue;
          seen.add(pk);
          list.push({ a: s.id, b: t, kind: key });
        }
      }
    }
    return list;
  }, [students, nameOf]);

  function addPair() {
    if (!aId || !bId || aId === bId) return;
    const student = students.find((s) => s.id === aId)!;
    const existing = Array.isArray(student.attributes[kind])
      ? (student.attributes[kind] as string[])
      : [];
    if (!existing.includes(bId)) {
      updateStudent.mutate({
        studentId: aId,
        classId,
        attributes: { ...student.attributes, [kind]: [...existing, bId] },
      });
    }
    setAId('');
    setBId('');
  }

  function removePair(pair: { a: string; b: string; kind: 'cannot_sit_near' | 'works_well_with' }) {
    // The pair may be stored on either student — clean both directions.
    for (const [sid, other] of [[pair.a, pair.b], [pair.b, pair.a]] as const) {
      const s = students.find((x) => x.id === sid);
      if (!s) continue;
      const arr = s.attributes[pair.kind];
      if (Array.isArray(arr) && arr.includes(other)) {
        updateStudent.mutate({
          studentId: sid,
          classId,
          attributes: { ...s.attributes, [pair.kind]: arr.filter((x) => x !== other) },
        });
      }
    }
  }

  const selectCls = 'rounded-md border border-rule bg-paper px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/40 theme-aware';

  return (
    <Card>
      <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">Pairs</h2>
      <p className="font-sans text-sm text-ink-soft mt-3 mb-5">
        Mark who shouldn&rsquo;t sit together and who works well side by side. These pairs are
        shared with the Group Mate Maker.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <select value={aId} onChange={(e) => setAId(e.target.value)} className={selectCls}>
          <option value="">Student…</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className={selectCls}>
          <option value="cannot_sit_near">must be kept apart from</option>
          <option value="works_well_with">works well with</option>
        </select>
        <select value={bId} onChange={(e) => setBId(e.target.value)} className={selectCls}>
          <option value="">Student…</option>
          {students.filter((s) => s.id !== aId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <Button size="sm" variant="outline" onClick={addPair} disabled={!aId || !bId}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add pair
        </Button>
      </div>

      {pairs.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {pairs.map((p) => (
            <span
              key={`${p.kind}:${p.a}:${p.b}`}
              className={[
                'inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border font-sans text-xs',
                p.kind === 'cannot_sit_near'
                  ? 'border-terracotta/40 bg-terracotta-soft text-ink'
                  : 'border-sage/40 bg-sage/10 text-ink',
              ].join(' ')}
            >
              {p.kind === 'cannot_sit_near'
                ? <Ban className="w-3 h-3 text-terracotta" />
                : <Link2 className="w-3 h-3 text-sage" />}
              {nameOf.get(p.a)} &amp; {nameOf.get(p.b)}
              <button
                onClick={() => removePair(p)}
                className="text-ink-faint hover:text-terracotta ml-0.5"
                aria-label="Remove pair"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Chart display ───────────────────────────────────────────────────

function ChartView({
  layout, room, students, className,
}: {
  layout: SeatingLayout;
  room: RoomConfig;
  students: Student[];
  className: string;
}) {
  const nameOf = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);
  const byPos = useMemo(
    () => new Map(layout.assignments.map((a) => [`${a.row},${a.col}`, a.student_id])),
    [layout],
  );

  return (
    <Card>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h2 className="font-display text-display-md text-ink rule-ornament">Your chart</h2>
        <Button variant="outline" size="sm" onClick={() => printSeating(className, room, layout, nameOf)}>
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          Print / PDF
        </Button>
      </div>

      {layout.constraint_violations.length > 0 && (
        <div className="flex items-start gap-3 p-3.5 rounded-md border border-terracotta bg-terracotta-soft mb-4 theme-aware">
          <XCircle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
          <ul className="font-sans text-sm text-ink space-y-1">
            {layout.constraint_violations.map((v, i) => <li key={i}>{v.reason}</li>)}
          </ul>
        </div>
      )}
      {layout.warnings.length > 0 && (
        <div className="flex items-start gap-3 p-3.5 rounded-md border border-rule bg-rule/20 mb-4 theme-aware">
          <AlertTriangle className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
          <ul className="font-sans text-sm text-ink-soft space-y-1">
            {layout.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <p className="text-center font-sans text-[11px] uppercase tracking-widest text-ink-faint mb-3">
        ▲ Front of room (board)
      </p>
      <div className="overflow-x-auto">
        <div
          className="grid gap-2 mx-auto w-fit"
          style={{ gridTemplateColumns: `repeat(${room.cols}, minmax(72px, 96px))` }}
        >
          {Array.from({ length: room.rows * room.cols }, (_, i) => {
            const row = Math.floor(i / room.cols);
            const col = i % room.cols;
            const sid = byPos.get(`${row},${col}`);
            return (
              <div
                key={i}
                className={[
                  'h-12 rounded-md border flex items-center justify-center px-1 font-sans text-xs text-center',
                  sid
                    ? 'border-rule bg-paper text-ink shadow-card theme-aware'
                    : 'border-dashed border-rule/70 text-ink-faint/40',
                ].join(' ')}
              >
                <span className="truncate">{sid ? nameOf.get(sid) : ''}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="font-sans text-xs text-ink-faint mt-5 flex items-center gap-1.5">
        <RotateCcw className="w-3 h-3" />
        Regenerate as often as you like — pinned and IEP placements stay put.
      </p>
    </Card>
  );
}
