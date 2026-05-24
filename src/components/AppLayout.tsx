import { type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-rule bg-paper sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="font-display text-xl text-ink hover:text-terracotta transition-colors"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            SubPlan
          </Link>

          <nav className="flex items-center gap-6">
            <NavLink
              to="/plans"
              className={({ isActive }) =>
                `text-sm font-sans transition-colors ${
                  isActive ? 'text-ink font-semibold' : 'text-ink-soft hover:text-ink'
                }`
              }
            >
              Plans
            </NavLink>
            <NavLink
              to="/templates"
              className={({ isActive }) =>
                `text-sm font-sans transition-colors ${
                  isActive ? 'text-ink font-semibold' : 'text-ink-soft hover:text-ink'
                }`
              }
            >
              Templates
            </NavLink>
            <NavLink
              to="/account"
              className={({ isActive }) =>
                `text-sm font-sans transition-colors ${
                  isActive ? 'text-ink font-semibold' : 'text-ink-soft hover:text-ink'
                }`
              }
            >
              Account
            </NavLink>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void signOut();
              }}
            >
              Sign out
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
