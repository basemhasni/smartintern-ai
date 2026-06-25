import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import AuthVisualPanel from './AuthVisualPanel.jsx';

function AuthLayout({ children, subtitle, title, variant = 'login' }) {
  return (
    <main className="grid min-h-screen bg-white text-ink lg:grid-cols-[minmax(0,1.18fr)_minmax(440px,0.82fr)]">
      <AuthVisualPanel variant={variant} />
      <section className="relative flex min-h-screen items-center overflow-hidden px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
        <div className="pointer-events-none absolute right-[-120px] top-[-100px] h-72 w-72 rounded-full bg-aiSoft/60 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-[-140px] left-[-100px] h-72 w-72 rounded-full bg-cyanSoft/70 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[460px]">
          <Link className="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-muted transition hover:text-primary" to="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Retour a l’accueil
          </Link>

          <div className="mt-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-panel">
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-black text-primary">SmartIntern AI</p>
              <p className="text-[11px] font-semibold text-muted">AI-powered Career Hub</p>
            </div>
          </div>

          <div className="mt-6">
            <AuthVisualPanel variant={variant} compact />
          </div>

          <header className="mt-8 lg:mt-10">
            <h1 className="text-3xl font-black text-ink sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">{subtitle}</p>
          </header>

          <div className="mt-7 rounded-stitch border border-line/80 bg-white/90 p-5 shadow-stitch backdrop-blur-sm sm:p-6">{children}</div>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
