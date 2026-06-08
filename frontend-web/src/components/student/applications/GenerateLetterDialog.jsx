const tones = [
  { value: 'PROFESSIONAL', label: 'Professionnel' },
  { value: 'DYNAMIC', label: 'Dynamique' },
  { value: 'SIMPLE', label: 'Simple et direct' },
];

function GenerateLetterDialog({ tone, isGenerating, onToneChange, onGenerate }) {
  return (
    <div className="rounded-stitch border border-dashed border-line bg-canvas p-5">
      <p className="text-sm font-black text-ink">Generation de lettre</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        SmartIntern AI prepare une lettre adaptee a votre profil et a l’offre.
      </p>
      <label className="mt-4 block text-sm font-black text-ink" htmlFor="letter-tone">Ton</label>
      <select
        id="letter-tone"
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-3 text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        value={tone}
        disabled={isGenerating}
        onChange={(event) => onToneChange(event.target.value)}
      >
        {tones.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <button className="mt-4 w-full rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={isGenerating} onClick={onGenerate}>
        {isGenerating ? 'Generation en cours...' : 'Generer une lettre'}
      </button>
    </div>
  );
}

export default GenerateLetterDialog;
