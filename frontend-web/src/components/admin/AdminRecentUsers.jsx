import { Link } from 'react-router-dom';

import { formatAdminDate } from '../../utils/admin.js';
import AdminStatusBadge from './AdminStatusBadge.jsx';

function AdminRecentUsers({ users }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Elements recemment crees</p>
          <h2 className="mt-2 text-lg font-black text-ink">Utilisateurs recents</h2>
        </div>
        <Link className="text-sm font-black text-primary" to="/admin/users">Voir tout</Link>
      </div>
      <div className="mt-4 space-y-3">
        {users.length ? users.map((user) => (
          <article key={user.id} className="rounded-lg bg-canvas p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-ink">{user.firstName} {user.lastName}</p>
                <p className="mt-1 text-xs font-bold text-muted">{user.email}</p>
              </div>
              <AdminStatusBadge tone="primary">{user.roleLabel}</AdminStatusBadge>
            </div>
            <p className="mt-2 text-xs font-bold text-muted">{formatAdminDate(user.createdAt)}</p>
          </article>
        )) : <p className="text-sm font-bold text-muted">Aucun utilisateur recent.</p>}
      </div>
    </section>
  );
}

export default AdminRecentUsers;
