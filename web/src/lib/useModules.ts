/**
 * What the server says about each installed module, right now.
 *
 * The same move as useCapability.ts, one scale up. There it is "can any model on
 * this host embed"; here it is "can this module reach the thing it fronts, and
 * is it configured". Both answers come from the backend and both carry the
 * upstream's own reason, because an environment fact reported as an app error is
 * the most expensive kind of confusion in a bench.
 */

import { usePolled } from './usePolled.ts';

export interface ModuleStatus {
  id: string;
  label: string;
  prefix: string;
  /** Env keys the module reads. Shown in Settings so misconfiguration is findable. */
  env: string[];
  ready: boolean;
  /** Why not, in the upstream's words. Never a paraphrase invented here. */
  reason: string | null;
}

export function useModuleList(): ModuleStatus[] {
  const { data } = usePolled<{ modules: ModuleStatus[] }>('/_chap/health', 15_000);
  return data?.modules ?? [];
}

/** `null` until the first health response lands — not the same as "not ready". */
export function useModule(id: string): ModuleStatus | null {
  return useModuleList().find((module) => module.id === id) ?? null;
}
