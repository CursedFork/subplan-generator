import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/logo/Logo';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) setError(authError.message);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Logo top-left */}
      <div className="px-8 pt-6">
        <Link to="/" aria-label="Teacher's Pet home">
          <Logo />
        </Link>
      </div>

      <div className="flex flex-1">
        {/* Left: marketing */}
        <div className="hidden lg:flex lg:w-1/2 bg-terracotta-soft flex-col justify-center px-16 py-20">
          <h1 className="font-display text-display-lg text-ink rule-ornament">
            Welcome back.
          </h1>
          <p className="mt-8 font-sans text-lg text-ink-soft leading-relaxed max-w-sm hidden sm:block">
            Your class info is saved — just sign in and pick up where you left off.
          </p>
        </div>

        {/* Right: form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
          <Card className="w-full max-w-sm">
            <h2 className="font-display text-display-md text-ink mb-1">Welcome back.</h2>
            <p className="font-sans text-sm text-ink-soft mb-8">Sign in to your account.</p>

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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-sans text-ink-soft hover:text-terracotta transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm font-sans text-terracotta" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm font-sans text-ink-soft">
              Don&rsquo;t have an account?{' '}
              <Link
                to="/signup"
                className="text-terracotta hover:underline underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
