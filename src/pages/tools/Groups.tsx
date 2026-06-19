import { useState } from 'react';
import { Users, Shuffle, Sparkles, ToggleRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type {
  GroupingMode,
  GroupSizeSpec,
  GroupingConstraint,
  GroupingRequest,
  ConstraintKind,
  BalanceAttribute,
} from '@/lib/grouping/types';

// ─── Demo form ────────────────────────────────────────────────────────────────
// Builds a real GroupingRequest from local state and logs it.
// No class data exists yet — class_id and student_ids are placeholders.

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
    description: 'Reads "cannot sit near" pairs you already marked on students.',
  },
  {
    kind: 'keep_together',
    label: 'Keep compatible students together',
    description: 'Reads "works well with" pairs you already marked on students.',
  },
  {
    kind: 'one_leader_per_group',
    label: 'One group leader per group',
    description: 'Spreads students flagged as group leaders evenly — one per group.',
  },
  {
    kind: 'balance_attribute',
    attribute: 'behavior_rating',
    label: 'Balance behavior across groups',
    description: 'Ensures no group gets all the high-challenge students.',
  },
  {
    kind: 'balance_attribute',
    attribute: 'reading_level',
    label: 'Balance reading level across groups',
    description: 'Spreads reading levels so each group has a mix.',
  },
  {
    kind: 'balance_attribute',
    attribute: 'iep',
    label: 'Spread IEP students across groups',
    description: 'Prevents any single group from having all IEP students.',
  },
];

function constraintKey(c: ConstraintToggle) {
  return c.attribute ? `${c.kind}:${c.attribute}` : c.kind;
}

