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
import StudentLayout from '../components/layout/StudentLayout.jsx';
import CareerAssistantPlaceholderPage from '../pages/student/CareerAssistantPlaceholderPage.jsx';
import StudentCvPage from '../pages/student/StudentCvPage.jsx';
import StudentApplicationsPage from '../pages/student/StudentApplicationsPage.jsx';
import StudentDashboardPage from '../pages/student/StudentDashboardPage.jsx';
import StudentOfferDetailPage from '../pages/student/StudentOfferDetailPage.jsx';
import StudentOffersPage from '../pages/student/StudentOffersPage.jsx';
import StudentProfilePage from '../pages/student/StudentProfilePage.jsx';

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
      <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="cv" element={<StudentCvPage />} />
          <Route path="offers" element={<StudentOffersPage />} />
          <Route path="offers/:offerId" element={<StudentOfferDetailPage />} />
          <Route path="applications" element={<StudentApplicationsPage />} />
          <Route path="career-assistant" element={<CareerAssistantPlaceholderPage />} />
        </Route>
      </Route>
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
