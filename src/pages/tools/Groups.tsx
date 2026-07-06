import { useMemo, useState } from 'react';
import {
  Users, Shuffle, Sparkles, Plus, Trash2, Star, Printer, RotateCcw, AlertTriangle, XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ClassPicker } from '@/components/roster/ClassPicker';
import {
  useClasses, useStudents, useAddStudents, useUpdateStudent, useDeleteStudent,
} from '@/hooks/useRoster';
import { generateGroups } from '@/lib/grouping/grouper';
import { printGroups } from '@/lib/grouping/printGroups';
import type {
  GroupingMode, GroupSizeSpec, GroupingConstraint, GroupingRequest, GroupingResult,
  ConstraintKind, BalanceAttribute,
} from '@/lib/grouping/types';
import type { Student } from '@/types/app';

// ─── Constraint toggles ──────────────────────────────────────────────

interface ConstraintToggle {
  kind: ConstraintKind;
  attribute?: BalanceAttribute;
  label: string;
  description: string;
}

const AVAILABLE_CONSTRAINTS: ConstraintToggle[] = [
  {
    kind: 'keep_apart',
    label: 'Keep conflicting students apart',
    description: 'Uses each student’s "keep apart" list.',
  },
  {
    kind: 'keep_together',
    label: 'Keep compatible students together',
    description: 'Uses each student’s "works well with" list.',
  },
  {
    kind: 'one_leader_per_group',
    label: 'One group leader per group',
    description: 'Spreads starred leaders — one per group.',
  },
  {
    kind: 'balance_attribute',
    attribute: 'reading_level',
    label: 'Balance reading level',
    description: 'Each group gets a mix of levels.',
  },
  {
    kind: 'balance_attribute',
    attribute: 'iep',
    label: 'Spread IEP students',
    description: 'No group gets all IEP students.',
  },
];

function constraintKey(c: ConstraintToggle) {
  return c.attribute ? `${c.kind}:${c.attribute}` : c.kind;
}

