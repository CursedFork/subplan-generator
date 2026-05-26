import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTemplates, getSectionTitles } from '@/hooks/useTemplates';

const ICONS: Record<string, string> = {
  'standard-day':       '📋',
  'single-period':      '⏱️',
  'emergency':          '⚡',
  'half-day':           '🌤️',
  'primary-classroom':  '🌟',
  'reading-workshop':   '📚',
  'specialist-rotation':'🎨',
};

export default function Templates() {
  const { data: templates, isLoading, isError } = useTemplates();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-sans text-ink-faint">Loading templates…</p>
      </div>
    );
  }

  if (isError || !templates) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm font-sans text-terracotta">
          Couldn&rsquo;t load templates. Please refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="font-display text-display-lg text-ink">Templates</h1>
        <p className="font-sans text-sm text-ink-soft mt-1">
          Choose a structure for your day. The assistant will use it as a guide when building your
          plan — you can always adjust details in the conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map(t => {
          const sections = getSectionTitles(t.schema);
          const icon = ICONS[t.id] ?? '📄';

          return (
            <Card key={t.id} className="flex flex-col gap-4">
              {/* Title row */}
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5" aria-hidden="true">
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-display-md text-ink">{t.name}</h2>
                    {t.is_default && (
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-terracotta border border-terracotta/40 rounded px-1.5 py-0.5 shrink-0">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-sm text-ink-soft mt-1 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>

              {/* Section tags */}
              {sections.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sections.map(sec => (
                    <span
                      key={sec}
                      className="inline-block text-xs font-sans text-ink-faint bg-terracotta-soft rounded px-2 py-0.5"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-auto pt-2">
                <Button asChild size="sm">
                  <Link to={`/new-plan?template=${t.id}`}>Use this template</Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs font-sans text-ink-faint pb-12">
        More templates will be added over time. The generated plan can be saved as a PDF
        directly from your browser once complete.
      </p>
    </div>
  );
}
