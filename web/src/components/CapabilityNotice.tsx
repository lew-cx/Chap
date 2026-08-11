/**
 * "This host cannot do that, and here is why."
 *
 * A surface that needs something the host cannot provide should say so before
 * you use it, in the backend's own words. The alternative — letting the button
 * fail with a 400 — makes an environment fact look like a bug in the app.
 *
 * Two callers, one shape. `useCapability` answers it for a LewLM capability and
 * `useModules` answers it for a whole module, because "ask the backend, degrade
 * honestly" is the same move at both scales.
 */

export function CapabilityNotice({
  title,
  status,
}: {
  title: string;
  /** From `useCapability` or `useModule` — the backend's own answer, not a guess. */
  status: { ready: boolean; reason: string | null };
}) {
  if (status.ready) return null;

  return (
    <div className="panel mb-3" style={{ borderColor: 'var(--skin-warn)' }}>
      <div className="micro-label" style={{ color: 'var(--skin-warn)' }}>
        {title}
      </div>
      <p className="mt-1 text-sm" style={{ color: 'var(--skin-muted)' }}>
        {status.reason ?? 'No model in the registry advertises this capability.'} The
        controls below stay live so you can see the request Chap would send and the
        typed error LewLM returns.
      </p>
    </div>
  );
}
