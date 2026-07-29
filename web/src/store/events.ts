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
 * LewLM has no server-side filtering or replay (docs/lewlm-gaps.md#g13), so
 * every event of every request arrives and Chap filters locally, and a reconnect
 * inserts an explicit gap marker rather than pretending the window was continuous.
 */

import { create } from 'zustand';

import { subscribeEvents, type EventStreamStatus, type StreamEvent } from '@chap/lewlm';

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
  setPaused: (paused: boolean) => void;
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
  setPaused: (paused) => set({ paused }),
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
  const controller = new AbortController();

  void subscribeEvents(lewlm, {
    signal: controller.signal,
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

  return () => controller.abort();
}
