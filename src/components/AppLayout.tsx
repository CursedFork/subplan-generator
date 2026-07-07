import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useAdmin';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from './ui/Button';
import { Logo } from './logo/Logo';

interface Props {
  children: ReactNode;
}

const NAV_LINKS = [
  { to: '/plans',     label: 'Plans'     },
  { to: '/tools',     label: 'Tools'     },
  { to: '/templates', label: 'Templates' },
  { to: '/profile',   label: 'Profile'   },
  { to: '/billing',   label: 'Billing'   },
];

function desktopLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'relative px-3 py-1.5 text-sm font-sans rounded transition-colors duration-150',
    'after:absolute after:bottom-0 after:left-3 after:right-3 after:h-px',
    'after:bg-terracotta after:transition-transform after:duration-200 after:origin-left',
    isActive
      ? 'text-ink font-semibold after:scale-x-100'
      : 'text-ink-soft hover:text-ink after:scale-x-0 hover:bg-rule/30',
  ].join(' ');
}

function mobileLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'block px-4 py-2.5 text-sm font-sans rounded border-l-2 transition-colors duration-150',
    isActive
      ? 'border-terracotta bg-terracotta-soft/40 text-ink font-semibold'
      : 'border-transparent text-ink-soft hover:text-ink hover:bg-rule/30',
  ].join(' ');
}

export function AppLayout({ children }: Props) {
  const { signOut } = useAuth();
  const isAdmin = useIsAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu whenever navigation happens
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = isAdmin
    ? [...NAV_LINKS, { to: '/admin', label: 'Admin' }]
    : NAV_LINKS;

  return (
    <div className="min-h-screen bg-paper theme-aware">
      <header className="border-b border-rule bg-paper theme-aware sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-6">

          {/* Logo */}
          <Link
            to="/dashboard"
            className="hover:opacity-80 transition-opacity duration-150 shrink-0"
            aria-label="Teacher's Pet — go to dashboard"
          >
            <Logo />
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden sm:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to} className={desktopLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right-side controls (desktop) */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
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

          {/* Hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="sm:hidden shrink-0 p-2 -mr-2 rounded text-ink-soft hover:text-ink hover:bg-rule/30 transition-colors duration-150"
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>

        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div id="mobile-nav" className="sm:hidden border-t border-rule bg-paper theme-aware">
            <nav className="px-4 py-3 flex flex-col gap-0.5">
              {links.map(({ to, label }) => (
                <NavLink key={to} to={to} className={mobileLinkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-rule flex items-center justify-between">
              <ThemeSwitcher />
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
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 theme-aware">{children}</main>
    </div>
  );
}
