import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { usePlans } from '@/hooks/usePlans';
import { printPlan } from '@/lib/printPlan';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: plans } = usePlans();

  const firstName = profile?.display_name?.split(' ').at(0) ?? 'there';
  const profileIncomplete = profile && !profile.school_info?.school_name;

  const recentFinal = (plans ?? []).filter(p => p.status === 'final').slice(0, 3);
  const teacherName = profile?.display_name ?? null;

  return (
    <div className="space-y-10">

      {/* Welcome */}
      <div>
        <h1 className="font-display text-display-lg text-ink">Welcome back, {firstName}.</h1>
      </div>

      {/* Profile nudge — shown until school_name is set */}
      {profileIncomplete && (
        <div className="rounded-md border border-terracotta/30 bg-terracotta-soft px-5 py-4 flex gap-3 items-start">
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
            className="text-terracotta shrink-0 mt-0.5" aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="font-sans text-sm font-semibold text-ink">Complete your profile first</p>
            <p className="font-sans text-sm text-ink-soft mt-0.5 leading-relaxed">
              Add your school info once and it pre-fills every plan automatically — no re-typing contacts,
              emergency procedures, or classroom rules each time.
            </p>
            <Link
              to="/profile"
              className="inline-block mt-2 text-sm font-sans font-semibold text-terracotta hover:underline underline-offset-2"
            >
              Set up your profile →
            </Link>
          </div>
        </div>
      )}

      {/* New plan card */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">
          Let&rsquo;s plan your day.
        </h2>
        <p className="font-sans text-base text-ink-soft mt-4 mb-8 max-w-md">
          Start a new plan with our agent, or browse templates to see what formats are available.
        </p>

        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link to="/new-plan">New plan with the agent</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/templates">Browse templates</Link>
          </Button>
          <div className="relative group inline-block">
            <Button variant="outline" disabled>
              Reformat an existing plan
            </Button>
            <div className="absolute left-1/2 -translate-x-1/2 -top-9 bg-ink text-paper text-xs px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Coming soon
            </div>
          </div>
        </div>
      </Card>

      {/* Recent finalized plans */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-display-md text-ink rule-ornament">
            Recent plans
          </h2>
          {(plans ?? []).length > 0 && (
            <Link
              to="/plans"
              className="text-sm font-sans text-ink-faint hover:text-terracotta transition-colors"
            >
              View all →
            </Link>
          )}
        </div>

        {recentFinal.length > 0 ? (
          <div className="space-y-3">
            {recentFinal.map(plan => (
              <div
                key={plan.id}
                className="flex items-center gap-4 rounded-md border border-rule bg-paper px-4 py-3 shadow-card theme-aware"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-sage shrink-0" title="Finalized" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-semibold text-ink truncate">{plan.title}</p>
                  <p className="font-sans text-xs text-ink-faint mt-0.5">
                    {[plan.grade, plan.subject].filter(Boolean).join(' · ')}
                    {plan.finalized_at && (
                      <span className="ml-2">{formatDate(plan.finalized_at)}</span>
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { printPlan(plan.content, teacherName); }}
                  className="shrink-0"
                >
                  Print / PDF
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 border border-dashed border-rule rounded-md flex flex-col items-center justify-center text-center">
            <p className="font-sans text-sm text-ink-faint max-w-xs leading-relaxed">
              No finalized plans yet. Create one with the agent and it will appear here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
