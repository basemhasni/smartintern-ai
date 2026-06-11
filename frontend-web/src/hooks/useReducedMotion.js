import { useEffect, useState } from 'react';

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const override = new URLSearchParams(window.location.search).get('motion');
      const forceMotion = override === 'on';
      const forceReduced = override === 'off';
      document.documentElement.dataset.motion = forceMotion ? 'force' : forceReduced ? 'reduce' : 'system';
      setPrefersReducedMotion(forceReduced || (!forceMotion && query.matches));
    };
    update();
    query.addEventListener('change', update);
    window.addEventListener('popstate', update);
    return () => {
      query.removeEventListener('change', update);
      window.removeEventListener('popstate', update);
    };
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
