import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

type CallbackState = 'loading' | 'error';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') as 'signup' | 'recovery' | 'email' | null;

    if (!tokenHash || !type) {
      setErrorMsg('This confirmation link is missing required parameters. Please request a new one.');
      setState('error');
      return;
    }

    void supabase.auth
      .verifyOtp({ token_hash: tokenHash, type })
      .then(({ error }) => {
        if (error) {
          setErrorMsg(
            error.message.includes('expired')
              ? 'This link has expired. Please request a new confirmation email.'
              : error.message,
          );
          setState('error');
        } else if (type === 'signup') {
          // New user — send them straight to Profile setup
          void navigate('/profile?onboarding=true', { replace: true });
        } else {
          // Password recovery or other type — handled by ResetPassword page
          void navigate('/reset-password', { replace: true });
        }
      });
  }, [navigate, searchParams]);

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-terracotta-soft flex items-center justify-center mx-auto mb-6">
            <svg
              width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="text-terracotta" aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="font-display text-display-md text-ink mb-3">Link expired.</h1>
          <p className="font-sans text-sm text-ink-soft leading-relaxed mb-6">{errorMsg}</p>
          <div className="flex flex-col gap-2">
            <a
              href="/signin"
              className="font-sans text-sm font-semibold text-terracotta hover:underline underline-offset-2"
            >
              Back to sign in
            </a>
            <a
              href="/forgot-password"
              className="font-sans text-sm text-ink-faint hover:text-ink transition-colors"
            >
              Reset your password instead
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-rule border-t-terracotta animate-spin" aria-label="Verifying…" />
    </div>
  );
}
