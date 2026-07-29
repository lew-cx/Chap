/**
 * "This host cannot do that, and here is why."
 *
 * A surface that needs a capability no runnable model provides should say so
 * before you use it, in LewLM's own words. The alternative — letting the button
 * fail with a 400 — makes an environment fact look like a bug in the app.
 */

import type { CapabilityStatus } from '../lib/useCapability.ts';

export function CapabilityNotice({
  capability,
  status,
}: {
  capability: string;
  /** From `useCapability` — LewLM's own answer, not a guess. */
  status: CapabilityStatus;
}) {
  if (status.ready) return null;

  return (
    <div className="panel mb-3" style={{ borderColor: 'var(--skin-warn)' }}>
      <div className="micro-label" style={{ color: 'var(--skin-warn)' }}>
        no runnable {capability} model on this host
      </div>
      <p className="mt-1 text-sm" style={{ color: 'var(--skin-muted)' }}>
        {status.reason ?? 'No model in the registry advertises this capability.'} The
        controls below stay live so you can see the request Chap would send and the
        typed error LewLM returns.
      </p>
    </div>
  );
}
