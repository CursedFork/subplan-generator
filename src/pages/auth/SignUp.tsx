import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';

const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[a-zA-Z]/, 'Password must include at least one letter.')
      .regex(/[0-9]/, 'Password must include at least one number.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type FieldErrors = Partial<Record<'email' | 'password' | 'confirmPassword', string>>;

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const result = signUpSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors | undefined;
        if (field && !errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Referral code stored for later wiring in Stripe increment.
        data: referralCode ? { referral_code: referralCode } : undefined,
      },
    });
    setLoading(false);

    if (authError) {
      setFormError(authError.message);
      return;
    }

    void navigate(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Left: marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-terracotta-soft flex-col justify-center px-16 py-20">
        <p className="font-sans text-xs uppercase tracking-widest text-terracotta mb-6">
          For K–12 teachers
        </p>
        <h1 className="font-display text-display-lg text-ink rule-ornament">
          Your sub will thank you.
        </h1>
        <p className="mt-8 font-sans text-lg text-ink-soft leading-relaxed max-w-sm">
          Create an account and get your first sub plan together in under five minutes.
          Everything your sub needs — room number, schedule, activities — in one clear document.
        </p>
        <p className="mt-4 font-sans text-base text-ink-faint max-w-sm">
          Kind to write. Kind to read.
        </p>
      </div>

      {/* Right: form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-sm">
          <h2 className="font-display text-display-md text-ink mb-1">Create your account.</h2>
          <p className="font-sans text-sm text-ink-soft mb-8">
            Already have one?{' '}
            <Link to="/signin" className="text-terracotta hover:underline underline-offset-2">
              Sign in
            </Link>
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
              {fieldErrors.email && (
                <p className="text-xs font-sans text-terracotta">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldErrors.password && (
                <p className="text-xs font-sans text-terracotta">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs font-sans text-terracotta">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {formError && (
              <p className="text-sm font-sans text-terracotta" role="alert">
                {formError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          {/* Referral code — captured for later Stripe increment wiring */}
          <div className="mt-6">
            {!showReferral ? (
              <button
                type="button"
                className="text-xs font-sans text-ink-faint hover:text-ink-soft transition-colors underline underline-offset-2"
                onClick={() => setShowReferral(true)}
              >
                Have a referral code?
              </button>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="referral">Referral code</Label>
                <Input
                  id="referral"
                  type="text"
                  placeholder="e.g. AB12CD34"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
