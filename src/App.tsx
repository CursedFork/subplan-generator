import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute';
import { AppLayout } from '@/components/AppLayout';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import Dashboard from '@/pages/Dashboard';
import NewPlan from '@/pages/NewPlan';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/signin"
          element={
            <ErrorBoundary>
              <PublicOnlyRoute>
                <SignIn />
              </PublicOnlyRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/signup"
          element={
            <ErrorBoundary>
              <PublicOnlyRoute>
                <SignUp />
              </PublicOnlyRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ErrorBoundary>
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            </ErrorBoundary>
          }
        />
        <Route
          path="/verify-email"
          element={
            <ErrorBoundary>
              <PublicOnlyRoute>
                <VerifyEmail />
              </PublicOnlyRoute>
            </ErrorBoundary>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        <Route
          path="/profile"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        <Route
          path="/new-plan"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <NewPlan />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        <Route
          path="*"
          element={
            <ErrorBoundary>
              <NotFound />
            </ErrorBoundary>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
