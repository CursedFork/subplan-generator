import { type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

const NAV_LINKS = [
  { to: '/plans',     label: 'Plans'     },
  { to: '/templates', label: 'Templates' },
  { to: '/profile',   label: 'Profile'   },
];

export function AppLayout({ children }: Props) {
  const { signOut } = useAuth();
  const isAdmin = useIsAdmin();

  return (
    <div className="min-h-screen bg-paper theme-aware">
      <header className="border-b border-rule bg-paper theme-aware sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="font-display text-xl text-ink hover:text-terracotta transition-colors duration-150 shrink-0"
            style={{ fontVariationSettings: "'opsz' 96" }}
          >
            Teacher&rsquo;s Pet
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'relative px-3 py-1.5 text-sm font-sans rounded transition-colors duration-150',
                    'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px',
                    'after:bg-terracotta after:transition-transform after:duration-200 after:origin-left',
                    isActive
                      ? 'text-ink font-semibold after:scale-x-100'
                      : 'text-ink-soft hover:text-ink after:scale-x-0 hover:bg-rule/30',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  [
                    'relative px-3 py-1.5 text-sm font-sans rounded transition-colors duration-150',
                    'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px',
                    'after:bg-terracotta after:transition-transform after:duration-200 after:origin-left',
                    isActive
                      ? 'text-ink font-semibold after:scale-x-100'
                      : 'text-ink-soft hover:text-ink after:scale-x-0 hover:bg-rule/30',
                  ].join(' ')
                }
              >
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right-side controls */}
          <div className="flex items-center gap-4 shrink-0">
            <ThemeSwitcher />
            <div className="w-px h-4 bg-rule" aria-hidden="true" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { void signOut(); }}
              className="text-ink-faint hover:text-ink"
            >
              Sign out
            </Button>
          </div>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 theme-aware">{children}</main>
    </div>
  );
}
