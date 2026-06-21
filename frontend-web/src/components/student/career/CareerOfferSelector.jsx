import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import SkillBadge from '../../common/SkillBadge.jsx';
import ScoreBadge from '../../common/ScoreBadge.jsx';

function CareerOfferSelector({ offers, selectedOfferId, onSelectOffer }) {
  const [query, setQuery] = useState('');
  const filteredOffers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return offers;
    }

    return offers.filter((offer) => [
      offer.title,
      offer.company?.companyName,
      offer.location,
      offer.duration,
    ].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery));
  }, [offers, query]);
  const selectedOffer = offers.find((offer) => String(offer.id) === String(selectedOfferId));

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Offre cible</p>
      <h2 className="mt-2 text-xl font-black text-ink">Choisir l opportunite</h2>
      <div className="relative mt-5">
        <label className="sr-only" htmlFor="career-offer-search">Rechercher une offre</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="career-offer-search"
          className="w-full rounded-lg border border-line bg-canvas py-3 pl-12 pr-4 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          value={query}
          placeholder="Rechercher par titre ou entreprise"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="mt-4 max-h-[300px] space-y-3 overflow-y-auto pr-1">
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
                <div className="min-w-0">
                  <p className="font-black text-ink">{offer.title}</p>
                  <p className="mt-1 text-sm font-bold text-muted">{offer.company?.companyName || 'Entreprise non renseignee'}</p>
                  <p className="mt-1 text-xs font-bold text-muted">{offer.location || 'Lieu non renseigne'} / {offer.duration || 'Duree non renseignee'}</p>
                </div>
                {offer.matching?.score !== undefined ? <ScoreBadge score={offer.matching.score} /> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {offer.isRecommended ? <SkillBadge tone="ai">Recommandee</SkillBadge> : null}
                {isSelected ? <SkillBadge tone="primary">Selectionnee</SkillBadge> : null}
              </div>
            </button>
          );
        })}
      </div>
      {selectedOffer ? (
        <div className="mt-5 rounded-stitch bg-canvas p-4">
          <p className="text-sm font-black text-ink">Offre selectionnee</p>
          <p className="mt-1 text-sm text-muted">{selectedOffer.title} chez {selectedOffer.company?.companyName || 'cette entreprise'}</p>
        </div>
      ) : null}
    </section>
  );
}

export default CareerOfferSelector;
