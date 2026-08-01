import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Landing page: send each role to its own dashboard.
export function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const target = user.role === 'STUDENT' ? '/jobs' : user.role === 'RECRUITER' ? '/my-jobs' : '/admin';
  return <Navigate to={target} replace />;
}
