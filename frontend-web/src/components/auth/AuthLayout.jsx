import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import AuthVisualPanel from './AuthVisualPanel.jsx';

function AuthLayout({ children, subtitle, title }) {
  return (
    <main className="grid min-h-screen bg-white text-ink lg:grid-cols-[0.95fr_1.05fr]">
      <AuthVisualPanel />
      <section className="flex min-h-screen items-center px-5 py-8 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-[430px]">
          <Link className="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-muted transition hover:text-primary" to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Retour a l’accueil
          </Link>

          <div className="mt-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-black text-primary">SmartIntern AI</p>
              <p className="text-[11px] font-semibold text-muted">AI-powered Career Hub</p>
            </div>
          </div>

          <header className="mt-10">
            <h1 className="text-4xl font-black tracking-tight text-ink">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>
          </header>

          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
