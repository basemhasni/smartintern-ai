import { Link } from 'react-router-dom';

function LoginPage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-10 text-ink">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <section className="w-full rounded-stitch border border-line bg-white p-8 shadow-stitch">
          <p className="text-sm font-semibold text-primary">SmartIntern AI</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Connexion</h1>
          <p className="mt-2 text-sm text-muted">Page placeholder. La connexion backend sera ajoutee ensuite.</p>
          <Link className="mt-8 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white" to="/">
            Retour a la landing page
          </Link>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
