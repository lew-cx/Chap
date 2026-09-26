/**
 * DocKtizo, from the browser.
 *
 * DocKtizo is a separate, experimental document-generation service built on
 * LewLM (github.com/lew-cx/DocKtizo). This package is an optional Chap
 * *companion*: off unless `CHAP_COMPANIONS=docktizo`, and nothing in Chap needs
 * it. See this package's README.md.
 *
 * Same shape as the collections client: one `call<T>`, thin named methods,
 * nothing clever. Errors are surfaced as DocKtizo's own envelope rather than
 * paraphrased — the whole point of the Generate tab is that a 422 shows you what
 * DocKtizo said, not what Chap guessed it meant.
 *
 * Everything goes through `/dk`, which chap-server proxies while injecting the
 * bearer token. No credential reaches this bundle, which is also why an
 * artifact download can be a plain string handed to `<a download>`.
 */

import type {
  ApprovalDecision,
  ApprovalHistory,
  ArtifactMetadata,
  DocumentDetail,
  DocumentList,
  DocumentTypeList,
  GenerationAccepted,
  GenerationCancellation,
  GenerationRequest,
  GenerationStatus,
  ManualOverrideRequest,
  MigrationPreview,
  MigrationRequest,
  ReadinessReport,
  RevisionDetail,
  RevisionList,
  RevisionRequest,
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

/**
 * A POST DocKtizo will replay rather than repeat.
 *
 * Every write below is idempotent on a caller-supplied key: same key and same
 * body replays the original outcome with `replayed: true`, same key and a
 * different body is a 409 `idempotency_conflict`. A review decision, a revision
 * and a migration are all things a double-click must not do twice, so the key
 * is a required argument rather than an option.
 */
const idempotent = (body: unknown, key: string): RequestInit => ({
  ...json(body),
  headers: { 'content-type': 'application/json', 'idempotency-key': key },
});

export const docktizo = {
  /** Which workspace the token resolved to, and what it may do. */
  whoami: () => call<Whoami>('/whoami'),

  documentTypes: {
    // No `get`. `GET /v1/document-types` returns each entry in full — schema,
    // capabilities, templates and all — so the per-id route reads the same bytes
    // one at a time. Same reasoning as the paged event reader below.
    list: () => call<DocumentTypeList>('/document-types'),
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
      call<GenerationAccepted>('/generations', idempotent(body, idempotencyKey)),

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

  /**
   * The document a generation produced, and everything you can do to it after.
   *
   * A generation is one run. The document is the durable thing: a head revision,
   * a review state, and a version history that outlives every run that touched
   * it. Chap used to stop at the run, which is why `awaiting_review` was a wall
   * — the stepper reached it and nothing could act on it.
   */
  documents: {
    /**
     * The workspace's documents, newest first and cursor-paged.
     *
     * "Newest" is `created_at`, not `updated_at` — measured, not assumed. The
     * table shows `updated_at`, so the column and the ordering are two different
     * dates and the rows will not look sorted by the one on screen.
     *
     * Chap reads one page. This route is new: until it existed a document was
     * reachable only through an id something else had just handed over, and the
     * tab below opened on a box asking you to paste one.
     */
    list: (limit = 50) => call<DocumentList>(`/documents?limit=${limit}`),

    get: (id: string) => call<DocumentDetail>(`/documents/${encodeURIComponent(id)}`),

    /**
     * The version history, OLDEST first and cursor-paged.
     *
     * Measured against a live DocKtizo: a three-revision document comes back
     * `[1, 2, 3]`. This said "newest first" for as long as it existed and the
     * screen repeated the claim, which is the kind of small untruth that is
     * only ever found by reading the response.
     *
     * Chap reads one page. A document accumulates revisions at human speed, and
     * a "load more" that has never had anything to load is a control Chap would
     * be maintaining on speculation.
     */
    revisions: (id: string, limit = 50) =>
      call<RevisionList>(`/documents/${encodeURIComponent(id)}/revisions?limit=${limit}`),

    /** A targeted revision: named fields, re-generated under instructions. */
    revise: (id: string, body: RevisionRequest, key: string) =>
      call<GenerationAccepted>(`/documents/${encodeURIComponent(id)}/revisions`, idempotent(body, key)),

    /**
     * A correction with no model in the loop — the values are the caller's.
     *
     * Still a new immutable revision, still validated and re-rendered under the
     * workflow's own rules; only the content is supplied rather than generated.
     */
    override: (id: string, body: ManualOverrideRequest, key: string) =>
      call<GenerationAccepted>(
        `/documents/${encodeURIComponent(id)}/revisions/manual-override`,
        idempotent(body, key),
      ),

    migrations: {
      /**
       * What a version change would do, decided without writing anything.
       *
       * The preview runs the registered mapping, validates the candidate under
       * the target version's complete rules, and reports every consequence as a
       * coded notice. Nothing is guessed here and nothing is guessed in the UI:
       * `required_acknowledgements` is the exact list the submit will demand.
       */
      preview: (id: string, body: MigrationRequest) =>
        call<MigrationPreview>(`/documents/${encodeURIComponent(id)}/migrations/preview`, json(body)),

      create: (id: string, body: MigrationRequest, key: string) =>
        call<GenerationAccepted>(`/documents/${encodeURIComponent(id)}/migrations`, idempotent(body, key)),
    },
  },

  revisions: {
    get: (id: string) => call<RevisionDetail>(`/revisions/${encodeURIComponent(id)}`),

    /** Every decision ever recorded against this revision, in order. */
    approvals: (id: string) => call<ApprovalHistory>(`/revisions/${encodeURIComponent(id)}/approvals`),

    /**
     * Approve, reject, or send back for changes.
     *
     * Three routes rather than one with a field, so the decision is in the URL
     * and cannot be smuggled past authorization in a body. The action name is
     * DocKtizo's own path segment; naming it here would be Chap inventing a
     * fourth vocabulary for the same three words.
     */
    decide: (id: string, action: 'approve' | 'reject' | 'request-changes', comment: string, key: string) =>
      call<ApprovalDecision>(
        `/revisions/${encodeURIComponent(id)}/${action}`,
        idempotent({ comment: comment || null }, key),
      ),
  },

  artifacts: {
    get: (id: string) => call<ArtifactMetadata>(`/artifacts/${encodeURIComponent(id)}`),
  },
};

/**
 * A plain URL, not a blob. The proxy injects the bearer, so `<a download>` works
 * and the browser handles Content-Disposition — which is a whole feature Chap
 * never had to build.
 *
 * The path is DocKtizo's own `download_url`, not one Chap assembles. It is the
 * only route in the module a response hands over ready-made, and taking it means
 * one fewer place where Chap has to agree with DocKtizo about a URL shape.
 */
export const downloadUrl = (artifact: ArtifactMetadata) => `/dk${artifact.download_url}`;
