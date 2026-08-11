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
  GenerationEventPage,
  GenerationRequest,
  GenerationStatus,
  SourceSummary,
  TemplateList,
} from './types.ts';

const BASE = '/dk/v1';

/** DocKtizo's error envelope, which is shaped exactly like LewLM's. */
export class DocktizoError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'DocktizoError';
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { code?: string; message?: string; retryable?: boolean };
      detail?: unknown;
    } | null;

    // FastAPI's own 422 uses `detail`, not DocKtizo's envelope. Show it as it
    // arrived rather than flattening two different failures into one string.
    const message = body?.error?.message ?? (body?.detail ? JSON.stringify(body.detail) : res.statusText);
    throw new DocktizoError(res.status, body?.error?.code ?? `http_${res.status}`, message, body?.error?.retryable ?? false);
  }

  return (await res.json()) as T;
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

export const docktizo = {
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

    events: (id: string, cursor: string | null, limit = 100) =>
      call<GenerationEventPage>(
        `/generations/${encodeURIComponent(id)}/events?limit=${limit}` +
          (cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''),
      ),

    cancel: (id: string) =>
      call<GenerationCancellation>(`/generations/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),
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
