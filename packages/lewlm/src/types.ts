/**
 * Curated names over the generated contract.
 *
 * This is the only hand-written type file in the package. It exists so the rest
 * of Chap imports `ChatCompletionChunk` rather than remembering whether a shape
 * came from the integration bundle or from OpenAPI.
 */

import type { operations, paths } from './generated/openapi.ts';

// --- Shapes the bundle publishes and OpenAPI does not -----------------------
// (chat/responses requests and stream chunks, and the event envelope)

export type {
  ChatCompletionChunk,
  ChatCompletionChunkChoice,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  CitationContextPackage,
  CompletionUsage,
  DocumentChunk,
  DocumentGenerateRequest,
  DocumentGenerateResponse,
  DocumentIngestRequest,
  DocumentIngestResponse,
  DocumentTransformRequest,
  DocumentTransformResponse,
  EmbeddingCreateRequest,
  EmbeddingCreateResponse,
  EventType,
  ExecutionMetadata,
  GeneratedCitationReference,
  GrammarResponseFormat,
  IngestedDocumentSource,
  InputAudioPart,
  InputFilePart,
  InputImagePart,
  InputTextPart,
  JSONSchemaResponseFormat,
  ParsedToolCall,
  PromptCompilationTrace,
  ComponentProvenance,
  PromptMCPToolDefinition,
  PromptToolDefinition,
  ReasoningOutput,
  ReasoningVisibility,
  RerankCreateRequest,
  RerankCreateResponse,
  ResponseChunk,
  ResponseCreateRequest,
  ResponseCreateResponse,
  ResponseInputMessage,
  RetrievalContextRequest,
  RetrievalContextResponse,
  SamplingControlReport,
  SamplingControls,
  ServingProfileApplication,
  StreamEvent,
  StructuredOutputResult,
  TextResponseFormat,
  ToolCallParseIssue,
  ToolCallParseResult,
} from './generated/bundle.ts';

export { ERROR_CODES, ERRORS, EVENT_TYPES, RETRYABLE_ERROR_CODES } from './generated/enums.ts';
export type { KnownErrorCode, KnownEventType } from './generated/enums.ts';
export { CONTRACT } from './generated/meta.ts';
export type { operations, paths } from './generated/openapi.ts';

// --- Helpers that turn any of the 52 routes into a one-line alias ------------

type Op<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends keyof operations
  ? operations[paths[P][M]]
  : paths[P][M];

/** The 200 `application/json` body of a route. */
export type Res<P extends keyof paths, M extends keyof paths[P]> = Op<P, M> extends {
  responses: { 200: { content: { 'application/json': infer R } } };
}
  ? R
  : never;

/** The `application/json` request body of a route. */
export type Body<P extends keyof paths, M extends keyof paths[P]> = Op<P, M> extends {
  requestBody?: { content: { 'application/json': infer B } };
}
  ? B
  : Op<P, M> extends { requestBody: { content: { 'application/json': infer B } } }
    ? B
    : never;

// --- Route aliases ----------------------------------------------------------

export type HealthResponse = Res<'/v1/health', 'get'>;

export type ModelInventory = Res<'/v1/models', 'get'>;
export type ModelCapabilityReport = Res<'/v1/models/{model_id}/capabilities', 'get'>;
/** One manifest plus its readiness annotation — the pairing a picker needs. */
export type SingleModel = Res<'/v1/models/{model_id}', 'get'>;
export type ModelScanSummary = Res<'/v1/models/scan', 'post'>;
export type ModelLifecycleResponse = Res<'/v1/models/{model_id}/warm', 'post'>;
export type ModelResidencySnapshot = Res<'/v1/models/{model_id}/residency', 'get'>;
export type LifecycleOperationRecord = Res<'/v1/models/{model_id}/drain-operations', 'post'>;
export type JobRecord = Res<'/v1/jobs/{job_id}', 'get'>;

export type RuntimeInfo = Res<'/v1/runtime', 'get'>;
export type RuntimeStats = Res<'/v1/runtime/stats', 'get'>;
export type RuntimeResidencies = Res<'/v1/runtime/residencies', 'get'>;
export type CacheStats = Res<'/v1/cache/stats', 'get'>;
export type ClusterStatus = Res<'/v1/cluster/status', 'get'>;
export type ClusterStats = Res<'/v1/cluster/stats', 'get'>;
export type ServingProfileRecommendation = Res<'/v1/benchmarks/autotune', 'post'>;

export type SessionRecord = Res<'/v1/sessions', 'post'>;
export type SessionListResponse = Res<'/v1/sessions', 'get'>;
export type SessionDetail = Res<'/v1/sessions/{session_id}', 'get'>;
export type SessionMessagesResponse = Res<'/v1/sessions/{session_id}/messages', 'get'>;
export type SessionExportBundle = Res<'/v1/sessions/{session_id}/export', 'get'>;

export type ToolCatalog = Res<'/v1/tools', 'get'>;
export type ToolDescriptor = Res<'/v1/tools/{tool_name}', 'get'>;
export type ToolExecutionEnvelope = Res<'/v1/tools/execute', 'post'>;
export type SkillCatalog = Res<'/v1/skills', 'get'>;
export type SkillDescriptor = Res<'/v1/skills/{skill_name}', 'get'>;

export type LewLMCapabilities = Res<'/v1/lewlm/capabilities', 'get'>;
export type ProbeReport = Res<'/v1/lewlm/probes', 'post'>;
export type ConversionPlan = Res<'/v1/lewlm/conversions/plan', 'post'>;
export type ModelArtifacts = Res<'/v1/lewlm/models/{model_id}/artifacts', 'get'>;

export type TokenCountRequest = Body<'/v1/tokenize/count', 'post'>;
export type TokenCountResponse = Res<'/v1/tokenize/count', 'post'>;
export type SessionUpdateRequest = Body<'/v1/sessions/{session_id}', 'patch'>;

export type AudioTranscriptionResponse = Res<'/v1/audio/transcriptions', 'post'>;
export type AudioSpeechResponse = Res<'/v1/audio/speech', 'post'>;
export type AudioVoiceInventory = Res<'/v1/audio/voices', 'get'>;

/** The three session context policies LewLM merges history under. */
export type SessionContextPolicy = 'full_history' | 'last_turn' | 'summary_and_last_turn';
