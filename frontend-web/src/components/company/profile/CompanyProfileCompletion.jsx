import { calculateCompanyProfileCompletion } from '../../../utils/companyDashboard.js';

const fields = [
  ['companyName', 'Nom entreprise'],
  ['sector', 'Secteur'],
  ['description', 'Description'],
  ['website', 'Site web'],
  ['address', 'Adresse'],
];

function CompanyProfileCompletion({ company }) {
  const completion = calculateCompanyProfileCompletion(company);
  const completed = fields.filter(([field]) => String(company?.[field] || '').trim());
  const missing = fields.filter(([field]) => !String(company?.[field] || '').trim());

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Completion</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <h2 className="text-xl font-black text-ink">Profil complete a {completion}%</h2>
        <span className="text-sm font-black text-primary">{completion}%</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-canvas" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={completion}>
        <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">Completes</p>
          <ul className="mt-2 space-y-1 text-sm font-bold text-ink">
            {completed.length ? completed.map(([, label]) => <li key={label}>{label}</li>) : <li>Aucun champ complete</li>}
          </ul>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">A completer</p>
          <ul className="mt-2 space-y-1 text-sm font-bold text-muted">
            {missing.length ? missing.map(([, label]) => <li key={label}>{label}</li>) : <li>Tous les champs principaux sont renseignes</li>}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-xs font-bold leading-5 text-muted">Ce score est une estimation frontend basee sur 5 champs principaux. Le statut n est pas inclus.</p>
    </section>
  );
}

export default CompanyProfileCompletion;
