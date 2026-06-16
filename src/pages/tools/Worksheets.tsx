import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function WorksheetsPage() {
  return (
    <div className="space-y-10 max-w-2xl">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-md bg-terracotta-soft text-terracotta shrink-0">
          <Layers className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <div>
          <span className="text-xs font-sans font-semibold text-ink-faint bg-rule/60 px-2.5 py-1 rounded-full">
            Coming soon
          </span>
          <h1 className="font-display text-display-lg text-ink mt-1">Worksheet Generator</h1>
        </div>
      </div>

      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">
          What it does
        </h2>
        <p className="font-sans text-base text-ink-soft mt-4 leading-relaxed">
          Describe a topic, pick a grade level, and tell the tool what skill you want to practice
          &mdash; the generator builds a complete, ready-to-print worksheet in seconds. You can
          request multiple difficulty levels at once to differentiate for your classroom.
        </p>
        <ul className="mt-6 space-y-3 font-sans text-sm text-ink-soft">
          {[
            'Specify any topic, standard code, or learning objective',
            'Choose grade level and number of questions',
            'Get a printable PDF or editable version',
            'Differentiated versions (on-level, scaffolded, extension) in one click',
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
          Any teacher who needs practice materials fast &mdash; especially useful before a sub day,
          for stations or centers, or when a lesson plan needs a quick exit ticket.
        </p>
      </Card>

      <div>
        <div className="relative group inline-block">
          <Button disabled size="lg">
            Generate a worksheet
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
