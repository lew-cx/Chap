/**
 * DocKtizo, from the browser.
 *
 * Same shape as the collections client: one `call<T>`, thin named methods,
 * nothing clever. Errors are surfaced as DocKtizo's own envelope rather than
 * paraphrased — the whole point of the Generate tab is that a 422 shows you what
 * DocKtizo said, not what Chap guessed it meant.
 *
 * Everything goes through `/dk`, which chap-server proxies while injecting the
 * bearer token. No credential reaches this bundle, which is also why
 * `artifactDownloadUrl` can be a plain string handed to `<a download>`.
 */

import type {
  ArtifactMetadata,
  DocumentTypeDetail,
  GenerationAccepted,
  GenerationCancellation,
  GenerationRequest,
  GenerationStatus,
  ReadinessReport,
  SourceSummary,
  TemplateList,
  Whoami,
} from './types.ts';

const BASE = '/dk/v1';

/**
 * Readiness lives outside `/v1`, and is anonymous — but tiered. An unscoped
 * caller gets a verdict with empty component lists (`detail_level: 'summary'`);
 * a caller with `document_types:read` gets the components and the per-workflow
 * capability check. Withheld detail is labelled rather than looking like an
 * empty dependency list, which is the only way a client can tell the two apart.
 */
export const readiness = () => callAt('/dk/health/ready') as Promise<ReadinessReport>;

/**
 * DocKtizo's error envelope, which is shaped exactly like LewLM's.
 *
 * `issues` is the part worth having. A 422 used to carry `issue_count` and
 * nothing else, so a client could say "two things are wrong" and not which two;
 * DocKtizo now returns index-aligned `issue_locations` and `issue_codes`, and
 * deliberately not the submitted values or the human messages. That is enough
 * to point at a field, which is all a caller needed.
 */
export class DocktizoError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly retryable: boolean,
    readonly issues: { location: string; code: string }[] = [],
  ) {
    super(message);
    this.name = 'DocktizoError';
  }
}

interface Envelope {
  error?: {
    code?: string;
    message?: string;
    retryable?: boolean;
    details?: {
      issue_locations?: string[];
      issue_codes?: string[];
      [key: string]: unknown;
    };
  };
  detail?: unknown;
}

async function fail(res: Response): Promise<never> {
  const body = (await res.json().catch(() => null)) as Envelope | null;
  const details = body?.error?.details ?? {};
  const locations = details.issue_locations ?? [];
  const codes = details.issue_codes ?? [];

  // FastAPI's own 422 uses `detail`, not DocKtizo's envelope. Show it as it
  // arrived rather than flattening two different failures into one string.
  const message = body?.error?.message ?? (body?.detail ? JSON.stringify(body.detail) : res.statusText);

  throw new DocktizoError(
    res.status,
    body?.error?.code ?? `http_${res.status}`,
    message,
    body?.error?.retryable ?? false,
    locations.map((location, index) => ({ location, code: codes[index] ?? 'invalid' })),
  );
}

async function callAt<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) await fail(res);
  return (await res.json()) as T;
}

const call = <T,>(path: string, init?: RequestInit): Promise<T> => callAt<T>(`${BASE}${path}`, init);

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

export const docktizo = {
  /** Which workspace the token resolved to, and what it may do. */
  whoami: () => call<Whoami>('/whoami'),

  documentTypes: {
    list: () => call<{ count: number; items: DocumentTypeDetail[] }>('/document-types'),
    get: (id: string) => call<DocumentTypeDetail>(`/document-types/${encodeURIComponent(id)}`),
  },

  sources: {
    /**
     * Text and structured sources. `kind` picks which, and the field it reads.
     *
     * The request field is `title`; the response calls it `display_name`. The
     * body is `additionalProperties: false`, so sending the response's spelling
     * back is a 422 — worth knowing before you go looking for it in a stack trace.
     */
    create: (body: Record<string, unknown>) => call<SourceSummary>('/sources', json(body)),

    /** A file. Multipart, so no content-type header — the browser sets the boundary. */
    upload: (file: File, title: string) => {
      const form = new FormData();
      form.append('file', file);
      form.append('title', title || file.name);
      return call<SourceSummary>('/sources', { method: 'POST', body: form });
    },
  },

  templates: {
    list: (workflowId: string) =>
      call<TemplateList>(`/templates?workflow_id=${encodeURIComponent(workflowId)}`),
  },

  generations: {
    /**
     * `Idempotency-Key` is the whole reason this method takes a second argument.
     * Same key and same body replays the original generation with
     * `replayed: true`; same key and a different body is a 409.
     */
    create: (body: GenerationRequest, idempotencyKey: string) =>
      call<GenerationAccepted>('/generations', {
        ...json(body),
        headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
      }),

    get: (id: string) => call<GenerationStatus>(`/generations/${encodeURIComponent(id)}`),

    // There is no paged `events()` here. DocKtizo offers one, and the two are
    // interchangeable — same log, same cursors — so Chap follows the stream and
    // does not keep a second way to read the same thing.

    cancel: (id: string) =>
      call<GenerationCancellation>(`/generations/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),

    /**
     * Tail the same durable log the paged read walks.
     *
     * Every `id:` is a paged cursor, so `Last-Event-ID` resumes exactly and a
     * client may switch between this and `events()` without replaying or
     * skipping. Authorization and cursor validity are checked before the
     * response begins, which is why a refusal arrives here as an ordinary error
     * envelope rather than a stream that dies two frames in.
     */
    stream: async (id: string, cursor: string | null, signal: AbortSignal) => {
      const res = await fetch(
        `${BASE}/generations/${encodeURIComponent(id)}/events/stream` +
          (cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''),
        { headers: { accept: 'text/event-stream' }, signal },
      );
      if (!res.ok) await fail(res);
      return res;
    },
  },

  artifacts: {
    get: (id: string) => call<ArtifactMetadata>(`/artifacts/${encodeURIComponent(id)}`),
  },
};

/**
 * A plain URL, not a blob. The proxy injects the bearer, so `<a download>` works
 * and the browser handles Content-Disposition — which is a whole feature Chap
 * never had to build.
 */
export const artifactDownloadUrl = (id: string) =>
  `${BASE}/artifacts/${encodeURIComponent(id)}/download`;
