import CompanyApplicationsEmptyState from './CompanyApplicationsEmptyState.jsx';
import CompanyApplicationCard from './CompanyApplicationCard.jsx';

function CompanyApplicationsList({ applications, hasAnyApplication, selectedOffer, onOpenDetails, onUpdateStatus, onResetFilters }) {
  if (!applications.length) {
    return (
      <CompanyApplicationsEmptyState
        variant={hasAnyApplication ? 'filtered' : 'no-applications'}
        selectedOffer={selectedOffer}
        onReset={onResetFilters}
      />
    );
  }

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {applications.map((application) => (
        <CompanyApplicationCard key={application.id} application={application} onOpenDetails={onOpenDetails} onUpdateStatus={onUpdateStatus} />
      ))}
    </section>
  );
}

export default CompanyApplicationsList;
