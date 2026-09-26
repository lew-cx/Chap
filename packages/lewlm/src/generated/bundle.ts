/**
 * DO NOT EDIT.
 *
 * Generated from LewLM's published contract by `npm run gen:types`.
 * Edit LewLM, not this file. See docs/lewlm-gaps.md for what the contract
 * is missing and why some shapes look the way they do.
 */
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentSourceType".
 */
export type DocumentSourceType =
  'text' | 'markdown' | 'csv' | 'xlsx' | 'docx' | 'pdf' | 'image' | 'image_bundle';
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ReasoningVisibility".
 */
export type ReasoningVisibility = 'hidden' | 'summarized' | 'raw_model_emitted';
/**
 * The role a component played in producing a result.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ComponentKind".
 */
export type ComponentKind =
  'parser' | 'renderer' | 'chunker' | 'ocr' | 'scoring_policy' | 'tokenizer';
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RuntimeAffinity".
 */
export type RuntimeAffinity =
  | 'mlx_text'
  | 'mlx_vision'
  | 'mlx_audio'
  | 'llamacpp'
  | 'onnx_genai'
  | 'external_accelerator'
  | 'conversion'
  | 'experimental'
  | 'distributed_experimental';
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RequestModality".
 */
export type RequestModality =
  'text_only' | 'image_conditioned' | 'frame_bundle_video' | 'audio_conditioned';
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RoutingModalityPath".
 */
export type RoutingModalityPath = 'text_default' | 'text_fast_path' | 'multimodal_default';
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RuntimeSupportPath".
 */
export type RuntimeSupportPath = 'packaged' | 'bridge';
/**
 * Stable, machine-readable reasons a single source failed to ingest.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentIngestErrorCode".
 */
export type DocumentIngestErrorCode =
  | 'unsupported_source_type'
  | 'corrupt_source'
  | 'empty_source'
  | 'checksum_mismatch'
  | 'source_too_large'
  | 'parser_failed'
  | 'parser_timeout'
  | 'ocr_unavailable'
  | 'access_denied'
  | 'internal_error';
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentOutputFormat".
 */
export type DocumentOutputFormat = 'text' | 'markdown' | 'json' | 'csv' | 'docx' | 'pdf' | 'xlsx';
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "EventScope".
 */
export type EventScope = 'system' | 'request' | 'job';
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "EventType".
 */
export type EventType =
  | 'system.ready'
  | 'events.resumed'
  | 'operation.progress'
  | 'request.accepted'
  | 'request.queued'
  | 'request.failed'
  | 'request.completed'
  | 'prefill.started'
  | 'model.scan.started'
  | 'model.scan.completed'
  | 'model.scan.failed'
  | 'model.load.requested'
  | 'model.load.joined'
  | 'model.loading'
  | 'model.loaded'
  | 'model.load.failed'
  | 'model.usage.acquired'
  | 'model.usage.released'
  | 'model.drain.requested'
  | 'model.draining'
  | 'model.unload.blocked'
  | 'model.unloading'
  | 'model.unloaded'
  | 'model.unload.failed'
  | 'audio.chunk'
  | 'audio.transcription.started'
  | 'audio.transcription.completed'
  | 'audio.transcription.failed'
  | 'audio.speech.started'
  | 'audio.speech.completed'
  | 'audio.speech.failed'
  | 'document.parse.started'
  | 'document.parse.completed'
  | 'document.parse.failed'
  | 'document.render.started'
  | 'document.render.completed'
  | 'document.render.failed'
  | 'document.transform.started'
  | 'document.transform.completed'
  | 'document.transform.failed'
  | 'cluster.token.issued'
  | 'cluster.worker.enrolled'
  | 'cluster.worker.heartbeat'
  | 'cluster.plan.updated'
  | 'cluster.pipeline.stage.completed'
  | 'cluster.pipeline.completed'
  | 'cluster.worker.recovered'
  | 'autotune.completed'
  | 'token.delta'
  | 'reasoning.delta'
  | 'speculation.started'
  | 'speculation.accepted'
  | 'tool.pending'
  | 'tool.started'
  | 'tool.finished'
  | 'tool.failed';
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentTransformRequest".
 */
export type DocumentTransformRequest =
  | ContractTextReplacementRequest
  | ReceiptExtractionRequest
  | OCRAssistedExtractionRequest
  | BrandedDocumentTemplateRequest
  | FileTemplateTransformRequest
  | DocumentComparisonRequest
  | MeetingTranscriptNotesRequest
  | LongDocumentMemoRequest
  | SpeechTranscriptCleanupRequest;
export type EventScope1 = 'system' | 'request' | 'job';

export interface LewLMBundle {}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ChatMessage".
 */
