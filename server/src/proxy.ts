/**
 * The proxy is a BYTE PIPE. It must never transform a payload.
 *
 * It exists for exactly one reason: LewLM ships no CORS middleware
 * (docs/lewlm-gaps.md#g1-no-cors-support), so a browser cannot talk to it
 * directly. This file puts Chap and LewLM on one origin and does nothing else.
 *
 * It is allowed to:
 *   - forward the request verbatim to LewLM
 *   - strip hop-by-hop headers that fetch/undici must not relay
 *   - inject credentials and audit headers the browser must not hold
 *   - disable downstream buffering so SSE arrives frame by frame
 *
 * It is NOT allowed to reshape bodies, synthesize responses, retry, cache, or
 * "helpfully" fix anything. The moment it does, a workaround becomes invisible
 * to scripts/loc-budget.mjs and the gap report loses its teeth. If you feel the
 * urge to add logic here, that urge is a gap report entry.
 *
 * The credentials are supplied per target rather than hardcoded, because there
 * is now more than one upstream. That is still data: the pipe sets exactly the
 * headers it was handed and invents none. "Reshape" includes reshaping headers
 * on any condition other than the target they were given for.
 */

import type { Context } from 'hono';

/**
 * Headers that describe a single transport hop and must not be relayed.
 * `host` is dropped so undici recomputes it for the upstream origin;
 * `content-length` is dropped because the body is re-streamed.
 */
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

/** One upstream, and what the pipe is allowed to add on the way there. */
export interface PipeTarget {
  baseUrl: string;
  /** Removed from the path before forwarding: `/dk/healthz` reaches DocKtizo as `/healthz`. */
  stripPrefix?: string;
  /**
   * Credentials and audit identity the browser must not hold. Supplied by the
   * caller, set verbatim, never conditional on the request.
   */
  headers?: Readonly<Record<string, string>>;
}

function forwardRequestHeaders(source: Headers, inject: PipeTarget['headers']): Headers {
  const headers = new Headers();
  for (const [key, value] of source) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  }

  // Credentials live in this process, never in the browser.
  for (const [key, value] of Object.entries(inject ?? {})) headers.set(key, value);

  return headers;
}

function forwardResponseHeaders(source: Headers): Headers {
  const headers = new Headers();
  for (const [key, value] of source) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  }
  // Some reverse proxies buffer text/event-stream by default, which would hold
  // LewLM's chunks until the stream ends. This tells them not to.
  headers.set('x-accel-buffering', 'no');
  return headers;
}

/** Errors raised before a response exists — LewLM unreachable, DNS failure, etc. */
function connectionError(target: string, cause: unknown): Response {
  const message = cause instanceof Error ? cause.message : String(cause);
  return Response.json(
    {
      error: {
        code: 'connection_error',
        message: `Chap could not reach ${target}: ${message}`,
        details: { target, upstream: true },
      },
    },
    { status: 502 },
  );
}

/** Pipe one request through to an upstream origin, preserving the streaming body. */
export async function pipe(c: Context, upstreamTarget: PipeTarget): Promise<Response> {
  const { baseUrl, stripPrefix = '', headers: inject } = upstreamTarget;
  const url = new URL(c.req.url);
  const path = stripPrefix ? url.pathname.slice(stripPrefix.length) : url.pathname;
  const target = `${baseUrl}${path}${url.search}`;

  const method = c.req.method;
  const hasBody = method !== 'GET' && method !== 'HEAD';

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers: forwardRequestHeaders(c.req.raw.headers, inject),
      body: hasBody ? c.req.raw.body : undefined,
      // Required by undici whenever a stream is used as a request body.
      ...(hasBody ? { duplex: 'half' } : {}),
      redirect: 'manual',
      signal: c.req.raw.signal,
    } as RequestInit);
  } catch (cause) {
    if (c.req.raw.signal.aborted) return new Response(null, { status: 499 });
    return connectionError(target, cause);
  }

  // `upstream.body` is passed through untouched — this is what keeps SSE live.
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: forwardResponseHeaders(upstream.headers),
  });
}
