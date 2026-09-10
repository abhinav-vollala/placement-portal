import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { AdminPage } from './pages/AdminPage';
import { ApplicantDetailPage } from './pages/ApplicantDetailPage';
import { DashboardRouter } from './pages/DashboardRouter';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { RecruiterAllJobsPage } from './pages/RecruiterAllJobsPage';
import { RecruiterApplicantsPage } from './pages/RecruiterApplicantsPage';
import { RecruiterJobsPage } from './pages/RecruiterJobsPage';
import { RecruiterShortlistedPage } from './pages/RecruiterShortlistedPage';
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
          path="/my-jobs/all"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <RecruiterAllJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs/applicants"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <RecruiterApplicantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs/applicants/:applicationId"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <ApplicantDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs/shortlisted"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <RecruiterShortlistedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/applicants"
          element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <RecruiterApplicantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetailsPage />
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
