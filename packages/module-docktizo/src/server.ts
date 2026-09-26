/**
 * DocKtizo, mounted at `/dk`.
 *
 * DocKtizo is a separate, experimental document-generation service built on
 * LewLM (github.com/lew-cx/DocKtizo). This package is an optional Chap
 * *companion*: off unless `CHAP_COMPANIONS=docktizo`, and nothing in Chap needs
 * it. See this package's README.md.
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

interface ReadinessReport {
  status?: string;
  core_ready?: boolean;
  generation_ready?: boolean;
  detail_level?: string;
  components?: { component: string; status: string; required_for_core?: boolean }[];
}

/**
 * One call.
 *
 * This used to be two — liveness, then an authenticated read of the cheapest
 * route, because `/healthz` checked nothing and could not tell a working
 * service from one with no authentication configured. `/health/ready` now
 * answers both, and answers the thing neither call could see: whether a worker
 * is actually present. An API running without `python -m docktizo.worker`
 * accepts generations and never executes them, which used to be invisible until
 * you noticed nothing had happened.
 *
 * It is anonymous but tiered. With Chap's bearer it returns full detail; an
 * offered-but-invalid credential still 401s, which is exactly what should be
 * surfaced. So the failure Chap reports is the upstream's own sentence.
 */
async function probe(baseUrl: string, headers: Record<string, string>): Promise<Readiness> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/health/ready`, {
      headers,
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    return { ready: false, reason: `DocKtizo unreachable at ${baseUrl} — ${detail}` };
  }

  const body = (await res.json().catch(() => ({}))) as ReadinessReport & ErrorEnvelope;

  if (!res.ok) {
    return { ready: false, reason: body.error?.message ?? `DocKtizo answered ${res.status} at /health/ready` };
  }
  // Name the components that are down rather than repeating the verdict. Which
  // ones matter depends on the verdict: a broken database stops everything, an
  // absent worker or an unreachable LewLM stops generation only.
  const down = (core: boolean) =>
    (body.components ?? [])
      .filter((component) => Boolean(component.required_for_core) === core && component.status !== 'ready')
      .map((component) => `${component.component} ${component.status}`)
      .join(', ');

  if (body.core_ready === false) {
    return { ready: false, reason: down(true) || `DocKtizo reports ${body.status ?? 'not ready'}` };
  }
  if (body.generation_ready === false) {
    // `worker unavailable` here means no process is heartbeating, which is the
    // failure that used to be invisible: the API accepts generations and nothing
    // ever runs them.
    return { ready: false, reason: `${down(false) || 'generation is not available'} — nothing will run` };
  }

  return { ready: true, reason: null };
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
