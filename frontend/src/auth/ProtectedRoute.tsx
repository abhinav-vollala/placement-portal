import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '../api/auth';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

// Wraps routes that require a logged-in user (and optionally specific roles).
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading…</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
