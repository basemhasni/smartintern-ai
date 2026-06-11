import { useCallback, useState } from 'react';

function useMouseParallax(strength = 1) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const onMouseMove = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setPosition({ x: x * strength, y: y * strength });
  }, [strength]);

  const onMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return {
    position,
    bind: {
      onMouseMove,
      onMouseLeave,
    },
  };
}

export default useMouseParallax;
