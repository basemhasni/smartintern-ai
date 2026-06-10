import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext.jsx';
import AdminHeader from './AdminHeader.jsx';
import AdminMobileSidebar from './AdminMobileSidebar.jsx';
import AdminSidebar from './AdminSidebar.jsx';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Utilisateurs',
  '/admin/companies': 'Entreprises',
};

function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const title = useMemo(() => pageTitles[location.pathname] || 'Administration', [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AdminSidebar user={user} onLogout={logout} />
      </div>
      <AdminMobileSidebar isOpen={isMobileSidebarOpen} user={user} onClose={() => setIsMobileSidebarOpen(false)} onLogout={logout} />
      <div className="lg:pl-64">
        <AdminHeader title={title} user={user} onOpenMenu={() => setIsMobileSidebarOpen(true)} onLogout={logout} />
        <main className="px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
