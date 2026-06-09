import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../auth/ProtectedRoute.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { getDashboardPathByRole } from '../utils/auth.js';
import AccessDeniedPage from '../pages/AccessDeniedPage.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import CompanyLayout from '../components/layout/CompanyLayout.jsx';
import StudentLayout from '../components/layout/StudentLayout.jsx';
import CandidateRankingPlaceholderPage from '../pages/company/CandidateRankingPlaceholderPage.jsx';
import CompanyApplicationsPage from '../pages/company/CompanyApplicationsPage.jsx';
import CompanyDashboardPage from '../pages/company/CompanyDashboardPage.jsx';
import CompanyOfferCreatePage from '../pages/company/CompanyOfferCreatePage.jsx';
import CompanyOfferDetailPage from '../pages/company/CompanyOfferDetailPage.jsx';
import CompanyOfferEditPage from '../pages/company/CompanyOfferEditPage.jsx';
import CompanyOffersPage from '../pages/company/CompanyOffersPage.jsx';
import CompanyProfilePage from '../pages/company/CompanyProfilePage.jsx';
import StudentCareerAssistantPage from '../pages/student/StudentCareerAssistantPage.jsx';
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
          <Route path="career-assistant" element={<StudentCareerAssistantPage />} />
        </Route>
      </Route>
      <Route path="/company" element={<ProtectedRoute allowedRoles={['COMPANY']} />}>
        <Route element={<CompanyLayout />}>
          <Route index element={<Navigate to="/company/dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboardPage />} />
          <Route path="profile" element={<CompanyProfilePage />} />
          <Route path="offers" element={<CompanyOffersPage />} />
          <Route path="offers/new" element={<CompanyOfferCreatePage />} />
          <Route path="offers/:offerId" element={<CompanyOfferDetailPage />} />
          <Route path="offers/:offerId/edit" element={<CompanyOfferEditPage />} />
          <Route path="applications" element={<CompanyApplicationsPage />} />
          <Route path="candidate-ranking" element={<CandidateRankingPlaceholderPage />} />
        </Route>
      </Route>
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
