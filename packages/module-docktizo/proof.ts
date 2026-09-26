#!/usr/bin/env -S npx tsx
/**
 * Headless proof of the DocKtizo module's transport, and the regression suite
 * for GAPS.md beside it. Run with `npm run proof:docktizo`.
 *
 * DocKtizo is a separate, experimental document-generation service built on
 * LewLM (github.com/lew-cx/DocKtizo). This package is an optional Chap
 * *companion*: off unless `CHAP_COMPANIONS=docktizo`, and nothing in Chap needs
 * it. See this package's README.md.
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
 * The second half proves the document lifecycle — the half of DocKtizo the
 * module reached for the first time in this pass. It rides on the single
 * generation D3 already submits rather than paying for a second model run, and
 * says so plainly when no generation on this host reaches a document.
 *
 * Usage:
 *   npx tsx packages/module-docktizo/proof.ts [--base http://127.0.0.1:8090] [--token …]
 */

import { readSSE } from '../lewlm/src/index.ts';
import { check, flag, gap, record, summarize } from '../../scripts/probe.ts';
import { RESTING } from './src/generated/contract.ts';
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
  // D3 submits one real generation. The lifecycle section below rides on it
  // rather than paying for a second model run.
  let generationId: string | null = null;

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
    generationId = id;

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

  await gap('D7', 'the registered migration pairs are not published', async () => {
    if (!authed) return 'not verifiable without a working token';
    // DocKtizo registers migrations as exact source-to-target pairs and its
    // registry has always been able to answer `targets_for(source)`. Nothing
    // published it, so a client offering "migrate this document" had to guess a
    // target and read the refusal. `migration_targets` is that answer.
    const types = (await body(await get('/v1/document-types'))) as {
      items?: Record<string, unknown>[];
    };
    const items = types.items ?? [];
    if (items.length === 0) return 'no document types installed; not verifiable here';
    if (!items.every((item) => Array.isArray(item['migration_targets']))) {
      return 'document-types names no target a document may migrate onto';
    }
    return null;
  });

  await gap('D8', 'a workspace\'s documents cannot be listed', async () => {
    if (!authed) return 'not verifiable without a working token';
    // A document used to be reachable only through an id something else had just
    // handed over. Keeping a local list would have been Chap holding a second,
    // worse copy of a record DocKtizo owns, so the tab asked you to paste one.
    const res = await get('/v1/documents?limit=1');
    if (!res.ok) return `GET /v1/documents -> ${res.status}`;
    const page = (await body(res)) as { items?: unknown[]; has_more?: boolean; next_cursor?: unknown };
    if (!Array.isArray(page.items) || page.has_more === undefined) {
      return 'GET /v1/documents answers, but not as a cursor-paged list';
    }
    return null;
  });

  // --- the document lifecycle ---------------------------------------------

  if (!authed) {
    record('SKIP', 'document lifecycle', 'no working token — pass --token or configure DOCKTIZO_AUTH_*');
    summarize();
  }

  // The document to prove against: the one D3's generation produced, or failing
  // that any the workspace already holds. The second half of that is new — until
  // `GET /v1/documents` existed a proof could only use a document it had just
  // made, which tied the whole lifecycle section to a working model.
  const documentId = (await settle(generationId)) ?? (await anyDocument());
  if (!documentId) {
    record('SKIP', 'document lifecycle', 'no generation reached a document, and the workspace holds none');
    summarize();
  }

  await check('document', async () => {
    const document = (await body(await get(`/v1/documents/${documentId}`))) as {
      workflow_id?: string;
      current_revision_number?: number;
      approval?: { state?: string };
    };
    return `${document.workflow_id} revision ${document.current_revision_number} · ${document.approval?.state}`;
  });

  await check('revision history', async () => {
    const page = (await body(await get(`/v1/documents/${documentId}/revisions?limit=50`))) as {
      items?: { revision_id: string; revision_mode: string }[];
    };
    const items = page.items ?? [];
    if (items.length === 0) throw new Error('a document exists with no revisions');
    // The approvals read is a separate authorization action from the revision
    // read, and a token missing it fails here rather than on the review screen.
    const approvals = await get(`/v1/revisions/${items[0]!.revision_id}/approvals`);
    if (!approvals.ok) throw new Error(`approvals -> ${approvals.status}`);
    return items.map((item) => item.revision_mode).join(', ');
  });

  // Which version this document may move onto, read rather than guessed. This
  // used to be a loop over every other installed version of the same document
  // type, submitting previews until one was not refused; `migration_targets` is
  // the registered set, so there is nothing left to try.
  const document = (await body(await get(`/v1/documents/${documentId}`))) as {
    workflow_id: string;
    document_type: string;
    current_revision_id: string;
  };
  const catalogue = (await body(await get('/v1/document-types'))) as {
    items?: { workflow_id: string; migration_targets?: string[] }[];
  };
  const migration = (target: string, extra: Record<string, unknown> = {}) => ({
    parent_revision_id: document.current_revision_id,
    source_workflow_id: document.workflow_id,
    target_workflow_id: target,
    use_target_default_template: true,
    reason: 'chap proof',
    ...extra,
  });

  let migratesOnto: string | null = null;

  await check('migration preview', async () => {
    const targets =
      (catalogue.items ?? []).find((item) => item.workflow_id === document.workflow_id)
        ?.migration_targets ?? [];
    if (targets.length === 0) return `no registered migration from ${document.workflow_id}`;

    const target = targets[0]!;
    const res = await get(`/v1/documents/${documentId}/migrations/preview`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(migration(target)),
    });
    // A published target that the preview refuses would mean the two disagree,
    // which is worth failing on rather than skipping past.
    if (!res.ok) {
      const envelope = (await body(res)) as { error?: { code?: string } };
      throw new Error(`${document.workflow_id} -> ${target} is published but refused: ${envelope.error?.code}`);
    }
    const preview = (await body(res)) as {
      migration_policy_version?: string;
      required_acknowledgements?: string[];
      candidate_valid?: boolean;
    };
    if (!preview.migration_policy_version) throw new Error('a preview named no policy version');
    migratesOnto = target;
    return (
      `${document.workflow_id} -> ${target} by ${preview.migration_policy_version} · ` +
      `${(preview.required_acknowledgements ?? []).length} to acknowledge · ` +
      `candidate ${preview.candidate_valid ? 'valid' : 'invalid'}`
    );
  });

  await check('unacknowledged migration is refused', async () => {
    if (!migratesOnto) return 'nothing to migrate onto';
    // The submit half, proven without spending a worker run: a migration whose
    // reported consequences are not acknowledged must never be accepted. This is
    // the rule the acknowledgement checkboxes exist to satisfy, checked at the
    // source rather than in the browser.
    const res = await get(`/v1/documents/${documentId}/migrations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': `proof-migration-${Date.now()}` },
      body: JSON.stringify(migration(migratesOnto, { acknowledged_notices: [] })),
    });
    if (res.ok) throw new Error('an unacknowledged migration was accepted');
    const envelope = (await body(res)) as { error?: { code?: string } };
    return `${res.status} ${envelope.error?.code ?? ''}`;
  });

  summarize();
}

/** Any document this workspace already holds. Newest first, so the freshest wins. */
async function anyDocument(): Promise<string | null> {
  const res = await get('/v1/documents?limit=1');
  if (!res.ok) return null;
  const page = (await body(res)) as { items?: { document_id?: string }[] };
  return page.items?.[0]?.document_id ?? null;
}

/**
 * Wait for a generation to produce a document, or report that it did not.
 *
 * `awaiting_review` is the interesting stop: the run is over, the artifacts are
 * written, and the document is the thing everything after this proves against.
 */
async function settle(generationId: string | null): Promise<string | null> {
  if (!generationId) return null;
  const deadline = Date.now() + 180_000;

  while (Date.now() < deadline) {
    const status = (await body(await get(`/v1/generations/${generationId}`))) as {
      state?: string;
      document_id?: string | null;
      error?: { code?: string };
    };
    if (status.document_id) return status.document_id;
    if (status.state && RESTING.includes(status.state)) {
      record('SKIP', 'generation reached no document', `${status.state} ${status.error?.code ?? ''}`);
      return null;
    }
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }
  return null;
}

main().catch((error) => {
  console.error('\ndocktizo proof crashed\n ', error, '\n');
  process.exit(1);
});
