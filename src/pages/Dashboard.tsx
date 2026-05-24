import { useProfile } from '@/hooks/useProfile';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const { data: profile } = useProfile();

  const firstName = profile?.display_name?.split(' ').at(0) ?? 'friend';

  return (
    <div className="space-y-12">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-display-lg text-ink">Welcome back, {firstName}.</h1>
      </div>

      {/* New plan card */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">
          Let&rsquo;s plan your day.
        </h2>
        <p className="font-sans text-base text-ink-soft mt-4 mb-8 max-w-md">
          Start a new plan with our agent, or upload an existing one to reformat it.
        </p>

        <div className="flex flex-wrap gap-4">
          {/* Tooltip wrapper — Radix Tooltip is not in this increment's package list */}
          <div className="relative group inline-block">
            <Button disabled>New plan with the agent</Button>
            <div className="absolute left-1/2 -translate-x-1/2 -top-9 bg-ink text-paper text-xs px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Coming soon
            </div>
          </div>

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

      {/* Recent plans */}
      <div>
        <h2 className="font-display text-display-md text-ink mb-1 rule-ornament">
          Recent plans
        </h2>

        <div className="mt-10 py-12 border border-dashed border-rule rounded-md flex flex-col items-center justify-center text-center">
          <p className="font-sans text-base text-ink-faint max-w-xs">
            No plans yet. Your finalized plans will live here.
          </p>
        </div>
      </div>
    </div>
  );
}
