import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext.jsx';
import AppHeader from './AppHeader.jsx';
import AppSidebar from './AppSidebar.jsx';
import MobileSidebar from './MobileSidebar.jsx';

const pageTitles = {
  '/student/dashboard': 'Dashboard',
  '/student/profile': 'Mon profil',
  '/student/cv': 'Mon CV',
  '/student/offers': 'Offres',
  '/student/applications': 'Mes candidatures',
  '/student/career-assistant': 'Assistant carriere',
};

function StudentLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const title = useMemo(() => pageTitles[location.pathname] || 'Espace etudiant', [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AppSidebar user={user} onLogout={logout} />
      </div>
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        user={user}
        onClose={() => setIsMobileSidebarOpen(false)}
        onLogout={logout}
      />
      <div className="lg:pl-64">
        <AppHeader
          firstName={user?.firstName}
          title={title}
          onOpenMenu={() => setIsMobileSidebarOpen(true)}
          onLogout={logout}
        />
        <main className="px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
