import { LogOut, Menu, Rocket, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { Role } from '../api/auth';
import { useAuth } from '../auth/AuthContext';

const roleLabel: Record<string, string> = {
  STUDENT: 'Student',
  RECRUITER: 'Recruiter',
  ADMIN: 'Admin',
};

const roleChip: Record<string, string> = {
  STUDENT: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  RECRUITER: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  ADMIN: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20',
};

// Nav links per role. Add a page by adding one entry here.
const navLinks: Record<Role, { to: string; label: string }[]> = {
  STUDENT: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/applications', label: 'Applications' },
    { to: '/profile', label: 'Profile' },
  ],
  RECRUITER: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/my-jobs', label: 'My Jobs' },
  ],
  ADMIN: [{ to: '/admin', label: 'Dashboard' }],
};

// Shared page shell: responsive navigation bar on top, routed content below.
export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return null;
  }

  const links = navLinks[user.role] ?? [];
  const chipClass = roleChip[user.role] ?? 'bg-slate-100 text-slate-700 ring-slate-500/20';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-sm">
              <Rocket className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-slate-900">Placement Portal</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${chipClass}`}
            >
              {roleLabel[user.role] ?? user.role}
            </span>
            <span className="max-w-[180px] truncate text-sm text-slate-500">{user.email}</span>
            <button className="btn-secondary" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={linkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{user.email}</p>
                <p className="text-xs text-slate-500">{roleLabel[user.role] ?? user.role}</p>
              </div>
              <button className="btn-danger" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
