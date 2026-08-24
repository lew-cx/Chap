/**
 * The event ring buffer.
 *
 * `token.delta` fires once per generated token, so this is a performance
 * constraint rather than an optimization. Three decisions follow from that:
 *
 *  - a **fixed-capacity ring**, so memory is bounded no matter how long the
 *    bench runs;
 *  - a **throttled flush** (~10 Hz), so React re-renders at a human rate rather
 *    than a token rate;
 *  - **one subscription for the whole app**, held here, so the rail and the
 *    events explorer share a buffer instead of opening two streams.
 *
 * LewLM now narrows the stream at the server, so the filter below is sent rather
 * than applied on arrival: an excluded event is never queued, never serialized
 * and never crosses the wire. The ring and the throttle stay, because the rail's
 * whole point is watching an unfiltered stream go past, and that is now a choice
 * rather than the only option.
 *
 * Replay is still missing (docs/lewlm-gaps.md#g13), so a reconnect inserts an
 * explicit gap marker rather than pretending the window was continuous.
 */

import { create } from 'zustand';

import { subscribeEvents, type EventFilter, type EventStreamStatus, type StreamEvent } from '@chap/lewlm';

import { lewlm } from '../lib/client.ts';

const CAPACITY = 5_000;
const FLUSH_MS = 100;

/** A ring entry. `gap` marks a reconnect, where events were lost. */
export interface EventRecord {
  seq: number;
  event: StreamEvent;
  gap?: true;
}

interface EventState {
  events: EventRecord[];
  status: EventStreamStatus;
  /** Total received since the page loaded, including any the ring has dropped. */
  received: number;
  dropped: number;
  paused: boolean;
  /**
   * Sent to LewLM. Changing it reopens the stream, which is why it lives here
   * rather than in a screen. The events explorer sets it while it is open and
   * clears it when it closes; everything else reads the unfiltered stream.
   */
  filter: EventFilter;
  setPaused: (paused: boolean) => void;
  setFilter: (filter: EventFilter) => void;
  clear: () => void;
}

let seq = 0;
let pending: EventRecord[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

export const useEvents = create<EventState>((set) => ({
  events: [],
  status: 'connecting',
  received: 0,
  dropped: 0,
  paused: false,
  filter: {},
  setPaused: (paused) => set({ paused }),
  setFilter: (filter) => set({ filter }),
  clear: () => set({ events: [], dropped: 0 }),
}));

function flush() {
  flushTimer = null;
  if (pending.length === 0) return;
  const batch = pending;
  pending = [];

  useEvents.setState((state) => {
    if (state.paused) return { received: state.received + batch.length };
    const merged = [...state.events, ...batch];
    const overflow = Math.max(0, merged.length - CAPACITY);
    return {
      events: overflow > 0 ? merged.slice(overflow) : merged,
      received: state.received + batch.length,
      dropped: state.dropped + overflow,
    };
  });
}

function push(record: Omit<EventRecord, 'seq'>) {
  pending.push({ seq: seq++, ...record });
  flushTimer ??= setTimeout(flush, FLUSH_MS);
}

/**
 * Start the single app-wide subscription. Called once from `main.tsx`; returns a
 * teardown so React StrictMode's double-mount does not open two streams.
 */
export function startEventStream(): () => void {
  let controller = new AbortController();

  const connect = (filter: EventFilter) => {
    void subscribeEvents(lewlm, {
      signal: controller.signal,
      filter,
      onEvent: (event) => push({ event }),
      onStatus: (status, detail) => {
        useEvents.setState({ status });
        if (status === 'reconnected') {
          // LewLM cannot replay, so say so in the stream itself rather than
          // leaving a silent hole in the timeline.
          push({
            gap: true,
            event: {
              type: 'stream.reconnected' as StreamEvent['type'],
              created_at: new Date().toISOString(),
              payload: { detail: detail ?? 'events between the drop and now were lost' },
            },
          });
        }
      },
    });
  };

  connect(useEvents.getState().filter);

  // A filter is a property of the connection, not of the buffer, so narrowing it
  // means reopening. Everything already received is kept: the ring holds what
  // arrived under the old filter and the explorer says which one is live.
  const stopWatching = useEvents.subscribe((state, previous) => {
    if (state.filter === previous.filter) return;
    controller.abort();
    controller = new AbortController();
    connect(state.filter);
  });

  return () => {
    stopWatching();
    controller.abort();
  };
}
