import AdminEmptyState from './AdminEmptyState.jsx';
import AdminUserCard from './AdminUserCard.jsx';

function AdminUsersList({ users, currentUserId, onChangeStatus }) {
  if (!users.length) {
    return (
      <AdminEmptyState
        title="Aucun utilisateur ne correspond a votre recherche."
        message="Essayez de modifier la recherche, le role ou le statut actif."
      />
    );
  }

  return (
    <section className="grid gap-4" aria-label="Liste des utilisateurs">
      {users.map((user) => (
        <AdminUserCard key={user.id} user={user} currentUserId={currentUserId} onChangeStatus={onChangeStatus} />
      ))}
    </section>
  );
}

export default AdminUsersList;
