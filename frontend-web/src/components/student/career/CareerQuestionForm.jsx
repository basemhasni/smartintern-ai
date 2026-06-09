import { forwardRef } from 'react';

import CareerPromptSuggestions from './CareerPromptSuggestions.jsx';

const CareerQuestionForm = forwardRef(function CareerQuestionForm({
  question,
  selectedOfferId,
  isSubmitting,
  error,
  onQuestionChange,
  onSubmit,
}, textareaRef) {
  const canSubmit = Boolean(selectedOfferId) && !isSubmitting;

  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Votre demande</p>
      <h2 className="mt-2 text-xl font-black text-ink">Poser une question carriere</h2>
      <form className="mt-5" onSubmit={onSubmit}>
        <label className="text-sm font-black text-ink" htmlFor="career-question">Question</label>
        <textarea
          ref={textareaRef}
          id="career-question"
          className="mt-2 min-h-32 w-full resize-y rounded-lg border border-line px-4 py-3 text-sm leading-7 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          value={question}
          maxLength={500}
          disabled={isSubmitting}
          placeholder="Exemple : Quelles competences dois-je travailler en priorite pour cette offre ?"
          onChange={(event) => onQuestionChange(event.target.value)}
        />
        <div className="mt-2 flex flex-col gap-2 text-xs font-bold text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Vous pouvez laisser vide pour generer une analyse complete.</p>
          <p>{question.length}/500</p>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-danger" aria-live="polite">{error}</p> : null}
        <button
          className="mt-5 w-full rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Generation en cours...' : question.trim() ? 'Generer mes conseils' : 'Generer une analyse complete'}
        </button>
      </form>
      <div className="mt-6">
        <CareerPromptSuggestions onSelect={onQuestionChange} />
      </div>
    </section>
  );
});

export default CareerQuestionForm;
