import type { AISuggestion } from "../../../shared/contracts";

export function AISuggestionList({ suggestions }: { suggestions: AISuggestion[] }) {
  if (!suggestions.length) return null;
  return (
    <section className="ai-suggestions" aria-labelledby="ai-suggestions-title">
      <div className="section-heading"><div><p className="eyebrow">READY TO ADD</p><h2 id="ai-suggestions-title">候选待办</h2></div><span>{suggestions[0]?.context}</span></div>
      <ul>
        {suggestions.map((suggestion) => (
          <li key={`${suggestion.context}-${suggestion.title}`} data-testid="ai-suggestion">
            <div><strong>{suggestion.title}</strong><span>{suggestion.category}</span></div>
            {suggestion.note ? <p>{suggestion.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
