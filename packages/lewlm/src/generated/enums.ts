/**
 * DO NOT EDIT.
 *
 * Generated from LewLM's published contract by `npm run gen:types`.
 * Edit LewLM, not this file. See docs/lewlm-gaps.md for what the contract
 * is missing and why some shapes look the way they do.
 */

/** Every event LewLM can emit on `/v1/events`. Source: integration-bundle.json. */
export const EVENT_TYPES = [
  "audio.chunk",
  "audio.speech.completed",
  "audio.speech.failed",
  "audio.speech.started",
  "audio.transcription.completed",
  "audio.transcription.failed",
  "audio.transcription.started",
  "autotune.completed",
  "cluster.pipeline.completed",
  "cluster.pipeline.stage.completed",
  "cluster.plan.updated",
  "cluster.token.issued",
  "cluster.worker.enrolled",
  "cluster.worker.heartbeat",
  "cluster.worker.recovered",
  "document.parse.completed",
  "document.parse.failed",
  "document.parse.started",
  "document.render.completed",
  "document.render.failed",
  "document.render.started",
  "document.transform.completed",
  "document.transform.failed",
  "document.transform.started",
  "model.drain.requested",
  "model.draining",
  "model.load.failed",
  "model.load.joined",
  "model.load.requested",
  "model.loaded",
  "model.loading",
  "model.scan.completed",
  "model.scan.failed",
  "model.scan.started",
  "model.unload.blocked",
  "model.unload.failed",
  "model.unloaded",
  "model.unloading",
  "model.usage.acquired",
  "model.usage.released",
  "operation.progress",
  "prefill.started",
  "reasoning.delta",
  "request.accepted",
  "request.completed",
  "request.failed",
  "request.queued",
  "speculation.accepted",
  "speculation.started",
  "system.ready",
  "token.delta",
  "tool.failed",
  "tool.finished",
  "tool.pending",
  "tool.started"
] as const;

export type KnownEventType = (typeof EVENT_TYPES)[number];

