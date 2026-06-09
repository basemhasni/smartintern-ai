import CompanyOfferCard from './CompanyOfferCard.jsx';
import CompanyOffersEmptyState from './CompanyOffersEmptyState.jsx';

function CompanyOffersList({ offers, hasAnyOffer, onArchive, onResetFilters }) {
  if (!offers.length) {
    return <CompanyOffersEmptyState filtered={hasAnyOffer} onReset={onResetFilters} />;
  }

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {offers.map((offer) => (
        <CompanyOfferCard key={offer.id} offer={offer} onArchive={onArchive} />
      ))}
    </section>
  );
}

export default CompanyOffersList;
