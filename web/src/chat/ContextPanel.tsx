/**
 * The citation-context builder.
 *
 * LewLM's grounding contract is caller-supplied: you hand it chunks, it grounds
 * the answer in them and returns `citations[]` resolving back to the ids you
 * gave. There is no vector store in LewLM by design, so this panel is the
 * smallest honest way to exercise the contract — paste a passage, ask about it,
 * watch the citation come back pointing at it.
 *
 * M9 replaces the paste box with retrieval from Chap's own store. The request
 * shape does not change, which is why this is worth building now.
 */

import type { ContextSource } from './request.ts';

interface Props {
  sources: ContextSource[];
  onChange: (next: ContextSource[]) => void;
}

export function ContextPanel({ sources, onChange }: Props) {
  const update = (index: number, change: Partial<ContextSource>) =>
    onChange(sources.map((source, at) => (at === index ? { ...source, ...change } : source)));

  return (
    <div className="flex flex-col gap-3">
      {sources.length === 0 && (
        <p className="micro-label">
          no context — the model answers from its weights alone and cites nothing
        </p>
      )}

      {sources.map((source, index) => (
        <div key={index} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="numeric" style={{ color: 'var(--skin-faint)' }}>
              chap-{index}
            </span>
            <input
              className="field flex-1"
              value={source.label}
              placeholder={`source ${index + 1}`}
              onChange={(event) => update(index, { label: event.target.value })}
            />
            <button
              type="button"
              className="chip"
              onClick={() => onChange(sources.filter((_, at) => at !== index))}
            >
              remove
            </button>
          </div>
          <textarea
            className="field scroll-thin min-h-20 resize-y"
            value={source.text}
            placeholder="Paste a passage the model may cite."
            onChange={(event) => update(index, { text: event.target.value })}
          />
        </div>
      ))}

      <div>
        <button
          type="button"
          className="btn"
          onClick={() => onChange([...sources, { label: '', text: '' }])}
        >
          add source
        </button>
      </div>
    </div>
  );
}
