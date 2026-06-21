import { promptSuggestions } from '../../../utils/careerAssistant.js';

function CareerPromptSuggestions({ onSelect }) {
  return (
    <div>
      <p className="text-sm font-black text-ink">Questions suggerees</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {promptSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            className="rounded-lg border border-line bg-canvas px-3 py-2 text-left text-xs font-bold leading-5 text-ink transition hover:border-primary/40 hover:bg-primarySoft hover:text-primary focus-visible:ring-4 focus-visible:ring-primary/15"
            type="button"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CareerPromptSuggestions;
