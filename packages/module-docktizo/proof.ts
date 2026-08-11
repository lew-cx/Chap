#!/usr/bin/env -S npx tsx
/**
 * Headless proof of the DocKtizo module's transport, and the regression suite
 * for docs/docktizo-gaps.md.
 *
 * Same contract as scripts/proof.ts: a `check` asserts something that should
 * work, a `gap` asserts something that is currently broken upstream. When a gap
 * probe stops finding the breakage it prints FIXD, which is the signal that Chap
 * can delete a workaround. Lines are the currency here — every gap below is
 * costing the module some.
 *
 * This runs against DocKtizo directly, not through Chap's proxy, so a failure
 * here is never a Chap bug. Two exceptions are marked in place.
 *
 * Usage:
 *   npx tsx packages/module-docktizo/proof.ts [--base http://127.0.0.1:8090] [--token …]
 */

import { check, flag, gap, record, summarize } from '../../scripts/probe.ts';

const BASE = flag('base', 'http://127.0.0.1:8090');
const TOKEN = flag('token', process.env['DOCKTIZO_TOKEN'] ?? '');
const WORKSPACE = flag('workspace', process.env['DOCKTIZO_WORKSPACE_ID'] ?? '');
/** Only D6 needs this: it compares two upstreams' vocabularies against each other. */
const LEWLM = flag('lewlm', process.env['LEWLM_BASE_URL'] ?? 'http://127.0.0.1:8080');

const headers: Record<string, string> = {
  ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}),
  ...(WORKSPACE ? { 'x-workspace-id': WORKSPACE } : {}),
};

const get = (path: string, init?: RequestInit) =>
  fetch(`${BASE}${path}`, { ...init, headers: { ...headers, ...init?.headers } });

async function body(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

async function main() {
  console.log(`\ndocktizo proof  ->  ${BASE}\n`);

  let authed = false;

  await check('healthz', async () => {
    const res = await get('/healthz');
    if (!res.ok) throw new Error(`${res.status}`);
    const health = await body(res);
    return `${health['service']} ${health['version']}`;
  });

  await check('document-types', async () => {
    const res = await get('/v1/document-types');
    if (!res.ok) {
      const envelope = (await body(res)) as { error?: { code?: string } };
      return `${res.status} ${envelope.error?.code ?? ''} — set --token, or DOCKTIZO_AUTH_* on the service`;
    }
    authed = true;
    const list = (await body(res)) as { items?: { workflow_id?: string }[] };
    return (list.items ?? []).map((item) => item.workflow_id).join(', ') || 'none installed';
  });

  // --- gaps ---------------------------------------------------------------

  await gap('D1', 'healthz reports liveness only, never downstream readiness', async () => {
    // The only anonymous endpoint, and the one an operator reaches for first. A
    // readiness-aware answer would have to name its dependencies; this one
    // cannot distinguish a working service from one with no worker, no database
    // and no authentication configured.
    const res = await get('/healthz');
    const health = await body(res);
    const keys = Object.keys(health).sort();
    const aware = keys.some((key) => /depend|ready|worker|lewlm|database/i.test(key));
    return aware ? null : `answers ${res.status} with only [${keys.join(', ')}] — nothing about the worker`;
  });

  await gap('D2', 'no committed spec and no published client', async () => {
    // The document exists only inside a running process. If DocKtizo ever ships
    // one at a stable URL alongside the service, this stops being a gap.
    const res = await fetch(`${BASE}/openapi.json`);
    if (!res.ok) return `GET /openapi.json -> ${res.status}; nothing is published outside the process`;
    const spec = (await body(res)) as { info?: { version?: string } };
    return `only from a running process (version ${spec.info?.version ?? '?'}), never from the repo`;
  });

  await gap('D3', 'generation events are polled, never streamed', async () => {
    // A streaming surface would advertise itself the way LewLM's /v1/events does.
    const res = await fetch(`${BASE}/v1/events`, { headers: { ...headers, accept: 'text/event-stream' } });
    if (res.ok && (res.headers.get('content-type') ?? '').includes('text/event-stream')) return null;
    return `no event stream (GET /v1/events -> ${res.status}); progress must be walked with a cursor`;
  });

  await gap('D4', 'no response says which workspace the token resolved to', async () => {
    if (!authed) return 'not verifiable without a working token; X-Workspace-ID is write-only in the schema';
    const res = await get('/v1/document-types');
    const named = [...res.headers.keys()].some((key) => /workspace/i.test(key));
    return named ? null : 'neither the body nor any response header names the effective workspace';
  });

  await gap('D5', 'request size limits are keyed to content-length', async () => {
    // `/v1/generations` is capped at 512 KiB. Send 600 KiB twice: once with a
    // content-length, once as a stream without one. The second is exactly what
    // Chap's proxy produces, because a re-streamed body has no length to declare.
    const oversized = JSON.stringify({
      document_type: 'status_report.v1',
      instructions: 'x'.repeat(600_000),
    });
    const post = (init: RequestInit) =>
      fetch(`${BASE}/v1/generations`, {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        ...init,
      });

    const declared = await post({ body: oversized });
    const streamed = await post({
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(oversized));
          controller.close();
        },
      }),
      duplex: 'half',
    } as RequestInit);

    if (streamed.status === 413) return null;
    return `600 KiB past a 512 KiB cap: ${declared.status} with content-length, ${streamed.status} without`;
  });

  await gap('D6', 'required_capabilities are not in LewLM\'s vocabulary', async () => {
    if (!authed) return 'not verifiable without a working token';
    const res = await get('/v1/document-types');
    const list = (await body(res)) as { items?: { required_capabilities?: string[] }[] };
    const required = new Set((list.items ?? []).flatMap((item) => item.required_capabilities ?? []));
    if (required.size === 0) return null;

    // LewLM annotates its inventory with the capability names it can actually
    // report on. If DocKtizo's names are not among them, no client can check a
    // workflow is runnable before submitting one.
    const lewlm = await fetch(`${LEWLM}/v1/models`).catch(() => null);
    if (!lewlm?.ok) return `LewLM unreachable at ${LEWLM}; cannot compare vocabularies`;
    const inventory = (await lewlm.json()) as {
      capability_availability?: { ready_capabilities?: string[]; blocked_capabilities?: string[] }[];
    };
    const published = new Set(
      (inventory.capability_availability ?? []).flatMap((entry) => [
        ...(entry.ready_capabilities ?? []),
        ...(entry.blocked_capabilities ?? []),
      ]),
    );
    const unknown = [...required].filter((name) => !published.has(name));
    if (unknown.length === 0) return null;
    return `DocKtizo requires [${unknown.join(', ')}]; LewLM publishes [${[...published].join(', ')}]`;
  });

  if (!authed) {
    record('SKIP', 'generation round trip', 'no working token — pass --token or configure DOCKTIZO_AUTH_*');
  }

  summarize();
}

main().catch((error) => {
  console.error('\ndocktizo proof crashed\n ', error, '\n');
  process.exit(1);
});
