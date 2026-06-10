import { Home, LayoutDashboard, LogOut, ShieldCheck, Sparkles, UsersRound, Building2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Utilisateurs', to: '/admin/users', icon: UsersRound },
  { label: 'Entreprises', to: '/admin/companies', icon: Building2 },
];

function AdminSidebar({ user, onLogout, onNavigate }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-line bg-[#eef1ff] px-4 py-5 text-ink">
      <NavLink className="flex items-center gap-3 px-1" to="/" onClick={onNavigate}>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white shadow-panel">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-base font-black leading-none text-primary">SmartIntern AI</span>
          <span className="text-[11px] font-bold text-muted">Admin Console</span>
        </span>
      </NavLink>

      <nav className="mt-8 flex-1 space-y-1" aria-label="Navigation administrateur">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
                isActive ? 'bg-white text-primary shadow-panel' : 'text-ink hover:bg-white hover:text-primary'
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
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="truncate text-xs font-black text-ink">{user?.firstName || 'Admin'} {user?.lastName || ''}</p>
          </div>
          <p className="mt-1 truncate text-xs text-muted">{user?.email}</p>
        </div>
        <NavLink
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-ink transition hover:bg-white hover:text-primary"
          to="/"
          onClick={onNavigate}
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Accueil
        </NavLink>
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-ink transition hover:bg-white hover:text-danger"
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

export default AdminSidebar;
