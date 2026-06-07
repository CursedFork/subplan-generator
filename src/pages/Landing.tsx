import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/components/logo/Logo';
import { Button } from '@/components/ui/Button';

function IconKind() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="hsl(14,65%,52%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPrint() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" stroke="hsl(14,65%,52%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="hsl(14,65%,52%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="6" y="14" width="12" height="8" stroke="hsl(14,65%,52%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconStandards() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="hsl(14,65%,52%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="22 4 12 14.01 9 11.01" stroke="hsl(14,65%,52%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconTemplate() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="hsl(14,65%,52%)" strokeWidth="1.5"/>
      <path d="M3 9h18" stroke="hsl(14,65%,52%)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 21V9" stroke="hsl(14,65%,52%)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const VALUE_PROPS = [
  { icon: <IconKind />, title: 'Kind, sub-ready writing', body: 'Warm, clear language your sub can follow — even at 7 AM.' },
  { icon: <IconPrint />, title: 'Print-perfect PDF + DOCX', body: 'Export a polished document ready to leave on your desk.' },
  { icon: <IconStandards />, title: 'Standards-aligned when you want it', body: 'Optionally tie activities to grade-level standards — or skip it.' },
  { icon: <IconTemplate />, title: 'Templates for any day', body: 'Standard day, half day, single period, emergency — all covered.' },
];

interface PricingCardProps {
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  annualMonthly: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
  annual: boolean;
}

function PricingCard({
  name, monthlyPrice, annualPrice, annualMonthly, features, cta, ctaHref, popular, annual,
}: PricingCardProps) {
  return (
    <div className={[
      'rounded-lg border bg-paper p-8 flex flex-col shadow-card theme-aware',
      popular ? 'border-terracotta/40 bg-terracotta-soft/30' : 'border-rule',
    ].join(' ')}>
      {popular && (
        <span className="inline-block self-start text-xs font-sans font-semibold uppercase tracking-widest text-terracotta mb-3">
          Most popular
        </span>
      )}
      <h3 className="font-display text-display-md text-ink leading-tight">{name}</h3>
      <div className="mt-3 mb-1 flex items-end gap-1">
        <span className="font-display text-4xl text-ink" style={{ fontVariationSettings: "'opsz' 96" }}>
          {annual ? annualMonthly : monthlyPrice}
        </span>
        <span className="font-sans text-sm text-ink-soft pb-1">/mo</span>
      </div>
      {annual ? (
        <p className="font-sans text-xs text-ink-faint mb-5">Billed annually ({annualPrice}/yr)</p>
      ) : (
        <div className="mb-5" />
      )}
      <ul className="space-y-2.5 flex-1 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 font-sans text-sm text-ink-soft">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5 text-terracotta" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Button asChild variant={popular ? 'primary' : 'outline'} className="w-full">
        <Link to={ctaHref}>{cta}</Link>
      </Button>
    </div>
  );
}

export default function Landing() {
  const { user, loading } = useAuth();
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-paper theme-aware">

      {/* Header */}
      <header className="border-b border-rule bg-paper theme-aware sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link to="/" aria-label="Teacher's Pet home"><Logo /></Link>
          <nav className="flex items-center gap-2">
            <a href="#pricing" className="font-sans text-sm text-ink-soft hover:text-ink transition-colors px-3 py-1.5 rounded hover:bg-rule/30">
              Pricing
            </a>
            {!loading && (
              user ? (
                <Button asChild variant="primary" size="sm">
                  <Link to="/dashboard">Open dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/signin">Sign in</Link>
                  </Button>
                  <Button asChild variant="primary" size="sm">
                    <Link to="/signup">Sign up</Link>
                  </Button>
                </>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <h1 className="font-display text-display-xl text-ink mx-auto max-w-2xl rule-ornament">
          Sub plans that actually sound like you wrote them.
        </h1>
        <p className="mt-10 font-sans text-lg text-ink-soft leading-relaxed max-w-xl mx-auto">
          Answer a few questions about your class, chat with our planning assistant, and walk away
          with a clear, kind sub plan your substitute will actually thank you for.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg"><Link to="/signup">Try it free</Link></Button>
          <Button asChild variant="outline" size="lg"><a href="#how-it-works">See how it works</a></Button>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-rule py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-display-lg text-ink text-center mb-14">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { n: '1', title: 'Tell us about your class', body: 'Your grade, schedule, classroom rules, and who to call — once, saved forever.' },
              { n: '2', title: 'Chat with our planning assistant', body: 'A short back-and-forth fills in the lesson details, activities, and any special instructions.' },
              { n: '3', title: 'Download a ready-to-print PDF', body: 'One click. A formatted, readable sub plan lands in your downloads.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex flex-col items-start gap-4">
                <span
                  className="w-10 h-10 rounded-full bg-terracotta-soft flex items-center justify-center font-display text-terracotta shrink-0"
                  style={{ fontVariationSettings: "'opsz' 96", fontWeight: 600 }}
                  aria-hidden="true"
                >{n}</span>
                <div>
                  <h3 className="font-display text-xl text-ink mb-1">{title}</h3>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="border-t border-rule py-20 bg-terracotta-soft/20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-display-lg text-ink text-center mb-14">What you get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {VALUE_PROPS.map(({ icon, title, body }) => (
              <div key={title} className="flex items-start gap-4">
                <span className="shrink-0 mt-0.5">{icon}</span>
                <div>
                  <h3 className="font-sans text-base font-semibold text-ink mb-1">{title}</h3>
                  <p className="font-sans text-sm text-ink-soft leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-rule py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-display-lg text-ink text-center mb-4">Pricing</h2>
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={'font-sans text-sm ' + (!annual ? 'text-ink' : 'text-ink-faint')}>Monthly</span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual((a) => !a)}
              className={'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ' + (annual ? 'bg-terracotta' : 'bg-rule')}
            >
              <span className={'inline-block h-4 w-4 rounded-full bg-paper shadow transition-transform duration-200 ' + (annual ? 'translate-x-6' : 'translate-x-1')} />
              <span className="sr-only">Toggle billing period</span>
            </button>
            <span className={'font-sans text-sm ' + (annual ? 'text-ink' : 'text-ink-faint')}>
              Annual
              <span className="ml-1.5 text-xs text-terracotta font-semibold">Save ~30%</span>
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PricingCard
              name="Basic" monthlyPrice="$9" annualPrice="$79" annualMonthly="~$6.58"
              features={['30 plans / month', 'PDF + DOCX export', 'All 5 templates', 'Standards alignment']}
              cta="Start with Basic" ctaHref="/signup?plan=basic" annual={annual}
            />
            <PricingCard
              name="Pro" monthlyPrice="$18" annualPrice="$158" annualMonthly="~$13.17"
              features={['Everything in Basic', '45 plans / month', 'Tone-safety review on every plan', 'Priority support']}
              cta="Start with Pro" ctaHref="/signup?plan=pro" popular annual={annual}
            />
          </div>
          <p className="mt-8 text-center font-sans text-xs text-ink-faint max-w-lg mx-auto leading-relaxed">
            We cap monthly usage to keep the service sustainable and prevent account sharing.
            Annual subscribers get the same caps as monthly.
          </p>
        </div>
      </section>

      {/* Who this is for */}
      <section className="border-t border-rule py-20 bg-terracotta-soft/10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-display-lg text-ink mb-6">Who this is for</h2>
          <p className="font-sans text-lg text-ink-soft leading-relaxed">
            This is for the K&ndash;12 teacher who has written a sub plan at 6&nbsp;AM while sick,
            trying to remember how the reading groups work and whether Marcus needs his EpiPen
            within reach. For the specialist who covers six classes a day and needs a plan that
            actually fits a 45-minute block. For anyone who has ever left a three-page wall of
            text and come back to find the classroom in ruins. Teacher&rsquo;s Pet helps you
            write something clear and kind &mdash; something your sub will actually read.
          </p>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-rule py-20 bg-terracotta-soft/30">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="font-display text-display-lg text-ink mb-6">Ready to stop dreading sub days?</h2>
          <Button asChild size="lg"><Link to="/signup">Create your account</Link></Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rule py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" aria-label="Teacher's Pet home"><Logo /></Link>
          <p className="font-sans text-xs text-ink-faint">&copy; 2026 Teacher&rsquo;s Pet</p>
          <nav className="flex items-center gap-4">
            <Link to="/terms" className="font-sans text-xs text-ink-faint hover:text-ink transition-colors">Terms</Link>
            <Link to="/privacy" className="font-sans text-xs text-ink-faint hover:text-ink transition-colors">Privacy</Link>
            <Link to="/contact" className="font-sans text-xs text-ink-faint hover:text-ink transition-colors">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
