import { BarChart3, BriefcaseBusiness, Building2, FileStack, LayoutDashboard, LogOut, PlusCircle, Sparkles, Trophy } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/company/dashboard', icon: LayoutDashboard },
  { label: 'Profil entreprise', to: '/company/profile', icon: Building2 },
  { label: 'Mes offres', to: '/company/offers', icon: BriefcaseBusiness },
  { label: 'Candidatures', to: '/company/applications', icon: FileStack },
  { label: 'Classement IA', to: '/company/candidate-ranking', icon: Trophy },
];

function CompanySidebar({ user, company, onLogout, onNavigate }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-line bg-[#eef1ff] px-4 py-5 text-ink">
      <NavLink className="flex items-center gap-3 px-1" to="/" onClick={onNavigate}>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white shadow-panel">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-base font-black leading-none text-primary">SmartIntern AI</span>
          <span className="text-[11px] font-bold text-muted">Recruitment Hub</span>
        </span>
      </NavLink>

      <NavLink
        className="mt-6 flex items-center gap-3 rounded-lg bg-primary px-3 py-3 text-sm font-black text-white shadow-panel"
        to="/company/offers"
        onClick={onNavigate}
      >
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
        Creer une offre
      </NavLink>

      <nav className="mt-6 flex-1 space-y-1" aria-label="Navigation entreprise">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
                isActive
                  ? 'bg-white text-primary shadow-panel'
                  : 'text-ink hover:bg-white hover:text-primary'
              }`}
              to={item.to}
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-line pt-4">
        <div className="rounded-stitch bg-white p-3 shadow-panel">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="truncate text-xs font-black text-ink">{company?.companyName || 'Entreprise'}</p>
          </div>
          <p className="mt-1 truncate text-xs text-muted">{user?.email}</p>
        </div>
        <button
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-ink transition hover:bg-white hover:text-danger"
          type="button"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Se deconnecter
        </button>
      </div>
    </aside>
  );
}

export default CompanySidebar;
