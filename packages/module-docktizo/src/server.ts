/**
 * DocKtizo, mounted at `/dk`.
 *
 * Nothing here reshapes anything: Chap fronts DocKtizo with the same byte pipe
 * it fronts LewLM with, and the only thing the module adds is the credential.
 * That matters more than it looks — because the bearer is injected here, an
 * artifact download is a plain `<a download>` in the browser with no token in
 * the bundle and no blob juggling in the UI.
 *
 * The probe is the interesting part. See below.
 */

/**
 * What this module needs from the host, declared here rather than imported.
 *
 * A module does not import core's types — it exports a plain factory, and
 * `server/src/modules.ts` checks the shape structurally when it registers it.
 * That is what makes the dependency arrow point one way.
 */
interface ModuleContext {
  env: NodeJS.ProcessEnv;
}

interface Readiness {
  ready: boolean;
  reason: string | null;
}

const DEFAULT_BASE_URL = 'http://127.0.0.1:8090';

/** How long to wait before calling DocKtizo unreachable. Health is polled. */
const PROBE_TIMEOUT_MS = 1500;

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

/** DocKtizo's error envelope. Identical in shape to LewLM's, and used the same way. */
interface ErrorEnvelope {
  error?: { code?: string; message?: string };
}

/**
 * Two calls, not one.
 *
 * `GET /healthz` is process liveness only — DocKtizo's own docstring says
 * downstream readiness "will be added with runtime composition". It touches no
 * database, does not reach LewLM, and knows nothing about the worker. It is also
 * anonymous, so a service with authentication switched off answers `ok` while
 * every route Chap needs returns 503.
 *
 * So the second call is the real one: an authenticated read of the cheapest
 * route there is. What comes back is what the browser shows, in DocKtizo's own
 * words — which turns "I forgot an environment variable" from a blank screen
 * into a sentence. See docs/docktizo-gaps.md, D1 and D5.
 *
 * What neither call can see is the worker. A generation submitted to an API
 * running without `python -m docktizo.worker` is accepted and then sits in
 * `accepted` forever, and nothing DocKtizo exposes reports that. That is D1.
 */
async function probe(baseUrl: string, headers: Record<string, string>): Promise<Readiness> {
  const get = (path: string) =>
    fetch(`${baseUrl}${path}`, { headers, signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });

  try {
    const live = await get('/healthz');
    if (!live.ok) return { ready: false, reason: `DocKtizo answered ${live.status} at /healthz` };
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    return { ready: false, reason: `DocKtizo unreachable at ${baseUrl} — ${detail}` };
  }

  try {
    const reachable = await get('/v1/document-types');
    if (reachable.ok) return { ready: true, reason: null };

    const body = (await reachable.json().catch(() => ({}))) as ErrorEnvelope;
    return {
      ready: false,
      reason: body.error?.message ?? `DocKtizo answered ${reachable.status} at /v1/document-types`,
    };
  } catch (cause) {
    return { ready: false, reason: cause instanceof Error ? cause.message : String(cause) };
  }
}

export function docktizo(context: ModuleContext) {
  const baseUrl = trimTrailingSlash(context.env['DOCKTIZO_BASE_URL'] ?? DEFAULT_BASE_URL);
  const token = context.env['DOCKTIZO_TOKEN'];
  const workspaceId = context.env['DOCKTIZO_WORKSPACE_ID'];

  // Credentials live in this process, never in the browser. `X-Actor-ID` is
  // deliberately absent: DocKtizo rejects it, and the workspace is derived from
  // the token rather than claimed by the caller.
  const headers: Record<string, string> = {
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...(workspaceId ? { 'x-workspace-id': workspaceId } : {}),
  };

  return {
    id: 'docktizo',
    label: 'DocKtizo',
    prefix: '/dk',
    env: ['DOCKTIZO_BASE_URL', 'DOCKTIZO_TOKEN', 'DOCKTIZO_WORKSPACE_ID'],
    proxy: { baseUrl, headers },
    probe: () => probe(baseUrl, headers),
  };
}
