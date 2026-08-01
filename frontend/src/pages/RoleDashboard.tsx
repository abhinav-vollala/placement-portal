import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { RecruiterDashboardPage } from './RecruiterDashboardPage';
import { StudentDashboardPage } from './StudentDashboardPage';

// /dashboard dispatches to the right dashboard for the logged-in role.
export function RoleDashboard() {
  const { user } = useAuth();

  if (user?.role === 'STUDENT') {
    return <StudentDashboardPage />;
  }
  if (user?.role === 'RECRUITER') {
    return <RecruiterDashboardPage />;
  }
  return <Navigate to="/admin" replace />;
}
