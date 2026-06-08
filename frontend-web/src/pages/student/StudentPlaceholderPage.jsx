import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function StudentPlaceholderPage({ eyebrow, title, description }) {
  return (
    <section className="mx-auto max-w-4xl rounded-stitch border border-line bg-white p-8 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-black text-ink">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{description}</p>
      <div className="mt-8 rounded-stitch border border-dashed border-line bg-canvas p-6">
        <p className="text-sm font-bold text-ink">
          Cette page est preparee dans la navigation. Sa logique metier complete sera connectee dans une prochaine etape.
        </p>
      </div>
      <Link className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel" to="/student/dashboard">
        Retour au dashboard
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

export default StudentPlaceholderPage;
