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

export type DocumentTypeList = Schemas['DocumentTypeListResponse'];
export type DocumentTypeDetail = Schemas['DocumentTypeResponse'];

export type SourceSummary = Schemas['SourceResponse'];

export type TemplateSummary = Schemas['TemplateResponse'];
export type TemplateList = Schemas['TemplateListResponse'];

export type GenerationRequest = Schemas['GenerationCreateRequest'];
export type GenerationAccepted = Schemas['GenerationAcceptedResponse'];
export type GenerationStatus = Schemas['GenerationStatusResponse'];
export type GenerationState = Schemas['GenerationState'];
export type GenerationEvent = Schemas['GenerationEventResponse'];
export type GenerationCancellation = Schemas['GenerationCancellationResponse'];

export type ArtifactMetadata = Schemas['ArtifactResponse'];
export type OutputFormat = Schemas['OutputFormat'];

/**
 * The document, which is what a generation actually produces.
 *
 * A generation is a run; a document is the durable thing with a head revision,
 * a review state and a version history. Chap used to stop at the run, so
 * `awaiting_review` was a wall: the pipeline reached it and nothing in the UI
 * could act on it.
 */
export type DocumentDetail = Schemas['DocumentResponse'];
export type DocumentList = Schemas['DocumentListResponse'];
export type RevisionList = Schemas['RevisionListResponse'];
export type RevisionSummary = Schemas['RevisionSummaryResponse'];
export type RevisionDetail = Schemas['RevisionResponse'];
export type RevisionRequest = Schemas['RevisionCreateRequest'];
export type ManualOverrideRequest = Schemas['ManualOverrideCreateRequest'];
export type ReviewState = Schemas['ReviewState'];

export type ApprovalHistory = Schemas['ApprovalHistoryResponse'];
export type ApprovalRecord = Schemas['ApprovalRecordResponse'];
export type ApprovalDecision = Schemas['ApprovalDecisionResponse'];

/**
 * Moving a document onto a new workflow version.
 *
 * The preview is the interesting half: DocKtizo maps the document under the
 * target version's rules without writing anything, and reports every
 * consequence as a coded notice. Some of those must be acknowledged by code
 * before the submit is allowed, which is why the same request type serves both
 * calls — the second one just carries `acknowledged_notices`.
 */
export type MigrationRequest = Schemas['WorkflowMigrationCreateRequest'];
export type MigrationPreview = Schemas['WorkflowMigrationPreviewResponse'];
export type MigrationNotice = Schemas['MigrationNoticeResponse'];

export type Whoami = Schemas['WhoAmIResponse'];
export type ReadinessReport = Schemas['ReadinessReport'];
export type WorkflowReadiness = Schemas['WorkflowReadiness'];

/** The state machine, from DocKtizo's own transition table. */
export { PIPELINE_ORDER, RESTING, TERMINAL } from './generated/contract.ts';
