import { Send } from 'lucide-react';
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
    <section className="rounded-stitch border border-primary/15 bg-white p-5 shadow-panel sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ai">Votre question</p>
          <h2 className="mt-2 text-xl font-black text-ink">Que voulez-vous preparer ?</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Posez une question precise pour obtenir une reponse ciblee. L analyse complete restera disponible separement.</p>
        </div>
        <span className="hidden rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-black text-muted sm:block">Reponse personnalisee</span>
      </div>
      <div className="mt-5">
        <CareerPromptSuggestions onSelect={onQuestionChange} />
      </div>
      <form className="mt-6 border-t border-line pt-5" onSubmit={onSubmit}>
        <label className="text-sm font-black text-ink" htmlFor="career-question">Votre question pour cette offre</label>
        <textarea
          ref={textareaRef}
          id="career-question"
          className="mt-2 min-h-36 w-full resize-y rounded-lg border border-line bg-canvas px-4 py-3 text-sm leading-7 text-ink outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          value={question}
          maxLength={500}
          disabled={isSubmitting}
          placeholder="Exemple : Quelles competences dois-je travailler en priorite pour cette offre ?"
          onChange={(event) => onQuestionChange(event.target.value)}
        />
        <div className="mt-2 flex flex-col gap-2 text-xs font-bold text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{question.trim() ? 'La reponse se concentrera sur cette question.' : 'Sans question, une analyse complete sera generee.'}</p>
          <p>{question.length}/500</p>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-danger" aria-live="polite">{error}</p> : null}
        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          type="submit"
          disabled={!canSubmit}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Generation en cours...' : question.trim() ? 'Obtenir une reponse ciblee' : 'Generer une analyse complete'}
        </button>
      </form>
    </section>
  );
});

export default CareerQuestionForm;
