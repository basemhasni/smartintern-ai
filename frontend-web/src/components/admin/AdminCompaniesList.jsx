import AdminCompanyCard from './AdminCompanyCard.jsx';
import AdminEmptyState from './AdminEmptyState.jsx';

function AdminCompaniesList({ companies, onChangeStatus }) {
  if (!companies.length) {
    return (
      <AdminEmptyState
        title="Aucune entreprise ne correspond aux filtres selectionnes."
        message="Essayez une autre recherche ou un autre statut."
      />
    );
  }

  return (
    <section className="grid gap-4" aria-label="Liste des entreprises">
      {companies.map((company) => (
        <AdminCompanyCard key={company.id} company={company} onChangeStatus={onChangeStatus} />
      ))}
    </section>
  );
}

export default AdminCompaniesList;
