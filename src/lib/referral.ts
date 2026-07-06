// Referral capture: ?ref=CODE lands on the public pages before the user has
// an account, so the code is parked in localStorage and attached to the
// account after signup (see useAttachReferral in useReferral.ts).

const STORAGE_KEY = 'teacherspet-ref';

// Call on public-page mount (Landing, SignUp).
export function captureReferralCode(): void {
  try {
    const code = new URLSearchParams(window.location.search).get('ref');
    if (code && /^[A-Za-z0-9]{4,16}$/.test(code)) {
      localStorage.setItem(STORAGE_KEY, code.toUpperCase());
    }
  } catch { /* storage unavailable — referral silently skipped */ }
}

// Manual-entry path: the SignUp form's referral field parks its value here
// so the same post-signup attach flow handles both URL and typed codes.
export function parkReferralCode(code: string): void {
  try {
    const trimmed = code.trim();
    if (/^[A-Za-z0-9]{4,16}$/.test(trimmed)) {
      localStorage.setItem(STORAGE_KEY, trimmed.toUpperCase());
    }
  } catch { /* ignore */ }
}

export function pendingReferralCode(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearReferralCode(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function referralLink(code: string): string {
  return `${window.location.origin}/?ref=${code}`;
}