/** Every error LewLM can return, with the status and retryability it carries. */
export const ERRORS = [
  {
    "code": "authentication_error",
    "http_status": 401,
    "retryable": false,
    "description": "Raised when an API request is missing or has invalid credentials."
  },
  {
    "code": "authentication_required",
    "http_status": 401,
    "retryable": false,
    "description": "The endpoint requires an API key and none was accepted."
  },
  {
    "code": "backend_contract_violation",
    "http_status": 502,
    "retryable": false,
    "description": "Raised when a backend returns a result LewLM cannot safely trust."
  },
  {
    "code": "backpressure_error",
    "http_status": 503,
    "retryable": true,
    "description": "Raised when runtime request admission control rejects or times out a request."
  },
  {
    "code": "configuration_error",
    "http_status": 400,
    "retryable": false,
    "description": "Raised when application settings are invalid."
  },
  {
    "code": "conversion_error",
    "http_status": 400,
    "retryable": false,
    "description": "Raised when a model conversion job fails."
  },
  {
    "code": "document_generation_error",
    "http_status": 500,
    "retryable": false,
    "description": "Raised when an output document artifact cannot be rendered."
  },
  {
    "code": "document_validation_error",
    "http_status": 400,
    "retryable": false,
    "description": "Raised when a document IR payload is invalid or incomplete."
  },
  {
    "code": "file_access_error",
    "http_status": 403,
    "retryable": false,
    "description": "Raised when a file path falls outside the allowed local scope."
  },
  {
    "code": "forbidden",
    "http_status": 403,
    "retryable": false,
    "description": "The credential is valid but not authorized for this endpoint."
  },
  {
    "code": "http_error",
    "http_status": 500,
    "retryable": false,
    "description": "A framework-level HTTP failure with no more specific LewLM code."
  },
  {
    "code": "idempotency_conflict",
    "http_status": 409,
    "retryable": false,
    "description": "Raised when an idempotency key is reused for a different request payload."
  },
  {
    "code": "internal_error",
    "http_status": 500,
    "retryable": false,
    "description": "Raised when an unexpected failure would otherwise escape as a bare 500."
  },
  {
    "code": "invalid_request",
    "http_status": 422,
    "retryable": false,
    "description": "Raised when a request body or parameter fails validation."
  },
  {
    "code": "job_not_found",
    "http_status": 404,
    "retryable": false,
    "description": "Raised when a background job cannot be found."
  },
  {
    "code": "lewlm_error",
    "http_status": 400,
    "retryable": false,
    "description": "Base class for structured LewLM errors."
  },
  {
    "code": "method_not_allowed",
    "http_status": 405,
    "retryable": false,
    "description": "The route exists but does not accept this HTTP method."
  },
  {
    "code": "model_lifecycle_conflict",
    "http_status": 409,
    "retryable": true,
    "description": "Raised when a model lifecycle action would interrupt active use."
  },
  {
    "code": "model_load_failed",
    "http_status": 503,
    "retryable": false,
    "description": "Raised when a backend cannot load a model on the current host."
  },
  {
    "code": "model_not_found",
    "http_status": 404,
    "retryable": false,
    "description": "Raised when a referenced model is not present in the registry."
  },
  {
    "code": "model_scan_error",
    "http_status": 400,
    "retryable": false,
    "description": "Raised when model discovery cannot complete."
  },
  {
    "code": "not_found",
    "http_status": 404,
    "retryable": false,
    "description": "No route or resource matched the request path."
  },
  {
    "code": "not_implemented",
    "http_status": 501,
    "retryable": false,
    "description": "Raised when a CLI or API feature exists but is not yet implemented."
  },
  {
    "code": "pack_unavailable",
    "http_status": 503,
    "retryable": false,
    "description": "Raised when a disabled or missing pack blocks a requested surface."
  },
  {
    "code": "privacy_mode_enabled",
    "http_status": 403,
    "retryable": false,
    "description": "Raised when a persistent feature is blocked by privacy mode."
  },
  {
    "code": "rate_limit_error",
    "http_status": 429,
    "retryable": true,
    "description": "Raised when a client exceeds the configured request rate."
  },
  {
    "code": "rate_limited",
    "http_status": 429,
    "retryable": true,
    "description": "The configured request rate for this client was exceeded."
  },
  {
    "code": "request_too_large",
    "http_status": 413,
    "retryable": false,
    "description": "Raised when a request body exceeds configured limits."
  },
  {
    "code": "response_too_large",
    "http_status": 507,
    "retryable": false,
    "description": "A response exceeded the client's configured size limit and was refused rather than buffered."
  },
  {
    "code": "routing_error",
    "http_status": 400,
    "retryable": false,
    "description": "Raised when the router cannot choose a suitable model/runtime pair."
  },
  {
    "code": "runtime_unavailable",
    "http_status": 503,
    "retryable": true,
    "description": "Raised when a runtime backend is unavailable on the current system."
  },
  {
    "code": "sandbox_execution_error",
    "http_status": 500,
    "retryable": false,
    "description": "Raised when a sandboxed worker fails or times out."
  },
  {
    "code": "session_not_found",
    "http_status": 404,
    "retryable": false,
    "description": "Raised when a requested session does not exist."
  },
  {
    "code": "skill_not_found",
    "http_status": 404,
    "retryable": false,
    "description": "Raised when a requested built-in skill does not exist."
  },
  {
    "code": "storage_error",
    "http_status": 500,
    "retryable": true,
    "description": "Raised when persistence or metadata access fails."
  },
  {
    "code": "tool_authorization_error",
    "http_status": 403,
    "retryable": false,
    "description": "Raised when an operation is not explicitly authorized."
  },
  {
    "code": "tool_not_found",
    "http_status": 404,
    "retryable": false,
    "description": "Raised when a requested local tool does not exist."
  },
  {
    "code": "unsupported_capability",
    "http_status": 400,
    "retryable": false,
    "description": "Raised when the selected model or runtime lacks a requested capability."
  },
  {
    "code": "unsupported_media_type",
    "http_status": 415,
    "retryable": false,
    "description": "Raised when a request or file payload uses an unsupported media type."
  }
] as const;

export const ERROR_CODES = [
  "authentication_error",
  "authentication_required",
  "backend_contract_violation",
  "backpressure_error",
  "configuration_error",
  "conversion_error",
  "document_generation_error",
  "document_validation_error",
  "file_access_error",
  "forbidden",
  "http_error",
  "idempotency_conflict",
  "internal_error",
  "invalid_request",
  "job_not_found",
  "lewlm_error",
  "method_not_allowed",
  "model_lifecycle_conflict",
  "model_load_failed",
  "model_not_found",
  "model_scan_error",
  "not_found",
  "not_implemented",
  "pack_unavailable",
  "privacy_mode_enabled",
  "rate_limit_error",
  "rate_limited",
  "request_too_large",
  "response_too_large",
  "routing_error",
  "runtime_unavailable",
  "sandbox_execution_error",
  "session_not_found",
  "skill_not_found",
  "storage_error",
  "tool_authorization_error",
  "tool_not_found",
  "unsupported_capability",
  "unsupported_media_type"
] as const;

export type KnownErrorCode = (typeof ERROR_CODES)[number];

/** Codes LewLM says are worth retrying unchanged. */
export const RETRYABLE_ERROR_CODES: ReadonlySet<string> = new Set(
  ERRORS.filter((entry) => entry.retryable).map((entry) => entry.code),
);
