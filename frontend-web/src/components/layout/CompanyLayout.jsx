import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { getCompanyProfile } from '../../api/companyApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { normalizeCompanyProfile } from '../../utils/companyDashboard.js';
import CompanyHeader from './CompanyHeader.jsx';
import CompanyMobileSidebar from './CompanyMobileSidebar.jsx';
import CompanySidebar from './CompanySidebar.jsx';

const pageTitles = {
  '/company/dashboard': 'Dashboard',
  '/company/profile': 'Profil entreprise',
  '/company/offers': 'Mes offres',
  '/company/applications': 'Candidatures',
  '/company/candidate-ranking': 'Classement IA',
};

function CompanyLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [company, setCompany] = useState(null);
  const title = useMemo(() => pageTitles[location.pathname] || 'Espace entreprise', [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    getCompanyProfile()
      .then((profile) => {
        if (isMounted) {
          setCompany(normalizeCompanyProfile(profile));
        }
      })
      .catch(() => {
        if (isMounted) {
          setCompany(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <CompanySidebar user={user} company={company} onLogout={logout} />
      </div>
      <CompanyMobileSidebar
        isOpen={isMobileSidebarOpen}
        user={user}
        company={company}
        onClose={() => setIsMobileSidebarOpen(false)}
        onLogout={logout}
      />
      <div className="lg:pl-64">
        <CompanyHeader
          title={title}
          user={user}
          company={company}
          onOpenMenu={() => setIsMobileSidebarOpen(true)}
          onLogout={logout}
        />
        <main className="px-4 py-6 md:px-6 lg:px-8">
          <Outlet context={{ companyFromLayout: company }} />
        </main>
      </div>
    </div>
  );
}

export default CompanyLayout;
