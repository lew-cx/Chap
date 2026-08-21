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

import { readSSE } from '../lewlm/src/index.ts';
import { check, flag, gap, record, summarize } from '../../scripts/probe.ts';
import { DOCKTIZO_CONTRACT } from './src/generated/meta.ts';

const BASE = flag('base', 'http://127.0.0.1:8090');
const TOKEN = flag('token', process.env['DOCKTIZO_TOKEN'] ?? '');
const WORKSPACE = flag('workspace', process.env['DOCKTIZO_WORKSPACE_ID'] ?? '');

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

  await gap('D1', 'health reports liveness only, never downstream readiness', async () => {
    // A readiness-aware answer has to name its dependencies, and in particular
    // has to know whether a worker is present — an API running without one
    // accepts generations and never executes them.
    const res = await get('/health/ready');
    if (!res.ok) return `GET /health/ready -> ${res.status}`;
    const report = (await body(res)) as {
      components?: unknown[];
      generation_ready?: boolean;
      detail_level?: string;
    };
    if (report.generation_ready === undefined) return 'readiness does not report worker presence';
    if (report.detail_level === undefined) return 'readiness does not label withheld detail';
    return null;
  });

  await gap('D2', 'no committed spec and no published client', async () => {
    // The point is a spec in the repo, gated against the running app — not one
    // that exists only inside a process. This probe checks the running app still
    // agrees with what Chap generated from the committed copy.
    const res = await fetch(`${BASE}/openapi.json`);
    if (!res.ok) return `GET /openapi.json -> ${res.status}`;
    const live = (await body(res)) as { paths?: Record<string, unknown> };
    const liveRoutes = Object.keys(live.paths ?? {}).length;
    if (liveRoutes !== DOCKTIZO_CONTRACT.routeCount) {
      return `Chap generated from ${DOCKTIZO_CONTRACT.routeCount} routes, the live app serves ${liveRoutes}`;
    }
    return null;
  });

  await gap('D3', 'generation events are polled, never streamed', async () => {
    if (!authed) return 'not verifiable without a working token';

    // Stream a real generation, so this proves the transport rather than the
    // existence of a route. The generation only has to reach the log; whether
    // the workflow eventually succeeds is not what is under test here.
    const submitted = await fetch(`${BASE}/v1/generations`, {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json', 'idempotency-key': `proof-d3-${Date.now()}` },
      body: JSON.stringify({
        document_type: 'status_report.v1',
        input_data: {
          project_name: 'chap proof',
          reporting_period: 'probe',
          reporting_date: new Date().toISOString().slice(0, 10),
          facts: ['A probe submitted this generation to prove the event stream.'],
        },
      }),
    });
    if (!submitted.ok) {
      // A submit-time capability refusal is D6's fix working, not D3 failing.
      const envelope = (await body(submitted)) as { error?: { code?: string } };
      return `could not submit a generation to stream (${submitted.status} ${envelope.error?.code ?? ''})`;
    }
    const { generation_id: id } = (await body(submitted)) as { generation_id: string };

    const res = await fetch(`${BASE}/v1/generations/${id}/events/stream`, {
      headers: { ...headers, accept: 'text/event-stream' },
      signal: AbortSignal.timeout(10_000),
    });
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('text/event-stream')) {
      void res.body?.cancel();
      return `GET .../events/stream -> ${res.status} ${contentType || 'no content-type'}`;
    }

    // One frame is the whole claim: the log is followable, and `id:` is a cursor
    // a reconnect can resume from. Breaking out releases the connection —
    // readSSE cancels its own reader in a finally, so nothing is cancelled here.
    for await (const frame of readSSE(res)) {
      return frame.id ? null : 'streams, but frames carry no id: cursor to resume from';
    }
    return 'stream opened but yielded no frames';
  });

  await gap('D4', 'no response says which workspace the token resolved to', async () => {
    if (!authed) return 'not verifiable without a working token';
    const res = await get('/v1/whoami');
    if (!res.ok) return `GET /v1/whoami -> ${res.status}`;
    const who = (await body(res)) as { workspace_id?: string };
    const echoed = (await get('/v1/document-types')).headers.get('x-workspace-id');
    if (!who.workspace_id) return 'whoami does not name the workspace';
    if (!echoed) return 'authenticated responses do not echo X-Workspace-ID';
    return null;
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

  await gap('D6', 'a workflow the host cannot run is accepted anyway', async () => {
    if (!authed) return 'not verifiable without a working token';
    // The fix DocKtizo chose: check capabilities at submit and refuse with a
    // typed error naming what is missing, rather than failing several stages in.
    // Readiness reporting the same thing per workflow is what lets Chap warn
    // before the button is pressed.
    const res = await get('/health/ready');
    if (!res.ok) return `GET /health/ready -> ${res.status}`;
    const report = (await body(res)) as { workflows?: { missing_capabilities?: string[] }[] };
    if (report.workflows === undefined) {
      return 'readiness does not report per-workflow capability coverage';
    }
    return null;
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
