import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from './AuthContext.jsx';

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 text-ink">
      <div className="rounded-stitch border border-line bg-white p-6 text-center shadow-stitch">
        <p className="text-sm font-bold text-primary">SmartIntern AI</p>
        <p className="mt-2 text-sm text-muted">Verification de votre session...</p>
      </div>
    </main>
  );
}

function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
