/**
 * Output contract: free text, a JSON Schema, or a grammar.
 *
 * Whether the contract is enforced at decode time or merely described in the
 * prompt depends on the runtime — and LewLM now says which *before* the run, per
 * contract mode, in the same shape the response carries. So this panel predicts,
 * the run inspector reports, and the two are directly comparable.
 */

import { Labelled } from '../components/Field.tsx';
import type { StructuredSupport } from '../lib/useStructuredSupport.ts';
import type { FormatMode, FormatState } from './request.ts';

const MODES: { value: FormatMode; label: string }[] = [
  { value: 'text', label: 'text' },
  { value: 'json_schema', label: 'json_schema' },
  { value: 'grammar', label: 'grammar' },
];

interface Props {
  value: FormatState;
  onChange: (next: FormatState) => void;
  error: string | null;
  /** From the selected model's capability report. Null while unknown. */
  support: StructuredSupport | null;
}

export function FormatPanel({ value, onChange, error, support }: Props) {
  const predicted = value.mode === 'text' ? null : support?.[value.mode] ?? null;
  const set = (change: Partial<FormatState>) => onChange({ ...value, ...change });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Labelled label="response_format">
          <select
            className="field"
            value={value.mode}
            onChange={(event) => set({ mode: event.target.value as FormatMode })}
          >
            {MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </Labelled>

        {value.mode !== 'text' && (
          <>
            <Labelled label="name">
              <input
                className="field w-40"
                value={value.name}
                onChange={(event) => set({ name: event.target.value })}
              />
            </Labelled>

            {value.mode === 'grammar' && (
              <Labelled label="syntax">
                <input
                  className="field w-24"
                  value={value.syntax}
                  onChange={(event) => set({ syntax: event.target.value })}
                />
              </Labelled>
            )}

            <label className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={value.strict}
                onChange={(event) => set({ strict: event.target.checked })}
              />
              <span className="micro-label">strict</span>
            </label>
          </>
        )}
      </div>

      {value.mode === 'json_schema' && (
        <textarea
          className="field code scroll-thin min-h-40 resize-y"
          spellCheck={false}
          value={value.schemaText}
          onChange={(event) => set({ schemaText: event.target.value })}
        />
      )}

      {value.mode === 'grammar' && (
        <textarea
          className="field code scroll-thin min-h-24 resize-y"
          spellCheck={false}
          value={value.grammarText}
          onChange={(event) => set({ grammarText: event.target.value })}
        />
      )}

      {/*
       * The prediction. `decode_time` means the runtime cannot emit invalid
       * output; `prompt_guided` means it will merely be asked nicely, and the
       * reason says why the stronger guarantee is unavailable. Knowing that
       * before generating is the whole of gap G18.
       */}
      {predicted && (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="micro-label">before you run</span>
          <span
            className="numeric"
            style={{
              color: predicted.decoder_enforced ? 'var(--skin-ok)' : 'var(--skin-warn)',
            }}
          >
            {predicted.enforcement}
            {predicted.fallback_used ? ' — will fall back' : ''}
          </span>
          {support?.reason && (
            <span className="text-sm" style={{ color: 'var(--skin-muted)' }}>
              {support.reason}
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="numeric" style={{ color: 'var(--skin-danger)' }}>
          {error} — Send is disabled until this parses
        </p>
      )}
    </div>
  );
}
