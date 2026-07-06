# Stripe Setup — Teacher's Pet

> **STATUS (July 6, 2026): Test mode is fully wired.** Account created, products/prices
> created, webhook endpoint live, all six secrets set, portal configured. Steps 1–6 are
> DONE for test mode. What remains: your end-to-end click test (step 7) and going
> live (step 8) when you're ready to take real money.
>
> Test-mode reference:
> - Products: `prod_Upt7yPKDZ9kZrD` (Basic), `prod_Upt752JgBzqaGg` (Pro)
> - Prices: Basic $9/mo `price_1TqDRHEASQdv5ZD4Wtlu0A3Z`, Basic $79/yr
>   `price_1TqDRHEASQdv5ZD4iT95aCBG`, Pro $18/mo `price_1TqDRHEASQdv5ZD4UCfwXtAL`,
>   Pro $158/yr `price_1TqDRHEASQdv5ZD4jyw9vOVC`
> - Webhook endpoint: `we_1TqDRiEASQdv5ZD4hEGXtEpX`
> - Portal config: `bpc_1TqDSpEASQdv5ZD4CA60awL6` (default)

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

## 4. ~~Run the migration and deploy functions~~ — DONE (July 5, 2026)

Already completed by Claude:
- Migration history repaired (the four manually-run migrations marked applied)
- `20260616000000_roster_schema.sql` and `20260705000000_free_tier_billing.sql`
  pushed to production
- All four edge functions deployed (agent-turn, create-checkout-session,
  create-portal-session, stripe-webhook with --no-verify-jwt)

Only redeploy stripe-webhook after you add the STRIPE_WEBHOOK_SECRET in step 5:

```powershell
cd C:\Users\Andrew\subplan-generator
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

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
6. **Purge test-mode subscriptions** — rows created by 4242-card checkouts during
   testing keep granting paid tiers until deleted. Run in the SQL Editor
   (https://supabase.com/dashboard/project/mcvlnscbekyivvlnlisu/sql/new):

   ```sql
   -- Test-mode Stripe IDs are harmless to remove; live ones don't exist yet.
   delete from public.subscriptions;
   ```

   (If you want to keep a specific row, add `where user_id != '<uuid>'`.)
7. Optionally delete the test-mode webhook endpoint in the Stripe dashboard
   (Developers → Webhooks, test mode). The webhook function ignores
   cross-mode events either way — it checks `event.livemode` against the key.

## Founding-teacher promo (optional but recommended)

Stripe dashboard → **Product catalog → Coupons → Create coupon**:
- 50% off, duration "once" (applies to first year of an annual plan)
- Then **Promotion codes → Create**: code `FOUNDING50`, limit to 50 redemptions.

Checkout already has `allow_promotion_codes: true`, so the code field appears automatically.

## Costs cheat sheet

Stripe fees: 2.9% + $0.30 per charge. On a $79 annual: ~$2.59 (3.3%). On a $9 monthly:
~$0.56 (6.2%). Annual billing is meaningfully better — the UI already defaults to it.
