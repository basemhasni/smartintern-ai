import { CheckCircle2 } from 'lucide-react';

function CareerStrengths({ strengths }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Points forts</p>
      <h2 className="mt-2 text-xl font-black text-ink">Vos points d appui</h2>
      <div className="mt-5 space-y-3">
        {strengths.length ? strengths.map((strength) => (
          <div key={strength} className="flex gap-3 rounded-lg bg-green-50 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" aria-hidden="true" />
            <p className="text-sm font-bold leading-6 text-ink">{strength}</p>
          </div>
        )) : (
          <p className="text-sm leading-6 text-muted">L analyse n a pas identifie de point fort specifique pour cette offre. Verifiez que votre CV contient suffisamment de details.</p>
        )}
      </div>
    </section>
  );
}

export default CareerStrengths;
