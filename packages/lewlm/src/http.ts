/**
 * The typed fetch wrapper every LewLM call goes through.
 *
 * Deliberately thin: build a URL, attach identity headers, throw a typed error
 * on failure. Anything cleverer belongs in the caller or, more often, in LewLM.
 */

import { connectionError, isAbort, toLewLMError } from './errors.ts';

export interface ClientOptions {
  /** Origin to call. `''` uses the current origin, which is how the browser runs. */
  baseUrl?: string;
  /**
   * Only set this in a Node process. In the browser the key is injected by
   * chap-server so it never reaches client code.
   */
  apiKey?: string | undefined;
  /** Stable per-deployment label. LewLM aggregates bounded metrics under it. */
  applicationId?: string;
  /** Per-tab identity, for audit correlation. Not a credential. */
  clientInstanceId?: string;
  /** Sent as `x-lewlm-authorized-actions` when tool authorization is required. */
  authorizedActions?: readonly string[];
}

export interface RequestOptions {
  json?: unknown;
  form?: FormData;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal | undefined;
  /** Overrides the default `application/json`; used by the streaming paths. */
  accept?: string;
  headers?: Record<string, string>;
  /** Groups several requests under one id in LewLM's metadata, events and logs. */
  correlationId?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface Client {
  readonly options: ClientOptions;
  /** Perform a request and parse the JSON body. Throws `LewLMApiError`. */
  request: <T>(method: HttpMethod, path: string, options?: RequestOptions) => Promise<T>;
  /** Perform a request and return the raw `Response`, body unread. */
  raw: (method: HttpMethod, path: string, options?: RequestOptions) => Promise<Response>;
}

function buildUrl(baseUrl: string, path: string, query: RequestOptions['query']): string {
  const url = `${baseUrl}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

export function createClient(options: ClientOptions = {}): Client {
  const baseUrl = (options.baseUrl ?? '').replace(/\/$/, '');
  const applicationId = options.applicationId ?? 'chap';
  const clientInstanceId = options.clientInstanceId ?? crypto.randomUUID();

  async function raw(
    method: HttpMethod,
    path: string,
    request: RequestOptions = {},
  ): Promise<Response> {
    const headers = new Headers(request.headers);
    headers.set('accept', request.accept ?? 'application/json');

    // Operational metadata, not authentication. LewLM keeps these out of metric
    // labels and only uses them for audit context.
    headers.set('x-lewlm-application-id', applicationId);
    headers.set('x-lewlm-client-instance-id', clientInstanceId);

    // Mint a request id only when the caller has not chosen one. LewLM echoes
    // whatever it receives — including on errors — so a caller that wants to
    // correlate a specific call must be able to name it.
    if (!headers.has('x-request-id')) headers.set('x-request-id', crypto.randomUUID());

    // Correlation spans several requests (a chat turn plus its ingest, say)
    // where the request id identifies exactly one.
    if (request.correlationId) headers.set('x-lewlm-correlation-id', request.correlationId);

    if (options.authorizedActions?.length) {
      headers.set('x-lewlm-authorized-actions', options.authorizedActions.join(','));
    }
    if (options.apiKey) headers.set('x-api-key', options.apiKey);

    let body: BodyInit | undefined;
    if (request.form) {
      // Let fetch set the multipart boundary.
      body = request.form;
    } else if (request.json !== undefined) {
      headers.set('content-type', 'application/json');
      body = JSON.stringify(request.json);
    }

    let res: Response;
    try {
      res = await fetch(buildUrl(baseUrl, path, request.query), {
        method,
        headers,
        body,
        signal: request.signal ?? null,
      });
    } catch (cause) {
      if (isAbort(cause)) throw cause;
      throw connectionError(cause);
    }

    if (!res.ok) throw await toLewLMError(res);
    return res;
  }

  return {
    options,
    raw,
    async request<T>(method: HttpMethod, path: string, request?: RequestOptions): Promise<T> {
      const res = await raw(method, path, request);
      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    },
  };
}
