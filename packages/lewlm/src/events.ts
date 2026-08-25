/**
 * The `/v1/events` subscription.
 *
 * SSE, not the WebSocket route. The WS endpoint is server→client only and never
 * reads a client message, so it buys nothing over SSE; SSE crosses Chap's proxy
 * as an ordinary streaming fetch where WS would need an upgrade handler; and
 * `RequestGuard` is HTTP middleware, so the WS route skips the API key and the
 * rate limit entirely (docs/lewlm-gaps.md#g14).
 *
 * The stream can be narrowed at the server. Values inside one dimension are
 * alternatives and dimensions combine, so `{ types: ['token.delta'],
 * request_id: ['req-1'] }` is one request's tokens and nothing else. LewLM
 * applies this before an event is queued for the connection, which makes it a
 * backpressure control rather than a convenience — an excluded event is never
 * serialized and never sent.
 *
 * There is still no replay (#g13), so a reconnect loses whatever happened while
 * the socket was down. That is reported rather than hidden: `onStatus` fires
 * with `reconnected`, and the UI marks the gap.
 */

import type { Client } from './http.ts';
import { readSSE } from './sse.ts';
import type { StreamEvent } from './types.ts';

export type EventStreamStatus = 'connecting' | 'open' | 'reconnected' | 'closed';

/**
 * What to deliver. Every dimension is optional; an empty filter admits
 * everything, which is what an unfiltered subscriber gets.
 *
 * There is no negation — the filter names what it wants, not what it does not.
 * A caller that means "everything except tokens" has to enumerate the rest,
 * which `EVENT_TYPES` makes exact rather than a guess.
 */
export interface EventFilter {
  types?: readonly string[];
  scope?: readonly string[];
  request_id?: readonly string[];
  model_id?: readonly string[];
}

export interface EventSubscription {
  signal: AbortSignal;
  filter?: EventFilter;
  onEvent: (event: StreamEvent) => void;
  onStatus?: (status: EventStreamStatus, detail?: string) => void;
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
function search(filter: EventFilter | undefined): string {
  const params = new URLSearchParams();
  for (const [key, values] of Object.entries(filter ?? {})) {
    for (const value of values ?? []) params.append(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function subscribeEvents(
  client: Client,
  { signal, filter, onEvent, onStatus }: EventSubscription,
): Promise<void> {
  let retry = FIRST_RETRY_MS;
  let everOpened = false;

  while (!signal.aborted) {
    try {
      onStatus?.('connecting');
      const res = await client.raw('GET', `/v1/events${search(filter)}`, {
        accept: 'text/event-stream',
        signal,
      });

      onStatus?.(everOpened ? 'reconnected' : 'open');
      everOpened = true;
      retry = FIRST_RETRY_MS;

      for await (const frame of readSSE(res)) {
        if (!frame.data || frame.data === '[DONE]') continue;
        onEvent(JSON.parse(frame.data) as StreamEvent);
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
