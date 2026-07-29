/**
 * The `/v1/events` subscription.
 *
 * SSE, not the WebSocket route. The WS endpoint is server→client only and never
 * reads a client message, so it buys nothing over SSE; SSE crosses Chap's proxy
 * as an ordinary streaming fetch where WS would need an upgrade handler; and
 * `RequestGuard` is HTTP middleware, so the WS route skips the API key and the
 * rate limit entirely (docs/lewlm-gaps.md#g14).
 *
 * LewLM has no replay and no server-side filtering (#g13), so a reconnect loses
 * whatever happened while the socket was down. That is reported rather than
 * hidden: `onStatus` fires with `reconnected`, and the UI marks the gap.
 */

import type { Client } from './http.ts';
import { readSSE } from './sse.ts';
import type { StreamEvent } from './types.ts';

export type EventStreamStatus = 'connecting' | 'open' | 'reconnected' | 'closed';

export interface EventSubscription {
  signal: AbortSignal;
  onEvent: (event: StreamEvent) => void;
  onStatus?: (status: EventStreamStatus, detail?: string) => void;
}

const FIRST_RETRY_MS = 1_000;
const MAX_RETRY_MS = 10_000;

export async function subscribeEvents(
  client: Client,
  { signal, onEvent, onStatus }: EventSubscription,
): Promise<void> {
  let retry = FIRST_RETRY_MS;
  let everOpened = false;

  while (!signal.aborted) {
    try {
      onStatus?.('connecting');
      const res = await client.raw('GET', '/v1/events', {
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
    await new Promise((resolve) => setTimeout(resolve, retry));
    retry = Math.min(retry * 2, MAX_RETRY_MS);
  }

  onStatus?.('closed');
}
