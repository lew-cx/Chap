/**
 * A collapsed section with a label and an at-a-glance summary.
 *
 * Built on `<details>` so open/closed state, keyboard operation and the
 * disclosure triangle come from the platform rather than from Chap.
 */

import type { ReactNode } from 'react';

interface Props {
  label: string;
  /** Rendered beside the label — the one fact worth seeing while collapsed. */
  hint?: ReactNode;
  /** Draws the hint in the warning colour. For fallbacks and failed validation. */
  flagged?: boolean;
  open?: boolean;
  children: ReactNode;
}

export function Disclosure({ label, hint, flagged, open, children }: Props) {
  return (
    <details className="panel-bare" open={open} style={{ padding: 'var(--skin-panel-pad)' }}>
      <summary className="flex cursor-pointer items-center gap-2 select-none">
        <span className="micro-label">{label}</span>
        {hint != null && (
          <span
            className="numeric truncate"
            style={{ color: flagged ? 'var(--skin-warn)' : 'var(--skin-faint)' }}
          >
            {hint}
          </span>
        )}
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
