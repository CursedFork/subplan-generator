// Stripe webhook handler. Deployed with verify_jwt = false (Stripe cannot
// send a Supabase JWT) — security comes from signature verification below.
import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^17';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

type Tier = 'basic' | 'pro';
type Period = 'monthly' | 'annual';

// Fallback mapping when subscription metadata is missing (e.g. a subscription
// modified directly in the Stripe dashboard).
function tierFromPriceId(priceId: string): { tier: Tier; period: Period } | null {
  const map: [string | undefined, Tier, Period][] = [
    [Deno.env.get('STRIPE_PRICE_BASIC_MONTHLY'), 'basic', 'monthly'],
    [Deno.env.get('STRIPE_PRICE_BASIC_ANNUAL'), 'basic', 'annual'],
    [Deno.env.get('STRIPE_PRICE_PRO_MONTHLY'), 'pro', 'monthly'],
    [Deno.env.get('STRIPE_PRICE_PRO_ANNUAL'), 'pro', 'annual'],
  ];
  for (const [envPrice, tier, period] of map) {
    if (envPrice && envPrice === priceId) return { tier, period };
  }
  return null;
}

async function upsertSubscription(sub: Stripe.Subscription): Promise<void> {
  const userId = sub.metadata?.['user_id'];
  if (!userId) {
    console.error(`[webhook] Subscription ${sub.id} has no user_id metadata — skipping`);
    return;
  }

  const priceId = sub.items.data[0]?.price?.id ?? '';
  const fromPrice = tierFromPriceId(priceId);
  const tier = (sub.metadata?.['tier'] as Tier | undefined) ?? fromPrice?.tier ?? 'basic';
  const period =
    (sub.metadata?.['billing_period'] as Period | undefined) ?? fromPrice?.period ?? 'monthly';

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const { error } = await admin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      tier,
      billing_period: period,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) console.error(`[webhook] Upsert failed for ${sub.id}:`, error.message);
}

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[webhook] Signature verification failed:', message);
    return new Response('Invalid signature', { status: 400 });
  }

  // Live/test mode guard: only process events whose mode matches our key.
  // Signature verification already blocks cross-mode events (different
  // signing secrets), but this makes a misconfiguration fail loudly instead
  // of granting free subscriptions from test-card checkouts.
  const keyIsLive = Deno.env.get('STRIPE_SECRET_KEY')!.startsWith('sk_live');
  if (event.livemode !== keyIsLive) {
    console.error(
      `[webhook] Mode mismatch: event livemode=${event.livemode} but key is ${keyIsLive ? 'live' : 'test'} — ignoring ${event.type}`,
    );
    return new Response(JSON.stringify({ received: true, ignored: 'mode_mismatch' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          // client_reference_id backstops missing metadata (shouldn't happen,
          // but a lost user_id here means a paying customer with no access).
          if (!sub.metadata?.['user_id'] && session.client_reference_id) {
            sub.metadata = { ...sub.metadata, user_id: session.client_reference_id };
          }
          await upsertSubscription(sub);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await upsertSubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        // A renewal payment starts a fresh usage period.
        if (invoice.billing_reason === 'subscription_cycle' && invoice.subscription) {
          const subId =
            typeof invoice.subscription === 'string'
              ? invoice.subscription
              : invoice.subscription.id;
          const { error } = await admin.rpc('reset_period_usage', {
            p_stripe_subscription_id: subId,
          });
          if (error) console.error('[webhook] reset_period_usage failed:', error.message);
        }
        break;
      }

      default:
        // Unhandled event types are fine — Stripe sends many we don't need.
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[webhook] Handler error for ${event.type}:`, message);
    // 500 → Stripe retries with backoff, which is what we want.
    return new Response('Handler error', { status: 500 });
  }
});
