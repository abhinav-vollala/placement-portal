import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { AdminPage } from './pages/AdminPage';
import { ApplicantsPage } from './pages/ApplicantsPage';
import { DashboardRouter } from './pages/DashboardRouter';
import { LoginPage } from './pages/LoginPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { RecruiterJobsPage } from './pages/RecruiterJobsPage';
import { RegisterPage } from './pages/RegisterPage';
import { RoleDashboard } from './pages/RoleDashboard';
import { StudentJobsPage } from './pages/StudentJobsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';

// Route table. The layout route guards authentication; child routes that also
// pass `allowedRoles` additionally guard by role.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardRouter />} />
        <Route path="/dashboard" element={<RoleDashboard />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <RecruiterJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/applicants"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <ApplicantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
