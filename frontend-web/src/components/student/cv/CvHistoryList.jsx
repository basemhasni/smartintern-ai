import CvHistoryItem from './CvHistoryItem.jsx';

function CvHistoryList({ cvs, selectedCvId, onSelect, onDelete }) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Historique</p>
        <h2 className="mt-2 text-xl font-black text-ink">CV importes</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Le backend utilise le CV analyse le plus recent pour les recommandations et certains workflows IA.
        </p>
      </div>
      <div className="mt-5 space-y-3">
        {cvs.map((cv, index) => (
          <CvHistoryItem
            key={cv.id}
            cv={cv}
            isLatest={index === 0}
            isSelected={cv.id === selectedCvId}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

export default CvHistoryList;
