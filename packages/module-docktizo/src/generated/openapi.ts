/**
 * DO NOT EDIT.
 *
 * Generated from DocKtizo's published contract by
 * `npm run gen:types -- --target docktizo`. Edit DocKtizo, not this file.
 */
export interface paths {
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health */
        get: operations["health_health_live_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Readiness
         * @description Report dependency readiness, in detail only to an authorized caller.
         *
         *     The aggregate verdict is anonymous because an operator or a proxy must be
         *     able to tell a service that is serving from one that is not without holding
         *     a workspace credential. Component and workflow detail still requires
         *     ``document_types:read``.
         */
        get: operations["readiness_health_ready_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/healthz": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health */
        get: operations["health_healthz_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/artifacts/{artifact_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Artifact */
        get: operations["get_artifact_v1_artifacts__artifact_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/artifacts/{artifact_id}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Download Artifact */
        get: operations["download_artifact_v1_artifacts__artifact_id__download_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/audit-records": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Audit Records */
        get: operations["list_audit_records_v1_audit_records_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/document-types": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Document Types */
        get: operations["list_document_types_v1_document_types_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/document-types/{document_type}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Document Type */
        get: operations["get_document_type_v1_document_types__document_type__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/documents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Documents */
        get: operations["list_documents_v1_documents_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/documents/{document_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Document */
        get: operations["get_document_v1_documents__document_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/documents/{document_id}/migrations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Document Migration */
        post: operations["create_document_migration_v1_documents__document_id__migrations_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/documents/{document_id}/migrations/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Preview Document Migration
         * @description Report what a version change would do, without changing anything.
         *
         *     A caller cannot acknowledge consequences it has not been shown, so the
         *     submit route refuses until the codes reported here are echoed back.
         */
        post: operations["preview_document_migration_v1_documents__document_id__migrations_preview_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/documents/{document_id}/revisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Document Revisions */
        get: operations["list_document_revisions_v1_documents__document_id__revisions_get"];
        put?: never;
        /** Create Document Revision */
        post: operations["create_document_revision_v1_documents__document_id__revisions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/documents/{document_id}/revisions/manual-override": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Manual Override Revision */
        post: operations["create_manual_override_revision_v1_documents__document_id__revisions_manual_override_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/generations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Submit Generation */
        post: operations["submit_generation_v1_generations_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/generations/{generation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Generation */
        get: operations["get_generation_v1_generations__generation_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/generations/{generation_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancel Generation */
        post: operations["cancel_generation_v1_generations__generation_id__cancel_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/generations/{generation_id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Generation Events */
        get: operations["get_generation_events_v1_generations__generation_id__events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/generations/{generation_id}/events/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Stream Generation Events
         * @description Follow the durable event log as it is written, over one ordering.
         *
         *     Every ``id:`` is the same opaque cursor the paged read returns, so a
         *     reconnect with ``Last-Event-ID`` — or a switch back to polling — resumes
         *     exactly where the stream stopped and never replays or skips an event.
         */
        get: operations["stream_generation_events_v1_generations__generation_id__events_stream_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/revisions/{revision_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Revision */
        get: operations["get_revision_v1_revisions__revision_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/revisions/{revision_id}/approvals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Revision Approvals */
        get: operations["get_revision_approvals_v1_revisions__revision_id__approvals_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/revisions/{revision_id}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Approve Revision */
        post: operations["approve_revision_v1_revisions__revision_id__approve_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/revisions/{revision_id}/reject": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reject Revision */
        post: operations["reject_revision_v1_revisions__revision_id__reject_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/revisions/{revision_id}/request-changes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Request Revision Changes */
        post: operations["request_revision_changes_v1_revisions__revision_id__request_changes_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Source */
        post: operations["create_source_v1_sources_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sources/{source_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Source */
        get: operations["get_source_v1_sources__source_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Templates */
        get: operations["list_templates_v1_templates_get"];
        put?: never;
        /** Create Template */
        post: operations["create_template_v1_templates_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/templates/{template_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Template */
        get: operations["get_template_v1_templates__template_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/whoami": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Whoami
         * @description Report the resolved scope of this credential.
         *
         *     Authentication is required but no scope is, because a caller that cannot
         *     read its own resolved workspace cannot tell a misconfigured deployment from
         *     a denied one.
         */
        get: operations["whoami_v1_whoami_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** ApprovalDecisionRequest */
        ApprovalDecisionRequest: {
            /** Comment */
            comment?: string | null;
            /** Policy Result */
            policy_result?: {
                [key: string]: string | number | boolean | null;
            };
        };
        /** ApprovalDecisionResponse */
        ApprovalDecisionResponse: {
            /** Actor Id */
            actor_id: string;
            /** Approval Id */
            approval_id: string;
            /** Comment */
            comment: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            decision: components["schemas"]["ApprovalStatus"];
            execution_state: components["schemas"]["GenerationState"];
            /** Idempotency Key */
            idempotency_key: string;
            /** Policy Result */
            policy_result: {
                [key: string]: string | number | boolean | null;
            };
            /** Prior Approval Id */
            prior_approval_id: string | null;
            /** Replayed */
            replayed: boolean;
            /** Revision Id */
            revision_id: string;
            /** Sequence */
            sequence: number;
        };
        /** ApprovalHistoryResponse */
        ApprovalHistoryResponse: {
            /** Decisions */
            decisions: components["schemas"]["ApprovalRecordResponse"][];
            /** Revision Id */
            revision_id: string;
            /** State */
            state: string;
        };
        /** ApprovalRecordResponse */
        ApprovalRecordResponse: {
            /** Actor Id */
            actor_id: string;
            /** Approval Id */
            approval_id: string;
            /** Comment */
            comment: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            decision: components["schemas"]["ApprovalStatus"];
            /** Policy Result */
            policy_result: {
                [key: string]: string | number | boolean | null;
            };
            /** Prior Approval Id */
            prior_approval_id: string | null;
            /** Revision Id */
            revision_id: string;
            /** Sequence */
            sequence: number;
        };
        /**
         * ApprovalStatus
         * @enum {string}
         */
        ApprovalStatus: "approved" | "rejected" | "changes_requested";
        /** ApprovalSummary */
        ApprovalSummary: {
            /** Decided At */
            decided_at?: string | null;
            decision?: components["schemas"]["ApprovalStatus"] | null;
            state: components["schemas"]["ReviewState"];
        };
        /** ArtifactMetadata */
        ArtifactMetadata: {
            /** Artifact Id */
            artifact_id: string;
            /** Content Hash */
            content_hash: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Download Url */
            download_url: string;
            /** File Name */
            file_name: string;
            /** Generation Id */
            generation_id: string;
            /** Media Type */
            media_type: string;
            output_format: components["schemas"]["OutputFormat"];
            /** Revision Id */
            revision_id: string;
            /** Size Bytes */
            size_bytes: number;
            versions: components["schemas"]["ArtifactVersionView"];
        };
        /**
         * ArtifactResponse
         * @description Public artifact metadata; storage identities are intentionally absent.
         */
        ArtifactResponse: {
            /** Artifact Id */
            artifact_id: string;
            /** Content Hash */
            content_hash: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Download Url */
            download_url: string;
            /** File Name */
            file_name: string;
            /** Generation Id */
            generation_id: string;
            /** Media Type */
            media_type: string;
            output_format: components["schemas"]["OutputFormat"];
            /** Revision Id */
            revision_id: string;
            /** Size Bytes */
            size_bytes: number;
            versions: components["schemas"]["ArtifactVersionView"];
        };
        /** ArtifactVersionView */
        ArtifactVersionView: {
            /** Compiler Version */
            compiler_version: string;
            /** Document Spec Version */
            document_spec_version: string;
            /** Document Type */
            document_type: string;
            /** Renderer Adapter Version */
            renderer_adapter_version: string;
            /** Template Id */
            template_id: string | null;
            /** Template Version */
            template_version: string | null;
            /** Validation Policy Version */
            validation_policy_version: string;
            /** Workflow Id */
            workflow_id: string;
            /** Workflow Version */
            workflow_version: number;
        };
        /**
         * AuditAction
         * @enum {string}
         */
        AuditAction: "authentication" | "authorization" | "generation_requested" | "generation_completed" | "generation_failed" | "source_created" | "source_attached" | "template_created" | "template_selected" | "revision_requested" | "revision_created" | "manual_override_submitted" | "workflow_migration_previewed" | "workflow_migration_submitted" | "approval_decided" | "cancellation_requested" | "cancellation_acknowledged" | "artifact_downloaded" | "artifact_deleted" | "recovery_stale_listed" | "recovery_retry_submitted" | "artifact_reconciliation_run" | "retention_executed" | "operator_configuration_changed";
        /**
         * AuditOutcome
         * @enum {string}
         */
        AuditOutcome: "succeeded" | "failed" | "denied" | "accepted" | "replayed";
        /**
         * AuditRecord
         * @description Append-only security/business audit evidence with no private content.
         */
        AuditRecord: {
            action: components["schemas"]["AuditAction"];
            /** Actor Id */
            actor_id?: string | null;
            /** Artifact Id */
            artifact_id?: string | null;
            /** Audit Id */
            audit_id: string;
            /** Correlation Id */
            correlation_id: string;
            /** Document Id */
            document_id?: string | null;
            /** Error Code */
            error_code?: string | null;
            /** Generation Id */
            generation_id?: string | null;
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at?: string;
            outcome: components["schemas"]["AuditOutcome"];
            /** Policy Metadata */
            policy_metadata?: {
                [key: string]: string | number | boolean | null;
            };
            /** Request Id */
            request_id: string;
            /** Retain Until */
            retain_until?: string | null;
            /** Revision Id */
            revision_id?: string | null;
            /**
             * Schema Version
             * @default 1.0
             * @constant
             */
            schema_version: "1.0";
            /** Source Id */
            source_id?: string | null;
            /** Subject Id */
            subject_id?: string | null;
            /** Subject Type */
            subject_type: string;
            /** Template Id */
            template_id?: string | null;
            /** Workspace Id */
            workspace_id?: string | null;
        };
        /**
         * AuthenticationMethod
         * @enum {string}
         */
        AuthenticationMethod: "local_bearer" | "external_bearer";
        /**
         * AuthorizationAction
         * @description Explicit public and operator actions; absence is always a denial.
         * @enum {string}
         */
        AuthorizationAction: "document_types:read" | "sources:read" | "sources:create" | "templates:read" | "templates:create" | "assets:read" | "assets:create" | "generations:read" | "generations:create" | "generations:cancel" | "events:read" | "audit:read" | "documents:read" | "revisions:read" | "artifacts:read" | "artifacts:download" | "revisions:create" | "manual_overrides:create" | "migrations:read" | "migrations:create" | "approvals:read" | "approvals:create" | "recovery:read" | "recovery:retry" | "recovery:reconcile" | "retention:execute";
        /**
         * BrandStyleName
         * @enum {string}
         */
        BrandStyleName: "accent_color" | "heading_color" | "body_font" | "heading_font";
        /** BrandStyleToken */
        BrandStyleToken: {
            name: components["schemas"]["BrandStyleName"];
            /** Value */
            value: string;
        };
        /**
         * CancellationOutcome
         * @enum {string}
         */
        CancellationOutcome: "requested" | "already_requested" | "cancelled" | "already_cancelled";
        /** ComponentReadiness */
        ComponentReadiness: {
            /** Component */
            component: string;
            /** Latency Milliseconds */
            latency_milliseconds?: number | null;
            /** Required For Core */
            required_for_core: boolean;
            /** Safe Code */
            safe_code?: string | null;
            status: components["schemas"]["ReadinessStatus"];
        };
        /** DocumentListResponse */
        DocumentListResponse: {
            /** Has More */
            has_more: boolean;
            /** Items */
            items: components["schemas"]["DocumentResponse"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /**
         * DocumentResponse
         * @description Provider-neutral immutable document-head projection.
         */
        DocumentResponse: {
            approval: components["schemas"]["ApprovalSummary"];
            /** Artifact Ids */
            artifact_ids: string[];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Current Revision Id */
            current_revision_id: string | null;
            /** Current Revision Number */
            current_revision_number: number;
            /** Document Id */
            document_id: string;
            /** Document Type */
            document_type: string;
            /** Output Formats */
            output_formats: components["schemas"]["OutputFormat"][];
            /** Title */
            title: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Workflow Id */
            workflow_id: string;
            /** Workflow Version */
            workflow_version: number;
        };
        /** DocumentTypeListResponse */
        DocumentTypeListResponse: {
            /** Count */
            count: number;
            /** Items */
            items: components["schemas"]["DocumentTypeResponse"][];
        };
        /** DocumentTypeResponse */
        DocumentTypeResponse: {
            /** Compatible Template Ids */
            compatible_template_ids?: string[];
            /** Description */
            description: string;
            /** Document Type */
            document_type: string;
            /** Input Schema */
            input_schema?: {
                [key: string]: unknown;
            } | null;
            /** Migration Targets */
            migration_targets?: string[];
            /** Required Capabilities */
            required_capabilities: string[];
            /** Requires Review */
            requires_review: boolean;
            /** Retrieval Policy */
            retrieval_policy: string;
            /** Supported Output Formats */
            supported_output_formats: components["schemas"]["OutputFormat"][];
            /** Version */
            version: number;
            /** Workflow Id */
            workflow_id: string;
        };
        /**
         * EventType
         * @enum {string}
         */
        EventType: "GENERATION_ACCEPTED" | "GENERATION_PLANNING" | "SOURCE_GATHERING_STARTED" | "SOURCE_GATHERING_COMPLETED" | "RETRIEVAL_STARTED" | "RETRIEVAL_COMPLETED" | "SECTION_GENERATION_STARTED" | "SECTION_GENERATION_COMPLETED" | "VALIDATION_STARTED" | "VALIDATION_FAILED" | "REPAIR_STARTED" | "REPAIR_COMPLETED" | "COMPILATION_STARTED" | "COMPILATION_COMPLETED" | "RENDER_STARTED" | "RENDER_COMPLETED" | "GENERATION_COMPLETED" | "GENERATION_FAILED" | "CANCELLATION_REQUESTED" | "CANCELLATION_ACKNOWLEDGED" | "GENERATION_CANCELLED" | "REVISION_CREATED" | "MANUAL_OVERRIDE_CREATED" | "WORKFLOW_MIGRATION_APPLIED" | "APPROVAL_REQUESTED" | "REVISION_APPROVED" | "CHANGES_REQUESTED" | "REVISION_REJECTED";
        /** GenerationAcceptedResponse */
        GenerationAcceptedResponse: {
            /** Client Supplied Idempotency Key */
            client_supplied_idempotency_key: boolean;
            /** Correlation Id */
            correlation_id: string;
            /** Generation Id */
            generation_id: string;
            /** Idempotency Key */
            idempotency_key: string;
            /** Replayed */
            replayed: boolean;
            /** Request Fingerprint */
            request_fingerprint: string;
            state: components["schemas"]["GenerationState"];
            /** Status Url */
            status_url: string;
        };
        /** GenerationCancellationResponse */
        GenerationCancellationResponse: {
            /** Acknowledged At */
            acknowledged_at: string | null;
            /** Generation Id */
            generation_id: string;
            outcome: components["schemas"]["CancellationOutcome"];
            /**
             * Requested At
             * Format: date-time
             */
            requested_at: string;
            state: components["schemas"]["GenerationState"];
        };
        /**
         * GenerationCreateRequest
         * @example {
         *       "document_type": "status_report.v1",
         *       "input_data": {
         *         "facts": [
         *           "Release candidate validation completed."
         *         ],
         *         "project_name": "Apollo",
         *         "reporting_date": "2026-07-29",
         *         "reporting_period": "Week 30"
         *       },
         *       "output_formats": [
         *         "docx",
         *         "pdf"
         *       ]
         *     }
         * @example {
         *       "document_type": "executive_memo.v1",
         *       "input_data": {
         *         "author": "Strategy office",
         *         "facts": [
         *           "The bounded pilot completed."
         *         ],
         *         "memo_date": "2026-08-21",
         *         "purpose": "Support an executive funding decision.",
         *         "recipients": [
         *           "Executive team"
         *         ],
         *         "subject": "Platform investment"
         *       },
         *       "output_formats": [
         *         "docx",
         *         "pdf"
         *       ]
         *     }
         * @example {
         *       "document_type": "proposal.v1",
         *       "input_data": {
         *         "approach_facts": [
         *           "Use fixed section checkpoints"
         *         ],
         *         "call_to_action": "Approve a discovery workshop.",
         *         "client_context": "Northwind needs generation that survives interruption.",
         *         "client_name": "Northwind",
         *         "facts": [
         *           "Completed stages are retained durably."
         *         ],
         *         "problem_opportunity": "Interrupted work currently loses progress.",
         *         "proposal_date": "2026-08-22",
         *         "purpose": "Improve document operations.",
         *         "risks": [
         *           "Adoption delay"
         *         ],
         *         "scope_deliverables": [
         *           "Durable proposal workflow"
         *         ],
         *         "title": "Durable operations proposal"
         *       },
         *       "output_formats": [
         *         "docx",
         *         "pdf"
         *       ]
         *     }
         */
        GenerationCreateRequest: {
            /** Audience */
            audience?: string | null;
            /** Document Type */
            document_type: string;
            /** Input Data */
            input_data?: {
                [key: string]: unknown;
            };
            /** Instructions */
            instructions?: string | null;
            /** Locale */
            locale?: string | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /**
             * Output Formats
             * @default [
             *       "docx"
             *     ]
             */
            output_formats: components["schemas"]["OutputFormat"][];
            /** Source Ids */
            source_ids?: string[];
            /** Template Id */
            template_id?: string | null;
            /** Title */
            title?: string | null;
            /** Tone */
            tone?: string | null;
        };
        /** GenerationEventPageResponse */
        GenerationEventPageResponse: {
            /** Checkpoint */
            checkpoint: string;
            /** Has More */
            has_more: boolean;
            /** Items */
            items: components["schemas"]["GenerationEventResponse"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /** GenerationEventResponse */
        GenerationEventResponse: {
            /** Attributes */
            attributes: {
                [key: string]: string | number | boolean | null;
            };
            /** Correlation Id */
            correlation_id: string;
            /** Document Id */
            document_id: string | null;
            /** Error Code */
            error_code: string | null;
            /** Event Id */
            event_id: string;
            event_type: components["schemas"]["EventType"];
            /** Generation Id */
            generation_id: string;
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
            /** Progress */
            progress: number | null;
            /** Revision Id */
            revision_id: string | null;
            /**
             * Schema Version
             * @constant
             */
            schema_version: "1.0";
            /** Sequence */
            sequence: number;
            /** Stage */
            stage: string;
            state: components["schemas"]["GenerationState"];
            /** Workflow Id */
            workflow_id: string;
            /** Workspace Id */
            workspace_id: string;
        };
        /**
         * GenerationState
         * @enum {string}
         */
        GenerationState: "accepted" | "planning" | "gathering_sources" | "retrieving" | "generating" | "validating" | "repairing" | "compiling" | "rendering" | "awaiting_review" | "changes_requested" | "rejected" | "completed" | "failed" | "cancelled";
        /** GenerationStatusResponse */
        GenerationStatusResponse: {
            /** Artifact Ids */
            artifact_ids: string[];
            /** Attempt Count */
            attempt_count: number;
            /** Cancellation Acknowledged At */
            cancellation_acknowledged_at: string | null;
            /** Cancellation Requested At */
            cancellation_requested_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Document Id */
            document_id: string | null;
            error: components["schemas"]["SafeGenerationError"] | null;
            /** Generation Id */
            generation_id: string;
            /** Requested Formats */
            requested_formats: components["schemas"]["OutputFormat"][];
            /** Revision Id */
            revision_id: string | null;
            /** Stage */
            stage: string;
            state: components["schemas"]["GenerationState"];
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Workflow Id */
            workflow_id: string;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HealthResponse */
        HealthResponse: {
            /** Service */
            service: string;
            /** Status */
            status: string;
            /** Version */
            version: string;
        };
        /**
         * IngestionState
         * @enum {string}
         */
        IngestionState: "pending" | "staged" | "ingesting" | "ingested" | "failed";
        JsonValue: unknown;
        /** ManualOverrideCreateRequest */
        ManualOverrideCreateRequest: {
            /** Fields */
            fields: {
                [key: string]: components["schemas"]["JsonValue"];
            };
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Parent Revision Id */
            parent_revision_id: string;
            /** Reason */
            reason: string;
        };
        /** MigrationNoticeResponse */
        MigrationNoticeResponse: {
            /** Acknowledgement Required */
            acknowledgement_required: boolean;
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Path */
            path: (string | number)[];
            severity: components["schemas"]["MigrationSeverity"];
        };
        /**
         * MigrationSeverity
         * @description How much a caller has to care about one mapping consequence.
         * @enum {string}
         */
        MigrationSeverity: "info" | "warning" | "loss";
        /**
         * OutputFormat
         * @enum {string}
         */
        OutputFormat: "text" | "markdown" | "json" | "csv" | "docx" | "pdf" | "xlsx";
        /**
         * ReadinessDetail
         * @enum {string}
         */
        ReadinessDetail: "summary" | "full";
        /** ReadinessReport */
        ReadinessReport: {
            /**
             * Admission Policy
             * @default accept_deferred
             */
            admission_policy: string;
            /**
             * Cache Age Milliseconds
             * @default 0
             */
            cache_age_milliseconds: number;
            /**
             * Checked At
             * Format: date-time
             */
            checked_at: string;
            /** Components */
            components: components["schemas"]["ComponentReadiness"][];
            /** Core Ready */
            core_ready: boolean;
            /** @default full */
            detail_level: components["schemas"]["ReadinessDetail"];
            /** Generation Ready */
            generation_ready: boolean;
            /**
             * Schema Version
             * @default readiness.v1
             */
            schema_version: string;
            status: components["schemas"]["ReadinessStatus"];
            /** Workflows */
            workflows: components["schemas"]["WorkflowReadiness"][];
        };
        /**
         * ReadinessStatus
         * @enum {string}
         */
        ReadinessStatus: "ready" | "degraded" | "unavailable" | "timed_out" | "not_configured" | "deferred";
        /**
         * ReviewState
         * @enum {string}
         */
        ReviewState: "empty" | "awaiting_review" | "completed" | "approved" | "rejected" | "changes_requested";
        /** RevisionCreateRequest */
        RevisionCreateRequest: {
            /** Instructions */
            instructions: string;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Parent Revision Id */
            parent_revision_id: string;
            /** Source Ids */
            source_ids?: string[];
            /** Target Fields */
            target_fields: string[];
        };
        /** RevisionListResponse */
        RevisionListResponse: {
            /** Has More */
            has_more: boolean;
            /** Items */
            items: components["schemas"]["RevisionSummaryResponse"][];
            /** Next Cursor */
            next_cursor: string | null;
        };
        /**
         * RevisionMode
         * @enum {string}
         */
        RevisionMode: "generated" | "manual_override" | "migration";
        /**
         * RevisionResponse
         * @description Revision detail with public artifact metadata only.
         */
        RevisionResponse: {
            approval: components["schemas"]["ApprovalSummary"];
            /** Artifact Ids */
            artifact_ids: string[];
            /** Artifacts */
            artifacts: components["schemas"]["ArtifactMetadata"][];
            /** Changed Fields */
            changed_fields: string[];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Document Id */
            document_id: string;
            /** Document Spec Id */
            document_spec_id: string;
            /** Document Type */
            document_type: string;
            execution_state: components["schemas"]["GenerationState"];
            /** Generation Id */
            generation_id: string;
            /** Migration Policy Version */
            migration_policy_version?: string | null;
            /** Output Formats */
            output_formats: components["schemas"]["OutputFormat"][];
            /** Parent Revision Id */
            parent_revision_id: string | null;
            /** Requires Review */
            requires_review: boolean;
            /** Revision Id */
            revision_id: string;
            revision_mode: components["schemas"]["RevisionMode"];
            /** Revision Number */
            revision_number: number;
            /** Source Reference Ids */
            source_reference_ids: string[];
            /** Source Workflow Id */
            source_workflow_id?: string | null;
            /** Validation Report Id */
            validation_report_id: string;
            /** Workflow Id */
            workflow_id: string;
            /** Workflow Version */
            workflow_version: number;
        };
        /**
         * RevisionSummaryResponse
         * @description Immutable revision lineage summary.
         */
        RevisionSummaryResponse: {
            approval: components["schemas"]["ApprovalSummary"];
            /** Artifact Ids */
            artifact_ids: string[];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Document Id */
            document_id: string;
            /** Document Type */
            document_type: string;
            execution_state: components["schemas"]["GenerationState"];
            /** Generation Id */
            generation_id: string;
            /** Migration Policy Version */
            migration_policy_version?: string | null;
            /** Output Formats */
            output_formats: components["schemas"]["OutputFormat"][];
            /** Parent Revision Id */
            parent_revision_id: string | null;
            /** Requires Review */
            requires_review: boolean;
            /** Revision Id */
            revision_id: string;
            revision_mode: components["schemas"]["RevisionMode"];
            /** Revision Number */
            revision_number: number;
            /** Source Workflow Id */
            source_workflow_id?: string | null;
            /** Workflow Id */
            workflow_id: string;
            /** Workflow Version */
            workflow_version: number;
        };
        /** SafeGenerationError */
        SafeGenerationError: {
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Retryable */
            retryable: boolean;
        };
        /** SourceResponse */
        SourceResponse: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Display Name */
            display_name: string;
            /** File Name */
            file_name: string | null;
            ingestion_state: components["schemas"]["IngestionState"];
            /** Media Type */
            media_type: string | null;
            /** Metadata */
            metadata: {
                [key: string]: string | number | boolean | null;
            };
            /** Replayed */
            replayed?: boolean | null;
            /** Size Bytes */
            size_bytes: number | null;
            /** Source Id */
            source_id: string;
            source_type: components["schemas"]["SourceType"];
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * SourceType
         * @enum {string}
         */
        SourceType: "upload" | "lewlm_ingest" | "structured_data" | "user_text" | "revision" | "url_snapshot";
        /** TemplateAssetReference */
        TemplateAssetReference: {
            /** Alt Text */
            alt_text: string;
            /** Asset Id */
            asset_id: string;
            /** Caption */
            caption?: string | null;
            /** Height */
            height?: number | null;
            /** Width */
            width?: number | null;
        };
        /**
         * TemplateCreateRequest
         * @example {
         *       "configuration": {
         *         "section_order": [
         *           "summary",
         *           "milestones",
         *           "risks"
         *         ]
         *       },
         *       "name": "Operations weekly",
         *       "style_tokens": [
         *         {
         *           "name": "accent_color",
         *           "value": "#2563EB"
         *         }
         *       ],
         *       "supported_output_formats": [
         *         "docx",
         *         "pdf"
         *       ],
         *       "template_version": "1.0",
         *       "workflow_id": "status_report.v1"
         *     }
         */
        TemplateCreateRequest: {
            /** Assets */
            assets?: components["schemas"]["TemplateAssetReference"][];
            /** Compatible Workflow Ids */
            compatible_workflow_ids?: string[];
            /** Configuration */
            configuration?: {
                [key: string]: unknown;
            };
            /** Footer Text */
            footer_text?: string | null;
            /** Header Text */
            header_text?: string | null;
            /** Legal Text */
            legal_text?: string | null;
            /** Locale Default */
            locale_default?: string | null;
            /** Name */
            name: string;
            /** Organization Name */
            organization_name?: string | null;
            /** Style Tokens */
            style_tokens?: components["schemas"]["BrandStyleToken"][];
            /** Supported Output Formats */
            supported_output_formats: components["schemas"]["OutputFormat"][];
            /** Template Id */
            template_id?: string | null;
            /** Template Version */
            template_version: string;
            /** Workflow Id */
            workflow_id: string;
        };
        /** TemplateListResponse */
        TemplateListResponse: {
            /** Count */
            count: number;
            /** Items */
            items: components["schemas"]["TemplateResponse"][];
        };
        /** TemplateResponse */
        TemplateResponse: {
            /** Asset Ids */
            asset_ids: string[];
            /** Compatible Workflow Ids */
            compatible_workflow_ids: string[];
            /** Configuration */
            configuration: {
                [key: string]: unknown;
            };
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Footer Text */
            footer_text: string | null;
            /** Header Text */
            header_text: string | null;
            /** Legal Text */
            legal_text: string | null;
            /** Locale Default */
            locale_default: string | null;
            /** Name */
            name: string;
            /** Organization Name */
            organization_name: string | null;
            /** Style Tokens */
            style_tokens: components["schemas"]["BrandStyleToken"][];
            /** Supported Output Formats */
            supported_output_formats: components["schemas"]["OutputFormat"][];
            /** Template Id */
            template_id: string;
            /** Template Version */
            template_version: string;
            /** Workflow Id */
            workflow_id: string;
        };
        /** ValidationError */
        ValidationError: {
            /** Context */
            ctx?: Record<string, never>;
            /** Input */
            input?: unknown;
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
        /**
         * WhoAmIResponse
         * @description The scope a credential resolved to, so a caller never has to guess it.
         */
        WhoAmIResponse: {
            authentication_method: components["schemas"]["AuthenticationMethod"];
            /** Authorized Workspace Ids */
            authorized_workspace_ids: string[];
            /** Correlation Id */
            correlation_id: string;
            /** Request Id */
            request_id: string;
            /** Roles */
            roles: string[];
            /**
             * Schema Version
             * @default whoami.v1
             * @constant
             */
            schema_version: "whoami.v1";
            /** Scopes */
            scopes: components["schemas"]["AuthorizationAction"][];
            /** Subject Id */
            subject_id: string;
            /** Workspace Id */
            workspace_id: string;
        };
        /**
         * WorkflowMigrationCreateRequest
         * @description An explicit request to move one document onto a new workflow version.
         *
         *     Nothing here is optional by accident: the caller states the version it is on,
         *     the version it wants, which template the new version renders through, and
         *     which reported consequences it accepts.
         */
        WorkflowMigrationCreateRequest: {
            /** Acknowledged Notices */
            acknowledged_notices?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Parent Revision Id */
            parent_revision_id: string;
            /** Reason */
            reason: string;
            /** Source Workflow Id */
            source_workflow_id: string;
            /** Target Template Id */
            target_template_id?: string | null;
            /** Target Workflow Id */
            target_workflow_id: string;
            /**
             * Use Target Default Template
             * @default false
             */
            use_target_default_template: boolean;
        };
        /**
         * WorkflowMigrationPreviewResponse
         * @description Everything a caller must see before a migration may be submitted.
         */
        WorkflowMigrationPreviewResponse: {
            /** Candidate Spec Hash */
            candidate_spec_hash: string;
            /** Candidate Valid */
            candidate_valid: boolean;
            /** Document Id */
            document_id: string;
            /** Loses Content */
            loses_content: boolean;
            /** Migration Policy Version */
            migration_policy_version: string;
            /** Notices */
            notices: components["schemas"]["MigrationNoticeResponse"][];
            /** Parent Revision Id */
            parent_revision_id: string;
            /** Required Acknowledgements */
            required_acknowledgements: string[];
            /** Source Template Id */
            source_template_id: string | null;
            /** Source Workflow Id */
            source_workflow_id: string;
            /** Target Template Id */
            target_template_id: string | null;
            /** Target Template Policy */
            target_template_policy: string;
            /** Target Workflow Id */
            target_workflow_id: string;
            /** Validation Issue Codes */
            validation_issue_codes: string[];
        };
        /** WorkflowReadiness */
        WorkflowReadiness: {
            /** Missing Capabilities */
            missing_capabilities?: string[];
            /** Ready */
            ready: boolean;
            /** Required Capabilities */
            required_capabilities?: string[];
            /** Workflow Id */
            workflow_id: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    health_health_live_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    readiness_health_ready_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessReport"];
                };
            };
        };
    };
    health_healthz_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    get_artifact_v1_artifacts__artifact_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                artifact_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ArtifactResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    download_artifact_v1_artifacts__artifact_id__download_get: {
        parameters: {
            query?: never;
            header?: {
                Range?: string | null;
                "If-None-Match"?: string | null;
            };
            path: {
                artifact_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_audit_records_v1_audit_records_get: {
        parameters: {
            query?: {
                limit?: number;
                offset?: number;
                action?: components["schemas"]["AuditAction"] | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditRecord"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_document_types_v1_document_types_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentTypeListResponse"];
                };
            };
        };
    };
    get_document_type_v1_document_types__document_type__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                document_type: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentTypeResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_documents_v1_documents_get: {
        parameters: {
            query?: {
                cursor?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_document_v1_documents__document_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                document_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_document_migration_v1_documents__document_id__migrations_post: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path: {
                document_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkflowMigrationCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerationAcceptedResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    preview_document_migration_v1_documents__document_id__migrations_preview_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                document_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkflowMigrationCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkflowMigrationPreviewResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_document_revisions_v1_documents__document_id__revisions_get: {
        parameters: {
            query?: {
                cursor?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                document_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevisionListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_document_revision_v1_documents__document_id__revisions_post: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path: {
                document_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RevisionCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerationAcceptedResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_manual_override_revision_v1_documents__document_id__revisions_manual_override_post: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path: {
                document_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ManualOverrideCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerationAcceptedResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    submit_generation_v1_generations_post: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GenerationCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerationAcceptedResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_generation_v1_generations__generation_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                generation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerationStatusResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    cancel_generation_v1_generations__generation_id__cancel_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                generation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerationCancellationResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_generation_events_v1_generations__generation_id__events_get: {
        parameters: {
            query?: {
                cursor?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                generation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerationEventPageResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    stream_generation_events_v1_generations__generation_id__events_stream_get: {
        parameters: {
            query?: {
                cursor?: string | null;
            };
            header?: {
                "Last-Event-ID"?: string | null;
            };
            path: {
                generation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Server-sent generation events */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_revision_v1_revisions__revision_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                revision_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevisionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_revision_approvals_v1_revisions__revision_id__approvals_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                revision_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovalHistoryResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    approve_revision_v1_revisions__revision_id__approve_post: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path: {
                revision_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApprovalDecisionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovalDecisionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    reject_revision_v1_revisions__revision_id__reject_post: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path: {
                revision_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApprovalDecisionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovalDecisionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    request_revision_changes_v1_revisions__revision_id__request_changes_post: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string | null;
            };
            path: {
                revision_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApprovalDecisionRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApprovalDecisionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_source_v1_sources_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @constant */
                    kind: "text";
                    metadata?: Record<string, never>;
                    text: string;
                    title: string;
                } | {
                    data: Record<string, never> | unknown[];
                    /** @constant */
                    kind: "structured";
                    metadata?: Record<string, never>;
                    title: string;
                };
                "multipart/form-data": {
                    expected_content_hash?: string;
                    /** Format: binary */
                    file: string;
                    /** @description JSON object of safe scalar metadata */
                    metadata?: string;
                    title: string;
                };
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SourceResponse"];
                };
            };
        };
    };
    get_source_v1_sources__source_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                source_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SourceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_templates_v1_templates_get: {
        parameters: {
            query: {
                workflow_id: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TemplateListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_template_v1_templates_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TemplateCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TemplateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_template_v1_templates__template_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                template_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TemplateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    whoami_v1_whoami_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WhoAmIResponse"];
                };
            };
        };
    };
}
