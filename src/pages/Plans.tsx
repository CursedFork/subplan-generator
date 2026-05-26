import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePlans, useDeletePlan, type Plan } from '@/hooks/usePlans';
import { useProfile } from '@/hooks/useProfile';
import { printPlan } from '@/lib/printPlan';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEMPLATE_LABELS: Record<string, string> = {
  'standard-day':        'Standard Day',
  'single-period':       'Single Period',
  'emergency':           'Emergency',
  'half-day':            'Half Day',
  'primary-classroom':   'Primary Classroom',
  'reading-workshop':    'Reading Workshop',
  'specialist-rotation': 'Specialist Rotation',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

function planMeta(plan: Plan): string {
  return [plan.grade, plan.subject].filter(Boolean).join(' · ');
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Decorative icon */}
      <div className="w-16 h-16 rounded-full bg-terracotta-soft flex items-center justify-center mb-6">
        <svg
          width="28" height="28" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="text-terracotta" aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      </div>
      <h2 className="font-display text-display-md text-ink mb-2">No plans yet.</h2>
      <p className="font-sans text-sm text-ink-soft max-w-xs leading-relaxed mb-8">
        When you create a plan with the assistant, it will show up here. Each plan can be
        printed or saved as a PDF any time.
      </p>
      <Button asChild>
        <Link to="/new-plan">Create your first plan</Link>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plan card
// ---------------------------------------------------------------------------

interface PlanCardProps {
  plan: Plan;
  teacherName: string | null;
}

function PlanCard({ plan, teacherName }: PlanCardProps) {
  const deletePlan = useDeletePlan();
  const [confirming, setConfirming] = useState(false);

  const isFinal = plan.status === 'final';
  const templateLabel = TEMPLATE_LABELS[plan.template_id] ?? plan.template_id;
  const dateLabel = isFinal && plan.finalized_at
    ? `Finalized ${formatDate(plan.finalized_at)}`
    : `Created ${formatDate(plan.created_at)}`;
  const meta = planMeta(plan);

  function handleDelete() {
    deletePlan.mutate(plan.id, {
      onError: () => setConfirming(false),
    });
  }

  return (
    <Card className="flex items-start gap-4">
      {/* Status dot */}
      <div className="shrink-0 mt-1">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full mt-1 ${
            isFinal ? 'bg-sage' : 'bg-ink-faint'
          }`}
          title={isFinal ? 'Finalized' : 'Draft'}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="font-display text-display-md text-ink leading-snug truncate">
            {plan.title}
          </h2>
          <span
            className={`text-[10px] font-sans font-semibold uppercase tracking-widest rounded px-1.5 py-0.5 shrink-0 ${
              isFinal
                ? 'text-sage border border-sage/40'
                : 'text-ink-faint border border-rule'
            }`}
          >
            {isFinal ? 'Final' : 'Draft'}
          </span>
        </div>

        {meta && (
          <p className="font-sans text-sm text-ink-soft mt-0.5">{meta}</p>
        )}

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="inline-block text-xs font-sans text-ink-faint bg-terracotta-soft rounded px-2 py-0.5">
            {templateLabel}
          </span>
          <span className="text-xs font-sans text-ink-faint">{dateLabel}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-2">
        {isFinal && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => { printPlan(plan.content, teacherName); }}
          >
            Print / PDF
          </Button>
        )}

        {/* Delete with inline confirmation */}
        {confirming ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-sans text-ink-soft">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={deletePlan.isPending}
              className="text-xs font-sans text-terracotta hover:underline underline-offset-2 disabled:opacity-50"
            >
              {deletePlan.isPending ? 'Deleting…' : 'Yes'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs font-sans text-ink-faint hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs font-sans text-ink-faint hover:text-ink transition-colors p-1"
            aria-label="Delete plan"
          >
            <svg
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Plans() {
  const { data: plans, isLoading, isError } = usePlans();
  const { data: profile } = useProfile();
  const teacherName = profile?.display_name ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-sans text-ink-faint">Loading plans…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-sans text-terracotta">
          Couldn&rsquo;t load your plans. Please refresh.
        </p>
      </div>
    );
  }

  const final  = (plans ?? []).filter(p => p.status === 'final');
  const drafts = (plans ?? []).filter(p => p.status === 'draft');

  return (
    <div className="space-y-10 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-lg text-ink">Plans</h1>
          <p className="font-sans text-sm text-ink-soft mt-1">
            All of your substitute teacher plans in one place.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/new-plan">New plan</Link>
        </Button>
      </div>

      {/* Empty state */}
      {!plans?.length && <EmptyState />}

      {/* Finalized plans */}
      {final.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint">
            Finalized ({final.length})
          </h2>
          <div className="space-y-3">
            {final.map(p => (
              <PlanCard key={p.id} plan={p} teacherName={teacherName} />
            ))}
          </div>
        </section>
      )}

      {/* Draft plans */}
      {drafts.length > 0 && (
        <section className="space-y-3 pb-12">
          <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint">
            Drafts ({drafts.length})
          </h2>
          <div className="space-y-3">
            {drafts.map(p => (
              <PlanCard key={p.id} plan={p} teacherName={teacherName} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
