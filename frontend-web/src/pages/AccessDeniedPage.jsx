import { Link } from 'react-router-dom';

function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 text-ink">
      <section className="max-w-md rounded-stitch border border-line bg-white p-8 text-center shadow-stitch">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-danger">Acces refuse</p>
        <h1 className="mt-3 text-3xl font-black">Vous n’avez pas acces a cet espace.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Votre role ne permet pas d’ouvrir cette page.</p>
        <Link className="mt-7 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white" to="/dashboard">
          Retour a mon dashboard
        </Link>
      </section>
    </main>
  );
}

export default AccessDeniedPage;
