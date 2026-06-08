import OfferCard from './OfferCard.jsx';

function OfferList({ offers }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}

export default OfferList;
