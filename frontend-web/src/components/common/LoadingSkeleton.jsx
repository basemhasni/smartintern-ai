function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true" aria-label="Chargement du dashboard">
      <div className="rounded-stitch border border-line bg-white p-6 shadow-panel">
        <div className="h-4 w-32 rounded bg-line" />
        <div className="mt-4 h-8 w-2/3 rounded bg-line" />
        <div className="mt-3 h-4 w-1/2 rounded bg-line" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-stitch border border-line bg-white p-5 shadow-panel">
            <div className="h-3 w-20 rounded bg-line" />
            <div className="mt-5 h-8 w-24 rounded bg-line" />
            <div className="mt-3 h-3 w-28 rounded bg-line" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="h-72 rounded-stitch border border-line bg-white shadow-panel" />
        <div className="h-72 rounded-stitch border border-line bg-white shadow-panel" />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
