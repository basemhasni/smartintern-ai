import { offerStatusLabels } from '../../../utils/companyDashboard.js';
import { offerStatuses } from '../../../utils/companyOffers.js';

function OfferStatusSelector({ value, error, onChange }) {
  return (
    <div>
      <label className="text-sm font-black text-ink" htmlFor="offer-status-field">Statut</label>
      <select
        id="offer-status-field"
        className="mt-2 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      >
        {offerStatuses.map((status) => (
          <option key={status} value={status}>{offerStatusLabels[status] || status}</option>
        ))}
      </select>
      {error ? <p className="mt-2 text-xs font-bold text-danger">{error}</p> : null}
    </div>
  );
}

export default OfferStatusSelector;
