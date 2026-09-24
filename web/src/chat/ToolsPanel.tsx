import { Labelled } from '../components/Field.tsx';

export function ToolsPanel({
  source,
  choice,
  error,
  onSource,
  onChoice,
}: {
  source: string;
  choice: 'auto' | 'none' | 'required';
  error: string | null;
  onSource: (value: string) => void;
  onChoice: (value: 'auto' | 'none' | 'required') => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Labelled label="tool_choice">
        <select className="field w-40" value={choice} onChange={(event) => onChoice(event.target.value as typeof choice)}>
          <option value="auto">auto</option>
          <option value="required">required</option>
          <option value="none">none</option>
        </select>
      </Labelled>
      <Labelled label="tools · JSON array">
        <textarea
          className="field code scroll-thin min-h-40 resize-y"
          spellCheck={false}
          value={source}
          onChange={(event) => onSource(event.target.value)}
        />
      </Labelled>
      <p className="micro-label">LewLM compiles these definitions and validates returned calls; Chap does no tool-call parsing.</p>
      {error && <p className="numeric" style={{ color: 'var(--skin-danger)' }}>{error} — Send is disabled</p>}
    </div>
  );
}