function DemoForm() {
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
          .map((c) => ({
            kind: c.kind,
            attribute: c.attribute,
            weight: 'preferred' as const,
          }));

    const request: GroupingRequest = {
      class_id: 'demo-class-id',           // placeholder — no real roster yet
      student_ids: ['demo-student-1', 'demo-student-2'], // placeholder
      size_spec,
      mode,
      constraints,
    };

    // eslint-disable-next-line no-console
    console.log('[GroupMate] GroupingRequest:', JSON.stringify(request, null, 2));
    alert('GroupingRequest logged to console — algorithm coming soon!');
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div>
        <p className="font-sans text-sm font-semibold text-ink mb-3">Grouping mode</p>
        <div className="flex gap-3">
          {((['thoughtful', 'random'] as GroupingMode[])).map((m) => (
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
              {m === 'thoughtful'
                ? <Sparkles className="w-3.5 h-3.5" />
                : <Shuffle className="w-3.5 h-3.5" />}
              {m === 'thoughtful' ? 'Thoughtful' : 'Random'}
            </button>
          ))}
        </div>
        <p className="font-sans text-xs text-ink-faint mt-2">
          {mode === 'thoughtful'
            ? 'Respects relationships, balances behavior ratings and ability levels.'
            : 'Pure shuffle — fast, fair, no constraints applied.'}
        </p>
      </div>

      {/* Size spec */}
      <div>
        <p className="font-sans text-sm font-semibold text-ink mb-3">Group size</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-md border border-rule overflow-hidden">
            {(['by_size', 'by_count'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSizeType(t)}
                className={[
                  'px-3 py-1.5 text-xs font-sans font-medium transition-colors duration-150',
                  sizeType === t
                    ? 'bg-ink text-paper'
                    : 'bg-paper text-ink-soft hover:text-ink',
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
          <span className="font-sans text-sm text-ink-soft">
            {sizeType === 'by_size' ? 'students per group' : 'groups total'}
          </span>
        </div>
      </div>

      {/* Constraints — only shown in thoughtful mode */}
      {mode === 'thoughtful' && (
        <div>
          <p className="font-sans text-sm font-semibold text-ink mb-3">Constraints</p>
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
                    active
                      ? 'border-terracotta bg-terracotta-soft'
                      : 'border-rule bg-paper hover:border-ink-faint',
                  ].join(' ')}
                >
                  <div className={[
                    'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                    active ? 'border-terracotta bg-terracotta' : 'border-rule bg-paper',
                  ].join(' ')}>
                    {active && (
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`font-sans text-xs font-semibold ${active ? 'text-ink' : 'text-ink-soft'}`}>
                      {c.label}
                    </p>
                    <p className="font-sans text-xs text-ink-faint mt-0.5 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Generate */}
      <div className="flex items-center gap-4 pt-2">
        <div className="relative group inline-block">
          <Button size="lg" onClick={handleGenerate} disabled>
            {mode === 'random' ? 'Shuffle groups' : 'Generate groups'}
          </Button>
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-ink text-paper text-xs px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Coming soon
          </div>
        </div>
        <span className="font-sans text-xs text-ink-faint">
          No class roster yet — pick a class to enable this.
        </span>
      </div>
    </div>
  );
}

// ─── How it works steps ───────────────────────────────────────────────────────

const STEPS = [
  {
    number: '1',
    title: 'Pick a class',
    body: 'Select any class from your roster. Students and their attributes carry over automatically — no re-entering data.',
  },
  {
    number: '2',
    title: 'Choose thoughtful or random',
    body: 'Thoughtful mode respects relationships, ability levels, and behavior. Random mode is a pure shuffle — fast and fair.',
  },
  {
    number: '3',
    title: 'Generate, tweak, and print',
    body: 'Groups appear instantly. Regenerate until they look right, rename groups, then print or export for the class.',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GroupsPage() {
  return (
    <div className="space-y-10 max-w-3xl">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-md bg-terracotta-soft text-terracotta shrink-0">
            <Users className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-sans font-semibold text-ink-faint bg-rule/60 px-2.5 py-1 rounded-full">
            Coming soon
          </span>
        </div>
        <h1 className="font-display text-display-lg text-ink">Group Mate Maker</h1>
        <p className="font-sans text-base text-ink-soft mt-3 max-w-2xl leading-relaxed">
          Generate balanced student groups in one click — or shuffle randomly when you just
          need something quick. Uses the same roster and student attributes as the Seating
          Chart Maker: mark a student once and both tools know about it.
        </p>
      </div>

      {/* How it works */}
      <div>
        <h2 className="font-display text-display-md text-ink rule-ornament mb-6">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {STEPS.map(({ number, title, body }) => (
            <div key={number} className="rounded-md border border-rule bg-paper shadow-card p-6 theme-aware">
              <div className="w-7 h-7 rounded-full bg-terracotta-soft text-terracotta flex items-center justify-center font-display font-semibold text-sm mb-4">
                {number}
              </div>
              <h3 className="font-display text-display-sm text-ink mb-2">{title}</h3>
              <p className="font-sans text-sm text-ink-soft leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shared roster callout */}
      <div className="rounded-md border border-rule bg-paper p-5 flex gap-4 theme-aware">
        <div className="p-2 rounded bg-terracotta-soft text-terracotta shrink-0 self-start">
          <ToggleRight className="w-4 h-4" />
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-ink mb-1">One roster, two tools</p>
          <p className="font-sans text-sm text-ink-soft leading-relaxed">
            "Cannot sit near," "works well with," behavior rating, IEP flag, reading level,
            and group leader — all stored once on each student. The Seating Chart Maker and
            Group Mate Maker both read from that same record. Update a student's attribute
            once and both tools reflect it immediately.
          </p>
        </div>
      </div>

      {/* Two modes */}
      <div>
        <h2 className="font-display text-display-md text-ink rule-ornament mb-6">Two modes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-md border border-rule bg-paper shadow-card p-6 theme-aware">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-terracotta" strokeWidth={1.75} />
              <h3 className="font-display text-display-sm text-ink">Thoughtful</h3>
            </div>
            <p className="font-sans text-sm text-ink-soft leading-relaxed mb-4">
              Respects relationship constraints and balances attributes you choose. You pick
              which constraints apply — the algorithm handles the rest and tells you clearly
              when it couldn't satisfy something.
            </p>
            <ul className="space-y-2 font-sans text-xs text-ink-soft">
              {[
                'Keep conflicting students in separate groups',
                'Keep compatible students in the same group',
                'Balance behavior ratings across groups',
                'Balance reading levels across groups',
                'One group leader per group',
                'Spread IEP students evenly',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-terracotta mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-rule bg-paper shadow-card p-6 theme-aware">
            <div className="flex items-center gap-2 mb-3">
              <Shuffle className="w-4 h-4 text-terracotta" strokeWidth={1.75} />
              <h3 className="font-display text-display-sm text-ink">Random</h3>
            </div>
            <p className="font-sans text-sm text-ink-soft leading-relaxed mb-4">
              A fair, pure shuffle with no constraints applied. Best for low-stakes activities,
              peer review, or when you specifically want students to mix with people they
              don't normally work with.
            </p>
            <ul className="space-y-2 font-sans text-xs text-ink-soft">
              {[
                'No relationship or attribute constraints',
                'Pure random shuffle — different every time',
                'Choose group size or number of groups',
                'Regenerate until the spread looks reasonable',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-terracotta mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Demo form */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-1 rule-ornament">
          Try the form
        </h2>
        <p className="font-sans text-sm text-ink-soft mt-4 mb-6 leading-relaxed">
          The inputs below build a real{' '}
          <code className="font-mono text-xs bg-rule/60 px-1 py-0.5 rounded">GroupingRequest</code>{' '}
          and log it to the console. Wire it to a class roster and the algorithm to make it live.
        </p>
        <DemoForm />
      </Card>

      {/* What you get */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">
          What you get
        </h2>
        <ul className="mt-4 space-y-3 font-sans text-sm text-ink-soft">
          {[
            'Groups appear instantly. Hard constraints are always honored; soft constraints emit a clear warning if they conflict.',
            'Regenerate as many times as you want — each run gets a new run ID so you can compare results.',
            'Rename groups ("Blue Team", "Station A") without re-running.',
            'Print a clean group list to hand out or leave for a substitute.',
            'Roster shared with the Seating Chart Maker — students you already know, no double entry.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* CTA */}
      <div>
        <div className="relative group inline-block">
          <Button disabled size="lg">
            Create groups
          </Button>
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-ink text-paper text-xs px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Coming soon
          </div>
        </div>
        <p className="font-sans text-xs text-ink-faint mt-3">
          This tool is in development. Check back soon.
        </p>
      </div>

    </div>
  );
}
