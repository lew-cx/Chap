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

export function useStructuredSupport(modelId: string): StructuredSupport | null {
  const { data } = usePolled<ModelCapabilityReport>(
    modelId ? `/v1/models/${encodeURIComponent(modelId)}/capabilities` : null,
  );
  return data?.structured_output ?? null;
}
