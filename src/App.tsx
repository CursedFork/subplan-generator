import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute';
import { AppLayout } from '@/components/AppLayout';
import Landing from '@/pages/Landing';
import Placeholder from '@/pages/Placeholder';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import ResetPassword from '@/pages/auth/ResetPassword';
import AuthCallback from '@/pages/auth/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import Plans from '@/pages/Plans';
import NewPlan from '@/pages/NewPlan';
import Profile from '@/pages/Profile';
import Templates from '@/pages/Templates';
import Admin from '@/pages/Admin';
import { AdminRoute } from '@/components/AdminRoute';
import NotFound from '@/pages/NotFound';
import ProfileSetup from '@/pages/onboarding/ProfileSetup';

// RootRedirect is no longer needed — / is now the public landing page.
// Kept for potential internal use if needed.

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Routes>
        {/* Public landing page — accessible to everyone */}
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <Landing />
            </ErrorBoundary>
          }
        />

        {/* Footer legal/info pages */}
        <Route path="/terms" element={<Placeholder title="Terms of Service" />} />
        <Route path="/privacy" element={<Placeholder title="Privacy Policy" />} />
        <Route path="/contact" element={<Placeholder title="Contact" />} />

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

        {/* Auth callback — handles email confirmation token from Supabase.
            Must NOT be wrapped in PublicOnlyRoute; the session isn't set yet. */}
        <Route
          path="/auth/callback"
          element={
            <ErrorBoundary>
              <AuthCallback />
            </ErrorBoundary>
          }
        />

        {/* Reset-password is NOT wrapped in PublicOnlyRoute — the user arrives
            in a Supabase recovery session (technically signed in). */}
        <Route
          path="/reset-password"
          element={
            <ErrorBoundary>
              <ResetPassword />
            </ErrorBoundary>
          }
        />

        {/* Onboarding wizard */}
        <Route
          path="/welcome"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
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
          path="/plans"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <AppLayout>
                  <Plans />
                </AppLayout>
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        <Route
          path="/templates"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <AppLayout>
                  <Templates />
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
          path="/admin"
          element={
            <ErrorBoundary>
              <AdminRoute>
                <AppLayout>
                  <Admin />
                </AppLayout>
              </AdminRoute>
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
    </ThemeProvider>
  );
}
