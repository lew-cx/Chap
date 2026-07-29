import type { ReactNode } from 'react';

/** A labelled control. The label's casing and tracking come from the skin. */
export function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="micro-label">{label}</span>
      {children}
    </label>
  );
}

/** A key/value pair in a metadata readout. */
export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="micro-label">{label}</span>
      <span className="numeric truncate">{value}</span>
    </div>
  );
}
