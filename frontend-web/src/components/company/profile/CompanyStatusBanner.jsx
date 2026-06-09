import CompanyStatusCard from '../CompanyStatusCard.jsx';

const statusDetails = {
  PENDING: {
    title: 'En attente de validation',
    message: 'Votre profil est enregistre et attend une validation administrative.',
  },
  VALIDATED: {
    title: 'Entreprise validee',
    message: 'Votre entreprise est validee et peut utiliser les fonctionnalites de recrutement disponibles.',
  },
  REJECTED: {
    title: 'Validation refusee',
    message: 'Verifiez les informations de votre entreprise ou contactez l administration pour clarifier la situation.',
  },
  SUSPENDED: {
    title: 'Compte suspendu',
    message: 'Certaines fonctionnalites peuvent etre limitees. Contactez l administration si besoin.',
  },
};

function CompanyStatusBanner({ company }) {
  const detail = statusDetails[company?.status] || {
    title: company?.statusLabel || 'Statut entreprise',
    message: 'Le statut est gere par l administration.',
  };

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Statut</p>
          <h2 className="mt-2 text-xl font-black text-ink">{detail.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{detail.message}</p>
        </div>
        <CompanyStatusCard status={company?.status} label={company?.statusLabel} />
      </div>
      <p className="mt-4 text-xs font-bold text-muted">Ce statut est en lecture seule et ne peut pas etre modifie depuis cette page.</p>
    </section>
  );
}

export default CompanyStatusBanner;
