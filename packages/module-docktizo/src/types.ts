/**
 * Curated names over the generated OpenAPI types.
 *
 * Same idea as packages/lewlm/src/types.ts: `components['schemas']['X']` is
 * unreadable at a call site, so every shape the module actually uses gets one
 * alias here and nothing hand-writes a field.
 *
 * What is missing is the interesting part. LewLM ships an integration bundle
 * that publishes its streaming frames and its event-type catalogue, so
 * @chap/lewlm can type a stream and enumerate 55 event types without writing
 * either down. DocKtizo publishes neither, so the two `as const` tuples at the
 * bottom of this file are hand-maintained — the only place in the module where
 * Chap restates something the upstream already knows. See docs/docktizo-gaps.md.
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

/**
 * The pipeline, in order, for the stepper.
 *
 * DocKtizo enforces this sequence in a transition table it does not publish, so
 * the order here is Chap's reading of it rather than the contract's own word.
 * The three terminal states are excluded because they are not steps.
 */
export const PIPELINE = [
  'accepted',
  'planning',
  'gathering_sources',
  'retrieving',
  'generating',
  'validating',
  'repairing',
  'compiling',
  'rendering',
  'awaiting_review',
] as const;

/** Nothing more will happen. Polling stops here. */
export const TERMINAL: readonly GenerationState[] = [
  'completed',
  'failed',
  'cancelled',
  'rejected',
];
