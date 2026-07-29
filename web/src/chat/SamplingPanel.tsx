/**
 * Decode controls, and an honest report of what the runtime actually did with
 * them.
 *
 * LewLM accepts the full `sampling` block on every backend but returns
 * `metadata.sampling` saying which controls were `applied` and which were
 * `unsupported`. That distinction is the interesting part: on this host's
 * llama.cpp path every control currently comes back unsupported, and a test
 * bench should say so rather than let you believe you changed something.
 */

import type { SamplingControlReport, SamplingControls } from '@chap/lewlm';

import { Labelled } from '../components/Field.tsx';

/** The controls Chap exposes, in the order they appear. */
const NUMERIC: {
  key: keyof SamplingControls;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: 'top_p', label: 'top_p', min: 0.01, max: 1, step: 0.01 },
  { key: 'top_k', label: 'top_k', min: 1, max: 200, step: 1 },
  { key: 'min_p', label: 'min_p', min: 0, max: 1, step: 0.01 },
  { key: 'repetition_penalty', label: 'repeat', min: 0.01, max: 3, step: 0.01 },
  { key: 'presence_penalty', label: 'presence', min: -2, max: 2, step: 0.1 },
  { key: 'frequency_penalty', label: 'frequency', min: -2, max: 2, step: 0.1 },
];

interface Props {
  value: SamplingControls;
  onChange: (next: SamplingControls) => void;
  /** From the previous run. Null before anything has been sent. */
  report: SamplingControlReport | null;
}

export function SamplingPanel({ value, onChange, report }: Props) {
  const set = (key: keyof SamplingControls, raw: string) => {
    // Empty means "don't send it" — LewLM treats an absent control as unset,
    // which is different from sending a default.
    onChange({ ...value, [key]: raw === '' ? null : Number(raw) });
  };

  const unsupported = new Set(report?.unsupported ?? []);
  const applied = report?.applied ?? {};

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        {NUMERIC.map(({ key, label, min, max, step }) => (
          <Labelled key={key} label={label}>
            <input
              className="field numeric w-20"
              type="number"
              min={min}
              max={max}
              step={step}
              value={value[key] == null ? '' : String(value[key])}
              placeholder="—"
              onChange={(event) => set(key, event.target.value)}
            />
          </Labelled>
        ))}

        <Labelled label="seed">
          <input
            className="field numeric w-24"
            type="number"
            value={value.seed == null ? '' : String(value.seed)}
            placeholder="random"
            onChange={(event) => set('seed', event.target.value)}
          />
        </Labelled>

        <Labelled label="stop (comma separated)">
          <input
            className="field w-44"
            type="text"
            value={(value.stop ?? []).join(', ')}
            placeholder="—"
            onChange={(event) => {
              const stop = event.target.value
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean);
              onChange({ ...value, stop: stop.length > 0 ? stop : undefined });
            }}
          />
        </Labelled>
      </div>

      {report && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="micro-label">
            {report.runtime === 'unknown' ? 'runtime' : report.runtime} honored
          </span>

          {Object.keys(applied).length === 0 && unsupported.size === 0 && (
            <span className="micro-label">nothing requested</span>
          )}

          {Object.entries(applied).map(([key, applied_value]) => (
            <span key={key} className="numeric" style={{ color: 'var(--skin-ok)' }}>
              {key}={String(applied_value)}
            </span>
          ))}

          {[...unsupported].map((key) => (
            <span key={key} className="numeric line-through" style={{ color: 'var(--skin-faint)' }}>
              {key}
            </span>
          ))}

          {value.seed != null && (
            <span
              className="numeric"
              style={{ color: report.deterministic ? 'var(--skin-ok)' : 'var(--skin-warn)' }}
            >
              {report.deterministic ? 'reproducible' : 'seed ignored — not reproducible'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Strip unset controls so LewLM sees only what the user actually asked for. */
export function compactSampling(controls: SamplingControls): SamplingControls | undefined {
  const entries = Object.entries(controls).filter(([, entry]) => entry != null);
  return entries.length > 0 ? (Object.fromEntries(entries) as SamplingControls) : undefined;
}
