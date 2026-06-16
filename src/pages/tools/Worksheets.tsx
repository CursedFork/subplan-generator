import { useState } from 'react';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type {
  WorksheetRequest,
  WorksheetCategory,
  WorksheetTone,
  GradeBand,
} from '@/types/worksheet';

// ── Static config ─────────────────────────────────────────────────────────────

const GRADE_BANDS: { value: GradeBand; label: string }[] = [
  { value: 'K-2',  label: 'K – 2' },
  { value: '3-5',  label: '3 – 5' },
  { value: '6-8',  label: '6 – 8' },
  { value: '9-12', label: '9 – 12' },
];

const TONES: { value: WorksheetTone; label: string; description: string }[] = [
  {
    value: 'engaging',
    label: 'Engaging',
    description: 'Story framing, characters, and fun context woven through every item.',
  },
  {
    value: 'plain',
    label: 'Plain practice',
    description: 'Clean, no-frills layout focused purely on skill repetition.',
  },
  {
    value: 'assessment',
    label: 'Assessment',
    description: 'Neutral, test-like format with no decoration or added context.',
  },
];

const CATEGORIES: { value: WorksheetCategory; label: string; detail: string }[] = [
  {
    value: 'math-facts',
    label: 'Math Facts Drill',
    detail: 'Arithmetic & times-table grids',
  },
  {
    value: 'word-problems',
    label: 'Word Problems',
    detail: 'Math in context, multi-step reasoning',
  },
  {
    value: 'reading-comprehension',
    label: 'Reading Comprehension',
    detail: 'Passage + questions',
  },
  {
    value: 'vocabulary-matching',
    label: 'Vocabulary Matching',
    detail: 'Word bank ↔ definitions or context sentences',
  },
  {
    value: 'fill-in-the-blank',
    label: 'Fill in the Blank',
    detail: 'Cloze passages for any subject',
  },
  {
    value: 'graphic-organizer',
    label: 'Graphic Organizer',
    detail: 'Venn, T-chart, story map, concept web',
  },
  {
    value: 'short-answer',
    label: 'Short Answer',
    detail: 'Open response / exit ticket questions',
  },
  {
    value: 'multiple-choice',
    label: 'Multiple Choice',
    detail: 'Test-style, four options per item',
  },
];

// ── Default form state ────────────────────────────────────────────────────────

