import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from '../auth/ProtectedRoute.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { getDashboardPathByRole } from '../utils/auth.js';

const AccessDeniedPage = lazy(() => import('../pages/AccessDeniedPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage.jsx'));
const LandingPage = lazy(() => import('../pages/LandingPage.jsx'));
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx'));
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage.jsx'));
const AdminLayout = lazy(() => import('../components/layout/AdminLayout.jsx'));
const CompanyLayout = lazy(() => import('../components/layout/CompanyLayout.jsx'));
const StudentLayout = lazy(() => import('../components/layout/StudentLayout.jsx'));
const AdminCompaniesPage = lazy(() => import('../pages/admin/AdminCompaniesPage.jsx'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage.jsx'));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage.jsx'));
const CompanyApplicationsPage = lazy(() => import('../pages/company/CompanyApplicationsPage.jsx'));
const CompanyCandidateRankingPage = lazy(() => import('../pages/company/CompanyCandidateRankingPage.jsx'));
const CompanyDashboardPage = lazy(() => import('../pages/company/CompanyDashboardPage.jsx'));
const CompanyOfferCreatePage = lazy(() => import('../pages/company/CompanyOfferCreatePage.jsx'));
const CompanyOfferDetailPage = lazy(() => import('../pages/company/CompanyOfferDetailPage.jsx'));
const CompanyOfferEditPage = lazy(() => import('../pages/company/CompanyOfferEditPage.jsx'));
const CompanyOffersPage = lazy(() => import('../pages/company/CompanyOffersPage.jsx'));
const CompanyProfilePage = lazy(() => import('../pages/company/CompanyProfilePage.jsx'));
const StudentCareerAssistantPage = lazy(() => import('../pages/student/StudentCareerAssistantPage.jsx'));
const StudentCvPage = lazy(() => import('../pages/student/StudentCvPage.jsx'));
const StudentApplicationsPage = lazy(() => import('../pages/student/StudentApplicationsPage.jsx'));
const StudentDashboardPage = lazy(() => import('../pages/student/StudentDashboardPage.jsx'));
const StudentOfferDetailPage = lazy(() => import('../pages/student/StudentOfferDetailPage.jsx'));
const StudentOffersPage = lazy(() => import('../pages/student/StudentOffersPage.jsx'));
const StudentProfilePage = lazy(() => import('../pages/student/StudentProfilePage.jsx'));

function RouteLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas text-ink">
      <p className="rounded-stitch border border-line bg-white px-5 py-4 text-sm font-bold shadow-panel">
        Chargement...
      </p>
    </main>
  );
}

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
    <Suspense fallback={<RouteLoading />}>
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
          <Route path="candidate-ranking" element={<CompanyCandidateRankingPage />} />
        </Route>
      </Route>
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="companies" element={<AdminCompaniesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
