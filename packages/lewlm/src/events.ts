/**
 * The `/v1/events` subscription.
 *
 * SSE, not the WebSocket route. The WS endpoint is server→client only and never
 * reads a client message, so it buys nothing over SSE; SSE crosses Chap's proxy
 * as an ordinary streaming fetch where WS would need an upgrade handler.
 *
 * The stream can be narrowed at the server. Values inside one dimension are
 * alternatives and dimensions combine, so `{ types: ['token.delta'],
 * request_id: ['req-1'] }` is one request's tokens and nothing else. LewLM
 * applies this before an event is queued for the connection, which makes it a
 * backpressure control rather than a convenience — an excluded event is never
 * serialized and never sent.
 *
 * Every frame's cursor is sent back as `?after=` after a reconnect. LewLM
 * begins the resumed stream with `events.resumed`, including an exact lost count
 * or `null` when the cursor belongs to a previous server lifetime.
 *
 * `?after=` rather than `Last-Event-ID`, though LewLM reads both and allows the
 * header cross-origin: a query parameter is a simple request, so a browser
 * talking to LewLM directly reconnects without a preflight, and it crosses the
 * proxy unchanged. One spelling, no extra round trip, on both routes.
 */

import type { Client } from './http.ts';
import { readSSE } from './sse.ts';
import type { StreamEvent } from './types.ts';

export type EventStreamStatus = 'connecting' | 'open' | 'reconnected' | 'closed';

/**
 * What to deliver. Every dimension is optional; an empty filter admits
 * everything, which is what an unfiltered subscriber gets.
 *
 * `exclude_types` is applied after `types`, which keeps the common “everything
 * except token deltas” request short.
 */
export interface EventFilter {
  types?: readonly string[];
  exclude_types?: readonly string[];
  scope?: readonly string[];
  request_id?: readonly string[];
  model_id?: readonly string[];
}

export interface EventSubscription {
  signal: AbortSignal;
  filter?: EventFilter;
  onEvent: (event: StreamEvent) => void;
  onStatus?: (status: EventStreamStatus, detail?: string) => void;
  /** Cursor already consumed by a previous subscription (for filter changes). */
  after?: string | undefined;
  /** Persists the newest server cursor outside this retry loop. */
  onCursor?: (cursor: string) => void;
}

const FIRST_RETRY_MS = 1_000;
const MAX_RETRY_MS = 10_000;

/**
 * Sleep, but wake the moment the caller aborts.
 *
 * A bare `setTimeout` promise does not notice the signal, so a teardown during a
 * ten-second backoff was not acted on for up to ten more seconds — long enough
 * for a filter change to look like a hung connection.
 */
function backoff(ms: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', finish);
      resolve();
    };
    const timer = setTimeout(finish, ms);
    signal.addEventListener('abort', finish, { once: true });
  });
}

/** Repeatable query parameters, which `RequestOptions.query` cannot express. */
function search(filter: EventFilter | undefined, after: string | undefined): string {
  const params = new URLSearchParams();
  for (const [key, values] of Object.entries(filter ?? {})) {
    for (const value of values ?? []) params.append(key, value);
  }
  if (after) params.set('after', after);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function subscribeEvents(
  client: Client,
  { signal, filter, onEvent, onStatus, after, onCursor }: EventSubscription,
): Promise<void> {
  let retry = FIRST_RETRY_MS;
  let everOpened = false;
  let cursor = after;

  while (!signal.aborted) {
    try {
      onStatus?.('connecting');
      const res = await client.raw('GET', `/v1/events${search(filter, cursor)}`, {
        accept: 'text/event-stream',
        signal,
      });

      onStatus?.(everOpened ? 'reconnected' : 'open');
      everOpened = true;
      retry = FIRST_RETRY_MS;

      for await (const frame of readSSE(res)) {
        if (!frame.data || frame.data === '[DONE]') continue;
        const event = JSON.parse(frame.data) as StreamEvent;
        const nextCursor = frame.id ?? event.cursor ?? undefined;
        if (nextCursor) {
          cursor = nextCursor;
          onCursor?.(nextCursor);
        }
        onEvent(event);
      }
    } catch (cause) {
      if (signal.aborted) break;
      onStatus?.('closed', cause instanceof Error ? cause.message : String(cause));
    }

    if (signal.aborted) break;
    await backoff(retry, signal);
    retry = Math.min(retry * 2, MAX_RETRY_MS);
  }

  onStatus?.('closed');
}
