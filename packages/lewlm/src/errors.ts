/**
 * One error type for everything that can go wrong talking to LewLM.
 *
 * LewLM returns a single failure envelope on every path — including 404, 405,
 * request validation, and unexpected 500s:
 *
 *   { "error": { "code": "...", "message": "...", "details": { ... } } }
 *
 * So this file is mostly a typed unwrap. The only synthesized case left is a
 * failure to reach LewLM at all, which by definition has no envelope.
 */

/** Statuses LewLM uses for conditions that may succeed on a later attempt. */
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

export interface LewLMErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** One entry of `details.fields[]` on an `invalid_request`. */
export interface FieldError {
  field: string;
  message: string;
  type?: string;
}

export class LewLMApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Record<string, unknown>;
  readonly requestId: string | undefined;
  readonly retryable: boolean;
  /** True only when Chap invented this error because LewLM was unreachable. */
  readonly synthesized: boolean;

  constructor(init: {
    code: string;
    message: string;
    status: number;
    details?: Record<string, unknown>;
    requestId?: string | undefined;
    synthesized?: boolean;
  }) {
    super(init.message);
    this.name = 'LewLMApiError';
    this.code = init.code;
    this.status = init.status;
    this.details = init.details ?? {};
    this.requestId = init.requestId;
    this.retryable = RETRYABLE_STATUSES.has(init.status);
    this.synthesized = init.synthesized ?? false;
  }

  /**
   * Per-field validation failures. LewLM reports these on `invalid_request`
   * (422), so a form can point at the offending input instead of showing a
   * whole-request error.
   */
  get fields(): FieldError[] {
    const fields = this.details['fields'];
    return Array.isArray(fields) ? (fields as FieldError[]) : [];
  }
}

export function isLewLMErrorEnvelope(value: unknown): value is LewLMErrorEnvelope {
  if (!value || typeof value !== 'object') return false;
  const error = (value as { error?: unknown }).error;
  if (!error || typeof error !== 'object') return false;
  const { code, message } = error as { code?: unknown; message?: unknown };
  return typeof code === 'string' && typeof message === 'string';
}

/** Turn a failed response into a `LewLMApiError`. */
export async function toLewLMError(res: Response): Promise<LewLMApiError> {
  const requestId = res.headers.get('x-request-id') ?? undefined;
  let body: unknown;
  let text = '';

  try {
    text = await res.text();
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }

  if (isLewLMErrorEnvelope(body)) {
    return new LewLMApiError({
      code: body.error.code,
      message: body.error.message,
      status: res.status,
      details: body.error.details,
      requestId,
    });
  }

  /*
   * Reaching here means something between Chap and LewLM answered instead —
   * a proxy, a load balancer, or a different service on the port. Flagged as
   * synthesized so the UI never presents Chap's guess as LewLM's own words.
   */
  return new LewLMApiError({
    code: 'unexpected_response',
    message: text.trim().slice(0, 500) || `${res.status} ${res.statusText || 'request failed'}`,
    status: res.status,
    details: { envelope_missing: true, ...(text ? { body: text.slice(0, 2000) } : {}) },
    requestId,
    synthesized: true,
  });
}

/** LewLM unreachable, DNS failure, or a dropped connection. */
export function connectionError(cause: unknown): LewLMApiError {
  const message = cause instanceof Error ? cause.message : String(cause);
  return new LewLMApiError({
    code: 'connection_error',
    message: `Could not reach LewLM: ${message}`,
    status: 0,
    details: { cause: message },
    synthesized: true,
  });
}

/** An `AbortController` fired — the caller cancelled, so this is not a failure. */
export function isAbort(cause: unknown): boolean {
  return cause instanceof DOMException
    ? cause.name === 'AbortError'
    : cause instanceof Error && cause.name === 'AbortError';
}
