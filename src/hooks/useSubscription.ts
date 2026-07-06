import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// any: Database type is a placeholder until `npm run db:types` is run.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface Subscription {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  tier: 'basic' | 'pro';
  billing_period: 'monthly' | 'annual';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  plans_used_this_period: number;
}

export interface UsageSummary {
  // null tier = free tier (no subscription)
  tier: 'free' | 'basic' | 'pro';
  isActive: boolean; // free tier counts as active
  used: number;
  cap: number;
  periodEnd: string | null; // renewal date; null on free tier
  cancelAtPeriodEnd: boolean;
  subscription: Subscription | null;
}

const TIER_CAPS = { free: 3, basic: 30, pro: 45 } as const;

export function useSubscription() {
  const { user } = useAuth();

  return useQuery<UsageSummary>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: sub, error: subError } = await db
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (subError) throw subError;

      const subscription = (sub ?? null) as Subscription | null;
      const isPaidActive =
        !!subscription && ['active', 'trialing'].includes(subscription.status);

      if (isPaidActive) {
        return {
          tier: subscription.tier,
          isActive: true,
          used: subscription.plans_used_this_period,
          cap: TIER_CAPS[subscription.tier],
          periodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          subscription,
        };
      }

      // Free tier (never subscribed, or subscription lapsed):
      // 3 finalized plans lifetime — mirror of increment_plan_usage.
      const { count, error: countError } = await db
        .from('sub_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'final');
      if (countError) throw countError;

      return {
        tier: 'free' as const,
        isActive: true,
        used: count ?? 0,
        cap: TIER_CAPS.free,
        periodEnd: null,
        cancelAtPeriodEnd: false,
        subscription, // non-null if lapsed — Billing page uses it to offer the portal
      };
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}
