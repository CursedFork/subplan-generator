import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import type { AgentState } from '@/types/app';

const TEMPLATE_LABELS: Record<string, string> = {
  'standard-day': 'Standard Day',
  'single-period': 'Single Period',
  'emergency': 'Emergency / Last-Minute',
  'half-day': 'Half Day',
};

interface Props {
  state: AgentState | null;
}

export function PlanPane({ state }: Props) {
  if (!state) {
    return (
      <div className="w-1/2 flex items-center justify-center bg-paper/50 px-8">
        <p className="text-sm font-sans text-ink-faint text-center max-w-xs">
          Your plan will take shape here as you chat with the assistant.
        </p>
      </div>
    );
  }

  if (state.finalized && state.sub_plan_id) {
    return (
      <div className="w-1/2 flex flex-col items-center justify-center bg-paper/50 px-8 gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-sage/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-display text-display-md text-ink">Plan saved.</h2>
        <p className="font-sans text-sm text-ink-soft max-w-xs">
          Your sub plan is ready. PDF and DOCX download will be available in a future update.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const templateLabel = TEMPLATE_LABELS[state.template_id] ?? state.template_id;

  return (
    <div className="w-1/2 overflow-y-auto bg-paper/50 px-8 py-8">
      {/* Template badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint">
          Template
        </span>
        <span className="inline-block px-2.5 py-1 rounded-sm bg-terracotta-soft text-terracotta text-xs font-sans font-semibold">
          {templateLabel}
        </span>
      </div>

      <h2 className="font-display text-display-md text-ink mb-1 rule-ornament">
        Plan in progress
      </h2>

      <div className="mt-8 space-y-4">
        <PlanRow label="Grade" value={state.grade} />
        <PlanRow label="Subject" value={state.subject} />
        {state.unit && (
          <PlanRow
            label="Unit"
            value={
              state.unit.standard_codes.length > 0
                ? `${state.unit.unit_name} (${state.unit.standard_codes.join(', ')})`
                : state.unit.unit_name
            }
          />
        )}

        {state.activities.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint mb-3">
              Activities ({state.activities.length})
            </p>
            <div className="space-y-3">
              {state.activities.map((a, i) => (
                <div key={i} className="border border-rule rounded-md p-3 bg-paper shadow-card">
                  <p className="text-sm font-sans font-semibold text-ink">{a.title}</p>
                  <p className="text-xs font-sans text-ink-soft mt-0.5">{a.duration_min} min</p>
                  {a.period_key && (
                    <p className="text-xs font-sans text-ink-faint mt-1">Period: {a.period_key}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {state.activities.length === 0 && !state.grade && !state.subject && (
          <p className="text-sm font-sans text-ink-faint pt-2">
            Answer the assistant&rsquo;s questions and your plan will fill in here.
          </p>
        )}
      </div>
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint w-20 shrink-0">
        {label}
      </span>
      {value ? (
        <span className="text-sm font-sans text-ink">{value}</span>
      ) : (
        <span className="text-sm font-sans text-ink-faint italic">not set yet</span>
      )}
    </div>
  );
}
