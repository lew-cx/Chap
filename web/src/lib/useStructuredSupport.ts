/**
 * What a model+runtime pair will do with an output contract, before you spend a
 * generation finding out.
 *
 * `/v1/models/{id}/capabilities` now reports `structured_output` in the same
 * `StructuredOutputRuntimeStatus` shape the response carries per contract mode —
 * so the prediction and the outcome are literally comparable, field for field.
 * That is what makes the comparison in the composer worth showing rather than
 * two differently-shaped approximations sitting next to each other.
 */

import type { ModelCapabilityReport } from '@chap/lewlm';

import { usePolled } from './usePolled.ts';

export type StructuredSupport = NonNullable<ModelCapabilityReport['structured_output']>;

export type ToolCallingSupport = NonNullable<ModelCapabilityReport['tool_calling']>;

/** One report answers both questions; the poller is shared by path. */
function useCapabilities(modelId: string): ModelCapabilityReport | null {
  return usePolled<ModelCapabilityReport>(
    modelId ? `/v1/models/${encodeURIComponent(modelId)}/capabilities` : null,
  ).data;
}

export function useStructuredSupport(modelId: string): StructuredSupport | null {
  return useCapabilities(modelId)?.structured_output ?? null;
}

/**
 * Whether this model can call tools, and how: `native` (the engine emits
 * structured calls), `prompt_guided` (LewLM teaches a format and parses it), or
 * `none`. `null` until known, and whenever LewLM is left to route.
 */
export function useToolCallingSupport(modelId: string): ToolCallingSupport | null {
  return useCapabilities(modelId)?.tool_calling ?? null;
}
