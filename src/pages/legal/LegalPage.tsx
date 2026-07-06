import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/logo/Logo';

interface Props {
  title: string;
  effectiveDate?: string;
  children: ReactNode;
}

// Shared shell for Terms / Privacy so the two documents stay visually consistent.
export function LegalPage({ title, effectiveDate, children }: Props) {
  return (
    <div className="min-h-screen bg-paper theme-aware">
      <header className="border-b border-rule">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Teacher's Pet — home">
            <Logo />
          </Link>
          <Link to="/" className="font-sans text-sm text-ink-soft hover:text-ink transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="font-display text-display-lg text-ink rule-ornament">{title}</h1>
        {effectiveDate ? (
          <p className="font-sans text-sm text-ink-faint mt-4 mb-10">
            Effective date: {effectiveDate}
          </p>
        ) : (
          <div className="mb-10" />
        )}
        <div className="legal-body space-y-8 font-sans text-base text-ink-soft leading-relaxed [&_h2]:font-display [&_h2]:text-display-md [&_h2]:text-ink [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_strong]:text-ink">
          {children}
        </div>

        <div className="mt-14 pt-8 border-t border-rule">
          <p className="font-sans text-sm text-ink-faint">
            Questions? Email{' '}
            <a href="mailto:support@teacherspet.app" className="text-terracotta hover:underline">
              support@teacherspet.app
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
