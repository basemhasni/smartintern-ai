import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../auth/ProtectedRoute.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { getDashboardPathByRole } from '../utils/auth.js';
import AccessDeniedPage from '../pages/AccessDeniedPage.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import CompanyDashboard from '../pages/CompanyDashboard.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import StudentDashboard from '../pages/StudentDashboard.jsx';

function DashboardRedirect() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas text-ink">
        <p className="rounded-stitch border border-line bg-white px-5 py-4 text-sm font-bold shadow-panel">
          Verification de votre session...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPathByRole(role)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route
        path="/student/dashboard"
        element={(
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/company/dashboard"
        element={(
          <ProtectedRoute allowedRoles={['COMPANY']}>
            <CompanyDashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/dashboard"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
