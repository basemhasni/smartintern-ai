import { useEffect, useMemo, useState } from 'react';

function MotivationLetterEditor({ letter, isSaving, onSave }) {
  const [content, setContent] = useState(letter?.content || '');

  useEffect(() => {
    setContent(letter?.content || '');
  }, [letter]);

  const isDirty = useMemo(() => content !== (letter?.content || ''), [content, letter?.content]);
  const isInvalid = content.trim().length === 0;

  return (
    <div>
      <label className="text-sm font-black text-ink" htmlFor="motivation-letter-content">Contenu de la lettre</label>
      <textarea
        id="motivation-letter-content"
        className="mt-2 min-h-80 w-full resize-y rounded-lg border border-line px-4 py-3 text-sm leading-7 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        value={content}
        disabled={isSaving}
        aria-invalid={isInvalid}
        onChange={(event) => setContent(event.target.value)}
      />
      <div className="mt-2 flex flex-col gap-2 text-xs font-bold text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{content.length} caracteres</p>
        {isDirty ? <p className="text-amber-700">Modifications non enregistrees</p> : null}
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={!isDirty || isInvalid || isSaving}
          onClick={() => onSave(content.trim())}
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {isDirty ? (
          <button className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel" type="button" disabled={isSaving} onClick={() => setContent(letter?.content || '')}>
            Annuler les modifications
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default MotivationLetterEditor;