function defaultRequest(): WorksheetRequest {
  return {
    subject: '',
    grade_band: '3-5',
    skill: '',
    category: 'math-facts',
    tone: 'plain',
    item_count: 10,
    include_answer_key: true,
    theme: null,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorksheetsPage() {
  const [req, setReq] = useState<WorksheetRequest>(defaultRequest);
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof WorksheetRequest>(key: K, value: WorksheetRequest[K]) {
    setReq(prev => ({ ...prev, [key]: value }));
    setSubmitted(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('[WorksheetRequest]', req);
    setSubmitted(true);
  }

  const formValid = req.subject.trim().length > 0 && req.skill.trim().length > 0;

  return (
    <div className="space-y-12 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-md bg-terracotta-soft text-terracotta shrink-0 mt-1">
          <Layers className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div>
          <span className="text-xs font-sans font-semibold text-terracotta bg-terracotta-soft px-2.5 py-1 rounded-full">
            Beta
          </span>
          <h1 className="font-display text-display-lg text-ink mt-2">Worksheet Generator</h1>
          <p className="font-sans text-base text-ink-soft mt-2 max-w-xl leading-relaxed">
            Describe a skill, pick a format and a tone &mdash; Claude builds a
            ready-to-print worksheet in seconds. No searching, no reformatting, no clip art.
          </p>
        </div>
      </div>

      {/* ── Tone concept ── */}
      <section>
        <h2 className="font-display text-display-md text-ink rule-ornament mb-6">
          Every worksheet has a tone
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TONES.map(({ value, label, description }) => (
            <div
              key={value}
              className="rounded-md border border-rule bg-paper shadow-card p-5 theme-aware"
            >
              <p className="font-sans text-sm font-semibold text-ink">{label}</p>
              <p className="font-sans text-sm text-ink-soft mt-1.5 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Generator form ── */}
      <section>
        <h2 className="font-display text-display-md text-ink rule-ornament mb-6">
          Build your worksheet
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Subject + grade band */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-sm font-semibold text-ink">
                Subject
              </label>
              <Input
                placeholder="e.g. Math, ELA, Science"
                value={req.subject}
                onChange={e => set('subject', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-sans text-sm font-semibold text-ink">
                Grade band
              </label>
              <Select
                value={req.grade_band}
                onChange={e => set('grade_band', e.target.value as GradeBand)}
              >
                {GRADE_BANDS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Skill / topic */}
          <div className="space-y-1.5">
            <label className="font-sans text-sm font-semibold text-ink">
              Skill or topic
            </label>
            <Input
              placeholder="e.g. two-digit multiplication, main idea vs. supporting detail"
              value={req.skill}
              onChange={e => set('skill', e.target.value)}
            />
          </div>

          {/* Category grid */}
          <div className="space-y-2">
            <label className="font-sans text-sm font-semibold text-ink">
              Worksheet type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map(({ value, label, detail }) => {
                const selected = req.category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('category', value)}
                    className={cn(
                      'text-left rounded-md border p-3.5 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2',
                      selected
                        ? 'border-terracotta bg-terracotta-soft shadow-sm'
                        : 'border-rule bg-paper hover:border-terracotta/50 hover:bg-terracotta-soft/40 shadow-card',
                    )}
                  >
                    <p className={cn(
                      'font-sans text-sm font-semibold leading-tight',
                      selected ? 'text-terracotta' : 'text-ink',
                    )}>
                      {label}
                    </p>
                    <p className="font-sans text-xs text-ink-faint mt-1 leading-snug">
                      {detail}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone toggle */}
          <div className="space-y-2">
            <label className="font-sans text-sm font-semibold text-ink">
              Tone
            </label>
            <div className="flex flex-wrap gap-2">
              {TONES.map(({ value, label }) => {
                const selected = req.tone === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('tone', value)}
                    className={cn(
                      'px-4 py-2 rounded-md border text-sm font-sans font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2',
                      selected
                        ? 'bg-terracotta border-terracotta text-paper'
                        : 'bg-paper border-rule text-ink-soft hover:border-terracotta hover:text-terracotta',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Theme field — only shown for engaging tone */}
            {req.tone === 'engaging' && (
              <div className="mt-3 space-y-1.5">
                <label className="font-sans text-sm font-semibold text-ink">
                  Theme <span className="font-normal text-ink-faint">(optional)</span>
                </label>
                <Input
                  placeholder="e.g. space exploration, medieval knights, the ocean"
                  value={req.theme ?? ''}
                  onChange={e => set('theme', e.target.value || null)}
                />
              </div>
            )}
          </div>

          {/* Item count + answer key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-sm font-semibold text-ink">
                Number of items
                <span className="font-normal text-ink-faint ml-1">(5 – 30)</span>
              </label>
              <Input
                type="number"
                min={5}
                max={30}
                value={req.item_count}
                onChange={e => set('item_count', Math.min(30, Math.max(5, Number(e.target.value))))}
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={req.include_answer_key}
                  onChange={e => set('include_answer_key', e.target.checked)}
                  className="w-4 h-4 rounded border-rule accent-terracotta cursor-pointer"
                />
                <span className="font-sans text-sm font-semibold text-ink">
                  Include answer key
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={!formValid}
            >
              Generate worksheet
            </Button>
            {!formValid && (
              <p className="font-sans text-xs text-ink-faint mt-2">
                Fill in subject and skill to continue.
              </p>
            )}
          </div>

          {/* Confirmation — shown after submit */}
          {submitted && (
            <Card className="border-sage/40 bg-sage/5 p-5">
              <CardHeader className="mb-0">
                <CardTitle className="text-base text-ink">Request logged</CardTitle>
                <CardDescription>
                  Generation isn&rsquo;t wired up yet &mdash; check the browser console to see the{' '}
                  <code className="font-mono text-xs bg-rule/60 px-1 py-0.5 rounded">
                    WorksheetRequest
                  </code>{' '}
                  that would be sent to the Edge Function.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="mt-3 font-mono text-xs text-ink-soft bg-rule/40 rounded p-3 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(req, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

        </form>
      </section>
    </div>
  );
}
