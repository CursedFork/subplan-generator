import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';

export default function ResetPassword() {
  const navigate = useNavigate();

  // Supabase fires PASSWORD_RECOVERY once it parses the token from the URL.
  // Until then we show a loading state so the form doesn't flash prematurely.
  const [ready, setReady] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // If the token isn't processed within 5 s, assume the link is invalid/expired.
    const timeout = setTimeout(() => {
      setTokenError(true);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Clear the timeout if we become ready before it fires.
  useEffect(() => {
    if (ready) setTokenError(false);
  }, [ready]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setFieldError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setFieldError(error.message);
    } else {
      setDone(true);
      // Give the user a moment to read the success message, then redirect.
      setTimeout(() => { void navigate('/dashboard'); }, 2500);
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-terracotta-soft flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="text-terracotta" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display text-display-md text-ink mb-3">Password updated.</h1>
          <p className="font-sans text-sm text-ink-soft">
            Taking you to your dashboard…
          </p>
        </Card>
      </div>
    );
  }

  // ── Invalid / expired link ─────────────────────────────────────────────────
  if (tokenError && !ready) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-sm text-center">
          <h1 className="font-display text-display-md text-ink mb-3">Link expired.</h1>
          <p className="font-sans text-sm text-ink-soft mb-6">
            This reset link is invalid or has already been used. Request a new one and try again.
          </p>
          <Button asChild className="w-full">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // ── Waiting for Supabase to process the token ──────────────────────────────
  if (!ready) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
        <p className="text-sm font-sans text-ink-faint">Verifying reset link…</p>
      </div>
    );
  }

  // ── New password form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-display-md text-ink mb-1">
          Choose a new password.
        </h1>
        <p className="font-sans text-sm text-ink-soft mb-8">
          Pick something strong — at least 8 characters with letters and numbers.
        </p>

        <form
          onSubmit={(e) => { void handleSubmit(e); }}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {fieldError && (
            <p className="text-sm font-sans text-terracotta" role="alert">
              {fieldError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating…' : 'Set new password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
