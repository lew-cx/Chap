/**
 * DO NOT EDIT.
 *
 * Generated from a running DocKtizo by `npm run gen:types -- --target docktizo`.
 * DocKtizo commits no spec, so this and vendor/docktizo-openapi.json are the
 * only checked-in record of its contract. See docs/docktizo-gaps.md, D2.
 */
export interface paths {
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
            /** Approval Id */
            approval_id: string;
            /** Revision Id */
            revision_id: string;
            /** Sequence */
            sequence: number;
            decision: components["schemas"]["ApprovalStatus"];
            /** Actor Id */
            actor_id: string;
            /** Comment */
            comment: string | null;
            /** Policy Result */
            policy_result: {
                [key: string]: string | number | boolean | null;
            };
            /** Prior Approval Id */
            prior_approval_id: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            execution_state: components["schemas"]["GenerationState"];
            /** Idempotency Key */
            idempotency_key: string;
            /** Replayed */
            replayed: boolean;
        };
        /** ApprovalHistoryResponse */
        ApprovalHistoryResponse: {
            /** Revision Id */
            revision_id: string;
            /** State */
            state: string;
            /** Decisions */
            decisions: components["schemas"]["ApprovalRecordResponse"][];
        };
        /** ApprovalRecordResponse */
        ApprovalRecordResponse: {
            /** Approval Id */
            approval_id: string;
            /** Revision Id */
            revision_id: string;
            /** Sequence */
            sequence: number;
            decision: components["schemas"]["ApprovalStatus"];
            /** Actor Id */
            actor_id: string;
            /** Comment */
            comment: string | null;
            /** Policy Result */
            policy_result: {
                [key: string]: string | number | boolean | null;
            };
            /** Prior Approval Id */
            prior_approval_id: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /**
         * ApprovalStatus
         * @enum {string}
         */
        ApprovalStatus: "approved" | "rejected" | "changes_requested";
        /** ApprovalSummary */
        ApprovalSummary: {
            state: components["schemas"]["ReviewState"];
            decision?: components["schemas"]["ApprovalStatus"] | null;
            /** Decided At */
            decided_at?: string | null;
        };
        /** ArtifactMetadata */
        ArtifactMetadata: {
            /** Artifact Id */
            artifact_id: string;
            /** Generation Id */
            generation_id: string;
            /** Revision Id */
            revision_id: string;
            output_format: components["schemas"]["OutputFormat"];
            /** File Name */
            file_name: string;
            /** Media Type */
            media_type: string;
            /** Size Bytes */
            size_bytes: number;
            /** Content Hash */
            content_hash: string;
            versions: components["schemas"]["ArtifactVersionView"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Download Url */
            download_url: string;
        };
        /**
         * ArtifactResponse
         * @description Public artifact metadata; storage identities are intentionally absent.
         */
        ArtifactResponse: {
            /** Artifact Id */
            artifact_id: string;
            /** Generation Id */
            generation_id: string;
            /** Revision Id */
            revision_id: string;
            output_format: components["schemas"]["OutputFormat"];
            /** File Name */
            file_name: string;
            /** Media Type */
            media_type: string;
            /** Size Bytes */
            size_bytes: number;
            /** Content Hash */
            content_hash: string;
            versions: components["schemas"]["ArtifactVersionView"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Download Url */
            download_url: string;
        };
        /** ArtifactVersionView */
        ArtifactVersionView: {
            /** Workflow Id */
            workflow_id: string;
            /** Document Type */
            document_type: string;
            /** Workflow Version */
            workflow_version: number;
            /** Document Spec Version */
            document_spec_version: string;
            /** Compiler Version */
            compiler_version: string;
            /** Renderer Adapter Version */
            renderer_adapter_version: string;
            /** Template Id */
            template_id: string | null;
            /** Template Version */
            template_version: string | null;
            /** Validation Policy Version */
            validation_policy_version: string;
        };
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
        /**
         * DocumentResponse
         * @description Provider-neutral immutable document-head projection.
         */
        DocumentResponse: {
            /** Document Id */
            document_id: string;
            /** Workflow Id */
            workflow_id: string;
            /** Document Type */
            document_type: string;
            /** Workflow Version */
            workflow_version: number;
            /** Title */
            title: string;
            /** Current Revision Id */
            current_revision_id: string | null;
            /** Current Revision Number */
            current_revision_number: number;
            approval: components["schemas"]["ApprovalSummary"];
            /** Artifact Ids */
            artifact_ids: string[];
            /** Output Formats */
            output_formats: components["schemas"]["OutputFormat"][];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
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
            /** Workflow Id */
            workflow_id: string;
            /** Document Type */
            document_type: string;
            /** Version */
            version: number;
            /** Description */
            description: string;
            /** Supported Output Formats */
            supported_output_formats: components["schemas"]["OutputFormat"][];
            /** Retrieval Policy */
            retrieval_policy: string;
            /** Requires Review */
            requires_review: boolean;
            /** Required Capabilities */
            required_capabilities: string[];
            /** Input Schema */
            input_schema?: {
                [key: string]: unknown;
            } | null;
            /** Compatible Template Ids */
            compatible_template_ids?: string[];
        };
        /**
         * EventType
         * @enum {string}
         */
        EventType: "GENERATION_ACCEPTED" | "GENERATION_PLANNING" | "SOURCE_GATHERING_STARTED" | "SOURCE_GATHERING_COMPLETED" | "RETRIEVAL_STARTED" | "RETRIEVAL_COMPLETED" | "SECTION_GENERATION_STARTED" | "SECTION_GENERATION_COMPLETED" | "VALIDATION_STARTED" | "VALIDATION_FAILED" | "REPAIR_STARTED" | "REPAIR_COMPLETED" | "COMPILATION_STARTED" | "COMPILATION_COMPLETED" | "RENDER_STARTED" | "RENDER_COMPLETED" | "GENERATION_COMPLETED" | "GENERATION_FAILED" | "CANCELLATION_REQUESTED" | "CANCELLATION_ACKNOWLEDGED" | "GENERATION_CANCELLED" | "REVISION_CREATED" | "MANUAL_OVERRIDE_CREATED" | "APPROVAL_REQUESTED" | "REVISION_APPROVED" | "CHANGES_REQUESTED" | "REVISION_REJECTED";
        /** GenerationAcceptedResponse */
        GenerationAcceptedResponse: {
            /** Generation Id */
            generation_id: string;
            state: components["schemas"]["GenerationState"];
            /** Status Url */
            status_url: string;
            /** Correlation Id */
            correlation_id: string;
            /** Idempotency Key */
            idempotency_key: string;
            /** Request Fingerprint */
            request_fingerprint: string;
            /** Replayed */
            replayed: boolean;
            /** Client Supplied Idempotency Key */
            client_supplied_idempotency_key: boolean;
        };
        /** GenerationCancellationResponse */
        GenerationCancellationResponse: {
            /** Generation Id */
            generation_id: string;
            state: components["schemas"]["GenerationState"];
            outcome: components["schemas"]["CancellationOutcome"];
            /**
             * Requested At
             * Format: date-time
             */
            requested_at: string;
            /** Acknowledged At */
            acknowledged_at: string | null;
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
         */
        GenerationCreateRequest: {
            /** Document Type */
            document_type: string;
            /** Title */
            title?: string | null;
            /** Instructions */
            instructions?: string | null;
            /** Input Data */
            input_data?: {
                [key: string]: unknown;
            };
            /** Source Ids */
            source_ids?: string[];
            /** Template Id */
            template_id?: string | null;
            /**
             * Output Formats
             * @default [
             *       "docx"
             *     ]
             */
            output_formats: components["schemas"]["OutputFormat"][];
            /** Locale */
            locale?: string | null;
            /** Audience */
            audience?: string | null;
            /** Tone */
            tone?: string | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** GenerationEventPageResponse */
        GenerationEventPageResponse: {
            /** Items */
            items: components["schemas"]["GenerationEventResponse"][];
            /** Checkpoint */
            checkpoint: string;
            /** Next Cursor */
            next_cursor: string | null;
            /** Has More */
            has_more: boolean;
        };
        /** GenerationEventResponse */
        GenerationEventResponse: {
            /**
             * Schema Version
             * @constant
             */
            schema_version: "1.0";
            /** Event Id */
            event_id: string;
            /** Sequence */
            sequence: number;
            event_type: components["schemas"]["EventType"];
            /** Workspace Id */
            workspace_id: string;
            /** Generation Id */
            generation_id: string;
            /** Workflow Id */
            workflow_id: string;
            /** Correlation Id */
            correlation_id: string;
            /** Document Id */
            document_id: string | null;
            /** Revision Id */
            revision_id: string | null;
            state: components["schemas"]["GenerationState"];
            /** Stage */
            stage: string;
            /** Progress */
            progress: number | null;
            /** Error Code */
            error_code: string | null;
            /** Attributes */
            attributes: {
                [key: string]: string | number | boolean | null;
            };
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
        };
        /**
         * GenerationState
         * @enum {string}
         */
        GenerationState: "accepted" | "planning" | "gathering_sources" | "retrieving" | "generating" | "validating" | "repairing" | "compiling" | "rendering" | "awaiting_review" | "changes_requested" | "rejected" | "completed" | "failed" | "cancelled";
        /** GenerationStatusResponse */
        GenerationStatusResponse: {
            /** Generation Id */
            generation_id: string;
            /** Workflow Id */
            workflow_id: string;
            state: components["schemas"]["GenerationState"];
            /** Stage */
            stage: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Requested Formats */
            requested_formats: components["schemas"]["OutputFormat"][];
            /** Document Id */
            document_id: string | null;
            /** Revision Id */
            revision_id: string | null;
            /** Artifact Ids */
            artifact_ids: string[];
            /** Attempt Count */
            attempt_count: number;
            error: components["schemas"]["SafeGenerationError"] | null;
            /** Cancellation Requested At */
            cancellation_requested_at: string | null;
            /** Cancellation Acknowledged At */
            cancellation_acknowledged_at: string | null;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HealthResponse */
        HealthResponse: {
            /** Status */
            status: string;
            /** Service */
            service: string;
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
            /** Parent Revision Id */
            parent_revision_id: string;
            /** Reason */
            reason: string;
            /** Fields */
            fields: {
                [key: string]: components["schemas"]["JsonValue"];
            };
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * OutputFormat
         * @enum {string}
         */
        OutputFormat: "text" | "markdown" | "json" | "csv" | "docx" | "pdf" | "xlsx";
        /**
         * ReviewState
         * @enum {string}
         */
        ReviewState: "empty" | "awaiting_review" | "completed" | "approved" | "rejected" | "changes_requested";
        /** RevisionCreateRequest */
        RevisionCreateRequest: {
            /** Parent Revision Id */
            parent_revision_id: string;
            /** Instructions */
            instructions: string;
            /** Target Fields */
            target_fields: string[];
            /** Source Ids */
            source_ids?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** RevisionListResponse */
        RevisionListResponse: {
            /** Items */
            items: components["schemas"]["RevisionSummaryResponse"][];
            /** Next Cursor */
            next_cursor: string | null;
            /** Has More */
            has_more: boolean;
        };
        /**
         * RevisionMode
         * @enum {string}
         */
        RevisionMode: "generated" | "manual_override";
        /**
         * RevisionResponse
         * @description Revision detail with public artifact metadata only.
         */
        RevisionResponse: {
            /** Revision Id */
            revision_id: string;
            /** Document Id */
            document_id: string;
            /** Generation Id */
            generation_id: string;
            execution_state: components["schemas"]["GenerationState"];
            /** Workflow Id */
            workflow_id: string;
            /** Document Type */
            document_type: string;
            /** Workflow Version */
            workflow_version: number;
            /** Parent Revision Id */
            parent_revision_id: string | null;
            /** Revision Number */
            revision_number: number;
            /** Requires Review */
            requires_review: boolean;
            revision_mode: components["schemas"]["RevisionMode"];
            approval: components["schemas"]["ApprovalSummary"];
            /** Artifact Ids */
            artifact_ids: string[];
            /** Output Formats */
            output_formats: components["schemas"]["OutputFormat"][];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Document Spec Id */
            document_spec_id: string;
            /** Validation Report Id */
            validation_report_id: string;
            /** Source Reference Ids */
            source_reference_ids: string[];
            /** Changed Fields */
            changed_fields: string[];
            /** Artifacts */
            artifacts: components["schemas"]["ArtifactMetadata"][];
        };
        /**
         * RevisionSummaryResponse
         * @description Immutable revision lineage summary.
         */
        RevisionSummaryResponse: {
            /** Revision Id */
            revision_id: string;
            /** Document Id */
            document_id: string;
            /** Generation Id */
            generation_id: string;
            execution_state: components["schemas"]["GenerationState"];
            /** Workflow Id */
            workflow_id: string;
            /** Document Type */
            document_type: string;
            /** Workflow Version */
            workflow_version: number;
            /** Parent Revision Id */
            parent_revision_id: string | null;
            /** Revision Number */
            revision_number: number;
            /** Requires Review */
            requires_review: boolean;
            revision_mode: components["schemas"]["RevisionMode"];
            approval: components["schemas"]["ApprovalSummary"];
            /** Artifact Ids */
            artifact_ids: string[];
            /** Output Formats */
            output_formats: components["schemas"]["OutputFormat"][];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
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
            /** Source Id */
            source_id: string;
            source_type: components["schemas"]["SourceType"];
            /** Display Name */
            display_name: string;
            /** File Name */
            file_name: string | null;
            /** Media Type */
            media_type: string | null;
            /** Size Bytes */
            size_bytes: number | null;
            ingestion_state: components["schemas"]["IngestionState"];
            /** Metadata */
            metadata: {
                [key: string]: string | number | boolean | null;
            };
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Replayed */
            replayed?: boolean | null;
        };
        /**
         * SourceType
         * @enum {string}
         */
        SourceType: "upload" | "lewlm_ingest" | "structured_data" | "user_text" | "revision" | "url_snapshot";
        /** TemplateAssetReference */
        TemplateAssetReference: {
            /** Asset Id */
            asset_id: string;
            /** Alt Text */
            alt_text: string;
            /** Caption */
            caption?: string | null;
            /** Width */
            width?: number | null;
            /** Height */
            height?: number | null;
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
            /** Template Id */
            template_id?: string | null;
            /** Workflow Id */
            workflow_id: string;
            /** Template Version */
            template_version: string;
            /** Name */
            name: string;
            /** Compatible Workflow Ids */
            compatible_workflow_ids?: string[];
            /** Supported Output Formats */
            supported_output_formats: components["schemas"]["OutputFormat"][];
            /** Organization Name */
            organization_name?: string | null;
            /** Header Text */
            header_text?: string | null;
            /** Footer Text */
            footer_text?: string | null;
            /** Legal Text */
            legal_text?: string | null;
            /** Locale Default */
            locale_default?: string | null;
            /** Style Tokens */
            style_tokens?: components["schemas"]["BrandStyleToken"][];
            /** Assets */
            assets?: components["schemas"]["TemplateAssetReference"][];
            /** Configuration */
            configuration?: {
                [key: string]: unknown;
            };
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
            /** Template Id */
            template_id: string;
            /** Workflow Id */
            workflow_id: string;
            /** Template Version */
            template_version: string;
            /** Name */
            name: string;
            /** Compatible Workflow Ids */
            compatible_workflow_ids: string[];
            /** Supported Output Formats */
            supported_output_formats: components["schemas"]["OutputFormat"][];
            /** Organization Name */
            organization_name: string | null;
            /** Header Text */
            header_text: string | null;
            /** Footer Text */
            footer_text: string | null;
            /** Legal Text */
            legal_text: string | null;
            /** Locale Default */
            locale_default: string | null;
            /** Style Tokens */
            style_tokens: components["schemas"]["BrandStyleToken"][];
            /** Asset Ids */
            asset_ids: string[];
            /** Configuration */
            configuration: {
                [key: string]: unknown;
            };
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
            /** Input */
            input?: unknown;
            /** Context */
            ctx?: Record<string, never>;
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
                    title: string;
                    text: string;
                    metadata?: Record<string, never>;
                } | {
                    /** @constant */
                    kind: "structured";
                    title: string;
                    data: Record<string, never> | unknown[];
                    metadata?: Record<string, never>;
                };
                "multipart/form-data": {
                    title: string;
                    /** Format: binary */
                    file: string;
                    expected_content_hash?: string;
                    /** @description JSON object of safe scalar metadata */
                    metadata?: string;
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
}
