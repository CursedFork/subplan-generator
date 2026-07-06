import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@^17';
import { z } from 'npm:zod@^3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const requestSchema = z.object({
  tier: z.enum(['basic', 'pro']),
  period: z.enum(['monthly', 'annual']),
  // Where to send the user back to. Must be the app's own origin.
  return_origin: z.string().url(),
});

// Price IDs are configured as edge function secrets — see SETUP_STRIPE.md.
const PRICE_ENV_KEYS: Record<string, string> = {
  'basic:monthly': 'STRIPE_PRICE_BASIC_MONTHLY',
  'basic:annual': 'STRIPE_PRICE_BASIC_ANNUAL',
  'pro:monthly': 'STRIPE_PRICE_PRO_MONTHLY',
  'pro:annual': 'STRIPE_PRICE_PRO_ANNUAL',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const { tier, period, return_origin } = parsed.data;

    const priceId = Deno.env.get(PRICE_ENV_KEYS[`${tier}:${period}`]);
    if (!priceId) {
      console.error(`[checkout] Missing price env var for ${tier}:${period}`);
      return new Response(JSON.stringify({ error: 'Billing is not configured yet.' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Reuse the Stripe customer if this user has ever subscribed before.
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: existingSub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    const existingCustomerId =
      (existingSub as { stripe_customer_id: string | null } | null)?.stripe_customer_id ?? null;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      ...(existingCustomerId
        ? { customer: existingCustomerId }
        : { customer_email: user.email ?? undefined }),
      client_reference_id: user.id,
      subscription_data: {
        metadata: { user_id: user.id, tier, billing_period: period },
      },
      allow_promotion_codes: true,
      success_url: `${return_origin}/billing?success=true`,
      cancel_url: `${return_origin}/billing?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[checkout] Unexpected error:', message);
    return new Response(JSON.stringify({ error: 'Could not start checkout.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
