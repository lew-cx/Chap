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

import { useCallback, useEffect, useState } from 'react';

import type { ModelInventory } from '@chap/lewlm';

import { lewlm } from './client.ts';

export interface ModelOption {
  id: string;
  label: string;
  chatReady: boolean;
  /** Why a model cannot chat — surfaced rather than hidden. */
  reason: string | null;
}

export function useModels(): {
  models: ModelOption[];
  loading: boolean;
  reportLoadFailure: (modelId: string, reason: string) => void;
} {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;

    lewlm
      .request<ModelInventory>('GET', '/v1/models')
      .then((inventory) => {
        if (!live) return;
        const availability = new Map(
          (inventory.capability_availability ?? []).map((entry) => [entry.model_id, entry]),
        );

        setModels(
          inventory.items
            .map((item) => {
              const status = availability.get(item.model_id);
              return {
                id: item.model_id,
                label: item.display_name || item.model_id,
                chatReady: status?.chat_ready ?? false,
                reason: status?.reason ?? null,
              };
            })
            // Usable first, so the default selection is a working model.
            .sort((a, b) => Number(b.chatReady) - Number(a.chatReady)),
        );
      })
      .catch(() => undefined)
      .finally(() => live && setLoading(false));

    return () => {
      live = false;
    };
  }, []);

  const reportLoadFailure = useCallback((modelId: string, reason: string) => {
    setModels((current) =>
      current
        .map((option) => (option.id === modelId ? { ...option, chatReady: false, reason } : option))
        .sort((a, b) => Number(b.chatReady) - Number(a.chatReady)),
    );
  }, []);

  return { models, loading, reportLoadFailure };
}
