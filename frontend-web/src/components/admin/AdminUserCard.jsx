import { formatAdminDate } from '../../utils/admin.js';
import AdminStatusBadge from './AdminStatusBadge.jsx';

function AdminUserCard({ user, currentUserId, onChangeStatus }) {
  const isSelf = user.id === currentUserId;

  return (
    <article className="rounded-stitch border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-black text-ink">{user.firstName || 'Utilisateur'} {user.lastName}</h3>
          <p className="mt-1 break-all text-sm font-bold text-muted">{user.email}</p>
          <p className="mt-2 text-xs font-bold text-muted">Cree le {formatAdminDate(user.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminStatusBadge tone="primary">{user.roleLabel}</AdminStatusBadge>
          <AdminStatusBadge tone={user.isActive ? 'active' : 'inactive'}>{user.statusLabel}</AdminStatusBadge>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink shadow-panel disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={isSelf && user.isActive}
          onClick={() => onChangeStatus(user)}
        >
          {user.isActive ? 'Desactiver' : 'Reactiver'}
        </button>
        {isSelf ? <span className="text-xs font-bold leading-10 text-muted">Compte administrateur connecte</span> : null}
      </div>
    </article>
  );
}

export default AdminUserCard;