// ─── Page ────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Default to the first class once loaded.
  const activeClassId = selectedClassId ?? classes?.[0]?.id ?? null;
  const activeClass = classes?.find((c) => c.id === activeClassId) ?? null;

  const { data: students } = useStudents(activeClassId);

  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<GroupingResult | null>(null);

  const presentStudents = useMemo(
    () => (students ?? []).filter((s) => !absentIds.has(s.id)),
    [students, absentIds],
  );

  function selectClass(id: string) {
    setSelectedClassId(id);
    setAbsentIds(new Set());
    setResult(null);
  }

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-md bg-terracotta-soft text-terracotta shrink-0">
            <Users className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-sans font-semibold text-sage bg-sage/10 px-2.5 py-1 rounded-full">
            Active
          </span>
        </div>
        <h1 className="font-display text-display-lg text-ink">Group Mate Maker</h1>
        <p className="font-sans text-base text-ink-soft mt-3 max-w-2xl leading-relaxed">
          Pick a class, mark who&rsquo;s here today, and generate balanced groups — or shuffle
          randomly. The roster is shared with the Seating Chart Maker, so students only need
          to be entered once.
        </p>
      </div>

      {/* Class picker */}
      <ClassPicker
        classes={classes ?? []}
        loading={classesLoading}
        activeClassId={activeClassId}
        onSelect={selectClass}
      />

      {activeClassId && (
        <>
          <RosterEditor
            classId={activeClassId}
            students={students ?? []}
            absentIds={absentIds}
            onToggleAbsent={(id) => {
              setAbsentIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
          />

          <GeneratePanel
            classId={activeClassId}
            presentStudents={presentStudents}
            onResult={setResult}
          />

          {result && (
            <ResultsView
              result={result}
              students={students ?? []}
              className={activeClass?.name ?? 'Class'}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Roster editor ───────────────────────────────────────────────────

function RosterEditor({
  classId, students, absentIds, onToggleAbsent,
}: {
  classId: string;
  students: Student[];
  absentIds: Set<string>;
  onToggleAbsent: (id: string) => void;
}) {
  const addStudents = useAddStudents();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const [namesInput, setNamesInput] = useState('');

  function handleAdd() {
    const names = namesInput.split(/[\n,]/).map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    addStudents.mutate({ classId, names }, { onSuccess: () => setNamesInput('') });
  }

  function toggleAttr(s: Student, key: 'group_leader' | 'iep') {
    updateStudent.mutate({
      studentId: s.id,
      classId,
      attributes: { ...s.attributes, [key]: !s.attributes[key] },
    });
  }

  function setReadingLevel(s: Student, level: string) {
    updateStudent.mutate({
      studentId: s.id,
      classId,
      attributes: { ...s.attributes, reading_level: level.trim() || null },
    });
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="font-display text-display-md text-ink rule-ornament">Roster</h2>
        <span className="font-sans text-sm text-ink-faint">
          {students.length} students · {students.length - absentIds.size} present today
        </span>
      </div>

      {/* Add students */}
      <div className="flex items-start gap-2 mt-5">
        <textarea
          value={namesInput}
          onChange={(e) => setNamesInput(e.target.value)}
          placeholder={'Add students — one per line or comma-separated.\ne.g.\nAva R.\nBen T.\nCal W.'}
          rows={2}
          className="flex-1 rounded-md border border-rule bg-paper px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-terracotta/40 theme-aware resize-y"
        />
        <Button
          variant="outline"
          onClick={handleAdd}
          disabled={!namesInput.trim() || addStudents.isPending}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>
      <p className="font-sans text-xs text-ink-faint mt-2">
        Tip: use first names and last initials. Star a student to mark them as a group leader.
      </p>

      {/* Student rows */}
      {students.length > 0 && (
        <div className="mt-5 divide-y divide-rule border border-rule rounded-md overflow-hidden">
          {students.map((s) => {
            const absent = absentIds.has(s.id);
            return (
              <div
                key={s.id}
                className={[
                  'flex items-center gap-3 px-4 py-2.5 bg-paper theme-aware',
                  absent ? 'opacity-45' : '',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={!absent}
                  onChange={() => onToggleAbsent(s.id)}
                  title={absent ? 'Marked absent — excluded from groups' : 'Present'}
                  className="w-4 h-4 accent-[var(--color-terracotta,#c4633e)] shrink-0"
                />
                <span className={`flex-1 font-sans text-sm ${absent ? 'line-through text-ink-faint' : 'text-ink'}`}>
                  {s.name}
                </span>

                <button
                  onClick={() => toggleAttr(s, 'group_leader')}
                  title={s.attributes.group_leader ? 'Group leader — click to unset' : 'Mark as group leader'}
                  className={s.attributes.group_leader ? 'text-terracotta' : 'text-ink-faint hover:text-ink'}
                >
                  <Star className="w-4 h-4" fill={s.attributes.group_leader ? 'currentColor' : 'none'} />
                </button>

                <button
                  onClick={() => toggleAttr(s, 'iep')}
                  title={s.attributes.iep ? 'IEP — click to unset' : 'Mark IEP'}
                  className={[
                    'text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-full border transition-colors',
                    s.attributes.iep
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-paper text-ink-faint border-rule hover:text-ink',
                  ].join(' ')}
                >
                  IEP
                </button>

                <input
                  defaultValue={typeof s.attributes.reading_level === 'string' ? s.attributes.reading_level : ''}
                  onBlur={(e) => {
                    const current = typeof s.attributes.reading_level === 'string' ? s.attributes.reading_level : '';
                    if (e.target.value.trim() !== current) setReadingLevel(s, e.target.value);
                  }}
                  placeholder="Lvl"
                  maxLength={4}
                  title="Reading level (e.g. A–Z or 1–5)"
                  className="w-12 rounded border border-rule bg-paper px-1.5 py-1 font-sans text-xs text-center text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-terracotta/40 theme-aware"
                />

                <button
                  onClick={() => deleteStudent.mutate({ studentId: s.id, classId })}
                  title="Remove student"
                  className="text-ink-faint hover:text-terracotta transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Generate panel ──────────────────────────────────────────────────

function GeneratePanel({
  classId, presentStudents, onResult,
}: {
  classId: string;
  presentStudents: Student[];
  onResult: (r: GroupingResult) => void;
}) {
  const [mode, setMode] = useState<GroupingMode>('thoughtful');
  const [sizeType, setSizeType] = useState<'by_size' | 'by_count'>('by_size');
  const [sizeValue, setSizeValue] = useState(4);
  const [activeConstraints, setActiveConstraints] = useState<Set<string>>(
    new Set(['keep_apart', 'keep_together', 'one_leader_per_group']),
  );

  function toggleConstraint(key: string) {
    setActiveConstraints((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleGenerate() {
    const size_spec: GroupSizeSpec =
      sizeType === 'by_size'
        ? { type: 'by_size', group_size: sizeValue }
        : { type: 'by_count', group_count: sizeValue };

    const constraints: GroupingConstraint[] = mode === 'random'
      ? []
      : AVAILABLE_CONSTRAINTS
          .filter((c) => activeConstraints.has(constraintKey(c)))
          .map((c) => ({ kind: c.kind, attribute: c.attribute, weight: 'preferred' as const }));

    const request: GroupingRequest = {
      class_id: classId,
      student_ids: presentStudents.map((s) => s.id),
      size_spec,
      mode,
      constraints,
    };

    onResult(generateGroups(
      request,
      presentStudents.map((s) => ({ id: s.id, name: s.name, attributes: s.attributes })),
    ));
  }

  const canGenerate = presentStudents.length >= 2;

  return (
    <Card>
      <h2 className="font-display text-display-md text-ink mb-5 rule-ornament">Make groups</h2>
      <div className="space-y-6">
        {/* Mode */}
        <div className="flex gap-3">
          {(['thoughtful', 'random'] as GroupingMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-sans font-medium transition-colors duration-150',
                mode === m
                  ? 'bg-terracotta text-paper border-terracotta'
                  : 'bg-paper text-ink-soft border-rule hover:border-ink-faint hover:text-ink',
              ].join(' ')}
            >
              {m === 'thoughtful' ? <Sparkles className="w-3.5 h-3.5" /> : <Shuffle className="w-3.5 h-3.5" />}
              {m === 'thoughtful' ? 'Thoughtful' : 'Random'}
            </button>
          ))}
        </div>

        {/* Size */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-md border border-rule overflow-hidden">
            {(['by_size', 'by_count'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSizeType(t)}
                className={[
                  'px-3 py-1.5 text-xs font-sans font-medium transition-colors duration-150',
                  sizeType === t ? 'bg-ink text-paper' : 'bg-paper text-ink-soft hover:text-ink',
                ].join(' ')}
              >
                {t === 'by_size' ? 'Students per group' : 'Number of groups'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSizeValue((v) => Math.max(2, v - 1))}
              className="w-7 h-7 rounded border border-rule bg-paper text-ink-soft hover:text-ink font-sans text-sm flex items-center justify-center"
            >−</button>
            <span className="font-display text-display-md text-ink w-6 text-center">{sizeValue}</span>
            <button
              onClick={() => setSizeValue((v) => Math.min(12, v + 1))}
              className="w-7 h-7 rounded border border-rule bg-paper text-ink-soft hover:text-ink font-sans text-sm flex items-center justify-center"
            >+</button>
          </div>
        </div>

        {/* Constraints */}
        {mode === 'thoughtful' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AVAILABLE_CONSTRAINTS.map((c) => {
              const key = constraintKey(c);
              const active = activeConstraints.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleConstraint(key)}
                  className={[
                    'flex items-start gap-3 p-3 rounded-md border text-left transition-colors duration-150',
                    active ? 'border-terracotta bg-terracotta-soft' : 'border-rule bg-paper hover:border-ink-faint',
                  ].join(' ')}
                >
                  <div className={[
                    'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                    active ? 'border-terracotta bg-terracotta' : 'border-rule bg-paper',
                  ].join(' ')}>
                    {active && (
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`font-sans text-xs font-semibold ${active ? 'text-ink' : 'text-ink-soft'}`}>{c.label}</p>
                    <p className="font-sans text-xs text-ink-faint mt-0.5">{c.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button size="lg" onClick={handleGenerate} disabled={!canGenerate}>
            {mode === 'random' ? 'Shuffle groups' : 'Generate groups'}
          </Button>
          {!canGenerate && (
            <span className="font-sans text-xs text-ink-faint">
              Add at least 2 present students to generate groups.
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Results ─────────────────────────────────────────────────────────

function ResultsView({
  result, students, className,
}: {
  result: GroupingResult;
  students: Student[];
  className: string;
}) {
  const nameOf = useMemo(() => new Map(students.map((s) => [s.id, s.name])), [students]);
  const leaderIds = useMemo(
    () => new Set(students.filter((s) => s.attributes.group_leader === true).map((s) => s.id)),
    [students],
  );

  return (
    <Card>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h2 className="font-display text-display-md text-ink rule-ornament">
          {result.mode === 'random' ? 'Shuffled groups' : 'Your groups'}
        </h2>
        <Button variant="outline" size="sm" onClick={() => printGroups(className, result, nameOf)}>
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          Print / PDF
        </Button>
      </div>

      {result.violations.length > 0 && (
        <div className="flex items-start gap-3 p-3.5 rounded-md border border-terracotta bg-terracotta-soft mb-4 theme-aware">
          <XCircle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
          <ul className="font-sans text-sm text-ink space-y-1">
            {result.violations.map((v, i) => <li key={i}>{v.reason}</li>)}
          </ul>
        </div>
      )}
      {result.warnings.length > 0 && (
        <div className="flex items-start gap-3 p-3.5 rounded-md border border-rule bg-rule/20 mb-4 theme-aware">
          <AlertTriangle className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
          <ul className="font-sans text-sm text-ink-soft space-y-1">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {result.groups.map((g) => (
          <div key={g.group_index} className="rounded-md border border-rule bg-paper p-4 theme-aware">
            <p className="font-display text-display-sm text-ink border-b border-rule pb-2 mb-3">{g.label}</p>
            <ul className="space-y-1.5">
              {g.student_ids.map((id) => (
                <li key={id} className="flex items-center gap-2 font-sans text-sm text-ink-soft">
                  {leaderIds.has(id) && <Star className="w-3 h-3 text-terracotta shrink-0" fill="currentColor" />}
                  {nameOf.get(id) ?? 'Unknown'}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="font-sans text-xs text-ink-faint mt-5 flex items-center gap-1.5">
        <RotateCcw className="w-3 h-3" />
        Not quite right? Hit Generate again for a fresh arrangement — constraints stay applied.
      </p>
    </Card>
  );
}
