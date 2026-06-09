import { Link } from 'react-router-dom';

import { calculateCompanyProfileCompletion } from '../../utils/companyDashboard.js';
import CompanyStatusCard from './CompanyStatusCard.jsx';

function CompanyProfileSummary({ company }) {
  const completion = calculateCompanyProfileCompletion(company);

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Profil entreprise</p>
          <h2 className="mt-2 text-xl font-black text-ink">{company?.companyName || 'Entreprise a completer'}</h2>
          <p className="mt-2 text-sm font-bold text-muted">{company?.sector || 'Secteur non renseigne'}</p>
        </div>
        <CompanyStatusCard status={company?.status} label={company?.statusLabel} />
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted">
        {company?.description || 'Completez votre profil pour donner plus de contexte aux candidats et a SmartIntern AI.'}
      </p>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-black text-muted">
          <span>Completion estimee</span>
          <span>{completion}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-canvas">
          <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
        </div>
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-canvas p-3">
          <dt className="font-black text-muted">Site web</dt>
          <dd className="mt-1 truncate text-ink">{company?.website || 'Non renseigne'}</dd>
        </div>
        <div className="rounded-lg bg-canvas p-3">
          <dt className="font-black text-muted">Adresse</dt>
          <dd className="mt-1 truncate text-ink">{company?.address || 'Non renseignee'}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs font-bold leading-5 text-muted">
        Ce score de completion est une estimation frontend basee sur les champs principaux du profil.
      </p>
      <Link className="mt-5 inline-flex rounded-lg border border-line bg-white px-4 py-2 text-sm font-black text-ink shadow-panel" to="/company/profile">
        Completer le profil
      </Link>
    </section>
  );
}

export default CompanyProfileSummary;
