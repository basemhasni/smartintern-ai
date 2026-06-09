import { promptSuggestions } from '../../../utils/careerAssistant.js';

function CareerPromptSuggestions({ onSelect }) {
  return (
    <div>
      <p className="text-sm font-black text-ink">Questions suggerees</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {promptSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            className="rounded-full border border-line bg-canvas px-3 py-2 text-xs font-bold text-ink transition hover:bg-primarySoft hover:text-primary"
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
