import AIAgentsSection from '../components/landing/AIAgentsSection.jsx';
import AudiencePaths from '../components/landing/AudiencePaths.jsx';
import FinalCTA from '../components/landing/FinalCTA.jsx';
import HeroSection from '../components/landing/HeroSection.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import LandingNavbar from '../components/landing/LandingNavbar.jsx';
import MatchingDemo from '../components/landing/MatchingDemo.jsx';
import MatchingStory from '../components/landing/MatchingStory.jsx';
import ProductPreview from '../components/landing/ProductPreview.jsx';
import ValueStrip from '../components/landing/ValueStrip.jsx';

function LandingPage() {
  return (
    <div className="page-shell min-h-screen text-ink">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ValueStrip />
        <MatchingStory />
        <AudiencePaths />
        <AIAgentsSection />
        <ProductPreview />
        <MatchingDemo />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
