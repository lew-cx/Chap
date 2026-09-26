/**
 * A polled read, with the request state the ops screens need.
 *
 * Small on purpose. The ops console makes ~20 reads that differ only in path,
 * type and interval, and a query library would be more code than the screens it
 * serves — Chap's whole argument is that the integration layer stays legible.
 *
 * One poller per path, shared. Callers are components, and the same path is read
 * by several at once — `/v1/health` had a poller in the rail, one in the status
 * strip and one per ops panel, all asking the same question of the same host on
 * the same interval. The registry below makes that a single request and a single
 * interval no matter how many components mount, so where a hook is called stops
 * being something anyone has to think about.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { isAbort, LewLMApiError } from '@chap/lewlm';

import { lewlm } from './client.ts';

export interface Polled<T> {
  data: T | null;
  error: LewLMApiError | null;
  loading: boolean;
  /** Re-read now. Also what write actions call once they have finished. */
  refresh: () => void;
}

interface Snapshot {
  data: unknown;
  error: LewLMApiError | null;
  loading: boolean;
}

interface Poller {
  path: string;
  snapshot: Snapshot;
  /** Each subscriber's requested interval; the poller runs at the fastest one. */
  subscribers: Map<() => void, number>;
  timer: ReturnType<typeof setInterval> | null;
  /** The rate the running timer was started at, so it is only rebuilt on change. */
  running: number;
  /** The read in flight, so simultaneous mounts join it instead of racing it. */
  inFlight: Promise<void> | null;
  controller: AbortController | null;
}

const IDLE: Snapshot = { data: null, error: null, loading: false };

/**
 * Keyed by path alone. Two screens asking for `/v1/runtime/stats` at 4s and 5s
 * want the same fact at slightly different freshness, not two request streams —
 * so they share one poller running at the faster of the two.
 */
const pollers = new Map<string, Poller>();

function publish(poller: Poller, snapshot: Snapshot) {
  poller.snapshot = snapshot;
  for (const notify of poller.subscribers.keys()) notify();
}

/** Fastest interval any live subscriber asked for; 0 when none wants polling. */
function rate(poller: Poller): number {
  let fastest = 0;
  for (const interval of poller.subscribers.values()) {
    if (interval > 0 && (fastest === 0 || interval < fastest)) fastest = interval;
  }
  return fastest;
}

function retime(poller: Poller) {
  const next = rate(poller);
  if (next === poller.running) return;
  if (poller.timer) clearInterval(poller.timer);
  poller.timer = next > 0 ? setInterval(() => void read(poller), next) : null;
  poller.running = next;
}

function read(poller: Poller, force = false): Promise<void> {
  if (poller.inFlight && !force) return poller.inFlight;

  const request = lewlm
    .request<unknown>('GET', poller.path, { signal: poller.controller?.signal })
    .then((next) => publish(poller, { data: next, error: null, loading: false }))
    .catch((cause: unknown) => {
      // An aborted read is a teardown, not a failure.
      if (isAbort(cause)) return;
      publish(poller, {
        ...poller.snapshot,
        error: cause instanceof LewLMApiError ? cause : poller.snapshot.error,
        loading: false,
      });
    })
    .finally(() => {
      if (poller.inFlight === request) poller.inFlight = null;
    });

  poller.inFlight = request;
  return request;
}

function acquire(path: string, intervalMs: number, notify: () => void): Poller {
  let poller = pollers.get(path);
  if (!poller) {
    poller = {
      path,
      snapshot: { data: null, error: null, loading: true },
      subscribers: new Map(),
      timer: null,
      running: 0,
      inFlight: null,
      controller: null,
    };
    pollers.set(path, poller);
  }

  const first = poller.subscribers.size === 0;
  poller.subscribers.set(notify, intervalMs);
  if (first) {
    poller.controller = new AbortController();
    void read(poller);
  }
  retime(poller);
  return poller;
}

function release(poller: Poller, notify: () => void) {
  poller.subscribers.delete(notify);
  if (poller.subscribers.size > 0) {
    retime(poller);
    return;
  }

  if (poller.timer) clearInterval(poller.timer);
  poller.timer = null;
  poller.running = 0;
  poller.controller?.abort();
  poller.controller = null;
  poller.inFlight = null;
  // The last snapshot stays cached. Remounting a screen then shows what it had
  // a moment ago rather than a flash of empty, and a fresh read starts at once.
  if (poller.snapshot.loading) poller.snapshot = IDLE;
}

/**
 * Re-read a path now, for everyone watching it. For code that learns something
 * changed without being the component that polls it — a chat turn refused
 * because an engine went down says the inventory is stale, and waiting out a
 * 30-second interval to show that is the lag this exists to remove.
 */
export function refreshPolled(path: string): void {
  const poller = pollers.get(path);
  if (poller && poller.subscribers.size > 0) void read(poller, true);
}

export function usePolled<T>(path: string | null, intervalMs = 0): Polled<T> {
  const [snapshot, setSnapshot] = useState<Snapshot>(() =>
    path ? (pollers.get(path)?.snapshot ?? { data: null, error: null, loading: true }) : IDLE,
  );
  const active = useRef<Poller | null>(null);

  useEffect(() => {
    if (!path) {
      active.current = null;
      setSnapshot(IDLE);
      return;
    }

    const notify = () => setSnapshot(pollers.get(path)?.snapshot ?? IDLE);
    const poller = acquire(path, intervalMs, notify);
    active.current = poller;
    notify();

    return () => {
      active.current = null;
      release(poller, notify);
    };
  }, [path, intervalMs]);

  const refresh = useCallback(() => {
    if (active.current) void read(active.current, true);
  }, []);

  return {
    data: snapshot.data as T | null,
    error: snapshot.error,
    loading: snapshot.loading,
    refresh,
  };
}