export interface ChatMessage {
  role?: 'system' | 'developer' | 'user' | 'assistant' | 'tool';
  content?: string | (InputTextPart | InputImagePart | InputFilePart | InputAudioPart)[] | null;
  /**
   * On a `tool` message: the `id` of the call this result answers.
   */
  tool_call_id?: string | null;
  /**
   * On an `assistant` message: the calls that turn made, so a later `tool` message can name one.
   */
  tool_calls?: MessageToolCall[] | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "InputTextPart".
 */
export interface InputTextPart {
  type: 'text' | 'input_text';
  text: string;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "InputImagePart".
 */
export interface InputImagePart {
  type: 'input_image' | 'image';
  path?: string | null;
  upload_name?: string | null;
  detail?: 'auto' | 'low' | 'high';
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "InputFilePart".
 */
export interface InputFilePart {
  type: 'input_file' | 'file';
  path?: string | null;
  upload_name?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "InputAudioPart".
 */
export interface InputAudioPart {
  type: 'input_audio' | 'audio';
  path?: string | null;
  upload_name?: string | null;
  language?: string | null;
  prompt?: string | null;
}
/**
 * A call an earlier assistant turn made, as OpenAI's `message.tool_calls[]` spells it.
 *
 * `id` is the `call_id` LewLM reported for the call; the `tool` message that
 * answers it names the same value as `tool_call_id`.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "MessageToolCall".
 */
export interface MessageToolCall {
  id: string;
  type?: 'function';
  function: MessageToolCallFunction;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "MessageToolCallFunction".
 */
export interface MessageToolCallFunction {
  name: string;
  /**
   * The call's arguments: a JSON object, or its JSON text as OpenAI sends it.
   */
  arguments?:
    | string
    | {
        [k: string]: unknown;
      };
}
/**
 * Reusable source and chunk packages supplied by a host application.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "CitationContextPackage".
 */
export interface CitationContextPackage {
  sources?: IngestedDocumentSource[];
  chunks?: DocumentChunk[];
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "IngestedDocumentSource".
 */
export interface IngestedDocumentSource {
  /**
   * Stable source identifier. Caller-provided for uploaded sources, otherwise derived from the local source path.
   */
  source_id: string;
  /**
   * Server-local path. Always null for uploaded sources, which never make the caller depend on a shared filesystem mount.
   */
  path?: string | null;
  source_type: DocumentSourceType;
  /**
   * Basename of the local source path.
   */
  source_name: string;
  /**
   * Human-readable label for reuse in app UIs and citations.
   */
  source_label: string;
  /**
   * Detected media type when LewLM can determine it.
   */
  media_type?: string | null;
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentChunk".
 */
export interface DocumentChunk {
  /**
   * Stable chunk identifier derived from source and section identity.
   */
  chunk_id: string;
  text: string;
  /**
   * Stable source identifier that owns this chunk.
   */
  source_id: string;
  /**
   * Stable section identifier that owns this chunk.
   */
  section_id: string;
  /**
   * Human-readable source label for display and citation packaging.
   */
  source_label: string;
  /**
   * Human-readable section label for display and citation packaging.
   */
  section_label: string;
  section_heading?: string | null;
  section_level?: number | null;
  source_name?: string | null;
  source_path?: string | null;
  source_type?: DocumentSourceType | null;
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * Grammar-based structured-output contract.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "GrammarResponseFormat".
 */
export interface GrammarResponseFormat {
  type?: 'grammar';
  grammar: string;
  syntax?: string;
  name?: string | null;
  strict?: boolean;
}
/**
 * JSON-schema structured-output contract.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "JSONSchemaResponseFormat".
 */
export interface JSONSchemaResponseFormat {
  type?: 'json_schema';
  schema: {
    [k: string]: unknown;
  };
  name?: string | null;
  strict?: boolean;
}
/**
 * Prompt-only local MCP tool metadata surfaced during compilation.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "PromptMCPToolDefinition".
 */
export interface PromptMCPToolDefinition {
  name: string;
  description?: string | null;
  input_schema?: {
    [k: string]: unknown;
  };
  server: string;
}
/**
 * Declarative tool metadata that can be folded into a prompt plan.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "PromptToolDefinition".
 */
export interface PromptToolDefinition {
  name: string;
  description?: string | null;
  input_schema?: {
    [k: string]: unknown;
  };
}
/**
 * Caller-requested decode controls beyond temperature.
 *
 * Backends differ in which of these they expose, so LewLM passes through what
 * a runtime supports and reports the rest as unsupported rather than dropping
 * them silently — a caller that asked for a seed needs to know whether it
 * actually got determinism.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "SamplingControls".
 */
export interface SamplingControls {
  top_p?: number | null;
  top_k?: number | null;
  min_p?: number | null;
  repetition_penalty?: number | null;
  presence_penalty?: number | null;
  frequency_penalty?: number | null;
  /**
   * Set for reproducible sampling where the backend supports it.
   */
  seed?: number | null;
  /**
   * Stop sequences that end generation.
   */
  stop?: string[];
}
/**
 * Explicit plain-text response format.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "TextResponseFormat".
 */
export interface TextResponseFormat {
  type?: 'text';
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ChatCompletionChoice".
 */
export interface ChatCompletionChoice {
  index?: number;
  message: ChatCompletionChoiceMessage;
  finish_reason: string;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ChatCompletionChoiceMessage".
 */
export interface ChatCompletionChoiceMessage {
  role: string;
  content: string;
  reasoning?: ReasoningOutput | null;
}
/**
 * Structured reasoning metadata exposed according to policy.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ReasoningOutput".
 */
export interface ReasoningOutput {
  visibility: ReasoningVisibility;
  available?: boolean;
  content?: string | null;
  summary?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "CompletionUsage".
 */
export interface CompletionUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  /**
   * True when counts came from the model's own tokenizer. False when the backend exposed no tokenizer and LewLM had to estimate.
   */
  measured?: boolean;
  /**
   * Prompt tokens the backend reported as served from its own prefix cache (OpenAI-style prompt_tokens_details.cached_tokens). Absent when the backend exposes no such counter; LewLM never infers it.
   */
  cached_tokens?: number | null;
}
/**
 * One named, versioned component that contributed to a result.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ComponentProvenance".
 */
export interface ComponentProvenance {
  kind: ComponentKind;
  /**
   * Stable LewLM-owned component name, not a package name.
   */
  name: string;
  /**
   * Version of the LewLM-owned component behaviour.
   */
  version: string;
  /**
   * Third-party distribution that performs the work, when one does.
   */
  implementation?: string | null;
  /**
   * Installed version of `implementation`, or null when it cannot be determined.
   */
  implementation_version?: string | null;
  /**
   * Whether the same input reproduces the same output on this component.
   */
  deterministic?: boolean;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ExecutionMetadata".
 */
export interface ExecutionMetadata {
  /**
   * Envelope schema version. This does NOT identify the components that ran; see `components`.
   */
  version?: 'v1';
  request_id: string;
  /**
   * Caller-supplied correlation identifier echoed back on every result that carries it.
   */
  correlation_id?: string | null;
  created: number;
  result_origin?: 'runtime' | 'cache_hit' | 'coalesced' | 'tool_execution' | 'idempotent_replay';
  model?: ExecutionModelMetadata;
  routing: ExecutionRoutingMetadata;
  timing?: ExecutionTimingMetadata;
  serving?: ExecutionServingMetadata | null;
  /**
   * Named, versioned components that produced this result.
   */
  components?: ComponentProvenance[];
  /**
   * Which requested sampling controls the backend applied, and which it could not.
   */
  sampling?: SamplingControlReport | null;
  idempotency_key?: string | null;
  idempotent_replay?: boolean;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ExecutionModelMetadata".
 */
export interface ExecutionModelMetadata {
  requested_model_id?: string | null;
  resolved_model_id?: string | null;
  runtime_name?: string | null;
  runtime_affinity?: RuntimeAffinity | null;
  endpoint_id?: string | null;
  engine_profile?: string | null;
  execution_locality?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ExecutionRoutingMetadata".
 */
export interface ExecutionRoutingMetadata {
  kind: 'model_router' | 'tool_execution';
  reason?: string | null;
  request_modality?: RequestModality | null;
  modality_path?: RoutingModalityPath | null;
  modality_path_reason?: string | null;
  alternatives?: string[];
  fallback_from_model_id?: string | null;
  fallback_reason?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ExecutionTimingMetadata".
 */
export interface ExecutionTimingMetadata {
  queue_milliseconds?: number;
  load_milliseconds?: number;
  execute_milliseconds?: number;
  total_milliseconds?: number;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ExecutionServingMetadata".
 */
export interface ExecutionServingMetadata {
  capability?: string | null;
  phase?: string | null;
  streaming?: boolean;
  streaming_owner?: string | null;
  runtime_adapter_kind?: string | null;
  cancellation_requested?: boolean;
  queue_residency_milliseconds?: number;
  queue_count?: number;
  batched?: boolean;
  batch_size?: number;
}
/**
 * What a runtime did with the requested sampling controls.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "SamplingControlReport".
 */
export interface SamplingControlReport {
  runtime: string;
  requested?: {
    [k: string]: unknown;
  };
  applied?: {
    [k: string]: unknown;
  };
  /**
   * Controls the caller requested that this backend cannot honor.
   */
  unsupported?: string[];
  /**
   * True only when a seed was requested and the backend actually applied it.
   */
  deterministic?: boolean;
}
/**
 * Stable machine-readable citation reference resolved from generated output.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "GeneratedCitationReference".
 */
export interface GeneratedCitationReference {
  /**
   * Stable citation token emitted by the model and resolved by LewLM.
   */
  reference_id: string;
  /**
   * Stable source identifier aligned with document ingest output.
   */
  source_id: string;
  /**
   * Stable chunk identifier when the citation points to one chunk.
   */
  chunk_id?: string | null;
  /**
   * Stable section identifier when LewLM can resolve the citation to a known section.
   */
  section_id?: string | null;
  /**
   * Readable source label aligned with document ingest packaging.
   */
  source_label: string;
  /**
   * Readable section label aligned with document ingest packaging when LewLM can resolve one.
   */
  section_label?: string | null;
}
/**
 * One strictly parsed and schema-validated tool call.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ParsedToolCall".
 */
export interface ParsedToolCall {
  call_id: string;
  name: string;
  arguments?: {
    [k: string]: unknown;
  };
}
/**
 * Attachment metadata surfaced by prompt compilation.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "PromptAttachmentPlanEntry".
 */
export interface PromptAttachmentPlanEntry {
  message_index: number;
  role: string;
  name: string;
  attachment_type: string;
  media_type?: string | null;
  source_path?: string | null;
  extracted_text_characters?: number;
}
/**
 * Inspectable trace for a compiled prompt.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "PromptCompilationTrace".
 */
export interface PromptCompilationTrace {
  selected_template: string;
  requested_model_id?: string | null;
  resolved_model_id?: string | null;
  model_prompt_template?: PromptModelTemplateSelection | null;
  serialized_model_prompt?: string | null;
  message_count: number;
  message_roles?: string[];
  attachment_plan?: PromptAttachmentPlanEntry[];
  tool_plan?: PromptToolPlanEntry[];
  output_contract?: PromptOutputContract;
  overrides?: PromptOverrideRecord[];
}
/**
 * Selected model-aware prompt template used for serialization.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "PromptModelTemplateSelection".
 */
export interface PromptModelTemplateSelection {
  id: string;
  version: string;
  source?: 'default' | 'architecture_family' | 'model_id';
  matched_on?: string | null;
}
/**
 * Tool metadata surfaced by prompt compilation.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "PromptToolPlanEntry".
 */
export interface PromptToolPlanEntry {
  name: string;
  source?: 'request' | 'tools_file' | 'skills_file' | 'mcp_request' | 'mcp_tools_file';
  description?: string | null;
  input_schema?: {
    [k: string]: unknown;
  };
  registered?: boolean;
  execution_mode?: 'prompt_only' | 'local_tool';
  version?: string | null;
  required_authorization?: string | null;
  mcp_server?: string | null;
  metadata_trusted?: boolean;
}
/**
 * Declared output contract for a compiled prompt.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "PromptOutputContract".
 */
export interface PromptOutputContract {
  format?: 'text' | 'json_schema' | 'grammar';
  name?: string | null;
  strict?: boolean | null;
  schema?: {
    [k: string]: unknown;
  } | null;
  grammar?: string | null;
  syntax?: string | null;
}
/**
 * Inspectable record of an applied prompt override.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "PromptOverrideRecord".
 */
export interface PromptOverrideRecord {
  source: string;
  scope: string;
  summary: string;
  path?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ServingProfileApplication".
 */
export interface ServingProfileApplication {
  status: 'selected' | 'disabled' | 'not_found' | 'runtime_mismatch' | 'stale' | 'unavailable';
  source?: string;
  capability?: string;
  workload_class?: string;
  preset?: string;
  profile_id?: string | null;
  stale_inputs?: {
    /**
     * @minItems 2
     * @maxItems 2
     */
    [k: string]: [unknown, unknown];
  };
  runtime?: string | null;
  reason: string;
  recommendation_reason?: string | null;
  recommended_at?: string | null;
  artifact_id?: string | null;
  accepted_settings?: {
    [k: string]: number | string | boolean | null;
  };
  rejected_settings?: {
    [k: string]: ServingProfileRejectedSetting;
  };
  effective_settings?: {
    [k: string]: number | string | boolean | null;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ServingProfileRejectedSetting".
 */
export interface ServingProfileRejectedSetting {
  requested_value?: number | string | boolean | null;
  reason: string;
}
/**
 * Single structured-output validation issue.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "StructuredOutputIssue".
 */
export interface StructuredOutputIssue {
  code: string;
  message: string;
  path?: (string | number)[];
}
/**
 * Public structured-output status attached to generation responses.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "StructuredOutputResult".
 */
export interface StructuredOutputResult {
  requested?: boolean;
  contract?: (TextResponseFormat | JSONSchemaResponseFormat | GrammarResponseFormat) | null;
  enforcement?: 'none' | 'prompt_guided' | 'decode_time';
  decoder_enforced?: boolean;
  enforcement_evidence?: ('decoder' | 'upstream_native' | 'prompt') | null;
  fallback_used?: boolean;
  fallback_reason?: string | null;
  grammar_relaxations?: string[];
  parsed_output?: unknown;
  validation?: StructuredOutputValidation;
}
/**
 * Post-generation validation metadata for a structured-output request.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "StructuredOutputValidation".
 */
export interface StructuredOutputValidation {
  state?: 'not_requested' | 'valid' | 'invalid' | 'unavailable';
  validator?: 'none' | 'json_parse_only' | 'full_json_schema' | 'grammar';
  message?: string | null;
  issues?: StructuredOutputIssue[];
}
/**
 * One explicit reason a tool-call candidate was not accepted.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ToolCallParseIssue".
 */
export interface ToolCallParseIssue {
  code:
    | 'invalid_json'
    | 'unrecognized_shape'
    | 'missing_name'
    | 'unknown_tool'
    | 'arguments_not_object'
    | 'schema_violation';
  message: string;
  candidate_index: number;
}
/**
 * Strict parse outcome for one model output text.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ToolCallParseResult".
 */
export interface ToolCallParseResult {
  status: 'no_tool_calls' | 'parsed' | 'partial' | 'failed';
  parser?: string;
  tool_calls?: ParsedToolCall[];
  issues?: ToolCallParseIssue[];
  remaining_text?: string;
  parallel?: boolean;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ChatCompletionChunkChoice".
 */
export interface ChatCompletionChunkChoice {
  index?: number;
  delta: ChatCompletionDelta;
  finish_reason?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ChatCompletionDelta".
 */
export interface ChatCompletionDelta {
  role?: string | null;
  content?: string | null;
  reasoning?: ReasoningOutput | null;
  tool_calls?:
    | {
        [k: string]: unknown;
      }[]
    | null;
}
/**
 * Why a stream ended before its normal terminal chunk.
 *
 * Carried on a final chunk whose `finish_reason` is `error` (chat) or whose
 * `done` is true (responses), followed by `[DONE]`, so a client sees a
 * structured failure instead of a dropped connection. Any output already
 * delivered stands; LewLM never replays the request. Raw backend payloads
 * and credentials are never included.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "StreamErrorEnvelope".
 */
export interface StreamErrorEnvelope {
  code: string;
  message: string;
  details?: {
    [k: string]: unknown;
  };
  /**
   * True when at least one content delta had been delivered before the failure.
   */
  partial_output?: boolean;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ResponseInputMessage".
 */
export interface ResponseInputMessage {
  role?: 'system' | 'developer' | 'user' | 'assistant' | 'tool';
  content?: string | (InputTextPart | InputImagePart | InputFilePart | InputAudioPart)[] | null;
  /**
   * On a `tool` message: the `id` of the call this result answers.
   */
  tool_call_id?: string | null;
  /**
   * On an `assistant` message: the calls that turn made, so a later `tool` message can name one.
   */
  tool_calls?: MessageToolCall[] | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ResponseOutputText".
 */
export interface ResponseOutputText {
  type?: 'output_text';
  text: string;
  reasoning?: ReasoningOutput | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "EmbeddingDatum".
 */
export interface EmbeddingDatum {
  object?: 'embedding';
  embedding: number[];
  index: number;
}
/**
 * Explainable routing result for a generation request.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RoutingDecision".
 */
export interface RoutingDecision {
  model_id: string;
  runtime_name: string;
  runtime_affinity: RuntimeAffinity;
  support_path?: RuntimeSupportPath | null;
  reason: string;
  request_modality?: RequestModality | null;
  modality_path?: RoutingModalityPath | null;
  modality_path_reason?: string | null;
  alternatives?: string[];
  endpoint_id?: string | null;
  engine_profile?: string | null;
  execution_locality?: string | null;
  fallback_from_model_id?: string | null;
  fallback_reason?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RetrievalContextItem".
 */
export interface RetrievalContextItem {
  rank: number;
  score: number;
  embedding_score?: number | null;
  rerank_score?: number | null;
  chunk: DocumentChunk;
  source?: IngestedDocumentSource | null;
}
/**
 * The named, versioned ranking rules a retrieval response actually used.
 *
 * LewLM's ranking is rerank-primary with embedding tie-breaking and a stable
 * original-input-order fallback. That is a reasonable policy, but it is only
 * reproducible for a caller if it is named and versioned.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RetrievalScoringPolicy".
 */
export interface RetrievalScoringPolicy {
  name?: string;
  version?: string;
  primary_signal: 'rerank' | 'embedding' | 'none';
  tie_break_signal: 'embedding' | 'original_order';
  final_tie_break?: 'original_order';
  normalization?: 'none' | 'cosine';
  missing_score_behaviour?: 'rejected' | 'ranked_last';
  deduplication?: 'none' | 'chunk_id';
  embeddings_used: boolean;
  rerank_used: boolean;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RetrievalStageSummary".
 */
export interface RetrievalStageSummary {
  request_id: string;
  created: number;
  model: string;
  routing: RoutingDecision;
  metadata: ExecutionMetadata;
  usage?: CompletionUsage | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RerankResultItem".
 */
export interface RerankResultItem {
  index: number;
  relevance_score: number;
  document?: string | null;
}
/**
 * A document uploaded as bytes, requiring no shared filesystem mount.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentUploadSource".
 */
export interface DocumentUploadSource {
  /**
   * Caller-provided opaque identifier echoed back on every result.
   */
  source_id: string;
  file_name: string;
  content_base64: string;
  media_type?: string | null;
  /**
   * When set, LewLM refuses the source unless the received bytes match.
   */
  expected_sha256?: string | null;
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "CalloutBlock".
 */
export interface CalloutBlock {
  type?: 'callout';
  kind?: 'info' | 'warning' | 'success' | 'note';
  body: string;
  style_tokens?: string[];
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "Citation".
 */
export interface Citation {
  label: string;
  text: string;
  url?: string | null;
  style_tokens?: string[];
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentIR".
 */
export interface DocumentIR {
  metadata?: {
    [k: string]: unknown;
  };
  style_tokens?: StyleToken[];
  header?: HeaderFooterContent | null;
  footer?: HeaderFooterContent | null;
  sections?: DocumentSection[];
  references_title?: string;
  citations?: Citation[];
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "StyleToken".
 */
export interface StyleToken {
  name: string;
  value: string;
  applies_to?: string | null;
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "HeaderFooterContent".
 */
export interface HeaderFooterContent {
  left?: string | null;
  center?: string | null;
  right?: string | null;
  style_tokens?: string[];
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentSection".
 */
export interface DocumentSection {
  heading?: string | null;
  level?: number;
  style_tokens?: string[];
  metadata?: {
    [k: string]: unknown;
  };
  blocks?: (ParagraphBlock | TableBlock | ListBlock | CalloutBlock | ImageBlock)[];
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ParagraphBlock".
 */
export interface ParagraphBlock {
  type?: 'paragraph';
  text: string;
  style_tokens?: string[];
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "TableBlock".
 */
export interface TableBlock {
  type?: 'table';
  headers?: string[];
  rows?: string[][];
  caption?: string | null;
  style_tokens?: string[];
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ListBlock".
 */
export interface ListBlock {
  type?: 'list';
  ordered?: boolean;
  items?: string[];
  style_tokens?: string[];
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ImageBlock".
 */
export interface ImageBlock {
  type?: 'image';
  alt_text: string;
  path?: string | null;
  caption?: string | null;
  role?: 'image' | 'logo';
  mime_type?: string | null;
  width?: number | null;
  height?: number | null;
  style_tokens?: string[];
  metadata?: {
    [k: string]: unknown;
  };
}
/**
 * The per-source result of a multi-source ingest request.
 *
 * Multi-source ingestion previously surfaced only the sources that succeeded,
 * leaving a caller to infer which of its inputs went missing and with no way
 * to recover the reason. Every requested source now gets exactly one outcome.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentSourceIngestOutcome".
 */
export interface DocumentSourceIngestOutcome {
  /**
   * Caller-provided ID for uploads, else the LewLM-derived ID.
   */
  source_id: string;
  status: 'ingested' | 'failed';
  source_label?: string | null;
  source_type?: DocumentSourceType | null;
  media_type?: string | null;
  chunk_count?: number;
  section_count?: number;
  /**
   * SHA-256 of the bytes LewLM actually parsed.
   */
  content_sha256?: string | null;
  error_code?: DocumentIngestErrorCode | null;
  error_message?: string | null;
  /**
   * Whether retrying this source unchanged could plausibly succeed.
   */
  retryable?: boolean;
  /**
   * LewLM-side reference for correlating this source with logs and events.
   */
  provider_reference?: string | null;
  /**
   * Parser, OCR, and chunker components applied to this source.
   */
  components?: ComponentProvenance[];
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "BrandedDocumentSectionInput".
 */
export interface BrandedDocumentSectionInput {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  callout_title?: string | null;
  callout_body?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "BrandedDocumentSettings".
 */
export interface BrandedDocumentSettings {
  organization_name: string;
  subtitle?: string | null;
  audience?: string | null;
  issued_on?: string | null;
  contact_line?: string | null;
  header_text?: string | null;
  footer_text?: string | null;
  logo_path?: string | null;
  hero_image_path?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "BrandedDocumentTemplateInput".
 */
export interface BrandedDocumentTemplateInput {
  settings: BrandedDocumentSettings;
  summary: string;
  key_points?: string[];
  sections?: BrandedDocumentSectionInput[];
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "BrandedDocumentTemplateRequest".
 */
export interface BrandedDocumentTemplateRequest {
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  skill?: 'branded_document_template';
  output_format: DocumentOutputFormat;
  file_name?: string | null;
  input: BrandedDocumentTemplateInput;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ContractTextReplacementInput".
 */
export interface ContractTextReplacementInput {
  template_text: string;
  replacements?: {
    [k: string]: string;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ContractTextReplacementRequest".
 */
export interface ContractTextReplacementRequest {
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  skill?: 'contract_text_replacement';
  output_format: DocumentOutputFormat;
  file_name?: string | null;
  input: ContractTextReplacementInput;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentComparisonInput".
 */
export interface DocumentComparisonInput {
  left_title?: string;
  left_text: string;
  right_title?: string;
  right_text: string;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentComparisonRequest".
 */
export interface DocumentComparisonRequest {
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  skill?: 'document_comparison';
  output_format: DocumentOutputFormat;
  file_name?: string | null;
  input: DocumentComparisonInput;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "FileTemplateTransformInput".
 */
export interface FileTemplateTransformInput {
  replacements?: {
    [k: string]: string;
  };
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "FileTemplateTransformRequest".
 */
export interface FileTemplateTransformRequest {
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  skill?: 'file_template';
  output_format: DocumentOutputFormat;
  file_name?: string | null;
  template_path: string;
  input?: FileTemplateTransformInput;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "LongDocumentMemoInput".
 */
export interface LongDocumentMemoInput {
  source_title?: string;
  source_text: string;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "LongDocumentMemoRequest".
 */
export interface LongDocumentMemoRequest {
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  skill?: 'long_document_memo';
  output_format: DocumentOutputFormat;
  file_name?: string | null;
  input: LongDocumentMemoInput;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "MeetingTranscriptNotesInput".
 */
export interface MeetingTranscriptNotesInput {
  transcript_text: string;
  participants?: string[];
  meeting_date?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "MeetingTranscriptNotesRequest".
 */
export interface MeetingTranscriptNotesRequest {
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  skill?: 'meeting_transcript_notes';
  output_format: DocumentOutputFormat;
  file_name?: string | null;
  input: MeetingTranscriptNotesInput;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "OCRAssistedExtractionField".
 */
export interface OCRAssistedExtractionField {
  field: string;
  aliases?: string[];
  required?: boolean;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "OCRAssistedExtractionInput".
 */
export interface OCRAssistedExtractionInput {
  source_title?: string;
  document_type?: string | null;
  ocr_text: string;
  expected_fields?: OCRAssistedExtractionField[];
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "OCRAssistedExtractionRequest".
 */
export interface OCRAssistedExtractionRequest {
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  skill?: 'ocr_assisted_extraction';
  output_format: DocumentOutputFormat;
  file_name?: string | null;
  input: OCRAssistedExtractionInput;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ReceiptExtractionInput".
 */
export interface ReceiptExtractionInput {
  vendor: string;
  receipt_number?: string | null;
  purchased_at?: string | null;
  currency?: string | null;
  items?: ReceiptLineItem[];
  subtotal?: string | null;
  tax?: string | null;
  total?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ReceiptLineItem".
 */
export interface ReceiptLineItem {
  description: string;
  quantity?: string;
  unit_price?: string | null;
  total?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ReceiptExtractionRequest".
 */
export interface ReceiptExtractionRequest {
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  skill?: 'receipt_extraction';
  output_format: DocumentOutputFormat;
  file_name?: string | null;
  input: ReceiptExtractionInput;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "SpeechTranscriptCleanupInput".
 */
export interface SpeechTranscriptCleanupInput {
  transcript_text: string;
  language?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "SpeechTranscriptCleanupRequest".
 */
export interface SpeechTranscriptCleanupRequest {
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  skill?: 'speech_transcript_cleanup';
  output_format: DocumentOutputFormat;
  file_name?: string | null;
  input: SpeechTranscriptCleanupInput;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ChatCompletionRequest".
 */
export interface ChatCompletionRequest {
  model?: string | null;
  session_id?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  messages: ChatMessage[];
  citation_context?: CitationContextPackage | null;
  max_tokens?: number;
  temperature?: number;
  /**
   * Decode controls beyond temperature. Backends differ in support; `metadata.sampling` reports which were applied and which were not.
   */
  sampling?: SamplingControls | null;
  apply_serving_profile?: boolean;
  stream?: boolean;
  reasoning_visibility?: ReasoningVisibility | null;
  system_prompt?: string | null;
  developer_prompt?: string | null;
  pretext_path?: string | null;
  skills_path?: string | null;
  response_format?: (TextResponseFormat | JSONSchemaResponseFormat | GrammarResponseFormat) | null;
  response_format_path?: string | null;
  output_schema?: {
    [k: string]: unknown;
  } | null;
  output_schema_path?: string | null;
  tools?: PromptToolDefinition[];
  tools_path?: string | null;
  tool_choice?:
    | ('auto' | 'none' | 'required')
    | {
        [k: string]: unknown;
      }
    | null;
  mcp_tools?: PromptMCPToolDefinition[];
  mcp_tools_path?: string | null;
  include_prompt_trace?: boolean;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ChatCompletionResponse".
 */
export interface ChatCompletionResponse {
  id: string;
  object?: 'chat.completion';
  created: number;
  model: string;
  session_id?: string | null;
  choices: ChatCompletionChoice[];
  usage: CompletionUsage;
  metadata: ExecutionMetadata;
  citations?: GeneratedCitationReference[];
  structured_output?: StructuredOutputResult | null;
  tool_calls?: ToolCallParseResult | null;
  prompt_trace?: PromptCompilationTrace | null;
  serving_profile?: ServingProfileApplication | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ChatCompletionChunk".
 */
export interface ChatCompletionChunk {
  id: string;
  object?: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: ChatCompletionChunkChoice[];
  citations?: GeneratedCitationReference[];
  /**
   * Token accounting. Present on the final chunk only, since it is not knowable before then.
   */
  usage?: CompletionUsage | null;
  metadata?: ExecutionMetadata | null;
  structured_output?: StructuredOutputResult | null;
  tool_calls?: ToolCallParseResult | null;
  /**
   * Present only on a terminal chunk with finish_reason `error`: the stream ended incompletely.
   */
  error?: StreamErrorEnvelope | null;
  /**
   * Compiled-prompt trace when `include_prompt_trace` was set. Present on the final chunk only, so inspecting the prompt does not cost the caller its stream.
   */
  prompt_trace?: PromptCompilationTrace | null;
  serving_profile?: ServingProfileApplication | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ResponseCreateRequest".
 */
export interface ResponseCreateRequest {
  model?: string | null;
  session_id?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
  input: string | ResponseInputMessage[];
  citation_context?: CitationContextPackage | null;
  max_output_tokens?: number;
  temperature?: number;
  /**
   * Decode controls beyond temperature. Backends differ in support; `metadata.sampling` reports which were applied and which were not.
   */
  sampling?: SamplingControls | null;
  apply_serving_profile?: boolean;
  stream?: boolean;
  reasoning_visibility?: ReasoningVisibility | null;
  system_prompt?: string | null;
  developer_prompt?: string | null;
  pretext_path?: string | null;
  skills_path?: string | null;
  response_format?: (TextResponseFormat | JSONSchemaResponseFormat | GrammarResponseFormat) | null;
  response_format_path?: string | null;
  output_schema?: {
    [k: string]: unknown;
  } | null;
  output_schema_path?: string | null;
  tools?: PromptToolDefinition[];
  tools_path?: string | null;
  tool_choice?:
    | ('auto' | 'none' | 'required')
    | {
        [k: string]: unknown;
      }
    | null;
  mcp_tools?: PromptMCPToolDefinition[];
  mcp_tools_path?: string | null;
  include_prompt_trace?: boolean;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ResponseCreateResponse".
 */
export interface ResponseCreateResponse {
  id: string;
  object?: 'response';
  created: number;
  model: string;
  session_id?: string | null;
  output: ResponseOutputText[];
  output_text: string;
  /**
   * Why generation stopped, from the same vocabulary the chat surface publishes: `stop`, `length` (the reply hit `max_output_tokens` and is truncated), or `tool_calls`. Always set by this server; `null` only from a LewLM older than this field.
   */
  finish_reason?: string | null;
  usage?: CompletionUsage;
  metadata: ExecutionMetadata;
  citations?: GeneratedCitationReference[];
  structured_output?: StructuredOutputResult | null;
  tool_calls?: ToolCallParseResult | null;
  prompt_trace?: PromptCompilationTrace | null;
  serving_profile?: ServingProfileApplication | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "ResponseChunk".
 */
export interface ResponseChunk {
  id: string;
  object?: 'response.chunk';
  created: number;
  model: string;
  delta?: string | null;
  reasoning?: ReasoningOutput | null;
  tool_call_delta?:
    | {
        [k: string]: unknown;
      }[]
    | null;
  done?: boolean;
  /**
   * Why the stream ended, on the terminal chunk (`done` true) only: `stop`, `length`, `tool_calls`, `cancelled` (a named cancel stopped it; delivered text stands), or `error`.
   */
  finish_reason?: string | null;
  citations?: GeneratedCitationReference[];
  /**
   * Token accounting. Present on the final chunk only, since it is not knowable before then.
   */
  usage?: CompletionUsage | null;
  metadata?: ExecutionMetadata | null;
  structured_output?: StructuredOutputResult | null;
  tool_calls?: ToolCallParseResult | null;
  /**
   * Present only on a terminal chunk (`done` true) when the stream ended incompletely.
   */
  error?: StreamErrorEnvelope | null;
  /**
   * Compiled-prompt trace when `include_prompt_trace` was set. Present on the final chunk only, so inspecting the prompt does not cost the caller its stream.
   */
  prompt_trace?: PromptCompilationTrace | null;
  serving_profile?: ServingProfileApplication | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "EmbeddingCreateRequest".
 */
export interface EmbeddingCreateRequest {
  model?: string | null;
  input: string | string[];
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "EmbeddingCreateResponse".
 */
export interface EmbeddingCreateResponse {
  request_id: string;
  created: number;
  object?: 'list';
  data: EmbeddingDatum[];
  model: string;
  usage?: CompletionUsage;
  routing: RoutingDecision;
  metadata: ExecutionMetadata;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RetrievalContextRequest".
 */
export interface RetrievalContextRequest {
  query: string;
  candidate_chunks: DocumentChunk[];
  candidate_sources?: IngestedDocumentSource[];
  top_k?: number;
  use_embeddings?: boolean;
  use_rerank?: boolean;
  embedding_model?: string | null;
  rerank_model?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RetrievalContextResponse".
 */
export interface RetrievalContextResponse {
  request_id: string;
  created: number;
  query: string;
  strategy: 'hybrid' | 'embeddings' | 'rerank';
  candidate_count: number;
  returned_count: number;
  items: RetrievalContextItem[];
  sources?: IngestedDocumentSource[];
  scoring_policy: RetrievalScoringPolicy1;
  embedding_stage?: RetrievalStageSummary | null;
  rerank_stage?: RetrievalStageSummary | null;
  metadata: ExecutionMetadata;
}
/**
 * Named, versioned ranking rules this response applied.
 */
export interface RetrievalScoringPolicy1 {
  name?: string;
  version?: string;
  primary_signal: 'rerank' | 'embedding' | 'none';
  tie_break_signal: 'embedding' | 'original_order';
  final_tie_break?: 'original_order';
  normalization?: 'none' | 'cosine';
  missing_score_behaviour?: 'rejected' | 'ranked_last';
  deduplication?: 'none' | 'chunk_id';
  embeddings_used: boolean;
  rerank_used: boolean;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RerankCreateRequest".
 */
export interface RerankCreateRequest {
  model?: string | null;
  query: string;
  documents: string[];
  top_n?: number | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "RerankCreateResponse".
 */
export interface RerankCreateResponse {
  request_id: string;
  created: number;
  model: string;
  results: RerankResultItem[];
  routing: RoutingDecision;
  metadata: ExecutionMetadata;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentIngestRequest".
 */
export interface DocumentIngestRequest {
  /**
   * Server-local paths. Only usable when the caller shares LewLM's filesystem.
   */
  paths?: string[];
  /**
   * Uploaded byte sources with caller-owned identity. Preferred for remote callers.
   */
  sources?: DocumentUploadSource[];
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentIngestResponse".
 */
export interface DocumentIngestResponse {
  document: DocumentIR;
  sources?: IngestedDocumentSource[];
  chunks?: DocumentChunk[];
  /**
   * One outcome per requested source, in request order.
   */
  source_results?: DocumentSourceIngestOutcome[];
  ingested_count?: number;
  failed_count?: number;
  /**
   * True when at least one requested source failed while others succeeded.
   */
  partial?: boolean;
  /**
   * Distinct components that contributed to this ingest.
   */
  components?: ComponentProvenance[];
  request_id: string;
  idempotency_key?: string | null;
  idempotent_replay?: boolean;
  metadata: ExecutionMetadata;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentGenerateRequest".
 */
export interface DocumentGenerateRequest {
  output_format: DocumentOutputFormat;
  document: DocumentIR;
  file_name?: string | null;
  authorized_actions?: string[];
  idempotency_key?: string | null;
  /**
   * Caller correlation identifier echoed back through metadata and events.
   */
  correlation_id?: string | null;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentGenerateResponse".
 */
export interface DocumentGenerateResponse {
  request_id: string;
  idempotency_key?: string | null;
  idempotent_replay?: boolean;
  file_name: string;
  output_format: DocumentOutputFormat;
  media_type: string;
  size_bytes: number;
  /**
   * Base64-encoded artifact payload.
   */
  content_base64: string;
  metadata: ExecutionMetadata;
}
/**
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "DocumentTransformResponse".
 */
export interface DocumentTransformResponse {
  request_id: string;
  idempotency_key?: string | null;
  idempotent_replay?: boolean;
  file_name: string;
  output_format: DocumentOutputFormat;
  media_type: string;
  size_bytes: number;
  /**
   * Base64-encoded artifact payload.
   */
  content_base64: string;
  metadata: ExecutionMetadata;
  skill: string;
}
/**
 * An event emitted by LewLM subsystems.
 *
 * This interface was referenced by `LewLMBundle`'s JSON-Schema
 * via the `definition` "StreamEvent".
 */
export interface StreamEvent {
  event_id?: string;
  /**
   * Position of this event in the stream, assigned when it was published: the SSE frame's `id:` and the value `Last-Event-ID` or `?after=` resumes from. Opaque; compare only for equality. Null on an event that was never published to the bus, such as the `events.resumed` marker.
   */
  cursor?: string | null;
  type: EventType;
  scope?: EventScope1;
  created_at?: string;
  payload?: {
    [k: string]: unknown;
  };
  request_id?: string | null;
  /**
   * Caller correlation identifier for the request that produced this event.
   */
  correlation_id?: string | null;
  model_id?: string | null;
  runtime?: string | null;
  capability?: string | null;
  operation?: string | null;
  stage?: string | null;
  status?: string | null;
}
