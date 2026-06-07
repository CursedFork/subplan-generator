import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/logo/Logo';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [cooldown, setCooldown] = useState(0);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setResendError(null);
    setResendSuccess(false);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setResendError(error.message);
    } else {
      setResendSuccess(true);
      setCooldown(60);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Logo top-left */}
      <div className="px-8 pt-6">
        <Link to="/" aria-label="Teacher's Pet home">
          <Logo />
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-terracotta-soft flex items-center justify-center mx-auto mb-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-terracotta"
              aria-hidden="true"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </div>

          <h1 className="font-display text-display-md text-ink mb-3">Check your inbox.</h1>

          <p className="font-sans text-base text-ink-soft leading-relaxed">
            We sent a verification link to{' '}
            {email ? (
              <strong className="text-ink font-semibold">{email}</strong>
            ) : (
              'your email address'
            )}
            . Click the link in that email to finish setting up your account.
          </p>

          <div className="mt-8 space-y-3">
            {resendSuccess && (
              <p className="text-sm font-sans text-sage">Link resent — check your inbox.</p>
            )}
            {resendError && (
              <p className="text-sm font-sans text-terracotta">{resendError}</p>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                void handleResend();
              }}
              disabled={cooldown > 0 || !email}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
            </Button>
          </div>

          <p className="mt-6 text-sm font-sans text-ink-faint">
            Didn&rsquo;t get it? Check your spam folder, or{' '}
            {/* TODO(domain): replace with real support email */}
            <a
              href="mailto:support@teacherspet.app"
              className="text-ink-soft hover:text-terracotta transition-colors underline underline-offset-2"
            >
              contact support
            </a>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}
