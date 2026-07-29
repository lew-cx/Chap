/**
 * A polled read, with the request state the ops screens need.
 *
 * Small on purpose. The ops console makes ~20 reads that differ only in path,
 * type and interval, and a query library would be more code than the screens it
 * serves — Chap's whole argument is that the integration layer stays legible.
 */

import { useCallback, useEffect, useState } from 'react';

import { LewLMApiError } from '@chap/lewlm';

import { lewlm } from './client.ts';

export interface Polled<T> {
  data: T | null;
  error: LewLMApiError | null;
  loading: boolean;
  /** Re-read now. Also what write actions call once they have finished. */
  refresh: () => void;
}

export function usePolled<T>(path: string | null, intervalMs = 0): Polled<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<LewLMApiError | null>(null);
  const [loading, setLoading] = useState(path != null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((current) => current + 1), []);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }

    let live = true;
    const controller = new AbortController();

    const read = () =>
      lewlm
        .request<T>('GET', path, { signal: controller.signal })
        .then((next) => {
          if (!live) return;
          setData(next);
          setError(null);
        })
        .catch((cause: unknown) => {
          // An aborted read is a unmount, not a failure.
          if (!live || !(cause instanceof LewLMApiError)) return;
          setError(cause);
        })
        .finally(() => live && setLoading(false));

    void read();
    const timer = intervalMs > 0 ? setInterval(() => void read(), intervalMs) : null;

    return () => {
      live = false;
      controller.abort();
      if (timer) clearInterval(timer);
    };
  }, [path, intervalMs, tick]);

  return { data, error, loading, refresh };
}
