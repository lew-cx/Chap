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
 * Reconnects resume from the newest server cursor. LewLM's `events.resumed`
 * marker says whether the replay was complete, partially lost, or crossed a
 * server restart, so Chap never guesses about continuity.
 */

import { create } from 'zustand';

import { subscribeEvents, type EventFilter, type EventStreamStatus, type StreamEvent } from '@chap/lewlm';

import { lewlm } from '../lib/client.ts';

const CAPACITY = 5_000;
const FLUSH_MS = 100;

/**
 * The two markers Chap mints for holes in the timeline.
 *
 * Neither is LewLM's: both are things that happened to the subscription rather
 * than to the service, which is why they are cast into the contract's union
 * rather than generated from it. Named here so the row that draws them and the
 * code that pushes them cannot disagree about which is which.
 */
export const GAP_TYPES = {
  /** LewLM's own replay report; a gap only when payload.lost is non-zero/null. */
  reconnected: 'events.resumed',
  /** Pausing the view does not pause the stream; a resume loses a window too. */
  resumed: 'stream.resumed',
} as const;

/** A ring entry. `gap` marks a hole in the timeline, where events were lost. */
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
  /** Events discarded since the pause began, so resuming can say how many. */
  pausedDropped: number;
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

export const useEvents = create<EventState>((set, get) => ({
  events: [],
  status: 'connecting',
  received: 0,
  dropped: 0,
  paused: false,
  pausedDropped: 0,
  filter: {},

  setPaused: (paused) => {
    const missed = paused ? 0 : get().pausedDropped;
    set({ paused, pausedDropped: 0 });

    // Resuming leaves a hole, exactly as a reconnect does, so it gets the same
    // marker. Pretending the timeline was continuous is the one thing this
    // buffer is not allowed to do.
    if (missed > 0) {
      push({
        gap: true,
        event: {
          type: GAP_TYPES.resumed as StreamEvent['type'],
          created_at: new Date().toISOString(),
          payload: { detail: `${missed} events arrived while paused and were not kept` },
        },
      });
    }
  },

  setFilter: (filter) => set({ filter }),
  clear: () => set({ events: [], dropped: 0 }),
}));

function flush() {
  flushTimer = null;
  if (pending.length === 0) return;
  const batch = pending;
  pending = [];

  useEvents.setState((state) => {
    if (state.paused) {
      // The stream does not stop for a paused view, and these events are gone.
      // Counted as dropped so the "aged out" readout accounts for them instead
      // of quietly under-reporting what the buffer holds.
      return {
        received: state.received + batch.length,
        dropped: state.dropped + batch.length,
        pausedDropped: state.pausedDropped + batch.length,
      };
    }
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
  let lastCursor: string | undefined;
  /*
   * A deliberate reopen has two connections alive for a moment. The outgoing one
   * signs off with `closed`, which would land after the incoming one has already
   * said `connecting` — and flick the status dot to danger on an ordinary filter
   * change. Only the newest connection is allowed to set the status.
   */
  let generation = 0;

  const connect = (filter: EventFilter) => {
    const mine = ++generation;
    void subscribeEvents(lewlm, {
      signal: controller.signal,
      filter,
      after: lastCursor,
      onCursor: (cursor) => {
        lastCursor = cursor;
      },
      onEvent: (event) => {
        if (event.type === 'events.resumed') {
          const lost = event.payload?.['lost'];
          push({ event, ...(lost === 0 ? {} : { gap: true as const }) });
          return;
        }
        push({ event });
      },
      onStatus: (status) => {
        if (mine !== generation) return;
        useEvents.setState({ status });
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
