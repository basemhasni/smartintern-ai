import { CheckCircle2, Sparkles } from 'lucide-react';

const visualContent = {
  login: {
    image: '/images/auth/login-ai-matching-3d.png',
    alt: 'Illustration 3D du matching intelligent entre un profil et des offres de stage',
    eyebrow: 'Matching intelligent',
    title: 'Retrouvez votre parcours, vos opportunites et vos outils IA.',
    description: 'Votre espace centralise le matching, le suivi des candidatures et les recommandations de carriere.',
    signals: ['Profil securise', 'Matching explicable', 'Suivi centralise'],
  },
  register: {
    image: '/images/auth/register-onboarding-3d.png',
    alt: 'Illustration 3D de creation de profil, analyse de CV et recommandations de stages',
    eyebrow: 'Votre parcours commence ici',
    title: 'Construisez un profil qui relie vos competences aux bonnes opportunites.',
    description: 'Creez votre espace, structurez votre profil et laissez SmartIntern AI transformer vos signaux en correspondances utiles.',
    signals: ['Profil intelligent', 'Analyse CV', 'Opportunites ciblees'],
  },
};

function AuthVisualPanel({ variant = 'login', compact = false }) {
  const content = visualContent[variant] || visualContent.login;

  if (compact) {
    return (
      <div className="auth-mobile-visual relative hidden overflow-hidden rounded-stitch border border-white/80 bg-[#eef4ff] p-2 shadow-panel sm:block lg:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(109,54,232,0.16),transparent_34%),radial-gradient(circle_at_15%_80%,rgba(35,185,214,0.18),transparent_38%)]" aria-hidden="true" />
        <img className="relative h-40 w-full rounded-lg object-cover object-center" src={content.image} alt={content.alt} loading="eager" decoding="async" />
      </div>
    );
  }

  return (
    <aside className="auth-visual-panel relative hidden min-h-screen overflow-hidden border-r border-white/80 bg-[#edf3ff] px-8 py-8 lg:flex lg:flex-col xl:px-12 xl:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(15,91,215,0.15),transparent_27%),radial-gradient(circle_at_86%_20%,rgba(109,54,232,0.16),transparent_30%),radial-gradient(circle_at_45%_88%,rgba(35,185,214,0.16),transparent_32%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 opacity-30 soft-grid" aria-hidden="true" />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-panel">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-black text-primary">SmartIntern AI</p>
            <p className="text-[11px] font-semibold text-muted">AI-powered Career Hub</p>
          </div>
        </div>

        <div className="mt-8 max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">{content.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-ink xl:text-4xl">{content.title}</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted">{content.description}</p>
        </div>
      </div>

      <div className="relative z-10 my-auto py-6">
        <div className="auth-illustration-shell relative mx-auto w-full max-w-[760px]">
          <div className="absolute inset-[8%] rounded-[38px] bg-white/80 shadow-[0_30px_100px_rgba(31,38,76,0.16)] blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[24px] border border-white/90 bg-white/50 p-2 shadow-[0_28px_80px_rgba(31,38,76,0.14)] backdrop-blur-sm">
            <img className="auth-illustration h-auto w-full rounded-[18px] object-contain" src={content.image} alt={content.alt} loading="eager" decoding="async" />
            <div className="pointer-events-none absolute inset-2 rounded-[18px] ring-1 ring-inset ring-white/50" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/80 pt-5">
        {content.signals.map((signal) => (
          <span key={signal} className="inline-flex items-center gap-2 text-xs font-bold text-muted">
            <CheckCircle2 className="h-4 w-4 text-cyan-600" aria-hidden="true" />
            {signal}
          </span>
        ))}
      </div>
    </aside>
  );
}

export default AuthVisualPanel;
