/**
 * Which models on this host can serve a given capability, right now.
 *
 * `capability_availability[]` already answers this for the whole inventory in
 * one request, so a screen can say "no runnable embedding model" *before* you
 * press the button rather than turning a 400 into a surprise. The `reason` shown
 * is always LewLM's own.
 */

import type { ModelInventory } from '@chap/lewlm';

import { usePolled } from './usePolled.ts';

/** The capability names LewLM annotates the inventory with. */
type Capability = NonNullable<
  NonNullable<ModelInventory['capability_availability']>[number]['ready_capabilities']
>[number];

export interface CapabilityStatus {
  ready: boolean;
  /** Models that can serve it, if any. */
  models: string[];
  /** Why not, taken from a model that lists it as blocked. */
  reason: string | null;
}

export function useCapability(capability: Capability): CapabilityStatus {
  const { data } = usePolled<ModelInventory>('/v1/models', 30_000);
  const entries = data?.capability_availability ?? [];

  const models = entries
    .filter((entry) => (entry.ready_capabilities ?? []).includes(capability))
    .map((entry) => entry.model_id);

  const blocked = entries.find((entry) => (entry.blocked_capabilities ?? []).includes(capability));

  return { ready: models.length > 0, models, reason: blocked?.reason ?? null };
}
