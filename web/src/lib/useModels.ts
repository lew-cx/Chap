/**
 * The model picker's data.
 *
 * `GET /v1/models` annotates every model with `capability_availability[]`
 * (`servable`, `chat_ready`, `ready_capabilities`, `blocked_capabilities`,
 * `reason`), so one request answers both "what exists" and "what can run".
 *
 * `chat_ready` used to be a registry claim that a model could contradict at load
 * time — five models advertised chat here and two survived contact with the
 * runtime. Since the Gemma 4 routing patch it is checked against what the
 * installed runtime packages can actually build, so a model that cannot load no
 * longer claims it can. Chap took out the localStorage cache of load failures
 * that used to compensate: caching a runtime's limitation outlives the fix for
 * it, which is exactly what happened when this one landed.
 *
 * The in-session demotion below stays. A load can still fail for reasons no
 * inventory can predict — memory pressure, a corrupt file — and when it does the
 * bench should stop offering that model for the rest of the session. It just
 * should not remember it forever.
 */

import { useCallback, useMemo, useState } from 'react';

import type { LewLMApiError, ModelInventory, RuntimeInfo } from '@chap/lewlm';

import { usePolled } from './usePolled.ts';

export interface ModelOption {
  id: string;
  /** What to show. A display name when the manifest has one, else a short id. */
  label: string;
  chatReady: boolean;
  /** Why a model cannot chat — surfaced rather than hidden. */
  reason: string | null;
  endpointId: string | null;
  engineProfile: string | null;
  /**
   * LewLM's word: `packaged` for an in-process runtime, else the endpoint's
   * cached inventory state (`advertised`, `stale`, `failed`, `unknown`).
   */
  engineState: string | null;
  /**
   * The registered model LewLM would answer with instead, when this one's
   * engine is down and `explicit_alias` fallback names one.
   */
  fallbackModelId: string | null;
  executionLocality: string | null;
  /**
   * Whether the picker may offer it. `chat_ready: false` or an engine LewLM
   * reports `failed` both say no, and both keep the model listed with a reason —
   * unless LewLM names a fallback alias that would answer, in which case asking
   * for this model still gets a reply, and the reply says who gave it.
   */
  selectable: boolean;
  /**
   * The third of the three states LewLM keeps apart: listed is not warm. From
   * `runtime.startup`, which is process-local and never probes an engine.
   */
  warmth: 'warm' | 'loading' | null;
}

/**
 * A model name short enough to read, long enough to tell two apart.
 *
 * Two bundles on this host carry a 64-character digest as their `display_name`,
 * so shortening only when the name is missing would not have helped. Truncating
 * the *tail* makes every such model look identical in a picker — the digests
 * differ throughout — so both ends are kept. An ordinary name is under the
 * threshold and passes through untouched, and the full id is always the title.
 */
export function shortModelId(value: string, keep = 8): string {
  return value.length <= keep * 2 + 3 ? value : `${value.slice(0, keep)}…${value.slice(-keep)}`;
}

export function useModels(): {
  models: ModelOption[];
  loading: boolean;
  /**
   * Why the inventory could not be read. Distinct from an empty inventory: a
   * failed read used to be swallowed, and the picker simply came up empty with
   * nothing to say — the one thing the rest of this app never does.
   */
  error: LewLMApiError | null;
  reportLoadFailure: (modelId: string, reason: string) => void;
} {
  // The shared poller: five call sites read this path, and each one used to open
  // its own request.
  const { data, error, loading } = usePolled<ModelInventory>('/v1/models', 30_000);
  // Warmth changes on a load, not by the second; the Ops tabs poll this faster
  // and the shared poller runs at whichever subscriber asks most often.
  const { data: runtime } = usePolled<RuntimeInfo>('/v1/runtime', 15_000);
  /** In-session demotions, layered over the inventory rather than baked into it. */
  const [demoted, setDemoted] = useState<Record<string, string>>({});

  const models = useMemo(() => {
    const availability = new Map(
      (data?.capability_availability ?? []).map((entry) => [entry.model_id, entry]),
    );
    const warm = new Set((runtime?.startup?.warm_models ?? []).map((entry) => entry.model_id));
    const loadingIds = new Set((runtime?.startup?.loading_models ?? []).map((entry) => entry.model_id));

    return (data?.items ?? [])
      .map((item) => {
        const status = availability.get(item.model_id);
        const failure = demoted[item.model_id];
        const chatReady = failure ? false : (status?.chat_ready ?? false);
        const engineState = status?.engine_state ?? null;
        const endpointId = status?.endpoint_id ?? null;
        return {
          id: item.model_id,
          label: shortModelId(item.display_name || item.model_id),
          chatReady,
          reason: failure ?? status?.reason ?? null,
          endpointId,
          engineProfile: status?.engine_profile ?? null,
          engineState,
          fallbackModelId: status?.fallback_model_id ?? null,
          executionLocality: status?.execution_locality ?? null,
          selectable: (chatReady && engineState !== 'failed') || (!failure && status?.fallback_model_id != null),
          warmth: warm.has(item.model_id) ? 'warm' : loadingIds.has(item.model_id) ? 'loading' : null,
        } satisfies ModelOption;
      })
      // Usable first, so the default selection is a working model.
      .sort((a, b) => Number(b.selectable) - Number(a.selectable));
  }, [data, runtime, demoted]);

  const reportLoadFailure = useCallback((modelId: string, reason: string) => {
    setDemoted((current) => ({ ...current, [modelId]: reason }));
  }, []);

  return { models, loading, error, reportLoadFailure };
}
