import { LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function SeatingChartPage() {
  return (
    <div className="space-y-10 max-w-2xl">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-md bg-terracotta-soft text-terracotta shrink-0">
          <LayoutGrid className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div>
          <span className="text-xs font-sans font-semibold text-ink-faint bg-rule/60 px-2.5 py-1 rounded-full">
            Coming soon
          </span>
          <h1 className="font-display text-display-lg text-ink mt-1">Seating Chart Maker</h1>
        </div>
      </div>

      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">
          What it does
        </h2>
        <p className="font-sans text-base text-ink-soft mt-4 leading-relaxed">
          Build and save seating arrangements for each of your classes. Drag students into seats,
          mark accommodations, and set constraints &mdash; the tool flags conflicts so nothing slips
          through the cracks.
        </p>
        <ul className="mt-6 space-y-3 font-sans text-sm text-ink-soft">
          {[
            'Save multiple classes and switch between them instantly',
            'Mark IEP, 504, and seating-preference notes per student',
            'Set "cannot sit near" constraints and see conflicts highlighted',
            'Print a clean chart to leave for a substitute',
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
          Classroom teachers, especially those with complex accommodation needs or who rearrange
          seats frequently. The class roster you build here is also shared with the Group Mate Maker.
        </p>
      </Card>

      <div>
        <div className="relative group inline-block">
          <Button disabled size="lg">
            Create a seating chart
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
