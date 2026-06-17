import { useState } from 'react';
import { Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { generateWorksheet } from '@/lib/worksheetClient';
import type {
  WorksheetRequest,
  WorksheetResponse,
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
  { value: 'math-facts',            label: 'Math Facts Drill',      detail: 'Arithmetic & times-table grids' },
  { value: 'word-problems',         label: 'Word Problems',         detail: 'Math in context, multi-step reasoning' },
  { value: 'reading-comprehension', label: 'Reading Comprehension', detail: 'Passage + questions' },
  { value: 'vocabulary-matching',   label: 'Vocabulary Matching',   detail: 'Word bank ↔ definitions or context sentences' },
  { value: 'fill-in-the-blank',     label: 'Fill in the Blank',     detail: 'Cloze passages for any subject' },
  { value: 'graphic-organizer',     label: 'Graphic Organizer',     detail: 'Venn, T-chart, story map, concept web' },
  { value: 'short-answer',          label: 'Short Answer',          detail: 'Open response / exit ticket questions' },
  { value: 'multiple-choice',       label: 'Multiple Choice',       detail: 'Test-style, four options per item' },
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

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

// ── Worksheet display ─────────────────────────────────────────────────────────

function WorksheetDisplay({
  result,
  onReset,
}: {
  result: WorksheetResponse;
  onReset: () => void;
}) {
  const [showAnswers, setShowAnswers] = useState(false);
  const hasAnswers = result.items.some(i => i.answer !== null);
  const isMultipleChoice = result.request_echo.category === 'multiple-choice';
  const isReadingComp = result.request_echo.category === 'reading-comprehension';
  const isShortAnswer = result.request_echo.category === 'short-answer';

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-display-md text-ink rule-ornament">
          Your worksheet
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            Start over
          </Button>
        </div>
      </div>

      <div className="worksheet-print-target bg-paper border border-rule rounded-lg shadow-card p-8 space-y-6">

        {/* Title + name / date */}
        <div className="text-center border-b border-rule pb-5">
          <h3 className="font-display text-2xl text-ink">{result.title}</h3>
          <div className="flex justify-between mt-5 font-sans text-sm text-ink-soft">
            <span className="flex items-end gap-1.5">
              Name:
              <span className="inline-block w-48 border-b border-ink/40">&nbsp;</span>
            </span>
            <span className="flex items-end gap-1.5">
              Date:
              <span className="inline-block w-28 border-b border-ink/40">&nbsp;</span>
            </span>
          </div>
        </div>

        {/* Instructions / passage */}
        {result.instructions && (
          <div
            className={cn(
              'font-sans text-sm text-ink leading-relaxed',
              isReadingComp && 'bg-rule/30 rounded-md p-4 border border-rule/60',
            )}
          >
            {isReadingComp && (
              <p className="font-semibold text-ink mb-3">
                Read the passage, then answer the questions below.
              </p>
            )}
            <p className="whitespace-pre-wrap">{result.instructions}</p>
          </div>
        )}

        {/* Items */}
        <ol className="space-y-6">
          {result.items.map((item, i) => (
            <li key={i} className="font-sans text-sm text-ink">
              <div className="flex gap-3">
                <span className="font-semibold shrink-0 w-5 text-right pt-px">{i + 1}.</span>
                <div className="flex-1 space-y-2">
                  <p className="leading-relaxed whitespace-pre-wrap">{item.prompt}</p>

                  {isMultipleChoice && item.options && (
                    <ul className="space-y-2 mt-2">
                      {item.options.slice(0, 4).map((opt, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="font-semibold shrink-0 w-4">{OPTION_LABELS[j]}.</span>
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {!isMultipleChoice && (
                    <div className="mt-2 space-y-2.5 pt-1">
                      <div className="border-b border-ink-faint/40" />
                      {(isShortAnswer || isReadingComp) && (
                        <>
                          <div className="border-b border-ink-faint/40" />
                          <div className="border-b border-ink-faint/40" />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Answer key */}
        {hasAnswers && (
          <div className="border-t border-rule pt-5">
            <button
              type="button"
              onClick={() => setShowAnswers(s => !s)}
              className="font-sans text-sm font-semibold text-terracotta hover:text-terracotta/80 transition-colors flex items-center gap-1.5"
            >
              Answer Key
              <span className="text-xs">{showAnswers ? '▲' : '▼'}</span>
            </button>

            {showAnswers && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
                {result.items.map((item, i) =>
                  item.answer ? (
                    <div key={i} className="font-sans text-sm text-ink flex gap-2">
                      <span className="font-semibold shrink-0 w-5">{i + 1}.</span>
                      <span className="text-ink-soft">{item.answer}</span>
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WorksheetsPage() {
  const [req, setReq] = useState<WorksheetRequest>(defaultRequest);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<WorksheetResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  function set<K extends keyof WorksheetRequest>(key: K, value: WorksheetRequest[K]) {
    setReq(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    try {
      const worksheet = await generateWorksheet(req);
      setResult(worksheet);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStatus('error');
    }
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

        {/* Error banner */}
        {status === 'error' && (
          <Card className="border-terracotta/40 bg-terracotta-soft/30 p-5 mb-8">
            <CardHeader className="mb-0">
              <CardTitle className="text-base text-ink">Generation failed</CardTitle>
              <CardDescription className="text-ink-soft">{errorMsg}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Subject + grade band */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans text-sm font-semibold text-ink">Subject</label>
              <Input
                placeholder="e.g. Math, ELA, Science"
                value={req.subject}
                onChange={e => set('subject', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-sans text-sm font-semibold text-ink">Grade band</label>
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
            <label className="font-sans text-sm font-semibold text-ink">Skill or topic</label>
            <Input
              placeholder="e.g. two-digit multiplication, main idea vs. supporting detail"
              value={req.skill}
              onChange={e => set('skill', e.target.value)}
            />
          </div>

          {/* Category grid */}
          <div className="space-y-2">
            <label className="font-sans text-sm font-semibold text-ink">Worksheet type</label>
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
                    <p className="font-sans text-xs text-ink-faint mt-1 leading-snug">{detail}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone toggle */}
          <div className="space-y-2">
            <label className="font-sans text-sm font-semibold text-ink">Tone</label>
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
                onChange={e =>
                  set('item_count', Math.min(30, Math.max(5, Number(e.target.value))))
                }
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
                <span className="font-sans text-sm font-semibold text-ink">Include answer key</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button type="submit" size="lg" disabled={!formValid || status === 'loading'}>
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                status === 'success' ? 'Regenerate worksheet' : 'Generate worksheet'
              )}
            </Button>
            {!formValid && status !== 'loading' && (
              <p className="font-sans text-xs text-ink-faint mt-2">
                Fill in subject and skill to continue.
              </p>
            )}
          </div>

        </form>
      </section>

      {/* ── Result ── */}
      {status === 'success' && result && (
        <WorksheetDisplay
          result={result}
          onReset={() => {
            setStatus('idle');
            setResult(null);
          }}
        />
      )}

    </div>
  );
}
