import { useState } from 'react';

function LandingImage({ src, alt, className = '', imgClassName = '', priority = false }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`grid min-h-48 place-items-center rounded-stitch border border-line bg-canvas text-center text-sm font-bold text-muted ${className}`}>
        Visuel indisponible
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-stitch ${className}`}>
      <img
        className={`h-full w-full object-cover ${imgClassName}`}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : 'auto'}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default LandingImage;
