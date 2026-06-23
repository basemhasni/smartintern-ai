import { Link } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext.jsx';

function StudentDashboard() {
  const { logout, user } = useAuth();

  return (
    <main className="min-h-screen bg-canvas p-6 text-ink">
      <section className="mx-auto max-w-5xl rounded-stitch border border-line bg-white p-8 shadow-stitch">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ai">Dashboard etudiant</p>
            <h1 className="mt-2 text-3xl font-black">Bonjour {user?.firstName || 'etudiant'}</h1>
            <p className="mt-2 text-sm text-muted">Vos recommandations et outils IA seront connectes dans les prochaines etapes.</p>
          </div>
          <button className="rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink" type="button" onClick={logout}>
            Se deconnecter
          </button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Profil complete', '80%'],
            ['Offres recommandees', '3'],
            ['Score exemple', '87%'],
          ].map(([label, value]) => (
            <article key={label} className="rounded-stitch border border-line bg-canvas p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
              <p className="mt-3 text-3xl font-black text-ink">{value}</p>
            </article>
          ))}
        </div>
        <Link className="mt-8 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white" to="/">
          Retour landing
        </Link>
      </section>
    </main>
  );
}

export default StudentDashboard;
