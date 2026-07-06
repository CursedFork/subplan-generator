import { supabase } from './supabase';

export type BillingTier = 'basic' | 'pro';
export type BillingPeriod = 'monthly' | 'annual';

async function callBillingFunction(
  fn: 'create-checkout-session' | 'create-portal-session',
  body: Record<string, string>,
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    },
  );

  const json = await response.json() as { url?: string; error?: string };
  if (!response.ok || !json.url) {
    throw new Error(json.error ?? `Billing request failed (${response.status})`);
  }
  return json.url;
}

// Both return a Stripe-hosted URL; the caller redirects the browser there.
export function startCheckout(tier: BillingTier, period: BillingPeriod): Promise<string> {
  return callBillingFunction('create-checkout-session', {
    tier,
    period,
    return_origin: window.location.origin,
  });
}

export function openBillingPortal(): Promise<string> {
  return callBillingFunction('create-portal-session', {
    return_origin: window.location.origin,
  });
}
