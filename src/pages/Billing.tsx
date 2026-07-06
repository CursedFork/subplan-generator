import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, CreditCard, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSubscription } from '@/hooks/useSubscription';
import { startCheckout, openBillingPortal, type BillingTier, type BillingPeriod } from '@/lib/billingClient';

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
};

interface PlanDef {
  tier: BillingTier;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  annualPerMonth: string;
  planCap: number;
  blurb: string;
}

const PLANS: PlanDef[] = [
  {
    tier: 'basic',
    name: 'Basic',
    monthlyPrice: '$9',
    annualPrice: '$79',
    annualPerMonth: '~$6.58/mo',
    planCap: 30,
    blurb: 'For teachers who need solid coverage all year.',
  },
  {
    tier: 'pro',
    name: 'Pro',
    monthlyPrice: '$18',
    annualPrice: '$158',
    annualPerMonth: '~$13.17/mo',
    planCap: 45,
    blurb: 'For specialists, frequent travelers, and heavy users.',
  },
];

export default function Billing() {
  const [searchParams] = useSearchParams();
  const { data: usage, isLoading } = useSubscription();
  const [period, setPeriod] = useState<BillingPeriod>('annual');
  const [busy, setBusy] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = searchParams.get('success') === 'true';
  const showCanceled = searchParams.get('canceled') === 'true';

  async function handleCheckout(tier: BillingTier) {
    setBusy(tier);
    setErrorMsg(null);
    try {
      window.location.href = await startCheckout(tier, period);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not start checkout.');
      setBusy(null);
    }
  }

  async function handlePortal() {
    setBusy('portal');
    setErrorMsg(null);
    try {
      window.location.href = await openBillingPortal();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not open billing portal.');
      setBusy(null);
    }
  }

  const hasStripeAccount = !!usage?.subscription?.stripe_customer_id;
  const onPaidPlan = usage != null && usage.tier !== 'free';
  const pctUsed = usage ? Math.min(100, Math.round((usage.used / usage.cap) * 100)) : 0;

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="font-display text-display-lg text-ink rule-ornament">Billing</h1>
        <p className="font-sans text-base text-ink-soft mt-4">
          Manage your plan, see your usage, and upgrade any time.
        </p>
      </div>

      {showSuccess && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-sage bg-sage/10 theme-aware">
          <CheckCircle2 className="w-5 h-5 text-sage shrink-0 mt-0.5" />
          <div className="font-sans text-sm text-ink">
            <p className="font-semibold">You're subscribed!</p>
            <p className="text-ink-soft mt-0.5">
              It can take a few seconds for your new plan to appear here. Refresh if it
              hasn't updated yet.
            </p>
          </div>
        </div>
      )}
      {showCanceled && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-rule bg-rule/20 theme-aware">
          <XCircle className="w-5 h-5 text-ink-faint shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-ink-soft">
            Checkout was canceled — no charge was made. You can subscribe any time.
          </p>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-terracotta bg-terracotta-soft theme-aware">
          <XCircle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-ink">{errorMsg}</p>
        </div>
      )}

      {/* Current plan */}
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-display-md text-ink mb-1 rule-ornament">
              Current plan
            </h2>
            {isLoading || !usage ? (
              <div className="h-6 w-40 bg-rule/50 rounded animate-pulse mt-4" />
            ) : (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <span className="font-display text-display-md text-ink">
                    {TIER_LABELS[usage.tier]}
                  </span>
                  {onPaidPlan && usage.cancelAtPeriodEnd && (
                    <span className="text-xs font-sans font-semibold text-terracotta bg-terracotta-soft px-2.5 py-1 rounded-full">
                      Cancels at period end
                    </span>
                  )}
                </div>
                {onPaidPlan && usage.periodEnd && (
                  <p className="font-sans text-sm text-ink-soft mt-1">
                    {usage.cancelAtPeriodEnd ? 'Access until' : 'Renews'}{' '}
                    {new Date(usage.periodEnd).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                )}
                {usage.tier === 'free' && (
                  <p className="font-sans text-sm text-ink-soft mt-1">
                    3 finalized plans included — subscribe for a full year of coverage.
                  </p>
                )}
              </div>
            )}
          </div>
          {hasStripeAccount && (
            <Button
              variant="outline"
              onClick={() => { void handlePortal(); }}
              disabled={busy !== null}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {busy === 'portal' ? 'Opening…' : 'Manage billing'}
            </Button>
          )}
        </div>

        {/* Usage bar */}
        {usage && (
          <div className="mt-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-sans text-sm font-semibold text-ink">
                {usage.tier === 'free' ? 'Free plans used' : 'Plans this period'}
              </span>
              <span className="font-sans text-sm text-ink-soft">
                {usage.used} of {usage.cap}
              </span>
            </div>
            <div className="h-2 rounded-full bg-rule/50 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  pctUsed >= 100 ? 'bg-terracotta' : 'bg-sage'
                }`}
                style={{ width: `${pctUsed}%` }}
              />
            </div>
            {pctUsed >= 100 && (
              <p className="font-sans text-xs text-terracotta mt-2">
                {usage.tier === 'free'
                  ? "You've used all your free plans — subscribe below to keep going."
                  : "You've hit this period's limit. Upgrade to Pro or wait for your renewal."}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Plans */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <h2 className="font-display text-display-md text-ink rule-ornament">
            {onPaidPlan ? 'Change plan' : 'Choose a plan'}
          </h2>
          <div className="flex rounded-md border border-rule overflow-hidden">
            {(['annual', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={[
                  'px-4 py-1.5 text-sm font-sans font-medium transition-colors duration-150',
                  period === p ? 'bg-ink text-paper' : 'bg-paper text-ink-soft hover:text-ink',
                ].join(' ')}
              >
                {p === 'annual' ? 'Annual (save ~27%)' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = onPaidPlan && usage?.tier === plan.tier;
            return (
              <Card key={plan.tier} className={isCurrent ? 'border-sage' : ''}>
                <div className="flex items-center gap-2 mb-1">
                  {plan.tier === 'pro' && <Sparkles className="w-4 h-4 text-terracotta" />}
                  <h3 className="font-display text-display-md text-ink">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-xs font-sans font-semibold text-sage bg-sage/10 px-2.5 py-1 rounded-full ml-auto">
                      Current
                    </span>
                  )}
                </div>
                <p className="font-sans text-sm text-ink-soft mb-4">{plan.blurb}</p>
                <div className="mb-1">
                  <span className="font-display text-display-lg text-ink">
                    {period === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="font-sans text-sm text-ink-soft ml-1">
                    /{period === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
                {period === 'annual' && (
                  <p className="font-sans text-xs text-ink-faint mb-4">{plan.annualPerMonth}</p>
                )}
                <ul className="space-y-2 font-sans text-sm text-ink-soft mb-6 mt-4">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 shrink-0" />
                    {plan.planCap} plans per month
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 shrink-0" />
                    All templates and tools
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 shrink-0" />
                    Print &amp; PDF export
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="w-full"
                  variant={plan.tier === 'pro' ? 'primary' : 'outline'}
                  disabled={busy !== null || isCurrent}
                  onClick={() => { void handleCheckout(plan.tier); }}
                >
                  {isCurrent
                    ? 'Your current plan'
                    : busy === plan.tier
                      ? 'Redirecting…'
                      : onPaidPlan
                        ? `Switch to ${plan.name}`
                        : `Subscribe to ${plan.name}`}
                </Button>
              </Card>
            );
          })}
        </div>
        <p className="font-sans text-xs text-ink-faint mt-4">
          Promo codes can be entered at checkout. Cancel any time from Manage billing —
          you keep access until the end of your paid period.
        </p>
      </div>
    </div>
  );
}
