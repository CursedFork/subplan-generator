import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/logo/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      // TODO(domain): Replace with real domain once purchased.
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    // Never reveal whether the address exists.
    setSubmitted(true);
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
        <Card className="w-full max-w-sm">
          {submitted ? (
            <>
              <h1 className="font-display text-display-md text-ink mb-3">Check your email.</h1>
              <p className="font-sans text-base text-ink-soft leading-relaxed">
                If an account exists for that address, you&rsquo;ll get a link to reset your
                password within a few minutes.
              </p>
              <p className="mt-4 font-sans text-sm text-ink-faint">
                Don&rsquo;t see it? Check your spam folder.
              </p>
              <Link
                to="/signin"
                className="mt-6 inline-block text-sm font-sans text-terracotta hover:underline underline-offset-2"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-display-md text-ink mb-1">Reset your password.</h1>
              <p className="font-sans text-sm text-ink-soft mb-8">
                Enter your email and we&rsquo;ll send you a link.
              </p>

              <form
                onSubmit={(e) => {
                  void handleSubmit(e);
                }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm font-sans text-ink-soft">
                <Link to="/signin" className="text-terracotta hover:underline underline-offset-2">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
