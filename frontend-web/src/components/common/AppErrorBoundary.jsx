import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('Unexpected render error', error, info);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-canvas px-4 text-ink">
        <section className="w-full max-w-xl rounded-stitch border border-line bg-white p-7 text-center shadow-panel" role="alert">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-danger">Erreur inattendue</p>
          <h1 className="mt-3 text-2xl font-black">Cette page n a pas pu etre affichee.</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Vos donnees ne sont pas perdues. Rechargez la page ou revenez au tableau de bord.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white" type="button" onClick={() => window.location.reload()}>
              Reessayer
            </button>
            <a className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink" href="/dashboard">
              Retour au tableau de bord
            </a>
          </div>
        </section>
      </main>
    );
  }
}

export default AppErrorBoundary;
