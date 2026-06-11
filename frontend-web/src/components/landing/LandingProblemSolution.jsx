import { CheckCircle2, TriangleAlert } from 'lucide-react';

import { landingImages, problemPoints, solutionPoints } from '../../data/landingData.js';
import AnimatedReveal from './AnimatedReveal.jsx';
import LandingImage from './LandingImage.jsx';
import LandingSection from './LandingSection.jsx';

function PointList({ title, points, icon: Icon, tone }) {
  return (
    <div className="kinetic-panel rounded-[28px] border border-line bg-white p-6 shadow-panel">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone === 'solution' ? 'bg-green-50 text-success' : 'bg-amber-50 text-amber-700'}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="text-xl font-black text-ink">{title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex gap-3 text-sm leading-6 text-muted">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LandingProblemSolution() {
  return (
    <LandingSection
      id="problem"
      eyebrow="Probleme / solution"
      title="Moins de candidatures au hasard. Plus de correspondances utiles."
      subtitle="SmartIntern AI rend lisible ce qui compte vraiment : competences, contexte de l offre et pistes d amelioration."
      className="bg-canvas"
    >
      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr_1fr] lg:items-center">
        <AnimatedReveal direction="right">
          <PointList title="Sans contexte clair" points={problemPoints} icon={TriangleAlert} />
        </AnimatedReveal>
        <AnimatedReveal delay={120} className="problem-core-3d relative">
          <div className="problem-energy-ring" aria-hidden="true" />
          <LandingImage
            src={landingImages.problemSolution}
            alt="Illustration montrant le passage d une candidature dispersive vers une correspondance utile"
            className="aspect-square rounded-[28px] border border-white bg-white p-2 shadow-stitch"
            imgClassName="rounded-[22px]"
          />
        </AnimatedReveal>
        <AnimatedReveal direction="left" delay={200}>
          <PointList title="Avec SmartIntern AI" points={solutionPoints} icon={CheckCircle2} tone="solution" />
        </AnimatedReveal>
      </div>
    </LandingSection>
  );
}

export default LandingProblemSolution;
