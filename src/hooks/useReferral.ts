import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { pendingReferralCode, clearReferralCode } from '@/lib/referral';

// any: Database type is a placeholder until `npm run db:types` is run.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// Attaches a parked referral code to the signed-in account. Mounted on the
// Dashboard so it runs on the first authenticated page load after signup.
// The RPC validates everything server-side (self-referral, duplicates,
// account age), so failures here just mean "no credit" — never an error UI.
export function useAttachReferral(): void {
  const { user } = useAuth();
  const attempted = useRef(false);

  useEffect(() => {
    if (!user || attempted.current) return;
    const code = pendingReferralCode();
    if (!code) return;
    attempted.current = true;

    void (async () => {
      const { data, error } = await db.rpc('record_referral', { p_code: code });
      // Clear on any outcome — retrying an invalid/duplicate code is pointless.
      clearReferralCode();
      if (error) {
        console.warn('[referral] record_referral failed:', error.message);
      } else if (Array.isArray(data) && data[0]) {
        console.log(`[referral] ${data[0].ok ? 'recorded' : `skipped (${data[0].reason})`}`);
      }
    })();
  }, [user]);
}
