# Stripe Setup — Teacher's Pet

Everything code-side is done. Follow these steps to go live. Total time: ~45 minutes.
Do it all in **test mode** first, then repeat products/webhook/secrets in live mode.

## 1. Create the Stripe account (10 min)

1. Go to https://dashboard.stripe.com/register and sign up with drew.kozikowski@gmail.com.
2. You can build and test everything immediately in test mode. Activating live payments
   requires business details — sole proprietor with your SSN is fine, no LLC needed
   (though an LLC is worth considering later).

## 2. Create products and prices (10 min)

In the dashboard: **Product catalog → Add product**. Create two products with two
recurring prices each:

| Product | Price | Billing |
|---|---|---|
| Teacher's Pet Basic | $9.00 | Monthly |
| Teacher's Pet Basic | $79.00 | Yearly |
| Teacher's Pet Pro | $18.00 | Monthly |
| Teacher's Pet Pro | $158.00 | Yearly |

After creating each price, copy its **Price ID** (starts with `price_`). You need all four.

## 3. Set edge function secrets (5 min)

Supabase dashboard → project `mcvlnscbekyivvlnlisu` → **Edge Functions → Secrets**
(direct link: https://supabase.com/dashboard/project/mcvlnscbekyivvlnlisu/settings/functions).

Add these six secrets:

```
STRIPE_SECRET_KEY=sk_test_...        (Stripe dashboard → Developers → API keys)
STRIPE_WEBHOOK_SECRET=whsec_...      (from step 5 below — come back for this)
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_ANNUAL=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
```

## 4. Run the migration and deploy functions (5 min)

```powershell
cd C:\Users\Andrew\subplan-generator
npx supabase db push
npx supabase functions deploy create-checkout-session
npx supabase functions deploy create-portal-session
npx supabase functions deploy stripe-webhook --no-verify-jwt
npx supabase functions deploy agent-turn
```

The `--no-verify-jwt` flag on stripe-webhook is required — Stripe can't send a Supabase
JWT; the function verifies Stripe's signature instead.

If `db push` complains, run the SQL directly:
https://supabase.com/dashboard/project/mcvlnscbekyivvlnlisu/sql/new
and paste `supabase/migrations/20260705000000_free_tier_billing.sql`.

## 5. Add the webhook endpoint (5 min)

Stripe dashboard → **Developers → Webhooks → Add endpoint**.

- Endpoint URL: `https://mcvlnscbekyivvlnlisu.supabase.co/functions/v1/stripe-webhook`
- Events to select:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
- After creating it, copy the **Signing secret** (`whsec_...`) and add it as
  `STRIPE_WEBHOOK_SECRET` in step 3, then redeploy: `npx supabase functions deploy stripe-webhook --no-verify-jwt`.

## 6. Enable the billing portal (2 min)

Stripe dashboard → **Settings → Billing → Customer portal → Activate**.
Recommended settings: allow customers to cancel subscriptions, switch plans, and update
payment methods.

## 7. Test end-to-end (10 min)

1. Deploy the frontend (`git push` → Vercel auto-deploys).
2. Sign in with a test account → **Billing** page → subscribe to Basic Annual.
3. At Stripe checkout use test card `4242 4242 4242 4242`, any future expiry, any CVC.
4. You should land back on /billing with a success banner and see "Basic" as your plan.
5. Create and finalize 31 plans? No — just check the usage bar shows "0 of 30."
6. Click **Manage billing** → cancel → confirm the "Cancels at period end" badge appears.
7. Check the free tier: on a fresh account, finalize 3 plans, then the 4th should be
   blocked with an upgrade message.

## 8. Going live (when ready)

1. Activate your Stripe account (business details + bank account for payouts).
2. Recreate the four prices in **live mode** (test-mode products don't carry over).
3. Create a live-mode webhook endpoint (same URL, same events).
4. Swap the six secrets to their live values (`sk_live_...`, live `whsec_...`, live price IDs).
5. Redeploy the three billing functions.

## Founding-teacher promo (optional but recommended)

Stripe dashboard → **Product catalog → Coupons → Create coupon**:
- 50% off, duration "once" (applies to first year of an annual plan)
- Then **Promotion codes → Create**: code `FOUNDING50`, limit to 50 redemptions.

Checkout already has `allow_promotion_codes: true`, so the code field appears automatically.

## Costs cheat sheet

Stripe fees: 2.9% + $0.30 per charge. On a $79 annual: ~$2.59 (3.3%). On a $9 monthly:
~$0.56 (6.2%). Annual billing is meaningfully better — the UI already defaults to it.
