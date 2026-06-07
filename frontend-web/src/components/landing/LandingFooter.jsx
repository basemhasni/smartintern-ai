function LandingFooter() {
  return (
    <footer className="border-t border-line bg-white py-10">
      <div className="stitch-container flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-black text-primary">SmartIntern AI</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
            Plateforme PFE pour le matching de stages, l’analyse CV et l’aide a la decision.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm font-semibold text-muted sm:grid-cols-4" aria-label="Liens footer">
          <a href="#fonctionnement">Produit</a>
          <a href="#parcours">Etudiants</a>
          <a href="#parcours">Entreprises</a>
          <a href="#ia">Intelligence artificielle</a>
          <a href="/">Confidentialite</a>
          <a href="/">Contact</a>
          <a href="/">GitHub placeholder</a>
          <a href="/">Documentation placeholder</a>
        </nav>
      </div>
    </footer>
  );
}

export default LandingFooter;
