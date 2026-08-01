import { Link, Outlet, useNavigate } from 'react-router-dom';
import type { Role } from '../api/auth';
import { useAuth } from '../auth/AuthContext';

const roleLabel: Record<string, string> = {
  STUDENT: 'Student',
  RECRUITER: 'Recruiter',
  ADMIN: 'Admin',
};

// Nav links per role. Add a page by adding one entry here.
const navLinks: Record<Role, { to: string; label: string }[]> = {
  STUDENT: [
    { to: '/jobs', label: 'Jobs' },
    { to: '/applications', label: 'My Applications' },
  ],
  RECRUITER: [{ to: '/my-jobs', label: 'My Jobs' }],
  ADMIN: [{ to: '/admin', label: 'Admin' }],
};

// Shared page shell: navigation bar on top, routed content below.
export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const links = navLinks[user.role] ?? [];

  return (
    <div>
      <header className="navbar">
        <Link to="/" className="navbar-brand">
          Placement Portal
        </Link>
        <nav className="navbar-links">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="navbar-user">
          <span>
            {user.email} ({roleLabel[user.role] ?? user.role})
          </span>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
