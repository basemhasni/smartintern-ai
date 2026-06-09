import CompanyStatusCard from '../CompanyStatusCard.jsx';
import CompanyProfileCompletion from './CompanyProfileCompletion.jsx';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SI';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
};

function CompanyIdentityCard({ company }) {
  const user = company?.user || {};
  const website = company?.website && /^https?:\/\//i.test(company.website) ? company.website : '';

  return (
    <div className="space-y-5">
      <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-black text-white shadow-panel">
            {getInitials(company?.companyName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Identite</p>
            <h2 className="mt-2 truncate text-xl font-black text-ink">{company?.companyName || 'Entreprise a completer'}</h2>
            <p className="mt-1 text-sm font-bold text-muted">{company?.sector || 'Secteur non renseigne'}</p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="rounded-lg bg-canvas p-3">
            <dt className="font-black text-muted">Adresse</dt>
            <dd className="mt-1 text-ink">{company?.address || 'Non renseignee'}</dd>
          </div>
          {website ? (
            <div className="rounded-lg bg-canvas p-3">
              <dt className="font-black text-muted">Site web</dt>
              <dd className="mt-1">
                <a className="font-bold text-primary hover:underline" href={website} target="_blank" rel="noopener noreferrer">
                  Ouvrir le site
                </a>
              </dd>
            </div>
          ) : null}
          <div className="rounded-lg bg-canvas p-3">
            <dt className="font-black text-muted">Compte recruteur</dt>
            <dd className="mt-1 text-ink">{user.firstName || ''} {user.lastName || ''}</dd>
            <dd className="mt-1 truncate text-muted">{user.email || 'Email non renseigne'}</dd>
          </div>
          <div className="rounded-lg bg-canvas p-3">
            <dt className="font-black text-muted">Role et statut</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-line bg-white px-2.5 py-1 text-xs font-black text-muted">{user.role || 'COMPANY'}</span>
              <CompanyStatusCard status={company?.status} label={company?.statusLabel} />
            </dd>
          </div>
        </dl>
      </section>
      <CompanyProfileCompletion company={company} />
    </div>
  );
}

export default CompanyIdentityCard;
