import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatOfferDate } from '../../../utils/companyOffers.js';
import CompanyStatusCard from '../CompanyStatusCard.jsx';

function RankingOfferSelector({ offers, selectedOfferId, onSelectOffer }) {
  const [query, setQuery] = useState('');
  const filteredOffers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return offers;
    return offers.filter((offer) => [offer.title, offer.location, offer.statusLabel].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery));
  }, [offers, query]);

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Offre analysee</p>
      <h2 className="mt-2 text-xl font-black text-ink">Selectionner une offre</h2>
      <div className="relative mt-5">
        <label className="sr-only" htmlFor="ranking-offer-search">Rechercher une offre</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="ranking-offer-search"
          className="w-full rounded-lg border border-line bg-canvas py-3 pl-11 pr-4 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          value={query}
          placeholder="Rechercher une offre"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="mt-4 max-h-[470px] space-y-3 overflow-y-auto pr-1">
        {filteredOffers.map((offer) => {
          const isSelected = String(offer.id) === String(selectedOfferId);
          return (
            <button
              key={offer.id}
              className={`w-full rounded-stitch border p-4 text-left transition hover:-translate-y-0.5 ${isSelected ? 'border-primary bg-primarySoft' : 'border-line bg-white hover:border-primary/40'}`}
              type="button"
              onClick={() => onSelectOffer(offer.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-ink">{offer.title}</p>
                  <p className="mt-1 text-xs font-bold text-muted">{offer.location || 'Lieu non renseigne'} / {offer.duration || 'Duree non renseignee'}</p>
                  <p className="mt-2 text-xs font-bold text-muted">Mise a jour : {formatOfferDate(offer.updatedAt || offer.createdAt)}</p>
                </div>
                <CompanyStatusCard status={offer.status} label={offer.statusLabel} />
              </div>
              {Number.isFinite(Number(offer.applicationsCount)) ? (
                <p className="mt-3 text-xs font-black text-primary">{offer.applicationsCount} candidature(s)</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default RankingOfferSelector;
