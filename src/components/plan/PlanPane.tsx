import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { printPlan } from '@/lib/printPlan';
import type { AgentState, AdminContact } from '@/types/app';

const TEMPLATE_LABELS: Record<string, string> = {
  'standard-day':        'Standard Day',
  'single-period':       'Single Period',
  'emergency':           'Emergency / Last-Minute',
  'half-day':            'Half Day',
  'primary-classroom':   'Primary Classroom',
  'reading-workshop':    'Reading Workshop',
  'specialist-rotation': 'Specialist Rotation',
};

interface Props {
  state: AgentState | null;
  teacherName?: string | null;
}

export function PlanPane({ state, teacherName }: Props) {
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
      <div className="w-1/2 flex flex-col items-center justify-center bg-paper/50 px-8 gap-5 text-center">
        <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <div>
          <h2 className="font-display text-display-md text-ink">Plan saved!</h2>
          <p className="font-sans text-sm text-ink-soft max-w-xs mt-2 leading-relaxed">
            Your sub plan has been saved to <strong className="text-ink font-semibold">My Plans</strong>.
            Print it or export it as a PDF to hand off to your sub.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-[240px]">
          <Button
            onClick={() => { printPlan(state, teacherName ?? null); }}
            className="w-full"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Save as PDF
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/plans">View my plans</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full text-ink-faint">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>

        <p className="text-xs font-sans text-ink-faint max-w-[220px] leading-relaxed">
          In the print dialog, choose <em>Save as PDF</em> as the destination to get a file.
        </p>
      </div>
    );
  }

  const templateLabel = TEMPLATE_LABELS[state.template_id] ?? state.template_id;
  const hasAnyContent = state.school_name || state.grade || state.subject ||
    state.principal || state.emergency_procedures || state.activities.length > 0;

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

      {!hasAnyContent && (
        <p className="text-sm font-sans text-ink-faint mt-8">
          Answer the assistant&rsquo;s questions and your plan will fill in here.
        </p>
      )}

      <div className="mt-8 space-y-6">

        {/* School info */}
        {(state.school_name || state.date || state.school_year) && (
          <Section label="School">
            <PlanRow label="School" value={state.school_name} />
            <PlanRow label="Date" value={state.date} />
            <PlanRow label="Year" value={state.school_year} />
          </Section>
        )}

        {/* Teacher info */}
        {(state.grade || state.subject || state.grades_covered.length > 0) && (
          <Section label="Teacher">
            <PlanRow label="Grade" value={state.grade} />
            {state.grades_covered.length > 0 && (
              <PlanRow label="Grades" value={state.grades_covered.join(', ')} />
            )}
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
          </Section>
        )}

        {/* Admin contacts */}
        {(state.principal || state.assistant_principal || state.school_counselor || state.school_psychologist) && (
          <Section label="Administration">
            <ContactRow label="Principal" contact={state.principal} />
            <ContactRow label="Asst. Principal" contact={state.assistant_principal} />
            <ContactRow label="Counselor" contact={state.school_counselor} />
            <ContactRow label="Psychologist" contact={state.school_psychologist} />
          </Section>
        )}

        {/* Helpful staff */}
        {state.helpful_staff.length > 0 && (
          <Section label="Helpful Staff">
            <div className="space-y-1">
              {state.helpful_staff.map((s, i) => (
                <div key={i} className="text-sm font-sans text-ink">
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-ink-soft"> — {s.role}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Logistics */}
        {(state.emergency_procedures || state.health_concerns || state.bathroom_rules ||
          state.behavior_management || state.nurses_office || state.special_instructions) && (
          <Section label="Logistics">
            <LogisticsRow label="Emergency" value={state.emergency_procedures} />
            <LogisticsRow label="Health" value={state.health_concerns} />
            <LogisticsRow label="Bathroom" value={state.bathroom_rules} />
            <LogisticsRow label="Behavior" value={state.behavior_management} />
            <LogisticsRow label="Nurse's Office" value={state.nurses_office} />
            <LogisticsRow label="Special Notes" value={state.special_instructions} />
          </Section>
        )}

        {/* Activities / Schedule */}
        {state.activities.length > 0 && (
          <Section label={`Schedule (${state.activities.length} block${state.activities.length !== 1 ? 's' : ''})`}>
            <div className="space-y-3">
              {state.activities.map((a, i) => (
                <div key={i} className="border border-rule rounded-md p-3 bg-paper shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-sans font-semibold text-ink">{a.title}</p>
                    {(a.start_time || a.end_time) ? (
                      <span className="text-xs font-sans text-ink-faint shrink-0">
                        {a.start_time}{a.start_time && a.end_time ? ' – ' : ''}{a.end_time}
                      </span>
                    ) : (
                      <span className="text-xs font-sans text-ink-faint shrink-0">{a.duration_min} min</span>
                    )}
                  </div>
                  {a.grade_label && (
                    <p className="text-xs font-sans text-terracotta mt-0.5">{a.grade_label}</p>
                  )}
                  {a.period_key && (
                    <p className="text-xs font-sans text-ink-faint mt-0.5">Period: {a.period_key}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Sign-off */}
        {state.sign_off && (
          <Section label="Sign-off">
            <p className="text-sm font-sans text-ink italic">{state.sign_off}</p>
          </Section>
        )}

      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint mb-3">
        {label}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint w-20 shrink-0">
        {label}
      </span>
      <span className="text-sm font-sans text-ink">{value}</span>
    </div>
  );
}

function ContactRow({ label, contact }: { label: string; contact: AdminContact | null | undefined }) {
  if (!contact) return null;
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint w-24 shrink-0">
        {label}
      </span>
      <span className="text-sm font-sans text-ink">
        {contact.name}
        {contact.extension && (
          <span className="text-ink-faint ml-1">ext. {contact.extension}</span>
        )}
      </span>
    </div>
  );
}

function LogisticsRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint">{label}</p>
      <p className="text-sm font-sans text-ink leading-relaxed">{value}</p>
    </div>
  );
}
