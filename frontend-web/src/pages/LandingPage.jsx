import LandingAiArchitecture from '../components/landing/LandingAiArchitecture.jsx';
import LandingFeatures3D from '../components/landing/LandingFeatures3D.jsx';
import LandingFinalCta from '../components/landing/LandingFinalCta.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import LandingHero3D from '../components/landing/LandingHero3D.jsx';
import LandingHowItWorks3D from '../components/landing/LandingHowItWorks3D.jsx';
import LandingImpact from '../components/landing/LandingImpact.jsx';
import LandingJourneys3D from '../components/landing/LandingJourneys3D.jsx';
import LandingNavbar from '../components/landing/LandingNavbar.jsx';
import LandingProblemSolution from '../components/landing/LandingProblemSolution.jsx';
import LandingProductShowcase3D from '../components/landing/LandingProductShowcase3D.jsx';

function LandingPage() {
  return (
    <div className="page-shell min-h-screen overflow-x-hidden text-ink">
      <LandingNavbar />
      <main>
        <LandingHero3D />
        <LandingProblemSolution />
        <LandingFeatures3D />
        <LandingJourneys3D />
        <LandingHowItWorks3D />
        <LandingAiArchitecture />
        <LandingProductShowcase3D />
        <LandingImpact />
        <LandingFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
