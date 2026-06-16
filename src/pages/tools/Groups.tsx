import { Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function GroupsPage() {
  return (
    <div className="space-y-10 max-w-2xl">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-md bg-terracotta-soft text-terracotta shrink-0">
          <Users className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div>
          <span className="text-xs font-sans font-semibold text-ink-faint bg-rule/60 px-2.5 py-1 rounded-full">
            Coming soon
          </span>
          <h1 className="font-display text-display-lg text-ink mt-1">Group Mate Maker</h1>
        </div>
      </div>

      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">
          What it does
        </h2>
        <p className="font-sans text-base text-ink-soft mt-4 leading-relaxed">
          Pick a class, choose how many groups you need, and tell the tool what to balance &mdash;
          reading level, IEP status, leadership, or any attribute you track. It generates
          well-balanced groups in one click, and you can shuffle or lock individuals as needed.
        </p>
        <ul className="mt-6 space-y-3 font-sans text-sm text-ink-soft">
          {[
            'Balance by reading level, IEP, leadership, or custom attributes',
            'Lock specific pairings or separations ("never group together")',
            'Regenerate until the groups look right — no manual counting',
            'Export a printable group list for the class or for a sub',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">
          Who it&rsquo;s for
        </h2>
        <p className="font-sans text-base text-ink-soft mt-4 leading-relaxed">
          Teachers running stations, collaborative projects, literature circles, or any group work.
          Uses the same class roster as the Seating Chart Maker &mdash; add your students once and
          both tools stay in sync.
        </p>
      </Card>

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
