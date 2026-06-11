import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function MagneticButton({ children, to, href, variant = 'primary', className = '' }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const Component = to ? Link : 'a';
  const props = to ? { to } : { href };
  const variants = {
    primary: 'bg-primary text-white shadow-panel hover:bg-[#0b4fc4]',
    light: 'border border-line bg-white text-ink shadow-panel hover:border-primary',
    ghost: 'border border-white/30 text-white hover:bg-white/10',
  };

  const handleMove = (event) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setOffset({
      x: (event.clientX - rect.left - rect.width / 2) * 0.12,
      y: (event.clientY - rect.top - rect.height / 2) * 0.12,
    });
  };

  return (
    <Component
      ref={ref}
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${variants[variant]} ${className}`}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      onMouseMove={handleMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </Component>
  );
}

export default MagneticButton;
