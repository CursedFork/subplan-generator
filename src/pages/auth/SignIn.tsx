import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';

// Inline SVGs — lucide-react does not include brand/OAuth provider icons.
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.29.07 2.22.76 3.05.78 1.23-.26 2.41-.98 3.76-.83 1.64.2 2.87.84 3.7 2.11-3.33 2.05-2.53 6.14.33 7.7-.64 1.65-1.45 3.3-2.84 4.1zM13 3.5c-.1 2.25-1.67 4.08-3.87 3.98-.27-2.02 1.58-4.12 3.87-3.98z" />
  </svg>
);

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

  const handleOAuth = async (provider: 'google' | 'apple') => {
    // TODO(apple-oauth): Apple requires Apple Developer account + Supabase Auth provider config.
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${import.meta.env.VITE_APP_URL}/dashboard` },
    });
    if (authError) setError(authError.message);
  };

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Left: marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-terracotta-soft flex-col justify-center px-16 py-20">
        <p className="font-sans text-xs uppercase tracking-widest text-terracotta mb-6">
          For K–12 teachers
        </p>
        <h1 className="font-display text-display-lg text-ink rule-ornament">
          Sub plans, ready in minutes.
        </h1>
        <p className="mt-8 font-sans text-lg text-ink-soft leading-relaxed max-w-sm">
          You shouldn&rsquo;t have to worry about your class when you&rsquo;re out. Tell us
          the basics and we&rsquo;ll put together a clear, kind plan your sub can actually
          follow.
        </p>
        <p className="mt-4 font-sans text-base text-ink-faint max-w-sm">
          No jargon. No filler. Just a plan that makes their day — and yours — a little easier.
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-rule" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-paper px-3 text-xs font-sans text-ink-faint uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full gap-3"
              onClick={() => {
                void handleOAuth('google');
              }}
            >
              <GoogleIcon />
              Sign in with Google
            </Button>
            <Button
              variant="outline"
              className="w-full gap-3"
              onClick={() => {
                void handleOAuth('apple');
              }}
            >
              <AppleIcon />
              Sign in with Apple
            </Button>
          </div>

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
  );
}
