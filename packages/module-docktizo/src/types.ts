/**
 * Curated names over the generated OpenAPI types.
 *
 * Same idea as packages/lewlm/src/types.ts: `components['schemas']['X']` is
 * unreadable at a call site, so every shape the module actually uses gets one
 * alias here and nothing hand-writes a field.
 *
 * This file used to end with two hand-maintained tuples — the pipeline order
 * and the terminal set — because DocKtizo published neither and a stepper has
 * to know both. They are generated now (`generated/contract.ts`), and the
 * hand-written version was wrong: it omitted `changes_requested` from the
 * terminal set, so a generation that came back for changes would have been
 * polled forever.
 */

import type { components } from './generated/openapi.ts';

type Schemas = components['schemas'];

export type DocumentTypeSummary = Schemas['DocumentTypeListResponse']['items'][number];
export type DocumentTypeDetail = Schemas['DocumentTypeResponse'];

export type SourceSummary = Schemas['SourceResponse'];

export type TemplateSummary = Schemas['TemplateResponse'];
export type TemplateList = Schemas['TemplateListResponse'];

export type GenerationRequest = Schemas['GenerationCreateRequest'];
export type GenerationAccepted = Schemas['GenerationAcceptedResponse'];
export type GenerationStatus = Schemas['GenerationStatusResponse'];
export type GenerationState = Schemas['GenerationState'];
export type GenerationEventPage = Schemas['GenerationEventPageResponse'];
export type GenerationEvent = Schemas['GenerationEventResponse'];
export type GenerationCancellation = Schemas['GenerationCancellationResponse'];

export type ArtifactMetadata = Schemas['ArtifactResponse'];
export type OutputFormat = Schemas['OutputFormat'];

export type Whoami = Schemas['WhoAmIResponse'];
export type ReadinessReport = Schemas['ReadinessReport'];
export type WorkflowReadiness = Schemas['WorkflowReadiness'];

/** The state machine, from DocKtizo's own transition table. */
export { PIPELINE_ORDER, TERMINAL } from './generated/contract.ts';
