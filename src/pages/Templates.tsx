import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTemplates, getSectionTitles } from '@/hooks/useTemplates';
import { buildPlanHtml } from '@/lib/printPlan';
import { getMockState } from '@/lib/mockPlanState';

const ICONS: Record<string, string> = {
  'standard-day':        '📋',
  'single-period':       '⏱️',
  'emergency':           '⚡',
  'half-day':            '🌤️',
  'primary-classroom':   '🌟',
  'reading-workshop':    '📚',
  'specialist-rotation': '🎨',
};

// ---------------------------------------------------------------------------
// Preview modal
// ---------------------------------------------------------------------------

interface PreviewModalProps {
  templateId: string;
  templateName: string;
  onClose: () => void;
}

function PreviewModal({ templateId, templateName, onClose }: PreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const html = buildPlanHtml(getMockState(templateId), 'Jane Smith');

  // Write HTML into the iframe after it mounts
  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    frame.contentDocument?.open();
    frame.contentDocument?.write(html);
    frame.contentDocument?.close();
  }, [html]);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal shell */}
      <div className="flex flex-col flex-1 m-4 md:m-8 bg-white rounded-lg shadow-2xl overflow-hidden">

        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-rule bg-paper shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display text-display-md text-ink">{templateName}</span>
            <span className="text-xs font-sans text-ink-faint bg-terracotta-soft rounded px-2 py-0.5">
              Sample preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const w = window.open('', '_blank', 'width=960,height=720');
                if (!w) return;
                w.document.write(html);
                w.document.close();
                w.focus();
                setTimeout(() => w.print(), 350);
              }}
            >
              Print sample
            </Button>
            <button
              onClick={onClose}
              aria-label="Close preview"
              className="p-1.5 rounded hover:bg-terracotta-soft transition-colors text-ink-faint hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* iframe — renders the plan HTML at document scale */}
        <iframe
          ref={iframeRef}
          title={`Preview of ${templateName} template`}
          className="flex-1 w-full border-0 bg-white"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Templates() {
  const { data: templates, isLoading, isError } = useTemplates();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewTemplate = templates?.find(t => t.id === previewId) ?? null;

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
    <>
      <div className="space-y-10 max-w-4xl">
        <div>
          <h1 className="font-display text-display-lg text-ink">Templates</h1>
          <p className="font-sans text-sm text-ink-soft mt-1">
            Choose a structure for your day. Preview any template to see a sample plan before you start.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(t => {
            const sections = getSectionTitles(t.schema);
            const icon = ICONS[t.id] ?? '📄';

            return (
              <Card key={t.id} className="flex flex-col gap-4 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
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

                {/* CTAs */}
                <div className="mt-auto pt-2 flex items-center gap-2">
                  <Button asChild size="sm">
                    <Link to={`/new-plan?template=${t.id}`}>Use this template</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewId(t.id)}
                  >
                    Preview
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="text-xs font-sans text-ink-faint pb-12">
          Previews show a sample plan with placeholder information. Your real plan will be built
          with your school info and lesson details through the assistant.
        </p>
      </div>

      {/* Preview modal */}
      {previewTemplate && (
        <PreviewModal
          templateId={previewTemplate.id}
          templateName={previewTemplate.name}
          onClose={() => setPreviewId(null)}
        />
      )}
    </>
  );
}
