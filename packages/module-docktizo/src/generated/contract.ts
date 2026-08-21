/**
 * DO NOT EDIT.
 *
 * Generated from DocKtizo's published contract by
 * `npm run gen:types -- --target docktizo`. Edit DocKtizo, not this file.
 */

/** The pipeline, in the order DocKtizo advances through it. */
export const PIPELINE_ORDER = ["accepted","planning","gathering_sources","retrieving","generating","validating","compiling","rendering","awaiting_review"] as const;

/** Nothing more will happen. Polling and streaming stop here. */
export const TERMINAL = ["cancelled","changes_requested","completed","failed","rejected"] as const;

/** Not advancing, but not necessarily finished — `awaiting_review` is both. */
export const RESTING = ["awaiting_review","cancelled","changes_requested","completed","failed","rejected"] as const;

export const GENERATION_STATES = ["accepted","planning","gathering_sources","retrieving","generating","validating","repairing","compiling","rendering","awaiting_review","changes_requested","rejected","completed","failed","cancelled"] as const;

/** What each state may become. The table DocKtizo enforces, not a reading of it. */
export const TRANSITIONS = {
  "accepted": [
    "cancelled",
    "failed",
    "planning"
  ],
  "awaiting_review": [
    "cancelled",
    "changes_requested",
    "completed",
    "failed",
    "rejected"
  ],
  "cancelled": [],
  "changes_requested": [],
  "compiling": [
    "cancelled",
    "failed",
    "rendering"
  ],
  "completed": [],
  "failed": [],
  "gathering_sources": [
    "cancelled",
    "failed",
    "generating",
    "retrieving"
  ],
  "generating": [
    "cancelled",
    "failed",
    "validating"
  ],
  "planning": [
    "cancelled",
    "failed",
    "gathering_sources",
    "generating",
    "retrieving"
  ],
  "rejected": [],
  "rendering": [
    "awaiting_review",
    "cancelled",
    "completed",
    "failed"
  ],
  "repairing": [
    "cancelled",
    "failed",
    "validating"
  ],
  "retrieving": [
    "cancelled",
    "failed",
    "generating"
  ],
  "validating": [
    "cancelled",
    "compiling",
    "failed",
    "repairing"
  ]
} as const;

export const EVENT_TYPES = ["GENERATION_ACCEPTED","GENERATION_PLANNING","SOURCE_GATHERING_STARTED","SOURCE_GATHERING_COMPLETED","RETRIEVAL_STARTED","RETRIEVAL_COMPLETED","SECTION_GENERATION_STARTED","SECTION_GENERATION_COMPLETED","VALIDATION_STARTED","VALIDATION_FAILED","REPAIR_STARTED","REPAIR_COMPLETED","COMPILATION_STARTED","COMPILATION_COMPLETED","RENDER_STARTED","RENDER_COMPLETED","GENERATION_COMPLETED","GENERATION_FAILED","CANCELLATION_REQUESTED","CANCELLATION_ACKNOWLEDGED","GENERATION_CANCELLED","REVISION_CREATED","MANUAL_OVERRIDE_CREATED","APPROVAL_REQUESTED","REVISION_APPROVED","CHANGES_REQUESTED","REVISION_REJECTED"] as const;

export const OUTPUT_FORMATS = ["text","markdown","json","csv","docx","pdf","xlsx"] as const;

export const REQUIRED_CAPABILITIES = ["structured_output","document_rendering","document_ingestion","embeddings","rerank","retrieval"] as const;

export const READINESS_STATUSES = ["ready","degraded","unavailable","timed_out","not_configured","deferred"] as const;

export const ERROR_CODES = ["artifact_integrity_failed","artifact_storage_failed","artifact_unavailable","authentication_required","authentication_unavailable","authorization_denied","business_validation_failed","byte_range_not_supported","caller_identity_forbidden","citation_validation_failed","compilation_failed","concurrency_conflict","credential_expired","event_cursor_expired","generation_cancelled","generation_not_cancellable","idempotency_conflict","invalid_approval_transition","invalid_credentials","invalid_event_cursor","invalid_generation_request","invalid_manual_override","invalid_reconciliation_scope","invalid_request","invalid_revision_cursor","invalid_revision_target","invalid_source","invalid_state_transition","not_found","persistence_conflict","provider_capability_missing","provider_unavailable","reconciliation_required","recovery_not_eligible","rendering_failed","repair_exhausted","request_too_large","retrieval_failed","source_access_denied","source_staging_failed","source_unavailable","stale_parent","structured_generation_failed","structured_output_invalid","unknown_document_type","unsupported_media_type","workspace_access_denied","workspace_mismatch","workspace_selection_required"] as const;

/** Every error code, with what DocKtizo says it means. */
export const ERRORS = {
  "artifact_integrity_failed": 500,
  "artifact_storage_failed": 500,
  "artifact_unavailable": 503,
  "authentication_required": 401,
  "authentication_unavailable": 503,
  "authorization_denied": 403,
  "business_validation_failed": 422,
  "byte_range_not_supported": 416,
  "caller_identity_forbidden": 400,
  "citation_validation_failed": 422,
  "compilation_failed": 500,
  "concurrency_conflict": 409,
  "credential_expired": 401,
  "event_cursor_expired": 410,
  "generation_cancelled": 409,
  "generation_not_cancellable": 409,
  "idempotency_conflict": 409,
  "invalid_approval_transition": 409,
  "invalid_credentials": 401,
  "invalid_event_cursor": 400,
  "invalid_generation_request": 422,
  "invalid_manual_override": 422,
  "invalid_reconciliation_scope": 422,
  "invalid_request": 422,
  "invalid_revision_cursor": 400,
  "invalid_revision_target": 422,
  "invalid_source": 422,
  "invalid_state_transition": 409,
  "not_found": 404,
  "persistence_conflict": 409,
  "provider_capability_missing": 503,
  "provider_unavailable": 503,
  "reconciliation_required": 409,
  "recovery_not_eligible": 409,
  "rendering_failed": 503,
  "repair_exhausted": 422,
  "request_too_large": 413,
  "retrieval_failed": 503,
  "source_access_denied": 403,
  "source_staging_failed": 500,
  "source_unavailable": 503,
  "stale_parent": 409,
  "structured_generation_failed": 503,
  "structured_output_invalid": 422,
  "unknown_document_type": 404,
  "unsupported_media_type": 415,
  "workspace_access_denied": 403,
  "workspace_mismatch": 422,
  "workspace_selection_required": 400
} as const;
