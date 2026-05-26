import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface Props {
  children: ReactNode;
}

export function AdminRoute({ children }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-rule border-t-terracotta animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;

  // Treat missing or false is_admin as unauthorized.
  const isAdmin = (profile as (typeof profile & { is_admin?: boolean }) | null)?.is_admin === true;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
