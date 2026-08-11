/**
 * DO NOT EDIT.
 *
 * Generated from LewLM's published contract by `npm run gen:types`.
 * Edit LewLM, not this file. See docs/lewlm-gaps.md for what the contract
 * is missing and why some shapes look the way they do.
 */
export interface paths {
    "/v1/chat/completions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Chat Completion
         * @description Create a chat completion using the selected local runtime.
         */
        post: operations["create_chat_completion_v1_chat_completions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/responses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Response
         * @description Create a LewLM responses-style completion.
         */
        post: operations["create_response_v1_responses_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cluster/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cluster Status
         * @description Return cluster coordinator or worker state.
         */
        get: operations["cluster_status_v1_cluster_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cluster/tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Issue Cluster Token
         * @description Issue a signed worker enrollment token on a coordinator node.
         */
        post: operations["issue_cluster_token_v1_cluster_tokens_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cluster/workers/enroll": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Enroll Cluster Worker
         * @description Enroll a worker on the coordinator and return its session token.
         */
        post: operations["enroll_cluster_worker_v1_cluster_workers_enroll_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cluster/workers/heartbeat": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cluster Worker Heartbeat
         * @description Refresh a worker heartbeat on the coordinator.
         */
        post: operations["cluster_worker_heartbeat_v1_cluster_workers_heartbeat_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cluster/plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cluster Plan
         * @description Create or refresh a deterministic distributed plan for a model.
         */
        post: operations["cluster_plan_v1_cluster_plans_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cluster/worker/pipeline-stage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cluster Pipeline Stage
         * @description Execute one worker stage of the distributed proof pipeline.
         */
        post: operations["cluster_pipeline_stage_v1_cluster_worker_pipeline_stage_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/documents/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate Document
         * @description Render a deterministic document artifact from the structured IR.
         */
        post: operations["generate_document_v1_documents_generate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/documents/ingest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ingest Document
         * @description Extract a structured document representation from local files or uploaded bytes.
         */
        post: operations["ingest_document_v1_documents_ingest_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/documents/transform": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Transform Document
         * @description Run a built-in document skill and render its output artifact.
         */
        post: operations["transform_document_v1_documents_transform_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Stream Events
         * @description Stream runtime and request lifecycle events over SSE.
         */
        get: operations["stream_events_v1_events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Health
         * @description Return service and storage health for the local LewLM instance.
         */
        get: operations["health_v1_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Sessions
         * @description List persisted local sessions.
         */
        get: operations["list_sessions_v1_sessions_get"];
        put?: never;
        /**
         * Create Session
         * @description Create a new persisted local session.
         */
        post: operations["create_session_v1_sessions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sessions/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Session
         * @description Return a persisted session and its turn history.
         */
        get: operations["get_session_v1_sessions__session_id__get"];
        put?: never;
        post?: never;
        /**
         * Delete Session
         * @description Delete a persisted session and its turns.
         */
        delete: operations["delete_session_v1_sessions__session_id__delete"];
        options?: never;
        head?: never;
        /**
         * Update Session
         * @description Rename a session or adjust its metadata without touching turn history.
         */
        patch: operations["update_session_v1_sessions__session_id__patch"];
        trace?: never;
    };
    "/v1/sessions/{session_id}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Session Messages
         * @description Return flattened chat messages for a persisted session.
         */
        get: operations["get_session_messages_v1_sessions__session_id__messages_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sessions/{session_id}/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Export Session
         * @description Export a persisted session as a portable bundle.
         */
        get: operations["export_session_v1_sessions__session_id__export_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/sessions/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Import Session
         * @description Import a portable session bundle into local persistence.
         */
        post: operations["import_session_v1_sessions_import_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lewlm/capabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lewlm Capabilities
         * @description Return LewLM's host-level middleware capability evidence report.
         */
        get: operations["lewlm_capabilities_v1_lewlm_capabilities_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lewlm/probes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Probe Lewlm Capabilities
         * @description Run a routing probe or an explicit runtime smoke probe.
         */
        post: operations["probe_lewlm_capabilities_v1_lewlm_probes_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lewlm/conversions/plan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Plan Lewlm Conversion
         * @description Return read-only conversion target options without queueing a job.
         */
        post: operations["plan_lewlm_conversion_v1_lewlm_conversions_plan_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lewlm/conversions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Lewlm Conversion
         * @description Queue or resolve a model conversion through the LewLM middleware namespace.
         */
        post: operations["create_lewlm_conversion_v1_lewlm_conversions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lewlm/conversions/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Lewlm Conversion
         * @description Return a conversion job by id through the LewLM namespace.
         */
        get: operations["get_lewlm_conversion_v1_lewlm_conversions__job_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lewlm/benchmarks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Lewlm Benchmark
         * @description Run a benchmark through the LewLM middleware namespace.
         */
        post: operations["create_lewlm_benchmark_v1_lewlm_benchmarks_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lewlm/models/{model_id}/artifacts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lewlm Model Artifacts
         * @description Return lineage, conversion, benchmark, and capability evidence for a model.
         */
        get: operations["lewlm_model_artifacts_v1_lewlm_models__model_id__artifacts_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Models
         * @description List models currently stored in the local registry.
         *
         *     Each item is annotated with the capabilities it can actually serve on this
         *     host, so a caller can choose a usable model without one request per model.
         */
        get: operations["list_models_v1_models_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/{model_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Model
         * @description Return one registered model with the readiness annotation from the list.
         *
         *     Without it a caller has to fetch the whole inventory and filter client-side
         *     just to render one model.
         */
        get: operations["get_model_v1_models__model_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/{model_id}/capabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Model Capabilities
         * @description Describe model/runtime capability support for the current host.
         */
        get: operations["model_capabilities_v1_models__model_id__capabilities_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/scan": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Scan Models
         * @description Scan configured or requested roots and update the local registry.
         */
        post: operations["scan_models_v1_models_scan_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/convert": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Convert Model
         * @description Queue or resolve a conversion job for a registered model.
         */
        post: operations["convert_model_v1_models_convert_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/{model_id}/warm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Warm Model
         * @description Warm a registered model in its selected runtime.
         */
        post: operations["warm_model_v1_models__model_id__warm_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/{model_id}/unload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Unload Model
         * @description Unload a registered model from its selected runtime.
         */
        post: operations["unload_model_v1_models__model_id__unload_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/{model_id}/drain": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Drain Model
         * @description Stop new leases, wait for current usage, and unload a model.
         */
        post: operations["drain_model_v1_models__model_id__drain_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/{model_id}/drain-operations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Drain Operation
         * @description Start an observable drain without holding the HTTP request open.
         */
        post: operations["create_drain_operation_v1_models__model_id__drain_operations_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/{model_id}/residency": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Model Residency
         * @description Return live residency state for one registered model.
         */
        get: operations["model_residency_v1_models__model_id__residency_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/embeddings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Embeddings
         * @description Create embeddings with a compatible local model.
         */
        post: operations["create_embeddings_v1_embeddings_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/rerank": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rerank Documents
         * @description Rerank candidate documents with a compatible local model.
         */
        post: operations["rerank_documents_v1_rerank_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/retrieval/context": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Retrieve Context
         * @description Rank caller-provided candidate chunks into reusable retrieval context.
         */
        post: operations["retrieve_context_v1_retrieval_context_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/tokenize/count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Count Tokens
         * @description Count tokens with the selected model's own tokenizer, not an estimate.
         */
        post: operations["count_tokens_v1_tokenize_count_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/audio/transcriptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Transcribe Audio
         * @description Transcribe a JSON or multipart audio payload with a compatible local model.
         */
        post: operations["transcribe_audio_v1_audio_transcriptions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/audio/voices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Audio Voices
         * @description List the synthesis voices the selected model can resolve on this host.
         */
        get: operations["list_audio_voices_v1_audio_voices_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/audio/speech": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Synthesize Speech
         * @description Generate speech audio from text with a compatible local model.
         */
        post: operations["synthesize_speech_v1_audio_speech_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/runtime": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Runtime Info
         * @description Return stable identity for this model-owning service container.
         */
        get: operations["runtime_info_v1_runtime_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/runtime/residencies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Runtime Residencies
         * @description List process-local live model residency state.
         */
        get: operations["runtime_residencies_v1_runtime_residencies_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/model-lifecycle/operations/{operation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Lifecycle Operation
         * @description Poll an asynchronous lifecycle operation.
         */
        get: operations["get_lifecycle_operation_v1_model_lifecycle_operations__operation_id__get"];
        put?: never;
        post?: never;
        /**
         * Cancel Lifecycle Operation
         * @description Cancel a pending or running lifecycle operation.
         */
        delete: operations["cancel_lifecycle_operation_v1_model_lifecycle_operations__operation_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/jobs/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Job
         * @description Return the status of a background job.
         */
        get: operations["get_job_v1_jobs__job_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cache/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cache Stats
         * @description Return managed cache statistics.
         */
        get: operations["cache_stats_v1_cache_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/runtime/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Runtime Stats
         * @description Return runtime availability and residency statistics.
         */
        get: operations["runtime_stats_v1_runtime_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/cluster/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cluster Stats
         * @description Return experimental cluster status.
         */
        get: operations["cluster_stats_v1_cluster_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/serving-profiles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Serving Profiles
         * @description List serving profiles stored on this host, newest first.
         *
         *     `limit` bounds the stored profiles read before `model` and `capability`
         *     narrow them, so it is a scan window rather than a page size.
         */
        get: operations["list_serving_profiles_v1_serving_profiles_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/benchmarks/autotune": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Autotune
         * @description Benchmark serving-profile candidates and persist the recommended profile.
         */
        post: operations["autotune_v1_benchmarks_autotune_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/skills": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Skills
         * @description List built-in deterministic skills.
         */
        get: operations["list_skills_v1_skills_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/skills/{skill_name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Skill
         * @description Return a built-in skill descriptor.
         */
        get: operations["get_skill_v1_skills__skill_name__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/tools": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Tools
         * @description List registered local tools.
         */
        get: operations["list_tools_v1_tools_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/tools/{tool_name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Tool
         * @description Return a registered local tool descriptor.
         */
        get: operations["get_tool_v1_tools__tool_name__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/tools/execute": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Execute Tool
         * @description Execute a registered local tool and return its trace plus result.
         */
        post: operations["execute_tool_v1_tools_execute_post"];
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
        /** ApplicationRuntimeMetrics */
        ApplicationRuntimeMetrics: {
            /** Application Id */
            application_id: string;
            /**
             * Request Count
             * @default 0
             */
            request_count: number;
            /**
             * Success Count
             * @default 0
             */
            success_count: number;
            /**
             * Failure Count
             * @default 0
             */
            failure_count: number;
            /**
             * Lease Acquisition Count
             * @default 0
             */
            lease_acquisition_count: number;
            /**
             * Active Lease Count
             * @default 0
             */
            active_lease_count: number;
            /**
             * Peak Active Lease Count
             * @default 0
             */
            peak_active_lease_count: number;
            /**
             * Load Contention Count
             * @default 0
             */
            load_contention_count: number;
            /**
             * Total Residency Wait Seconds
             * @default 0
             */
            total_residency_wait_seconds: number;
            /**
             * Average Residency Wait Seconds
             * @default 0
             */
            average_residency_wait_seconds: number;
            /** Model Usage Counts */
            model_usage_counts?: {
                [key: string]: number;
            };
            /** Capability Counts */
            capability_counts?: {
                [key: string]: number;
            };
            /** Last Request At */
            last_request_at?: string | null;
            /** Last Failure At */
            last_failure_at?: string | null;
        };
        /**
         * ArchitectureSubtype
         * @enum {string}
         */
        ArchitectureSubtype: "transformer" | "ssm_mamba" | "hybrid_ssm" | "moe" | "hybrid_moe" | "unknown";
        /** AsyncDrainRequest */
        AsyncDrainRequest: {
            /** Timeout Seconds */
            timeout_seconds?: number | null;
            /** Idempotency Key */
            idempotency_key?: string | null;
        };
        /**
         * AudioCapabilityRole
         * @description Which side of the audio contract a model can actually serve.
         * @enum {string}
         */
        AudioCapabilityRole: "transcription" | "speech";
        /** AudioSpeechCreateRequest */
        AudioSpeechCreateRequest: {
            /** Model */
            model?: string | null;
            /** Input */
            input: string;
            /** Voice */
            voice?: string | null;
            /**
             * Format
             * @default wav
             */
            format: string;
        };
        /** AudioSpeechCreateResponse */
        AudioSpeechCreateResponse: {
            /** Request Id */
            request_id: string;
            /** Created */
            created: number;
            /** Model */
            model: string;
            /** Media Type */
            media_type: string;
            /** Content Type */
            content_type: string;
            /** Audio Base64 */
            audio_base64: string;
            /** Voice */
            voice?: string | null;
            /** Duration Seconds */
            duration_seconds?: number | null;
            routing: components["schemas"]["RoutingDecision"];
            metadata: components["schemas"]["ExecutionMetadata"];
        };
        /** AudioTranscriptionCreateResponse */
        AudioTranscriptionCreateResponse: {
            /** Request Id */
            request_id: string;
            /** Created */
            created: number;
            /** Model */
            model: string;
            /** Text */
            text: string;
            /** Language */
            language?: string | null;
            /** Duration Seconds */
            duration_seconds?: number | null;
            /** Segments */
            segments?: components["schemas"]["AudioTranscriptionSegment"][];
            routing: components["schemas"]["RoutingDecision"];
            metadata: components["schemas"]["ExecutionMetadata"];
        };
        /** AudioTranscriptionSegment */
        AudioTranscriptionSegment: {
            /** Start Seconds */
            start_seconds?: number | null;
            /** End Seconds */
            end_seconds?: number | null;
            /** Text */
            text: string;
        };
        /**
         * AudioVoice
         * @description A synthesis voice the host can actually resolve right now.
         *
         *     Voices are host state, not manifest state: a backend may resolve a voice
         *     from its own download cache rather than from the model directory, so this
         *     is reported per host and per model instead of being declared up front, and
         *     each voice names the file it was found in.
         */
        AudioVoice: {
            /** Voice Id */
            voice_id: string;
            source: components["schemas"]["AudioVoiceSource"];
            /** Source Path */
            source_path?: string | null;
        };
        /**
         * AudioVoiceInventory
         * @description Voices available for one model on this host.
         */
        AudioVoiceInventory: {
            /** Model Id */
            model_id: string;
            /** Runtime Name */
            runtime_name?: string | null;
            /** Voices */
            voices?: components["schemas"]["AudioVoice"][];
            /**
             * Enumerable
             * @default true
             */
            enumerable: boolean;
            /** Reason */
            reason?: string | null;
        };
        /**
         * AudioVoiceSource
         * @description Where a synthesis voice was found.
         * @enum {string}
         */
        AudioVoiceSource: "bundle" | "backend_cache";
        /** AutotuneCandidateSummary */
        AutotuneCandidateSummary: {
            /** Name */
            name: string;
            /** Benchmark Id */
            benchmark_id: string;
            /** Runtime */
            runtime: string;
            /** Settings Overrides */
            settings_overrides?: {
                [key: string]: number | string | boolean | null;
            };
            /** Total Seconds */
            total_seconds: number;
            /** Load Seconds */
            load_seconds: number;
            /** Generate Seconds */
            generate_seconds: number;
            /** Completion Tokens Per Second */
            completion_tokens_per_second?: number | null;
            /** Continuous Batching Throughput */
            continuous_batching_throughput?: number | null;
            /** Warm Cache Ttft Ratio */
            warm_cache_ttft_ratio?: number | null;
            /** Selected Speculation Mode */
            selected_speculation_mode?: string | null;
            /** Quantization Profile */
            quantization_profile?: string | null;
            /** Active Kernel Path */
            active_kernel_path?: string | null;
            /** Active Cache Features */
            active_cache_features?: string[];
            artifact?: components["schemas"]["BenchmarkArtifactReference"] | null;
            /** Notes */
            notes?: string[];
        };
        /** AutotuneRequest */
        AutotuneRequest: {
            /** Model Id */
            model_id?: string | null;
            /**
             * Prompt
             * @default Benchmark ping
             */
            prompt: string;
            /**
             * Capability
             * @default chat
             */
            capability: string;
            /** Workload Class */
            workload_class?: string | null;
        };
        /**
         * BackendFeatureProbe
         * @description Presence report for one backend inference feature surface.
         *
         *     ``present`` is ``True``/``False`` when the installed backend could be
         *     inspected, and ``None`` when the backend itself is not importable on this
         *     host.
         */
        BackendFeatureProbe: {
            /** Profile */
            profile: string;
            /** Backend */
            backend: string;
            /** Feature */
            feature: string;
            /** Present */
            present?: boolean | null;
            /** Detail */
            detail: string;
        };
        /**
         * BackendModuleStatus
         * @description Installed-version evidence for one optional runtime backend module.
         *
         *     Version presence is inventory evidence only; capability claims still come from
         *     runtime feature probes, load/generate probes, and benchmark records.
         */
        BackendModuleStatus: {
            /** Profile */
            profile: string;
            /** Module */
            module: string;
            /** Distribution */
            distribution: string;
            /** Installed */
            installed: boolean;
            /** Version */
            version?: string | null;
            /** Detail */
            detail: string;
        };
        /** BenchmarkArtifactReference */
        BenchmarkArtifactReference: {
            /** Artifact Id */
            artifact_id: string;
            /** Artifact Path */
            artifact_path: string;
            /** Workload Signature */
            workload_signature: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Capability */
            capability: string;
            /** Benchmark Count */
            benchmark_count: number;
            /** Model Count */
            model_count: number;
            /** Regression Status */
            regression_status: string;
            /** Compared To Artifact Id */
            compared_to_artifact_id?: string | null;
        };
        /** BenchmarkArtifactSummary */
        BenchmarkArtifactSummary: {
            /**
             * Total Artifacts
             * @default 0
             */
            total_artifacts: number;
            latest_artifact?: components["schemas"]["BenchmarkArtifactReference"] | null;
            /** Recent Artifacts */
            recent_artifacts?: components["schemas"]["BenchmarkArtifactReference"][];
        };
        /** BenchmarkRecord */
        BenchmarkRecord: {
            /** Benchmark Id */
            benchmark_id: string;
            /** Model Id */
            model_id: string;
            /** Runtime */
            runtime: string;
            /**
             * Capability
             * @default chat
             */
            capability: string;
            /** Workload Class */
            workload_class?: string | null;
            /** Reason */
            reason: string;
            /** Prompt */
            prompt: string;
            /** Output Text */
            output_text: string;
            /** Load Seconds */
            load_seconds: number;
            /** Generate Seconds */
            generate_seconds: number;
            /** Total Seconds */
            total_seconds: number;
            /** Usage */
            usage?: {
                [key: string]: number;
            };
            /** Measurements */
            measurements?: {
                [key: string]: number;
            };
            /** Phase Breakdown */
            phase_breakdown?: {
                [key: string]: number | string | boolean | null;
            };
            /** Optimization Attribution */
            optimization_attribution?: {
                [key: string]: unknown;
            };
            /** Completion Tokens Per Second */
            completion_tokens_per_second?: number | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Performance Features */
            performance_features?: components["schemas"]["PerformanceFeatureStatus"][];
            /** Performance Core Evidence */
            performance_core_evidence?: components["schemas"]["PerformanceCoreEvidenceRecord"][];
            serving_profile?: components["schemas"]["ServingProfileApplication"] | null;
        };
        /** BenchmarkSummary */
        BenchmarkSummary: {
            /**
             * Total Runs
             * @default 0
             */
            total_runs: number;
            /** Last Run At */
            last_run_at?: string | null;
            /** Average Total Seconds */
            average_total_seconds?: number | null;
            /** Capability Counts */
            capability_counts?: {
                [key: string]: number;
            };
            /** Recent Runs */
            recent_runs?: components["schemas"]["BenchmarkRecord"][];
            /** Models */
            models?: components["schemas"]["ModelBenchmarkSummary"][];
            artifact_summary?: components["schemas"]["BenchmarkArtifactSummary"];
        };
        /** BrandedDocumentSectionInput */
        BrandedDocumentSectionInput: {
            /** Heading */
            heading: string;
            /** Paragraphs */
            paragraphs?: string[];
            /** Bullets */
            bullets?: string[];
            /** Callout Title */
            callout_title?: string | null;
            /** Callout Body */
            callout_body?: string | null;
        };
        /** BrandedDocumentSettings */
        BrandedDocumentSettings: {
            /** Organization Name */
            organization_name: string;
            /** Subtitle */
            subtitle?: string | null;
            /** Audience */
            audience?: string | null;
            /** Issued On */
            issued_on?: string | null;
            /** Contact Line */
            contact_line?: string | null;
            /** Header Text */
            header_text?: string | null;
            /** Footer Text */
            footer_text?: string | null;
            /** Logo Path */
            logo_path?: string | null;
            /** Hero Image Path */
            hero_image_path?: string | null;
        };
        /** BrandedDocumentTemplateInput */
        BrandedDocumentTemplateInput: {
            /**
             * Title
             * @default Branded Brief
             */
            title: string;
            settings: components["schemas"]["BrandedDocumentSettings"];
            /** Summary */
            summary: string;
            /** Key Points */
            key_points?: string[];
            /** Sections */
            sections?: components["schemas"]["BrandedDocumentSectionInput"][];
        };
        /** BrandedDocumentTemplateRequest */
        BrandedDocumentTemplateRequest: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            skill: "branded_document_template";
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** File Name */
            file_name?: string | null;
            input: components["schemas"]["BrandedDocumentTemplateInput"];
        };
        /** BuiltInSkillDescriptor */
        BuiltInSkillDescriptor: {
            /** Name */
            name: string;
            /**
             * Version
             * @default 1.0.0
             */
            version: string;
            /**
             * Category
             * @default document_transform
             * @constant
             */
            category: "document_transform";
            /** Description */
            description: string;
            /**
             * Tool Name
             * @default documents.transform
             */
            tool_name: string;
            /**
             * Required Authorization
             * @default document_transform
             */
            required_authorization: string;
            /** Supported Input Hints */
            supported_input_hints?: string[];
            /** Supported Output Formats */
            supported_output_formats?: components["schemas"]["DocumentOutputFormat"][];
            /** Example Path */
            example_path?: string | null;
            /** Tags */
            tags?: string[];
        };
        /** CacheStats */
        CacheStats: {
            /** Cache Dir */
            cache_dir: string;
            /** Artifact Count */
            artifact_count: number;
            /** File Count */
            file_count: number;
            /** Total Size Bytes */
            total_size_bytes: number;
            /**
             * Cache Hits
             * @default 0
             */
            cache_hits: number;
            /**
             * Cache Misses
             * @default 0
             */
            cache_misses: number;
            /**
             * Conversion Cache Hits
             * @default 0
             */
            conversion_cache_hits: number;
            /**
             * Conversion Cache Misses
             * @default 0
             */
            conversion_cache_misses: number;
            /**
             * Runtime Response Count
             * @default 0
             */
            runtime_response_count: number;
            /**
             * Runtime Response Bytes
             * @default 0
             */
            runtime_response_bytes: number;
            /**
             * Runtime Cache Hits
             * @default 0
             */
            runtime_cache_hits: number;
            /**
             * Runtime Cache Misses
             * @default 0
             */
            runtime_cache_misses: number;
            /**
             * Block Cache Count
             * @default 0
             */
            block_cache_count: number;
            /**
             * Block Cache Bytes
             * @default 0
             */
            block_cache_bytes: number;
            /**
             * Block Cache Hits
             * @default 0
             */
            block_cache_hits: number;
            /**
             * Block Cache Misses
             * @default 0
             */
            block_cache_misses: number;
            /**
             * Multimodal Feature Count
             * @default 0
             */
            multimodal_feature_count: number;
            /**
             * Multimodal Feature Bytes
             * @default 0
             */
            multimodal_feature_bytes: number;
            /**
             * Multimodal Feature Cache Hits
             * @default 0
             */
            multimodal_feature_cache_hits: number;
            /**
             * Multimodal Feature Cache Misses
             * @default 0
             */
            multimodal_feature_cache_misses: number;
            /**
             * Multimodal Encoder Count
             * @default 0
             */
            multimodal_encoder_count: number;
            /**
             * Multimodal Encoder Bytes
             * @default 0
             */
            multimodal_encoder_bytes: number;
            /**
             * Multimodal Encoder Cache Hits
             * @default 0
             */
            multimodal_encoder_cache_hits: number;
            /**
             * Multimodal Encoder Cache Misses
             * @default 0
             */
            multimodal_encoder_cache_misses: number;
            /**
             * Multimodal Encoder Cache Invalidations
             * @default 0
             */
            multimodal_encoder_cache_invalidations: number;
            /**
             * Multimodal Encoder Resident Count
             * @default 0
             */
            multimodal_encoder_resident_count: number;
            /**
             * Multimodal Encoder Resident Bytes
             * @default 0
             */
            multimodal_encoder_resident_bytes: number;
            /** Performance Features */
            performance_features?: components["schemas"]["PerformanceFeatureStatus"][];
        };
        /** CalloutBlock */
        CalloutBlock: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "callout";
            /**
             * Kind
             * @default info
             * @enum {string}
             */
            kind: "info" | "warning" | "success" | "note";
            /** Title */
            title?: string | null;
            /** Body */
            body: string;
            /** Style Tokens */
            style_tokens?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * CapabilityEvidence
         * @description A single support claim normalized into LewLM's evidence vocabulary.
         */
        CapabilityEvidence: {
            /** Capability */
            capability: components["schemas"]["CapabilityName"] | string;
            state: components["schemas"]["CapabilityEvidenceState"];
            /** @default unverified */
            ownership: components["schemas"]["CapabilityOwnership"];
            /** Reason */
            reason: string;
            /** Runtime Name */
            runtime_name?: string | null;
            runtime_affinity?: components["schemas"]["RuntimeAffinity"] | null;
            /** @default unknown */
            provider: components["schemas"]["RuntimeProvider"];
            /** Model Id */
            model_id?: string | null;
            /**
             * Source
             * @default runtime_probe
             */
            source: string;
            /** Probe Key */
            probe_key?: string | null;
            /** Benchmark Id */
            benchmark_id?: string | null;
            /** Artifact Id */
            artifact_id?: string | null;
            /**
             * Recorded At
             * Format: date-time
             */
            recorded_at?: string;
            /** Details */
            details?: {
                [key: string]: unknown;
            };
        };
        /**
         * CapabilityEvidenceState
         * @description Evidence-backed state for a claimed LewLM capability.
         * @enum {string}
         */
        CapabilityEvidenceState: "discovered" | "requires_install" | "requires_conversion" | "load_passed" | "generate_passed" | "benchmark_passed" | "probe_failed" | "unsupported";
        /**
         * CapabilityName
         * @enum {string}
         */
        CapabilityName: "chat" | "streaming" | "vision" | "audio_transcription" | "audio_speech" | "embeddings" | "rerank" | "conversion";
        /**
         * CapabilityOwnership
         * @description Truthful ownership label for a runtime or middleware capability.
         * @enum {string}
         */
        CapabilityOwnership: "lewlm_owned" | "backend_native" | "bridge_verified" | "fallback" | "unsupported" | "unverified";
        /**
         * CapabilityReadinessState
         * @enum {string}
         */
        CapabilityReadinessState: "ready" | "no_models" | "conversion_required" | "runtime_unavailable" | "blocked";
        /** CapabilityRuntimeMetrics */
        CapabilityRuntimeMetrics: {
            /** Capability */
            capability: string;
            /** Request Count */
            request_count: number;
            /** Success Count */
            success_count: number;
            /** Failure Count */
            failure_count: number;
            /** Success Rate */
            success_rate: number;
            /** Last Request At */
            last_request_at?: string | null;
            /** Last Error At */
            last_error_at?: string | null;
            /**
             * Total Prompt Tokens
             * @default 0
             */
            total_prompt_tokens: number;
            /**
             * Total Completion Tokens
             * @default 0
             */
            total_completion_tokens: number;
            /** Average Load Seconds */
            average_load_seconds?: number | null;
            /** Average Execution Seconds */
            average_execution_seconds?: number | null;
            /** Average Completion Tokens Per Second */
            average_completion_tokens_per_second?: number | null;
            /** Metric Totals */
            metric_totals?: {
                [key: string]: number;
            };
            /** Metric Averages */
            metric_averages?: {
                [key: string]: number;
            };
        };
        /** ChatCompletionChoice */
        ChatCompletionChoice: {
            /**
             * Index
             * @default 0
             */
            index: number;
            message: components["schemas"]["ChatCompletionChoiceMessage"];
            /** Finish Reason */
            finish_reason: string;
        };
        /** ChatCompletionChoiceMessage */
        ChatCompletionChoiceMessage: {
            /** Role */
            role: string;
            /** Content */
            content: string;
            reasoning?: components["schemas"]["ReasoningOutput"] | null;
        };
        /** ChatCompletionResponse */
        ChatCompletionResponse: {
            /** Id */
            id: string;
            /**
             * Object
             * @default chat.completion
             * @constant
             */
            object: "chat.completion";
            /** Created */
            created: number;
            /** Model */
            model: string;
            /**
             * Session Id
             * @default null
             */
            session_id: string | null;
            /** Choices */
            choices: components["schemas"]["ChatCompletionChoice"][];
            usage: components["schemas"]["CompletionUsage"];
            metadata: components["schemas"]["ExecutionMetadata"];
            /** Citations */
            citations?: components["schemas"]["GeneratedCitationReference"][];
            /** @default null */
            structured_output: components["schemas"]["StructuredOutputResult"] | null;
            /** @default null */
            tool_calls: components["schemas"]["ToolCallParseResult"] | null;
            /** @default null */
            prompt_trace: components["schemas"]["PromptCompilationTrace"] | null;
            /** @default null */
            serving_profile: components["schemas"]["ServingProfileApplication"] | null;
        };
        /** Citation */
        Citation: {
            /** Label */
            label: string;
            /** Text */
            text: string;
            /** Url */
            url?: string | null;
            /** Title */
            title?: string | null;
            /** Style Tokens */
            style_tokens?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** ClusterEnrollWorkerRequest */
        ClusterEnrollWorkerRequest: {
            /** Token */
            token: string;
            /** Worker Name */
            worker_name?: string | null;
            /** Endpoint */
            endpoint: string;
            /** Capabilities */
            capabilities?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** ClusterEnrollWorkerResponse */
        ClusterEnrollWorkerResponse: {
            worker: components["schemas"]["ClusterWorkerRecord"];
            /** Coordinator Url */
            coordinator_url: string;
            /** Session Token */
            session_token: string;
        };
        /** ClusterHeartbeatRequest */
        ClusterHeartbeatRequest: {
            /** Worker Id */
            worker_id: string;
            /** Session Token */
            session_token: string;
        };
        /** ClusterIssueTokenResponse */
        ClusterIssueTokenResponse: {
            /** Cluster Name */
            cluster_name: string;
            /** Token */
            token: string;
            /** Expires At */
            expires_at: string;
            /** Capabilities */
            capabilities?: string[];
            /** Worker Name */
            worker_name?: string | null;
        };
        /** ClusterPlanRequest */
        ClusterPlanRequest: {
            /** Model Id */
            model_id: string;
        };
        /** ClusterStageAssignment */
        ClusterStageAssignment: {
            /** Stage Index */
            stage_index: number;
            /** Stage Count */
            stage_count: number;
            /** Stage Name */
            stage_name: string;
            /** Worker Id */
            worker_id: string;
            /** Worker Name */
            worker_name: string;
            /** Endpoint */
            endpoint: string;
            /** Start Layer */
            start_layer: number;
            /** End Layer */
            end_layer: number;
            /**
             * Relative Weight
             * @default 1
             */
            relative_weight: number;
            /**
             * Selection Score
             * @default 1
             */
            selection_score: number;
            /**
             * Target Batch Tokens
             * @default 0
             */
            target_batch_tokens: number;
            /**
             * Prefetch Tokens
             * @default 0
             */
            prefetch_tokens: number;
            /**
             * Network Latency Ms
             * @default 0
             */
            network_latency_ms: number;
            /**
             * Network Bandwidth Gbps
             * @default 0
             */
            network_bandwidth_gbps: number;
            /**
             * Overlap Ratio
             * @default 0
             */
            overlap_ratio: number;
            /**
             * Expected Compute Seconds
             * @default 0
             */
            expected_compute_seconds: number;
            /**
             * Expected Network Seconds
             * @default 0
             */
            expected_network_seconds: number;
            /**
             * Expected Queue Seconds
             * @default 0
             */
            expected_queue_seconds: number;
            /**
             * Overlap Credit Seconds
             * @default 0
             */
            overlap_credit_seconds: number;
            /**
             * Expected Stage Seconds
             * @default 0
             */
            expected_stage_seconds: number;
            /**
             * Expected Utilization
             * @default 0
             */
            expected_utilization: number;
        };
        /** ClusterStageRequest */
        ClusterStageRequest: {
            /** Worker Id */
            worker_id: string;
            /** Model Id */
            model_id: string;
            stage: components["schemas"]["ClusterStageAssignment"];
            /** Prompt */
            prompt: string;
            /** Pipeline */
            pipeline?: {
                [key: string]: unknown;
            };
            /** Trace */
            trace?: {
                [key: string]: unknown;
            }[];
        };
        /** ClusterStageResponse */
        ClusterStageResponse: {
            /** Trace */
            trace?: {
                [key: string]: unknown;
            }[];
            /** Output Text */
            output_text?: string | null;
            /** Metrics */
            metrics?: {
                [key: string]: number | string | boolean;
            };
        };
        /** ClusterStatus */
        ClusterStatus: {
            /** Role */
            role: string;
            /** Enabled */
            enabled: boolean;
            /** Cluster Name */
            cluster_name: string;
            /** Node Name */
            node_name: string;
            /** Coordinator Url */
            coordinator_url?: string | null;
            /** Public Base Url */
            public_base_url?: string | null;
            /**
             * Ready Worker Count
             * @default 0
             */
            ready_worker_count: number;
            /**
             * Stale Worker Count
             * @default 0
             */
            stale_worker_count: number;
            /**
             * Plan Count
             * @default 0
             */
            plan_count: number;
            /** Worker Heartbeat Timeout Seconds */
            worker_heartbeat_timeout_seconds: number;
            worker_session?: components["schemas"]["ClusterWorkerSession"] | null;
            /** Workers */
            workers?: components["schemas"]["ClusterWorkerRecord"][];
            /** Latest Execution Metrics */
            latest_execution_metrics?: {
                [key: string]: number | string | boolean;
            };
            /** Notes */
            notes?: string[];
        };
        /** ClusterTokenIssueRequest */
        ClusterTokenIssueRequest: {
            /** Worker Name */
            worker_name?: string | null;
            /** Capabilities */
            capabilities?: string[];
            /** Ttl Seconds */
            ttl_seconds?: number | null;
        };
        /** ClusterWorkerProfile */
        ClusterWorkerProfile: {
            /** Worker Id */
            worker_id: string;
            /** Worker Name */
            worker_name: string;
            /** Endpoint */
            endpoint: string;
            /**
             * Relative Weight
             * @default 1
             */
            relative_weight: number;
            /**
             * Selection Score
             * @default 1
             */
            selection_score: number;
            /**
             * Network Latency Ms
             * @default 0
             */
            network_latency_ms: number;
            /**
             * Network Bandwidth Gbps
             * @default 0
             */
            network_bandwidth_gbps: number;
            /**
             * Max Batch Tokens
             * @default 0
             */
            max_batch_tokens: number;
            /**
             * Prefetch Tokens
             * @default 0
             */
            prefetch_tokens: number;
            /**
             * Overlap Ratio
             * @default 0
             */
            overlap_ratio: number;
        };
        /** ClusterWorkerRecord */
        ClusterWorkerRecord: {
            /** Worker Id */
            worker_id: string;
            /** Worker Name */
            worker_name: string;
            /** Endpoint */
            endpoint: string;
            /** Capabilities */
            capabilities?: string[];
            /** Status */
            status: string;
            /** Enrolled At */
            enrolled_at: string;
            /** Last Heartbeat At */
            last_heartbeat_at: string;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Session Token */
            session_token?: string | null;
            /** Last Error */
            last_error?: string | null;
        };
        /** ClusterWorkerSession */
        ClusterWorkerSession: {
            /** Worker Id */
            worker_id: string;
            /** Worker Name */
            worker_name: string;
            /** Coordinator Url */
            coordinator_url: string;
            /** Endpoint */
            endpoint: string;
            /** Session Token */
            session_token: string;
            /** Enrolled At */
            enrolled_at: string;
        };
        /** CompletionUsage */
        CompletionUsage: {
            /**
             * Prompt Tokens
             * @default 0
             */
            prompt_tokens: number;
            /**
             * Completion Tokens
             * @default 0
             */
            completion_tokens: number;
            /**
             * Total Tokens
             * @default 0
             */
            total_tokens: number;
            /**
             * Measured
             * @description True when counts came from the model's own tokenizer. False when the backend exposed no tokenizer and LewLM had to estimate.
             * @default true
             */
            measured: boolean;
        };
        /**
         * ComponentKind
         * @description The role a component played in producing a result.
         * @enum {string}
         */
        ComponentKind: "parser" | "renderer" | "chunker" | "ocr" | "scoring_policy" | "tokenizer";
        /**
         * ComponentProvenance
         * @description One named, versioned component that contributed to a result.
         */
        ComponentProvenance: {
            kind: components["schemas"]["ComponentKind"];
            /**
             * Name
             * @description Stable LewLM-owned component name, not a package name.
             */
            name: string;
            /**
             * Version
             * @description Version of the LewLM-owned component behaviour.
             */
            version: string;
            /**
             * Implementation
             * @description Third-party distribution that performs the work, when one does.
             */
            implementation?: string | null;
            /**
             * Implementation Version
             * @description Installed version of `implementation`, or null when it cannot be determined.
             */
            implementation_version?: string | null;
            /**
             * Deterministic
             * @description Whether the same input reproduces the same output on this component.
             * @default true
             */
            deterministic: boolean;
        };
        /** ConfigurationHealth */
        ConfigurationHealth: {
            /** Data Dir */
            data_dir: string;
            /** Models Dir */
            models_dir: string[];
            /**
             * Runtime Packs
             * @default []
             */
            runtime_packs: components["schemas"]["PackReport"][];
            /**
             * Feature Packs
             * @default []
             */
            feature_packs: components["schemas"]["PackReport"][];
            /** Privacy Mode */
            privacy_mode: boolean;
            /** Telemetry Enabled */
            telemetry_enabled: boolean;
            /** Allow Outbound Network */
            allow_outbound_network: boolean;
            /** Audit Log Enabled */
            audit_log_enabled: boolean;
            /** Persistence Encryption Enabled */
            persistence_encryption_enabled: boolean;
            /** Tool Authorization Required */
            tool_authorization_required: boolean;
            /** Parser Sandbox Enabled */
            parser_sandbox_enabled: boolean;
            /** Tool Sandbox Enabled */
            tool_sandbox_enabled: boolean;
            /** Conversion Sandbox Enabled */
            conversion_sandbox_enabled: boolean;
        };
        /** ContractTextReplacementInput */
        ContractTextReplacementInput: {
            /** Title */
            title: string;
            /** Template Text */
            template_text: string;
            /** Replacements */
            replacements?: {
                [key: string]: string;
            };
        };
        /** ContractTextReplacementRequest */
        ContractTextReplacementRequest: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            skill: "contract_text_replacement";
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** File Name */
            file_name?: string | null;
            input: components["schemas"]["ContractTextReplacementInput"];
        };
        /** ConversionJobRequest */
        ConversionJobRequest: {
            /** Model Id */
            model_id: string;
            /** @default balanced */
            policy: components["schemas"]["ConversionPolicy"];
            /** Target Id */
            target_id?: string | null;
            /** Custom Bits */
            custom_bits?: number | null;
            quantization_profile?: components["schemas"]["QuantizationProfile"] | null;
            /**
             * Force
             * @default false
             */
            force: boolean;
            /** Idempotency Key */
            idempotency_key?: string | null;
            /** Authorized Actions */
            authorized_actions?: string[];
        };
        /**
         * ConversionPolicy
         * @enum {string}
         */
        ConversionPolicy: "max_quality" | "balanced" | "max_fit" | "custom_bits";
        /**
         * ConversionStatus
         * @enum {string}
         */
        ConversionStatus: "runnable" | "requires_conversion" | "not_supported" | "unknown";
        /**
         * ConversionTarget
         * @description Operator-facing conversion target contract.
         */
        ConversionTarget: {
            /** Target Id */
            target_id: string;
            /** Target Format */
            target_format: string;
            /** @default unknown */
            runtime_provider: components["schemas"]["RuntimeProvider"];
            runtime_affinity?: components["schemas"]["RuntimeAffinity"] | null;
            /** Backend Name */
            backend_name?: string | null;
            /**
             * State
             * @default unverified
             */
            state: string;
            /**
             * Can Convert
             * @default false
             */
            can_convert: boolean;
            /**
             * Already Runnable
             * @default false
             */
            already_runnable: boolean;
            /** Reason */
            reason?: string | null;
            /** @default packaged */
            support_path: components["schemas"]["RuntimeSupportPath"];
            /** Optimization Profiles */
            optimization_profiles?: string[];
            /** Artifact Plans */
            artifact_plans?: {
                [key: string]: unknown;
            }[];
            /** Notes */
            notes?: string[];
        };
        /**
         * ConversionTargetPlanningReport
         * @description Read-only conversion target options for one model.
         */
        ConversionTargetPlanningReport: {
            /** Model Id */
            model_id: string;
            source_format: components["schemas"]["ModelFormat"];
            /** Conversion Status */
            conversion_status: string;
            /** Default Target Id */
            default_target_id?: string | null;
            /** Targets */
            targets?: components["schemas"]["ConversionTarget"][];
            /** Notes */
            notes?: string[];
        };
        /** DistributedExecutionPlan */
        DistributedExecutionPlan: {
            /** Model Id */
            model_id: string;
            /** Runtime Affinity */
            runtime_affinity: string;
            /** Stage Count */
            stage_count: number;
            /** Required Workers */
            required_workers: number;
            /** Total Layers */
            total_layers: number;
            /**
             * Recovery Count
             * @default 0
             */
            recovery_count: number;
            /** Assignments */
            assignments?: components["schemas"]["ClusterStageAssignment"][];
            /** Worker Profiles */
            worker_profiles?: components["schemas"]["ClusterWorkerProfile"][];
            /** Scheduling */
            scheduling?: {
                [key: string]: number | string | boolean;
            };
            /** Notes */
            notes?: string[];
            /** Created At */
            created_at: string;
            /** Updated At */
            updated_at: string;
            /** Last Execution At */
            last_execution_at?: string | null;
        };
        /** DocumentChunk */
        DocumentChunk: {
            /**
             * Chunk Id
             * @description Stable chunk identifier derived from source and section identity.
             */
            chunk_id: string;
            /** Text */
            text: string;
            /**
             * Source Id
             * @description Stable source identifier that owns this chunk.
             */
            source_id: string;
            /**
             * Section Id
             * @description Stable section identifier that owns this chunk.
             */
            section_id: string;
            /**
             * Source Label
             * @description Human-readable source label for display and citation packaging.
             */
            source_label: string;
            /**
             * Section Label
             * @description Human-readable section label for display and citation packaging.
             */
            section_label: string;
            /** Section Heading */
            section_heading?: string | null;
            /** Section Level */
            section_level?: number | null;
            /** Source Name */
            source_name?: string | null;
            /** Source Path */
            source_path?: string | null;
            source_type?: components["schemas"]["DocumentSourceType"] | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** DocumentComparisonInput */
        DocumentComparisonInput: {
            /**
             * Title
             * @default Document Comparison
             */
            title: string;
            /**
             * Left Title
             * @default Document A
             */
            left_title: string;
            /** Left Text */
            left_text: string;
            /**
             * Right Title
             * @default Document B
             */
            right_title: string;
            /** Right Text */
            right_text: string;
        };
        /** DocumentComparisonRequest */
        DocumentComparisonRequest: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            skill: "document_comparison";
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** File Name */
            file_name?: string | null;
            input: components["schemas"]["DocumentComparisonInput"];
        };
        /** DocumentGenerateRequest */
        DocumentGenerateRequest: {
            output_format: components["schemas"]["DocumentOutputFormat"];
            document: components["schemas"]["DocumentIR"];
            /** File Name */
            file_name?: string | null;
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
        };
        /** DocumentGenerateResponse */
        DocumentGenerateResponse: {
            /** Request Id */
            request_id: string;
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Idempotent Replay
             * @default false
             */
            idempotent_replay: boolean;
            /** File Name */
            file_name: string;
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** Media Type */
            media_type: string;
            /** Size Bytes */
            size_bytes: number;
            /**
             * Content Base64
             * @description Base64-encoded artifact payload.
             */
            content_base64: string;
            metadata: components["schemas"]["ExecutionMetadata"];
        };
        /** DocumentGenerateToolRequest */
        DocumentGenerateToolRequest: {
            /**
             * Tool
             * @default documents.generate
             * @constant
             */
            tool: "documents.generate";
            input: components["schemas"]["GenerateDocumentToolInput"];
        };
        /** DocumentIR */
        DocumentIR: {
            /** Title */
            title: string;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Style Tokens */
            style_tokens?: components["schemas"]["StyleToken"][];
            header?: components["schemas"]["HeaderFooterContent"] | null;
            footer?: components["schemas"]["HeaderFooterContent"] | null;
            /** Sections */
            sections?: components["schemas"]["DocumentSection"][];
            /**
             * References Title
             * @default References
             */
            references_title: string;
            /** Citations */
            citations?: components["schemas"]["Citation"][];
        };
        /**
         * DocumentIngestErrorCode
         * @description Stable, machine-readable reasons a single source failed to ingest.
         * @enum {string}
         */
        DocumentIngestErrorCode: "unsupported_source_type" | "corrupt_source" | "empty_source" | "checksum_mismatch" | "source_too_large" | "parser_failed" | "parser_timeout" | "ocr_unavailable" | "access_denied" | "internal_error";
        /** DocumentIngestRequest */
        DocumentIngestRequest: {
            /**
             * Paths
             * @description Server-local paths. Only usable when the caller shares LewLM's filesystem.
             */
            paths?: string[];
            /**
             * Sources
             * @description Uploaded byte sources with caller-owned identity. Preferred for remote callers.
             */
            sources?: components["schemas"]["DocumentUploadSource"][];
            /** Title */
            title?: string | null;
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
        };
        /** DocumentIngestResponse */
        DocumentIngestResponse: {
            document: components["schemas"]["DocumentIR"];
            /** Sources */
            sources?: components["schemas"]["IngestedDocumentSource"][];
            /** Chunks */
            chunks?: components["schemas"]["DocumentChunk"][];
            /**
             * Source Results
             * @description One outcome per requested source, in request order.
             */
            source_results?: components["schemas"]["DocumentSourceIngestOutcome"][];
            /**
             * Ingested Count
             * @default 0
             */
            ingested_count: number;
            /**
             * Failed Count
             * @default 0
             */
            failed_count: number;
            /**
             * Partial
             * @description True when at least one requested source failed while others succeeded.
             * @default false
             */
            partial: boolean;
            /**
             * Components
             * @description Distinct components that contributed to this ingest.
             */
            components?: components["schemas"]["ComponentProvenance"][];
            /** Request Id */
            request_id: string;
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Idempotent Replay
             * @default false
             */
            idempotent_replay: boolean;
            metadata: components["schemas"]["ExecutionMetadata"];
        };
        /** DocumentIngestToolRequest */
        DocumentIngestToolRequest: {
            /**
             * Tool
             * @default documents.ingest
             * @constant
             */
            tool: "documents.ingest";
            input: components["schemas"]["IngestDocumentToolInput"];
        };
        /**
         * DocumentOutputFormat
         * @enum {string}
         */
        DocumentOutputFormat: "text" | "markdown" | "json" | "csv" | "docx" | "pdf" | "xlsx";
        /** DocumentSection */
        DocumentSection: {
            /** Heading */
            heading?: string | null;
            /**
             * Level
             * @default 1
             */
            level: number;
            /** Style Tokens */
            style_tokens?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Blocks */
            blocks?: (components["schemas"]["ParagraphBlock"] | components["schemas"]["TableBlock"] | components["schemas"]["ListBlock"] | components["schemas"]["CalloutBlock"] | components["schemas"]["ImageBlock"])[];
        };
        /**
         * DocumentSourceIngestOutcome
         * @description The per-source result of a multi-source ingest request.
         *
         *     Multi-source ingestion previously surfaced only the sources that succeeded,
         *     leaving a caller to infer which of its inputs went missing and with no way
         *     to recover the reason. Every requested source now gets exactly one outcome.
         */
        DocumentSourceIngestOutcome: {
            /**
             * Source Id
             * @description Caller-provided ID for uploads, else the LewLM-derived ID.
             */
            source_id: string;
            /**
             * Status
             * @enum {string}
             */
            status: "ingested" | "failed";
            /** Source Label */
            source_label?: string | null;
            source_type?: components["schemas"]["DocumentSourceType"] | null;
            /** Media Type */
            media_type?: string | null;
            /**
             * Chunk Count
             * @default 0
             */
            chunk_count: number;
            /**
             * Section Count
             * @default 0
             */
            section_count: number;
            /**
             * Content Sha256
             * @description SHA-256 of the bytes LewLM actually parsed.
             */
            content_sha256?: string | null;
            error_code?: components["schemas"]["DocumentIngestErrorCode"] | null;
            /** Error Message */
            error_message?: string | null;
            /**
             * Retryable
             * @description Whether retrying this source unchanged could plausibly succeed.
             * @default false
             */
            retryable: boolean;
            /**
             * Provider Reference
             * @description LewLM-side reference for correlating this source with logs and events.
             */
            provider_reference?: string | null;
            /**
             * Components
             * @description Parser, OCR, and chunker components applied to this source.
             */
            components?: components["schemas"]["ComponentProvenance"][];
        };
        /**
         * DocumentSourceType
         * @enum {string}
         */
        DocumentSourceType: "text" | "markdown" | "csv" | "xlsx" | "docx" | "pdf" | "image" | "image_bundle";
        /** DocumentTransformResponse */
        DocumentTransformResponse: {
            /** Request Id */
            request_id: string;
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Idempotent Replay
             * @default false
             */
            idempotent_replay: boolean;
            /** File Name */
            file_name: string;
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** Media Type */
            media_type: string;
            /** Size Bytes */
            size_bytes: number;
            /**
             * Content Base64
             * @description Base64-encoded artifact payload.
             */
            content_base64: string;
            metadata: components["schemas"]["ExecutionMetadata"];
            /** Skill */
            skill: string;
        };
        /** DocumentTransformToolRequest */
        DocumentTransformToolRequest: {
            /**
             * Tool
             * @default documents.transform
             * @constant
             */
            tool: "documents.transform";
            /** Input */
            input: components["schemas"]["ContractTextReplacementRequest"] | components["schemas"]["ReceiptExtractionRequest"] | components["schemas"]["OCRAssistedExtractionRequest"] | components["schemas"]["BrandedDocumentTemplateRequest"] | components["schemas"]["FileTemplateTransformRequest"] | components["schemas"]["DocumentComparisonRequest"] | components["schemas"]["MeetingTranscriptNotesRequest"] | components["schemas"]["LongDocumentMemoRequest"] | components["schemas"]["SpeechTranscriptCleanupRequest"];
        };
        /**
         * DocumentUploadSource
         * @description A document uploaded as bytes, requiring no shared filesystem mount.
         */
        DocumentUploadSource: {
            /**
             * Source Id
             * @description Caller-provided opaque identifier echoed back on every result.
             */
            source_id: string;
            /** File Name */
            file_name: string;
            /** Content Base64 */
            content_base64: string;
            /** Media Type */
            media_type?: string | null;
            /**
             * Expected Sha256
             * @description When set, LewLM refuses the source unless the received bytes match.
             */
            expected_sha256?: string | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** EmbeddingCreateRequest */
        EmbeddingCreateRequest: {
            /** Model */
            model?: string | null;
            /** Input */
            input: string | string[];
        };
        /** EmbeddingCreateResponse */
        EmbeddingCreateResponse: {
            /** Request Id */
            request_id: string;
            /** Created */
            created: number;
            /**
             * Object
             * @default list
             * @constant
             */
            object: "list";
            /** Data */
            data: components["schemas"]["EmbeddingDatum"][];
            /** Model */
            model: string;
            usage?: components["schemas"]["CompletionUsage"];
            routing: components["schemas"]["RoutingDecision"];
            metadata: components["schemas"]["ExecutionMetadata"];
        };
        /** EmbeddingDatum */
        EmbeddingDatum: {
            /**
             * Object
             * @default embedding
             * @constant
             */
            object: "embedding";
            /** Embedding */
            embedding: number[];
            /** Index */
            index: number;
        };
        /** ExecutionMetadata */
        ExecutionMetadata: {
            /**
             * Version
             * @description Envelope schema version. This does NOT identify the components that ran; see `components`.
             * @default v1
             * @constant
             */
            version: "v1";
            /** Request Id */
            request_id: string;
            /**
             * Correlation Id
             * @description Caller-supplied correlation identifier echoed back on every result that carries it.
             */
            correlation_id?: string | null;
            /** Created */
            created: number;
            /**
             * Result Origin
             * @default runtime
             * @enum {string}
             */
            result_origin: "runtime" | "cache_hit" | "coalesced" | "tool_execution" | "idempotent_replay";
            model?: components["schemas"]["ExecutionModelMetadata"];
            routing: components["schemas"]["ExecutionRoutingMetadata"];
            timing?: components["schemas"]["ExecutionTimingMetadata"];
            serving?: components["schemas"]["ExecutionServingMetadata"] | null;
            /**
             * Components
             * @description Named, versioned components that produced this result.
             */
            components?: components["schemas"]["ComponentProvenance"][];
            /** @description Which requested sampling controls the backend applied, and which it could not. */
            sampling?: components["schemas"]["SamplingControlReport"] | null;
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Idempotent Replay
             * @default false
             */
            idempotent_replay: boolean;
        };
        /** ExecutionModelMetadata */
        ExecutionModelMetadata: {
            /** Requested Model Id */
            requested_model_id?: string | null;
            /** Resolved Model Id */
            resolved_model_id?: string | null;
            /** Runtime Name */
            runtime_name?: string | null;
            runtime_affinity?: components["schemas"]["RuntimeAffinity"] | null;
        };
        /** ExecutionRoutingMetadata */
        ExecutionRoutingMetadata: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "model_router" | "tool_execution";
            /** Reason */
            reason?: string | null;
            request_modality?: components["schemas"]["RequestModality"] | null;
            modality_path?: components["schemas"]["RoutingModalityPath"] | null;
            /** Modality Path Reason */
            modality_path_reason?: string | null;
            /** Alternatives */
            alternatives?: string[];
        };
        /** ExecutionServingMetadata */
        ExecutionServingMetadata: {
            /** Capability */
            capability?: string | null;
            /** Phase */
            phase?: string | null;
            /**
             * Streaming
             * @default false
             */
            streaming: boolean;
            /** Streaming Owner */
            streaming_owner?: string | null;
            /** Runtime Adapter Kind */
            runtime_adapter_kind?: string | null;
            /**
             * Cancellation Requested
             * @default false
             */
            cancellation_requested: boolean;
            /**
             * Queue Residency Milliseconds
             * @default 0
             */
            queue_residency_milliseconds: number;
            /**
             * Queue Count
             * @default 0
             */
            queue_count: number;
            /**
             * Batched
             * @default false
             */
            batched: boolean;
            /**
             * Batch Size
             * @default 1
             */
            batch_size: number;
        };
        /** ExecutionTimingMetadata */
        ExecutionTimingMetadata: {
            /**
             * Queue Milliseconds
             * @default 0
             */
            queue_milliseconds: number;
            /**
             * Load Milliseconds
             * @default 0
             */
            load_milliseconds: number;
            /**
             * Execute Milliseconds
             * @default 0
             */
            execute_milliseconds: number;
            /**
             * Total Milliseconds
             * @default 0
             */
            total_milliseconds: number;
        };
        /**
         * ExternalQuantizerReference
         * @description Explicit external quantizer selected by the operator.
         */
        ExternalQuantizerReference: {
            /** Name */
            name: string;
            /** Profile */
            profile?: string | null;
            /** Module */
            module?: string | null;
            /** Required Packages */
            required_packages?: string[];
        };
        /**
         * FeaturePathRecommendation
         * @description Recommended current-host path for one public operator-facing feature class.
         */
        FeaturePathRecommendation: {
            /** Feature Class */
            feature_class: string;
            /** Profile */
            profile: string;
            /** Label */
            label: string;
            support_path: components["schemas"]["RuntimeSupportPath"];
            /** Summary */
            summary: string;
            /** Fallback Guidance */
            fallback_guidance?: string[];
        };
        /** FileTemplateTransformInput */
        FileTemplateTransformInput: {
            /** Replacements */
            replacements?: {
                [key: string]: string;
            };
            /** Title */
            title?: string | null;
        };
        /** FileTemplateTransformRequest */
        FileTemplateTransformRequest: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            skill: "file_template";
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** File Name */
            file_name?: string | null;
            /** Template Path */
            template_path: string;
            input?: components["schemas"]["FileTemplateTransformInput"];
        };
        /**
         * GenerateAttachment
         * @description Normalized attachment metadata associated with a message.
         */
        GenerateAttachment: {
            /** Attachment Type */
            attachment_type: string;
            /** Name */
            name: string;
            /** Source Path */
            source_path?: string | null;
            /** Media Type */
            media_type?: string | null;
            /** Detail */
            detail?: ("auto" | "low" | "high") | null;
            /** Extracted Text */
            extracted_text?: string | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** GenerateDocumentToolInput */
        GenerateDocumentToolInput: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            output_format: components["schemas"]["DocumentOutputFormat"];
            document: components["schemas"]["DocumentIR"];
            /** File Name */
            file_name?: string | null;
        };
        /**
         * GenerateMessage
         * @description Normalized request message for text generation.
         */
        GenerateMessage: {
            /** Role */
            role: string;
            /** Content */
            content: string;
            /** Attachments */
            attachments?: components["schemas"]["GenerateAttachment"][];
        };
        /**
         * GeneratedCitationReference
         * @description Stable machine-readable citation reference resolved from generated output.
         */
        GeneratedCitationReference: {
            /**
             * Reference Id
             * @description Stable citation token emitted by the model and resolved by LewLM.
             */
            reference_id: string;
            /**
             * Source Id
             * @description Stable source identifier aligned with document ingest output.
             */
            source_id: string;
            /**
             * Chunk Id
             * @description Stable chunk identifier when the citation points to one chunk.
             */
            chunk_id?: string | null;
            /**
             * Section Id
             * @description Stable section identifier when LewLM can resolve the citation to a known section.
             */
            section_id?: string | null;
            /**
             * Source Label
             * @description Readable source label aligned with document ingest packaging.
             */
            source_label: string;
            /**
             * Section Label
             * @description Readable section label aligned with document ingest packaging when LewLM can resolve one.
             */
            section_label?: string | null;
        };
        /**
         * GrammarResponseFormat
         * @description Grammar-based structured-output contract.
         */
        GrammarResponseFormat: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "grammar";
            /** Grammar */
            grammar: string;
            /**
             * Syntax
             * @default ebnf
             */
            syntax: string;
            /** Name */
            name?: string | null;
            /**
             * Strict
             * @default true
             */
            strict: boolean;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HeaderFooterContent */
        HeaderFooterContent: {
            /** Left */
            left?: string | null;
            /** Center */
            center?: string | null;
            /** Right */
            right?: string | null;
            /** Style Tokens */
            style_tokens?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** HealthResponse */
        HealthResponse: {
            /**
             * Status
             * @constant
             */
            status: "ok";
            /** Service */
            service: string;
            /** Version */
            version: string;
            /** Runtime Instance Id */
            runtime_instance_id?: string | null;
            /** Started At */
            started_at?: string | null;
            /** Process Id */
            process_id?: number | null;
            /** Hostname */
            hostname?: string | null;
            /**
             * Time
             * Format: date-time
             */
            time: string;
            install_profiles: components["schemas"]["InstallProfileSummary"];
            readiness: components["schemas"]["ServiceReadinessSummary"];
            storage: components["schemas"]["StorageHealth"];
            configuration: components["schemas"]["ConfigurationHealth"];
            /** Cluster */
            cluster?: {
                [key: string]: unknown;
            } | null;
        };
        /**
         * HostCapabilityReadiness
         * @description Host-level readiness summary for one execution capability.
         */
        HostCapabilityReadiness: {
            capability: components["schemas"]["CapabilityName"];
            /** Ready */
            ready: boolean;
            readiness_state: components["schemas"]["CapabilityReadinessState"];
            /** Reason */
            reason: string;
            /** Available Runtime Names */
            available_runtime_names?: string[];
            /** Available Support Paths */
            available_support_paths?: components["schemas"]["RuntimeSupportPath"][];
            /** Packaged Runtime Names */
            packaged_runtime_names?: string[];
            /** Bridge Runtime Names */
            bridge_runtime_names?: string[];
            /**
             * Bridge Only
             * @default false
             */
            bridge_only: boolean;
            /**
             * Candidate Model Count
             * @default 0
             */
            candidate_model_count: number;
            /**
             * Runnable Model Count
             * @default 0
             */
            runnable_model_count: number;
            /** Ready Model Ids */
            ready_model_ids?: string[];
            /** Blocked Model Ids */
            blocked_model_ids?: string[];
            /** Conversion Required Model Ids */
            conversion_required_model_ids?: string[];
            /** Notes */
            notes?: string[];
        };
        /**
         * HostPlatformSnapshot
         * @description Basic information about the current host platform.
         */
        HostPlatformSnapshot: {
            /** System */
            system: string;
            /** Release */
            release: string;
            /** Machine */
            machine: string;
            /** Python Version */
            python_version: string;
            /** Total Memory Mb */
            total_memory_mb?: number | null;
            /** Total Memory Source */
            total_memory_source?: string | null;
            /** Total Memory Reason */
            total_memory_reason?: string | null;
        };
        /** ImageBlock */
        ImageBlock: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "image";
            /** Alt Text */
            alt_text: string;
            /** Path */
            path?: string | null;
            /** Caption */
            caption?: string | null;
            /**
             * Role
             * @default image
             * @enum {string}
             */
            role: "image" | "logo";
            /** Mime Type */
            mime_type?: string | null;
            /** Width */
            width?: number | null;
            /** Height */
            height?: number | null;
            /** Style Tokens */
            style_tokens?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** IngestDocumentToolInput */
        IngestDocumentToolInput: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * Paths
             * @description Server-local paths. Requires the caller to share LewLM's filesystem.
             */
            paths?: string[];
            /**
             * Sources
             * @description Uploaded byte sources. Preferred for remote callers; no shared mount needed.
             */
            sources?: components["schemas"]["UploadedSourceToolInput"][];
            /** Title */
            title?: string | null;
        };
        /** IngestedDocumentSource */
        IngestedDocumentSource: {
            /**
             * Source Id
             * @description Stable source identifier. Caller-provided for uploaded sources, otherwise derived from the local source path.
             */
            source_id: string;
            /**
             * Path
             * @description Server-local path. Always null for uploaded sources, which never make the caller depend on a shared filesystem mount.
             */
            path?: string | null;
            source_type: components["schemas"]["DocumentSourceType"];
            /**
             * Source Name
             * @description Basename of the local source path.
             */
            source_name: string;
            /**
             * Source Label
             * @description Human-readable label for reuse in app UIs and citations.
             */
            source_label: string;
            /**
             * Media Type
             * @description Detected media type when LewLM can determine it.
             */
            media_type?: string | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * InstallProfileStatus
         * @description Machine-readable status for one documented install profile.
         */
        InstallProfileStatus: {
            /** Profile */
            profile: string;
            /** Label */
            label: string;
            /** Extras */
            extras?: string[];
            /** Install Spec */
            install_spec: string;
            /** Installed */
            installed: boolean;
            /** Ready */
            ready: boolean;
            /** Summary */
            summary: string;
            /** Notes */
            notes?: string[];
        };
        /**
         * InstallProfileSummary
         * @description Current host summary for LewLM's documented install profiles.
         */
        InstallProfileSummary: {
            /** Active Profile Ids */
            active_profile_ids?: string[];
            /** Recommended Profile Id */
            recommended_profile_id?: string | null;
            /** Recommended Feature Paths */
            recommended_feature_paths?: components["schemas"]["FeaturePathRecommendation"][];
            standards_acceptance_contract?: components["schemas"]["StandardsAcceptanceContract"];
            /** Profiles */
            profiles?: components["schemas"]["InstallProfileStatus"][];
            /** Backend Inventory */
            backend_inventory?: components["schemas"]["BackendModuleStatus"][];
            /** Backend Feature Probes */
            backend_feature_probes?: components["schemas"]["BackendFeatureProbe"][];
            llamacpp_build?: components["schemas"]["LlamaCppBuildFlavor"] | null;
            /** Notes */
            notes?: string[];
        };
        /**
         * JSONSchemaResponseFormat
         * @description JSON-schema structured-output contract.
         */
        JSONSchemaResponseFormat: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "json_schema";
            /** Schema */
            schema: {
                [key: string]: unknown;
            };
            /** Name */
            name?: string | null;
            /**
             * Strict
             * @default true
             */
            strict: boolean;
        };
        /** JobRecord */
        JobRecord: {
            /** Job Id */
            job_id: string;
            job_type: components["schemas"]["JobType"];
            status: components["schemas"]["JobStatus"];
            /** Cache Key */
            cache_key?: string | null;
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Idempotent Replay
             * @default false
             */
            idempotent_replay: boolean;
            /** Payload */
            payload?: {
                [key: string]: unknown;
            };
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at?: string;
        };
        /**
         * JobStatus
         * @enum {string}
         */
        JobStatus: "queued" | "running" | "completed" | "failed";
        /**
         * JobType
         * @enum {string}
         */
        JobType: "model_conversion";
        /**
         * LayerQuantizationOverride
         * @description Per-layer mixed-precision override recorded on converted artifacts.
         */
        LayerQuantizationOverride: {
            /** Layer Pattern */
            layer_pattern: string;
            weight_precision?: components["schemas"]["QuantizationPrecision"] | null;
            activation_precision?: components["schemas"]["QuantizationPrecision"] | null;
            compute_precision?: components["schemas"]["QuantizationPrecision"] | null;
            /** Note */
            note?: string | null;
        };
        /** LewLMBenchmarkRequest */
        LewLMBenchmarkRequest: {
            /** Model Id */
            model_id?: string | null;
            /**
             * All Models
             * @default false
             */
            all_models: boolean;
            /**
             * Prompt
             * @default Benchmark ping
             */
            prompt: string;
            /**
             * Capability
             * @default chat
             */
            capability: string;
            /**
             * Warmup Run Count
             * @default 1
             */
            warmup_run_count: number;
            /** Workload Class */
            workload_class?: string | null;
            /**
             * Include Scenarios
             * @default false
             */
            include_scenarios: boolean;
        };
        /** LewLMConversionPlanRequest */
        LewLMConversionPlanRequest: {
            /** Model Id */
            model_id: string;
            /** @default balanced */
            policy: components["schemas"]["ConversionPolicy"];
            /** Custom Bits */
            custom_bits?: number | null;
        };
        /**
         * LewLMMiddlewareCapabilitiesReport
         * @description LewLM-wide middleware capability report for host apps and CLIs.
         */
        LewLMMiddlewareCapabilitiesReport: {
            /**
             * Service
             * @default LewLM
             */
            service: string;
            /**
             * Generated At
             * Format: date-time
             */
            generated_at?: string;
            host_platform: components["schemas"]["HostPlatformSnapshot"];
            /**
             * Discovered Model Count
             * @default 0
             */
            discovered_model_count: number;
            /**
             * Runnable Model Count
             * @default 0
             */
            runnable_model_count: number;
            /**
             * Conversion Required Model Count
             * @default 0
             */
            conversion_required_model_count: number;
            /** Capability Evidence */
            capability_evidence?: components["schemas"]["CapabilityEvidence"][];
            /** Runtime Providers */
            runtime_providers?: components["schemas"]["RuntimeProviderReport"][];
            readiness: components["schemas"]["ServiceReadinessSummary"];
            /** Notes */
            notes?: string[];
        };
        /**
         * LewLMProbeRequest
         * @description Live middleware probe request.
         *
         *     Routing probes are non-generating and remain the default. Load and generation probes
         *     are opt-in smoke tests for one explicit model.
         */
        LewLMProbeRequest: {
            /** Model Id */
            model_id?: string | null;
            capability?: components["schemas"]["CapabilityName"] | null;
            /**
             * Mode
             * @default routing
             * @enum {string}
             */
            mode: "routing" | "load" | "generate";
            /**
             * Prompt
             * @default LewLM runtime probe
             */
            prompt: string;
            /**
             * Max Tokens
             * @default 1
             */
            max_tokens: number;
        };
        /** LewLMProbeResponse */
        LewLMProbeResponse: {
            /** Model Id */
            model_id?: string | null;
            capability?: components["schemas"]["CapabilityName"] | null;
            /**
             * Mode
             * @default routing
             * @enum {string}
             */
            mode: "routing" | "load" | "generate";
            /** Evidence */
            evidence?: components["schemas"]["CapabilityEvidence"][];
            /**
             * Persisted
             * @default false
             */
            persisted: boolean;
            /** Reason */
            reason: string;
            /** Generated Text */
            generated_text?: string | null;
        };
        /** LifecycleOperationError */
        LifecycleOperationError: {
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Details */
            details?: {
                [key: string]: unknown;
            };
        };
        /**
         * LifecycleOperationKind
         * @enum {string}
         */
        LifecycleOperationKind: "drain_model";
        /** LifecycleOperationRecord */
        LifecycleOperationRecord: {
            /** Operation Id */
            operation_id: string;
            operation: components["schemas"]["LifecycleOperationKind"];
            status: components["schemas"]["LifecycleOperationStatus"];
            /** Runtime Instance Id */
            runtime_instance_id: string;
            /** Model Id */
            model_id: string;
            /** Runtime */
            runtime?: string | null;
            /** Application Id */
            application_id?: string | null;
            /** Client Instance Id */
            client_instance_id?: string | null;
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Idempotent Replay
             * @default false
             */
            idempotent_replay: boolean;
            /** Timeout Seconds */
            timeout_seconds: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Started At */
            started_at?: string | null;
            /** Completed At */
            completed_at?: string | null;
            result?: components["schemas"]["ModelLifecycleResult"] | null;
            error?: components["schemas"]["LifecycleOperationError"] | null;
        };
        /**
         * LifecycleOperationStatus
         * @enum {string}
         */
        LifecycleOperationStatus: "pending" | "running" | "succeeded" | "failed" | "cancelled";
        /** ListBlock */
        ListBlock: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "list";
            /**
             * Ordered
             * @default false
             */
            ordered: boolean;
            /** Items */
            items?: string[];
            /** Style Tokens */
            style_tokens?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * LlamaCppBuildFlavor
         * @description Honest report of what the installed llama.cpp build exposes on this host.
         *
         *     ``accelerator_hints`` are heuristic markers parsed from the backend's own
         *     system-info string; they are inventory evidence only, never a support claim.
         */
        LlamaCppBuildFlavor: {
            /** Installed */
            installed: boolean;
            /** Gpu Offload Supported */
            gpu_offload_supported?: boolean | null;
            /** Accelerator Hints */
            accelerator_hints?: string[];
            /** System Info */
            system_info?: string | null;
            /**
             * Detection State
             * @enum {string}
             */
            detection_state: "detected" | "partial" | "unavailable";
            /** Reason */
            reason: string;
        };
        /** LocalToolDescriptor */
        LocalToolDescriptor: {
            /** Name */
            name: string;
            /**
             * Version
             * @default 1.0.0
             */
            version: string;
            /** Description */
            description: string;
            /**
             * Execution Mode
             * @default local
             * @constant
             */
            execution_mode: "local";
            /** Required Authorization */
            required_authorization: string;
            /**
             * Result Type
             * @enum {string}
             */
            result_type: "artifact" | "document_ir";
            /** Input Schema */
            input_schema?: {
                [key: string]: unknown;
            };
            /** Tags */
            tags?: string[];
            /** Aliases */
            aliases?: string[];
        };
        /** LongDocumentMemoInput */
        LongDocumentMemoInput: {
            /**
             * Title
             * @default Structured Memo
             */
            title: string;
            /**
             * Source Title
             * @default Source Document
             */
            source_title: string;
            /** Source Text */
            source_text: string;
        };
        /** LongDocumentMemoRequest */
        LongDocumentMemoRequest: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            skill: "long_document_memo";
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** File Name */
            file_name?: string | null;
            input: components["schemas"]["LongDocumentMemoInput"];
        };
        /**
         * MeasuredCapabilityCategory
         * @enum {string}
         */
        MeasuredCapabilityCategory: "batching" | "cache_reuse" | "speculation" | "constrained_decoding" | "compile_kernels" | "adapter_preservation";
        /**
         * MeasuredCapabilityEvidenceSource
         * @enum {string}
         */
        MeasuredCapabilityEvidenceSource: "benchmark_feature" | "benchmark_scenario" | "code_probe" | "external_adapter_comparison";
        /**
         * MeasuredCapabilityProbeRecord
         * @description Persisted probe or benchmark evidence for one measured capability category.
         */
        MeasuredCapabilityProbeRecord: {
            /** Probe Key */
            probe_key: string;
            category: components["schemas"]["MeasuredCapabilityCategory"];
            /** Probe Name */
            probe_name: string;
            status: components["schemas"]["MeasuredCapabilityStatus"];
            source: components["schemas"]["MeasuredCapabilityEvidenceSource"];
            /** Reason */
            reason: string;
            /** Runtime Name */
            runtime_name?: string | null;
            runtime_affinity?: components["schemas"]["RuntimeAffinity"] | null;
            /** Model Id */
            model_id?: string | null;
            /** Workload Class */
            workload_class?: string | null;
            /** Details */
            details?: {
                [key: string]: unknown;
            };
            /**
             * Recorded At
             * Format: date-time
             */
            recorded_at?: string;
        };
        /** MeasuredCapabilityRegistrySummary */
        MeasuredCapabilityRegistrySummary: {
            host_platform: components["schemas"]["HostPlatformSnapshot"];
            /**
             * Total Records
             * @default 0
             */
            total_records: number;
            /** Latest Recorded At */
            latest_recorded_at?: string | null;
            /** Categories */
            categories?: components["schemas"]["MeasuredCapabilitySummary"][];
            /** Performance Core Evidence */
            performance_core_evidence?: components["schemas"]["PerformanceCoreEvidenceRecord"][];
        };
        /**
         * MeasuredCapabilityStatus
         * @enum {string}
         */
        MeasuredCapabilityStatus: "supported" | "degraded" | "fallback" | "rejected" | "not_applicable" | "unmeasured" | "mixed";
        /**
         * MeasuredCapabilitySummary
         * @description Summarized measured evidence for one capability category.
         */
        MeasuredCapabilitySummary: {
            category: components["schemas"]["MeasuredCapabilityCategory"];
            /** @default unmeasured */
            status: components["schemas"]["MeasuredCapabilityStatus"];
            /** Reason */
            reason: string;
            /**
             * Record Count
             * @default 0
             */
            record_count: number;
            /** Latest Recorded At */
            latest_recorded_at?: string | null;
            /** Runtime Names */
            runtime_names?: string[];
            /** Sources */
            sources?: string[];
            /** Probes */
            probes?: components["schemas"]["MeasuredCapabilityProbeRecord"][];
        };
        /** MeetingTranscriptNotesInput */
        MeetingTranscriptNotesInput: {
            /**
             * Title
             * @default Meeting Notes
             */
            title: string;
            /** Transcript Text */
            transcript_text: string;
            /** Participants */
            participants?: string[];
            /** Meeting Date */
            meeting_date?: string | null;
        };
        /** MeetingTranscriptNotesRequest */
        MeetingTranscriptNotesRequest: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            skill: "meeting_transcript_notes";
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** File Name */
            file_name?: string | null;
            input: components["schemas"]["MeetingTranscriptNotesInput"];
        };
        /**
         * ModelArtifactLayer
         * @description A single layer in a converted model artifact lineage.
         */
        ModelArtifactLayer: {
            /** Artifact Key */
            artifact_key: string;
            role: components["schemas"]["ModelArtifactRole"];
            /** Display Name */
            display_name: string;
            format_type: components["schemas"]["ModelFormat"];
            /** Source Path */
            source_path: string;
            /**
             * Modality
             * @default []
             */
            modality: components["schemas"]["ModelModality"][];
            /**
             * Runtime Affinity
             * @default []
             */
            runtime_affinity: components["schemas"]["RuntimeAffinity"][];
            /** Tokenizer Path */
            tokenizer_path?: string | null;
            /** Processor Path */
            processor_path?: string | null;
            /** Quantization */
            quantization?: string | null;
            quantization_profile?: components["schemas"]["QuantizationProfile"] | null;
            /** Derived From */
            derived_from?: string | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * ModelArtifactLineageReport
         * @description Artifact, conversion, probe, and benchmark context for one model.
         */
        ModelArtifactLineageReport: {
            /** Model Id */
            model_id: string;
            /** Display Name */
            display_name: string;
            /** Source Path */
            source_path: string;
            format_type: components["schemas"]["ModelFormat"];
            artifact_role: components["schemas"]["ModelArtifactRole"];
            /** Artifact Family Id */
            artifact_family_id?: string | null;
            /** Artifact Lineage */
            artifact_lineage?: components["schemas"]["ModelArtifactLayer"][];
            /** Conversion Artifacts */
            conversion_artifacts?: {
                [key: string]: unknown;
            }[];
            /** Runtime Probe Records */
            runtime_probe_records?: components["schemas"]["CapabilityEvidence"][];
            /** Latest Benchmark */
            latest_benchmark?: {
                [key: string]: unknown;
            } | null;
            /** Capability Evidence */
            capability_evidence?: components["schemas"]["CapabilityEvidence"][];
            /** Notes */
            notes?: string[];
        };
        /**
         * ModelArtifactRole
         * @enum {string}
         */
        ModelArtifactRole: "standalone" | "source_bundle" | "multimodal_runnable" | "text_runnable";
        /** ModelBenchmarkSummary */
        ModelBenchmarkSummary: {
            /** Model Id */
            model_id: string;
            /** Run Count */
            run_count: number;
            /** Average Total Seconds */
            average_total_seconds: number;
            /** Fastest Total Seconds */
            fastest_total_seconds: number;
            /**
             * Last Run At
             * Format: date-time
             */
            last_run_at: string;
            /** Capability Counts */
            capability_counts?: {
                [key: string]: number;
            };
        };
        /**
         * ModelCapabilityAvailability
         * @description Compact per-model serving readiness for the current host.
         *
         *     Lets a caller pick a usable model straight from the inventory instead of
         *     issuing one capability request per discovered model.
         */
        ModelCapabilityAvailability: {
            /** Model Id */
            model_id: string;
            /**
             * Servable
             * @default false
             */
            servable: boolean;
            /**
             * Chat Ready
             * @default false
             */
            chat_ready: boolean;
            /** Ready Capabilities */
            ready_capabilities?: components["schemas"]["CapabilityName"][];
            /** Blocked Capabilities */
            blocked_capabilities?: components["schemas"]["CapabilityName"][];
            /** Reason */
            reason: string;
        };
        /**
         * ModelCapabilityReport
         * @description Per-model capability summary for the current host platform.
         */
        ModelCapabilityReport: {
            /** Model Id */
            model_id: string;
            /** Display Name */
            display_name: string;
            /** Architecture Family */
            architecture_family: string;
            format_type: components["schemas"]["ModelFormat"];
            /** Modality */
            modality: components["schemas"]["ModelModality"][];
            /** Quantization */
            quantization?: string | null;
            quantization_profile?: components["schemas"]["QuantizationProfile"] | null;
            /** Validation Key */
            validation_key: string;
            conversion_status: components["schemas"]["ConversionStatus"];
            host_platform: components["schemas"]["HostPlatformSnapshot"];
            /** Runtime Candidates */
            runtime_candidates?: components["schemas"]["RuntimeCandidateReport"][];
            /** Target Platforms */
            target_platforms?: components["schemas"]["ModelTargetPlatformReport"][];
            /** Capabilities */
            capabilities?: components["schemas"]["ModelCapabilityStatus"][];
            structured_output?: components["schemas"]["ModelStructuredOutputSupport"] | null;
            /** Capability Evidence */
            capability_evidence?: components["schemas"]["CapabilityEvidence"][];
            /** Measured Capabilities */
            measured_capabilities?: components["schemas"]["MeasuredCapabilitySummary"][];
            standards_acceptance_contract?: components["schemas"]["StandardsAcceptanceContract"];
            /** Performance Core Evidence */
            performance_core_evidence?: components["schemas"]["PerformanceCoreEvidenceRecord"][];
        };
        /**
         * ModelCapabilityStatus
         * @description Capability outcome for a specific model on the current host.
         */
        ModelCapabilityStatus: {
            capability: components["schemas"]["CapabilityName"];
            /** Supported */
            supported: boolean;
            /** @default blocked */
            readiness_state: components["schemas"]["CapabilityReadinessState"];
            /** Runtime Name */
            runtime_name?: string | null;
            runtime_affinity?: components["schemas"]["RuntimeAffinity"] | null;
            support_path?: components["schemas"]["RuntimeSupportPath"] | null;
            /** Reason */
            reason: string;
            /** Alternatives */
            alternatives?: string[];
            /** Estimated Memory Mb */
            estimated_memory_mb?: number | null;
            /** Notes */
            notes?: string[];
        };
        /**
         * ModelDetail
         * @description One registered model and its serving readiness on this host.
         */
        ModelDetail: {
            model: components["schemas"]["ModelManifest"];
            capability_availability: components["schemas"]["ModelCapabilityAvailability"];
        };
        /**
         * ModelFormat
         * @enum {string}
         */
        ModelFormat: "gguf" | "mlx" | "onnx_genai" | "huggingface" | "audio_folder" | "adapter_bundle" | "unknown";
        /**
         * ModelInventory
         * @description API response envelope for listing discovered models.
         */
        ModelInventory: {
            /** Count */
            count: number;
            /** Items */
            items: components["schemas"]["ModelManifest"][];
            /** Capability Availability */
            capability_availability?: components["schemas"]["ModelCapabilityAvailability"][];
            /**
             * Servable Count
             * @default 0
             */
            servable_count: number;
            /**
             * Chat Ready Count
             * @default 0
             */
            chat_ready_count: number;
        };
        /** ModelLifecycleResponse */
        ModelLifecycleResponse: {
            /**
             * Status
             * @enum {string}
             */
            status: "warmed" | "drained" | "unloaded";
            /** Model Id */
            model_id: string;
            /** Runtime */
            runtime: string;
            /** Reason */
            reason: string;
            /** Runtime Instance Id */
            runtime_instance_id: string;
            /** Operation Id */
            operation_id: string;
            previous_state?: components["schemas"]["ModelResidencyState"] | null;
            current_state?: components["schemas"]["ModelResidencyState"] | null;
            /**
             * Active Usage Count
             * @default 0
             */
            active_usage_count: number;
            /**
             * Backend Operation Performed
             * @default false
             */
            backend_operation_performed: boolean;
            /**
             * Joined Existing Operation
             * @default false
             */
            joined_existing_operation: boolean;
        };
        /**
         * ModelLifecycleResult
         * @description Result of a warm, drain, or unload lifecycle operation.
         */
        ModelLifecycleResult: {
            /** Operation Id */
            operation_id?: string;
            /** Runtime Instance Id */
            runtime_instance_id: string;
            /** Model Id */
            model_id: string;
            /** Runtime */
            runtime: string;
            previous_state?: components["schemas"]["ModelResidencyState"] | null;
            current_state?: components["schemas"]["ModelResidencyState"] | null;
            /**
             * Active Usage Count
             * @default 0
             */
            active_usage_count: number;
            /**
             * Backend Operation Performed
             * @default false
             */
            backend_operation_performed: boolean;
            /**
             * Joined Existing Operation
             * @default false
             */
            joined_existing_operation: boolean;
            /** Reason */
            reason: string;
        };
        /**
         * ModelManifest
         * @description Normalized record stored in the local model registry.
         */
        ModelManifest: {
            /** Model Id */
            model_id: string;
            /** Display Name */
            display_name: string;
            /** Architecture Family */
            architecture_family: string;
            /** @default unknown */
            architecture_subtype: components["schemas"]["ArchitectureSubtype"];
            /** Modality */
            modality: components["schemas"]["ModelModality"][];
            /** Audio Roles */
            audio_roles?: components["schemas"]["AudioCapabilityRole"][];
            /** Source Path */
            source_path: string;
            format_type: components["schemas"]["ModelFormat"];
            /** Quantization */
            quantization?: string | null;
            quantization_profile?: components["schemas"]["QuantizationProfile"] | null;
            /** Tokenizer Path */
            tokenizer_path?: string | null;
            /** Processor Path */
            processor_path?: string | null;
            /** Runtime Affinity */
            runtime_affinity: components["schemas"]["RuntimeAffinity"][];
            /** Text Only Runtime Affinity */
            text_only_runtime_affinity?: components["schemas"]["RuntimeAffinity"][];
            /** Text Only Runtime Source */
            text_only_runtime_source?: string | null;
            /** Text Only Runtime Reason */
            text_only_runtime_reason?: string | null;
            /** Artifact Key */
            artifact_key?: string | null;
            /** @default standalone */
            artifact_role: components["schemas"]["ModelArtifactRole"];
            /** Artifact Family Id */
            artifact_family_id?: string | null;
            /** Artifact Lineage */
            artifact_lineage?: components["schemas"]["ModelArtifactLayer"][];
            /** Required Extra Files */
            required_extra_files?: string[];
            /** Estimated Memory Mb */
            estimated_memory_mb?: number | null;
            /** Context Length */
            context_length?: number | null;
            conversion_status: components["schemas"]["ConversionStatus"];
            /** Fingerprint */
            fingerprint: string;
            last_validation_result: components["schemas"]["ModelValidationResult"];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /**
             * Discovered At
             * Format: date-time
             */
            discovered_at?: string;
        };
        /**
         * ModelModality
         * @enum {string}
         */
        ModelModality: "text" | "vision" | "audio" | "embedding" | "rerank" | "multimodal";
        /** ModelOptimizationDefaults */
        ModelOptimizationDefaults: {
            /** Model Id */
            model_id: string;
            /** Display Name */
            display_name: string;
            /** Capability */
            capability: string;
            /** Runtime */
            runtime?: string | null;
            /** Runtime Affinity */
            runtime_affinity?: string | null;
            /** Profile Id */
            profile_id?: string | null;
            /** Default Workload Class */
            default_workload_class?: string | null;
            /** Workload Defaults */
            workload_defaults?: components["schemas"]["WorkloadOptimizationDefault"][];
            /**
             * Resolved
             * @default false
             */
            resolved: boolean;
            /**
             * Resolved Class Count
             * @default 0
             */
            resolved_class_count: number;
            /** Unresolved Classes */
            unresolved_classes?: string[];
            /** Decisions */
            decisions?: {
                [key: string]: components["schemas"]["OptimizationDefaultDecision"];
            };
        };
        /**
         * ModelResidencySnapshot
         * @description Safe public view of one resident model record.
         */
        ModelResidencySnapshot: {
            /** Model Id */
            model_id: string;
            /** Runtime */
            runtime: string;
            state: components["schemas"]["ModelResidencyState"];
            /** Load Started At */
            load_started_at?: string | null;
            /** Loaded At */
            loaded_at?: string | null;
            /** Last Used At */
            last_used_at?: string | null;
            /**
             * Active Usage Count
             * @default 0
             */
            active_usage_count: number;
            /**
             * Pending Unload
             * @default false
             */
            pending_unload: boolean;
            /** Failure */
            failure?: string | null;
            /**
             * Load Attempt Count
             * @default 0
             */
            load_attempt_count: number;
            /**
             * Joined Load Waiter Count
             * @default 0
             */
            joined_load_waiter_count: number;
            /** Estimated Memory Mb */
            estimated_memory_mb?: number | null;
        };
        /**
         * ModelResidencyState
         * @description Observable states for one process-local model residency.
         * @enum {string}
         */
        ModelResidencyState: "loading" | "ready" | "draining" | "unloading" | "failed";
        /** ModelRuntimeMetrics */
        ModelRuntimeMetrics: {
            /** Model Id */
            model_id: string;
            /** Runtime */
            runtime: string;
            /** Request Count */
            request_count: number;
            /** Success Count */
            success_count: number;
            /** Failure Count */
            failure_count: number;
            /** Success Rate */
            success_rate: number;
            /** Capability Counts */
            capability_counts?: {
                [key: string]: number;
            };
            /** Last Request At */
            last_request_at?: string | null;
            /** Last Error At */
            last_error_at?: string | null;
            /**
             * Total Prompt Tokens
             * @default 0
             */
            total_prompt_tokens: number;
            /**
             * Total Completion Tokens
             * @default 0
             */
            total_completion_tokens: number;
            /** Average Load Seconds */
            average_load_seconds?: number | null;
            /** Average Execution Seconds */
            average_execution_seconds?: number | null;
            /** Average Completion Tokens Per Second */
            average_completion_tokens_per_second?: number | null;
        };
        /** ModelScanRequest */
        ModelScanRequest: {
            /** Paths */
            paths?: string[];
        };
        /**
         * ModelScanSummary
         * @description Result payload returned after scanning model directories.
         */
        ModelScanSummary: {
            /** Roots Scanned */
            roots_scanned: string[];
            /** Discovered Count */
            discovered_count: number;
            /** New Count */
            new_count: number;
            /** Updated Count */
            updated_count: number;
            /** Unchanged Count */
            unchanged_count: number;
            /** Removed Count */
            removed_count: number;
            /** Manifests */
            manifests: components["schemas"]["ModelManifest"][];
            /**
             * Scanned At
             * Format: date-time
             */
            scanned_at?: string;
        };
        /**
         * ModelStructuredOutputSupport
         * @description What a `response_format` request will get, before spending a generation.
         *
         *     `StructuredOutputResult.enforcement` only arrives after the run, so without
         *     this a caller cannot warn that a contract will fall back to `prompt_guided`
         *     until it has already paid for the answer. The per-mode entries are the same
         *     `StructuredOutputRuntimeStatus` the response reports, so the prediction and
         *     the outcome are directly comparable.
         */
        ModelStructuredOutputSupport: {
            /** Runtime Name */
            runtime_name?: string | null;
            json_schema?: components["schemas"]["StructuredOutputRuntimeStatus"] | null;
            grammar?: components["schemas"]["StructuredOutputRuntimeStatus"] | null;
            /** Decode Time Modes */
            decode_time_modes?: ("json_schema" | "grammar")[];
            /** Reason */
            reason: string;
        };
        /**
         * ModelTargetPlatformReport
         * @description Per-model readiness summary for a specific target platform.
         */
        ModelTargetPlatformReport: {
            /** System */
            system: string;
            /** Machine */
            machine: string;
            /** Supported */
            supported: boolean;
            /** Readiness State */
            readiness_state: string;
            /** Verification Method */
            verification_method: string;
            /** Runtime Affinities */
            runtime_affinities?: components["schemas"]["RuntimeAffinity"][];
            /** Reason */
            reason: string;
            /**
             * Fallback Available
             * @default false
             */
            fallback_available: boolean;
            /** Fallback Reason */
            fallback_reason?: string | null;
            /** Install Hints */
            install_hints?: string[];
            /**
             * Validation Manifest Count
             * @default 0
             */
            validation_manifest_count: number;
            /** Verified Hosts */
            verified_hosts?: string[];
            /** Notes */
            notes?: string[];
        };
        /**
         * ModelValidationResult
         * @description Latest validation status associated with a discovered model.
         */
        ModelValidationResult: {
            status: components["schemas"]["ValidationState"];
            /** Message */
            message: string;
            /**
             * Checked At
             * Format: date-time
             */
            checked_at?: string;
            /** Details */
            details?: {
                [key: string]: unknown;
            };
        };
        /** OCRAssistedExtractionField */
        OCRAssistedExtractionField: {
            /** Field */
            field: string;
            /** Aliases */
            aliases?: string[];
            /**
             * Required
             * @default false
             */
            required: boolean;
        };
        /** OCRAssistedExtractionInput */
        OCRAssistedExtractionInput: {
            /**
             * Title
             * @default OCR Extraction
             */
            title: string;
            /**
             * Source Title
             * @default Scanned Document
             */
            source_title: string;
            /** Document Type */
            document_type?: string | null;
            /** Ocr Text */
            ocr_text: string;
            /** Expected Fields */
            expected_fields?: components["schemas"]["OCRAssistedExtractionField"][];
        };
        /** OCRAssistedExtractionRequest */
        OCRAssistedExtractionRequest: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            skill: "ocr_assisted_extraction";
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** File Name */
            file_name?: string | null;
            input: components["schemas"]["OCRAssistedExtractionInput"];
        };
        /** OptimizationDefaultDecision */
        OptimizationDefaultDecision: {
            /** Status */
            status: string;
            /** Reason */
            reason: string;
            /**
             * Benchmark Backed
             * @default false
             */
            benchmark_backed: boolean;
            /** Source */
            source?: string | null;
            /** Metrics */
            metrics?: {
                [key: string]: unknown;
            };
            /** Notes */
            notes?: string[];
        };
        /** OptimizationDefaultsSummary */
        OptimizationDefaultsSummary: {
            /**
             * Format
             * @default lewlm-optimization-defaults-v1
             */
            format: string;
            host_platform: components["schemas"]["HostPlatformSnapshot"];
            /**
             * Capability
             * @default chat
             */
            capability: string;
            /** Optimization Classes */
            optimization_classes?: string[];
            /**
             * Model Count
             * @default 0
             */
            model_count: number;
            /**
             * Resolved Model Count
             * @default 0
             */
            resolved_model_count: number;
            /**
             * Unresolved Model Count
             * @default 0
             */
            unresolved_model_count: number;
            /** Resolved Classes */
            resolved_classes?: string[];
            /** Benchmark Backed Classes */
            benchmark_backed_classes?: string[];
            /**
             * Complete
             * @default false
             */
            complete: boolean;
            /** Notes */
            notes?: string[];
            /** Models */
            models?: components["schemas"]["ModelOptimizationDefaults"][];
        };
        /**
         * PackKind
         * @description High-level pack category.
         * @enum {string}
         */
        PackKind: "runtime" | "feature";
        /**
         * PackReport
         * @description Machine-readable pack status.
         */
        PackReport: {
            /** Name */
            name: string;
            kind: components["schemas"]["PackKind"];
            /** Description */
            description: string;
            /** Active */
            active: boolean;
            status: components["schemas"]["PackStatus"];
            /** Reason */
            reason: string;
            /** Optional Dependency Group */
            optional_dependency_group?: string | null;
            /** Missing Modules */
            missing_modules?: string[];
            /** Runtime Affinities */
            runtime_affinities?: components["schemas"]["RuntimeAffinity"][];
            /** Surfaces */
            surfaces?: string[];
        };
        /**
         * PackStatus
         * @description Operator-facing pack state.
         * @enum {string}
         */
        PackStatus: "active" | "disabled" | "missing_dependency";
        /** ParagraphBlock */
        ParagraphBlock: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "paragraph";
            /** Text */
            text: string;
            /** Style Tokens */
            style_tokens?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * ParsedToolCall
         * @description One strictly parsed and schema-validated tool call.
         */
        ParsedToolCall: {
            /** Call Id */
            call_id: string;
            /** Name */
            name: string;
            /** Arguments */
            arguments?: {
                [key: string]: unknown;
            };
        };
        /**
         * PerformanceCoreEvidenceFamily
         * @enum {string}
         */
        PerformanceCoreEvidenceFamily: "continuous_batching" | "tiered_kv" | "prefix_reuse" | "prefill_isolation" | "speculation" | "constrained_decoding" | "kernel_acceleration";
        /**
         * PerformanceCoreEvidenceMode
         * @enum {string}
         */
        PerformanceCoreEvidenceMode: "lewlm_owned" | "backend_native" | "fallback" | "unsupported";
        /**
         * PerformanceCoreEvidenceRecord
         * @description Portable performance-core evidence summary shared across reporting surfaces.
         */
        PerformanceCoreEvidenceRecord: {
            family: components["schemas"]["PerformanceCoreEvidenceFamily"];
            /** @default unsupported */
            mode: components["schemas"]["PerformanceCoreEvidenceMode"];
            /** Reason */
            reason: string;
            /** Runtime Names */
            runtime_names?: string[];
            /** Feature Names */
            feature_names?: string[];
            /** Measured Categories */
            measured_categories?: components["schemas"]["MeasuredCapabilityCategory"][];
            /** Sources */
            sources?: components["schemas"]["PerformanceCoreEvidenceSource"][];
            /**
             * Benchmark Backed
             * @default false
             */
            benchmark_backed: boolean;
            /** Notes */
            notes?: string[];
            /** Metrics */
            metrics?: {
                [key: string]: unknown;
            };
        };
        /**
         * PerformanceCoreEvidenceSource
         * @enum {string}
         */
        PerformanceCoreEvidenceSource: "runtime_feature" | "benchmark_feature" | "benchmark_scenario" | "measured_capability" | "runtime_support_strategy";
        /**
         * PerformanceFeatureName
         * @enum {string}
         */
        PerformanceFeatureName: "serving_core" | "continuous_batching" | "distributed_pipeline" | "prefix_cache" | "persistent_multi_context_cache" | "hybrid_ssm_routing" | "ssm_state_cache_handling" | "moe_bounded_memory_serving" | "graph_compilation" | "attention_kernel_acceleration" | "paged_kv_cache" | "kv_cache_quantization" | "disk_backed_cache" | "block_disk_cache" | "speculative_decoding" | "prompt_lookup_speculation" | "constrained_decoding" | "keep_warm_model_residency" | "aggressive_unload_mode" | "balanced_residency_mode" | "request_scheduling_and_backpressure" | "decode_priority_scheduling" | "model_load_admission_control" | "prefill_optimization" | "chunked_prefill" | "prefill_isolation" | "multimodal_feature_caching" | "multimodal_encoder_caching";
        /** PerformanceFeatureStatus */
        PerformanceFeatureStatus: {
            feature: components["schemas"]["PerformanceFeatureName"];
            /** Supported */
            supported: boolean;
            /**
             * Active
             * @default false
             */
            active: boolean;
            /** Ownership Modes */
            ownership_modes?: string[];
            /** Supported Capabilities */
            supported_capabilities?: string[];
            /** Runtime Names */
            runtime_names?: string[];
            /** Reason */
            reason: string;
            /** Metrics */
            metrics?: {
                [key: string]: number | string | boolean | null;
            };
            /** Fallback Guidance */
            fallback_guidance?: string[];
            /** Notes */
            notes?: string[];
        };
        /**
         * PromptAttachmentPlanEntry
         * @description Attachment metadata surfaced by prompt compilation.
         */
        PromptAttachmentPlanEntry: {
            /** Message Index */
            message_index: number;
            /** Role */
            role: string;
            /** Name */
            name: string;
            /** Attachment Type */
            attachment_type: string;
            /** Media Type */
            media_type?: string | null;
            /** Source Path */
            source_path?: string | null;
            /**
             * Extracted Text Characters
             * @default 0
             */
            extracted_text_characters: number;
        };
        /**
         * PromptCompilationTrace
         * @description Inspectable trace for a compiled prompt.
         */
        PromptCompilationTrace: {
            /** Selected Template */
            selected_template: string;
            /** Requested Model Id */
            requested_model_id?: string | null;
            /** Resolved Model Id */
            resolved_model_id?: string | null;
            model_prompt_template?: components["schemas"]["PromptModelTemplateSelection"] | null;
            /** Serialized Model Prompt */
            serialized_model_prompt?: string | null;
            /** Message Count */
            message_count: number;
            /** Message Roles */
            message_roles?: string[];
            /** Attachment Plan */
            attachment_plan?: components["schemas"]["PromptAttachmentPlanEntry"][];
            /** Tool Plan */
            tool_plan?: components["schemas"]["PromptToolPlanEntry"][];
            output_contract?: components["schemas"]["PromptOutputContract"];
            /** Overrides */
            overrides?: components["schemas"]["PromptOverrideRecord"][];
        };
        /**
         * PromptModelTemplateSelection
         * @description Selected model-aware prompt template used for serialization.
         */
        PromptModelTemplateSelection: {
            /** Id */
            id: string;
            /** Version */
            version: string;
            /**
             * Source
             * @default default
             * @enum {string}
             */
            source: "default" | "architecture_family" | "model_id";
            /** Matched On */
            matched_on?: string | null;
        };
        /**
         * PromptOutputContract
         * @description Declared output contract for a compiled prompt.
         */
        PromptOutputContract: {
            /**
             * Format
             * @default text
             * @enum {string}
             */
            format: "text" | "json_schema" | "grammar";
            /** Name */
            name?: string | null;
            /** Strict */
            strict?: boolean | null;
            /** Schema */
            schema?: {
                [key: string]: unknown;
            } | null;
            /** Grammar */
            grammar?: string | null;
            /** Syntax */
            syntax?: string | null;
        };
        /**
         * PromptOverrideRecord
         * @description Inspectable record of an applied prompt override.
         */
        PromptOverrideRecord: {
            /** Source */
            source: string;
            /** Scope */
            scope: string;
            /** Summary */
            summary: string;
            /** Path */
            path?: string | null;
        };
        /**
         * PromptToolPlanEntry
         * @description Tool metadata surfaced by prompt compilation.
         */
        PromptToolPlanEntry: {
            /** Name */
            name: string;
            /**
             * Source
             * @default request
             * @enum {string}
             */
            source: "request" | "tools_file" | "skills_file" | "mcp_request" | "mcp_tools_file";
            /** Description */
            description?: string | null;
            /** Input Schema */
            input_schema?: {
                [key: string]: unknown;
            };
            /**
             * Registered
             * @default false
             */
            registered: boolean;
            /**
             * Execution Mode
             * @default prompt_only
             * @enum {string}
             */
            execution_mode: "prompt_only" | "local_tool";
            /** Version */
            version?: string | null;
            /** Required Authorization */
            required_authorization?: string | null;
            /** Mcp Server */
            mcp_server?: string | null;
            /**
             * Metadata Trusted
             * @default true
             */
            metadata_trusted: boolean;
        };
        /**
         * QuantizationPrecision
         * @enum {string}
         */
        QuantizationPrecision: "int2" | "int3" | "int4" | "int6" | "int8" | "fp8_e4m3" | "fp8_e5m2" | "fp16" | "bf16" | "fp32";
        /**
         * QuantizationProfile
         * @description Structured quantization profile preserved across conversion and discovery.
         */
        QuantizationProfile: {
            /** Name */
            name?: string | null;
            /** @default weight_only */
            strategy: components["schemas"]["QuantizationStrategy"];
            weight_precision?: components["schemas"]["QuantizationPrecision"] | null;
            activation_precision?: components["schemas"]["QuantizationPrecision"] | null;
            kv_cache_precision?: components["schemas"]["QuantizationPrecision"] | null;
            compute_precision?: components["schemas"]["QuantizationPrecision"] | null;
            /** Calibration Samples */
            calibration_samples?: number | null;
            /** Group Size */
            group_size?: number | null;
            /** Layer Overrides */
            layer_overrides?: components["schemas"]["LayerQuantizationOverride"][];
            external_quantizer?: components["schemas"]["ExternalQuantizerReference"] | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * QuantizationStrategy
         * @enum {string}
         */
        QuantizationStrategy: "weight_only" | "activation_aware" | "mixed_precision" | "hybrid_fp8" | "external_adaptive";
        /**
         * ReasoningOutput
         * @description Structured reasoning metadata exposed according to policy.
         */
        ReasoningOutput: {
            visibility: components["schemas"]["ReasoningVisibility"];
            /**
             * Available
             * @default false
             */
            available: boolean;
            /** Content */
            content?: string | null;
            /** Summary */
            summary?: string | null;
        };
        /**
         * ReasoningVisibility
         * @enum {string}
         */
        ReasoningVisibility: "hidden" | "summarized" | "raw_model_emitted";
        /** ReceiptExtractionInput */
        ReceiptExtractionInput: {
            /**
             * Title
             * @default Receipt Extraction
             */
            title: string;
            /** Vendor */
            vendor: string;
            /** Receipt Number */
            receipt_number?: string | null;
            /** Purchased At */
            purchased_at?: string | null;
            /** Currency */
            currency?: string | null;
            /** Items */
            items?: components["schemas"]["ReceiptLineItem"][];
            /** Subtotal */
            subtotal?: string | null;
            /** Tax */
            tax?: string | null;
            /** Total */
            total?: string | null;
        };
        /** ReceiptExtractionRequest */
        ReceiptExtractionRequest: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            skill: "receipt_extraction";
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** File Name */
            file_name?: string | null;
            input: components["schemas"]["ReceiptExtractionInput"];
        };
        /** ReceiptLineItem */
        ReceiptLineItem: {
            /** Description */
            description: string;
            /**
             * Quantity
             * @default 1
             */
            quantity: string;
            /** Unit Price */
            unit_price?: string | null;
            /** Total */
            total?: string | null;
        };
        /**
         * RequestModality
         * @enum {string}
         */
        RequestModality: "text_only" | "image_conditioned" | "frame_bundle_video" | "audio_conditioned";
        /** RerankCreateRequest */
        RerankCreateRequest: {
            /** Model */
            model?: string | null;
            /** Query */
            query: string;
            /** Documents */
            documents: string[];
            /** Top N */
            top_n?: number | null;
        };
        /** RerankCreateResponse */
        RerankCreateResponse: {
            /** Request Id */
            request_id: string;
            /** Created */
            created: number;
            /** Model */
            model: string;
            /** Results */
            results: components["schemas"]["RerankResultItem"][];
            routing: components["schemas"]["RoutingDecision"];
            metadata: components["schemas"]["ExecutionMetadata"];
        };
        /** RerankResultItem */
        RerankResultItem: {
            /** Index */
            index: number;
            /** Relevance Score */
            relevance_score: number;
            /** Document */
            document?: string | null;
        };
        /** ResponseCreateResponse */
        ResponseCreateResponse: {
            /** Id */
            id: string;
            /**
             * Object
             * @default response
             * @constant
             */
            object: "response";
            /** Created */
            created: number;
            /** Model */
            model: string;
            /**
             * Session Id
             * @default null
             */
            session_id: string | null;
            /** Output */
            output: components["schemas"]["ResponseOutputText"][];
            /** Output Text */
            output_text: string;
            usage?: components["schemas"]["CompletionUsage"];
            metadata: components["schemas"]["ExecutionMetadata"];
            /** Citations */
            citations?: components["schemas"]["GeneratedCitationReference"][];
            /** @default null */
            structured_output: components["schemas"]["StructuredOutputResult"] | null;
            /** @default null */
            tool_calls: components["schemas"]["ToolCallParseResult"] | null;
            /** @default null */
            prompt_trace: components["schemas"]["PromptCompilationTrace"] | null;
            /** @default null */
            serving_profile: components["schemas"]["ServingProfileApplication"] | null;
        };
        /** ResponseOutputText */
        ResponseOutputText: {
            /**
             * Type
             * @default output_text
             * @constant
             */
            type: "output_text";
            /** Text */
            text: string;
            reasoning?: components["schemas"]["ReasoningOutput"] | null;
        };
        /** RetrievalContextItem */
        RetrievalContextItem: {
            /** Rank */
            rank: number;
            /** Score */
            score: number;
            /** Embedding Score */
            embedding_score?: number | null;
            /** Rerank Score */
            rerank_score?: number | null;
            chunk: components["schemas"]["DocumentChunk"];
            source?: components["schemas"]["IngestedDocumentSource"] | null;
        };
        /** RetrievalContextRequest */
        RetrievalContextRequest: {
            /** Query */
            query: string;
            /** Candidate Chunks */
            candidate_chunks: components["schemas"]["DocumentChunk"][];
            /** Candidate Sources */
            candidate_sources?: components["schemas"]["IngestedDocumentSource"][];
            /**
             * Top K
             * @default 8
             */
            top_k: number;
            /**
             * Use Embeddings
             * @default true
             */
            use_embeddings: boolean;
            /**
             * Use Rerank
             * @default true
             */
            use_rerank: boolean;
            /** Embedding Model */
            embedding_model?: string | null;
            /** Rerank Model */
            rerank_model?: string | null;
        };
        /** RetrievalContextResponse */
        RetrievalContextResponse: {
            /** Request Id */
            request_id: string;
            /** Created */
            created: number;
            /** Query */
            query: string;
            /**
             * Strategy
             * @enum {string}
             */
            strategy: "hybrid" | "embeddings" | "rerank";
            /** Candidate Count */
            candidate_count: number;
            /** Returned Count */
            returned_count: number;
            /** Items */
            items: components["schemas"]["RetrievalContextItem"][];
            /** Sources */
            sources?: components["schemas"]["IngestedDocumentSource"][];
            /** @description Named, versioned ranking rules this response applied. */
            scoring_policy: components["schemas"]["RetrievalScoringPolicy"];
            embedding_stage?: components["schemas"]["RetrievalStageSummary"] | null;
            rerank_stage?: components["schemas"]["RetrievalStageSummary"] | null;
            metadata: components["schemas"]["ExecutionMetadata"];
        };
        /**
         * RetrievalScoringPolicy
         * @description The named, versioned ranking rules a retrieval response actually used.
         *
         *     LewLM's ranking is rerank-primary with embedding tie-breaking and a stable
         *     original-input-order fallback. That is a reasonable policy, but it is only
         *     reproducible for a caller if it is named and versioned.
         */
        RetrievalScoringPolicy: {
            /**
             * Name
             * @default rerank_primary_embedding_tiebreak
             */
            name: string;
            /**
             * Version
             * @default 1.0.0
             */
            version: string;
            /**
             * Primary Signal
             * @enum {string}
             */
            primary_signal: "rerank" | "embedding" | "none";
            /**
             * Tie Break Signal
             * @enum {string}
             */
            tie_break_signal: "embedding" | "original_order";
            /**
             * Final Tie Break
             * @default original_order
             * @constant
             */
            final_tie_break: "original_order";
            /**
             * Normalization
             * @default none
             * @enum {string}
             */
            normalization: "none" | "cosine";
            /**
             * Missing Score Behaviour
             * @default rejected
             * @enum {string}
             */
            missing_score_behaviour: "rejected" | "ranked_last";
            /**
             * Deduplication
             * @default chunk_id
             * @enum {string}
             */
            deduplication: "none" | "chunk_id";
            /** Embeddings Used */
            embeddings_used: boolean;
            /** Rerank Used */
            rerank_used: boolean;
        };
        /** RetrievalStageSummary */
        RetrievalStageSummary: {
            /** Request Id */
            request_id: string;
            /** Created */
            created: number;
            /** Model */
            model: string;
            routing: components["schemas"]["RoutingDecision"];
            metadata: components["schemas"]["ExecutionMetadata"];
            usage?: components["schemas"]["CompletionUsage"] | null;
        };
        /**
         * RoutingDecision
         * @description Explainable routing result for a generation request.
         */
        RoutingDecision: {
            /** Model Id */
            model_id: string;
            /** Runtime Name */
            runtime_name: string;
            runtime_affinity: components["schemas"]["RuntimeAffinity"];
            support_path?: components["schemas"]["RuntimeSupportPath"] | null;
            /** Reason */
            reason: string;
            request_modality?: components["schemas"]["RequestModality"] | null;
            modality_path?: components["schemas"]["RoutingModalityPath"] | null;
            /** Modality Path Reason */
            modality_path_reason?: string | null;
            /** Alternatives */
            alternatives?: string[];
        };
        /**
         * RoutingModalityPath
         * @enum {string}
         */
        RoutingModalityPath: "text_default" | "text_fast_path" | "multimodal_default";
        /**
         * RuntimeAffinity
         * @enum {string}
         */
        RuntimeAffinity: "mlx_text" | "mlx_vision" | "mlx_audio" | "llamacpp" | "onnx_genai" | "external_accelerator" | "conversion" | "experimental" | "distributed_experimental";
        /**
         * RuntimeBuildIdentity
         * @description Proof of which implementation produced an artifact.
         *
         *     A remote LewLM reporting only a package version cannot prove which build is
         *     running — an editable checkout, a patched wheel, and a release all report
         *     the same string. These fields let a caller distinguish them.
         */
        RuntimeBuildIdentity: {
            /** Package Version */
            package_version: string;
            /**
             * Api Schema Version
             * @default v1
             */
            api_schema_version: string;
            /**
             * Source Commit
             * @description Git commit of the running source tree, when it can be determined.
             */
            source_commit?: string | null;
            /**
             * Source Dirty
             * @description Whether the working tree had uncommitted changes. Null when unknown.
             */
            source_dirty?: boolean | null;
            /**
             * Distribution Digest
             * @description Stable digest of installed package metadata, for comparing two deployments.
             */
            distribution_digest?: string | null;
            /**
             * Install Kind
             * @description One of `editable`, `installed`, or `unknown`.
             * @default unknown
             */
            install_kind: string;
            /**
             * Release Build
             * @description True only for a clean, non-editable install with no local modifications.
             * @default false
             */
            release_build: boolean;
        };
        /**
         * RuntimeCandidateReport
         * @description Availability and compatibility details for a candidate runtime.
         */
        RuntimeCandidateReport: {
            /** Runtime Name */
            runtime_name: string;
            runtime_affinity: components["schemas"]["RuntimeAffinity"];
            readiness_state: components["schemas"]["RuntimeReadinessState"];
            /** Registered */
            registered: boolean;
            /** Available */
            available: boolean;
            /** Availability Reason */
            availability_reason?: string | null;
            /** Host Platform Supported */
            host_platform_supported: boolean;
            /** Supported Systems */
            supported_systems?: string[];
            /** Supported Machines */
            supported_machines?: string[];
            /** @default packaged */
            support_path: components["schemas"]["RuntimeSupportPath"];
            /** Supports Manifest */
            supports_manifest: boolean;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * RuntimeInfo
         * @description Public runtime identity and live process summary.
         */
        RuntimeInfo: {
            /** Runtime Instance Id */
            runtime_instance_id: string;
            /**
             * Started At
             * Format: date-time
             */
            started_at: string;
            /** Process Id */
            process_id: number;
            /** Hostname */
            hostname: string;
            /** Version */
            version: string;
            build: components["schemas"]["RuntimeBuildIdentity"];
            /**
             * Status
             * @default ready
             */
            status: string;
            /**
             * Loaded Model Count
             * @default 0
             */
            loaded_model_count: number;
            /**
             * Active Request Count
             * @default 0
             */
            active_request_count: number;
            /**
             * Enabled Features
             * @description Public feature surfaces this build has enabled.
             */
            enabled_features?: string[];
        };
        /**
         * RuntimeProvider
         * @description Known execution providers LewLM can own, package, or bridge.
         * @enum {string}
         */
        RuntimeProvider: "mlx" | "llamacpp" | "llamacpp_server" | "onnx_genai" | "openvino" | "vllm" | "sglang" | "tensorrt_llm" | "ollama" | "lm_studio" | "openai_compatible" | "unknown";
        /**
         * RuntimeProviderReport
         * @description Installed or configured provider summary for middleware clients.
         */
        RuntimeProviderReport: {
            provider: components["schemas"]["RuntimeProvider"];
            /** Runtime Name */
            runtime_name: string;
            runtime_affinity: components["schemas"]["RuntimeAffinity"];
            ownership: components["schemas"]["CapabilityOwnership"];
            support_path: components["schemas"]["RuntimeSupportPath"];
            /** Available */
            available: boolean;
            /** Reason */
            reason?: string | null;
            /** Supported Capabilities */
            supported_capabilities?: components["schemas"]["CapabilityName"][];
            /** @default discovered */
            evidence_state: components["schemas"]["CapabilityEvidenceState"];
            /** Notes */
            notes?: string[];
        };
        /**
         * RuntimeReadinessState
         * @enum {string}
         */
        RuntimeReadinessState: "ready" | "unregistered" | "host_unsupported" | "runtime_unavailable" | "manifest_unsupported";
        /** RuntimeRequestMetrics */
        RuntimeRequestMetrics: {
            /**
             * Total Requests
             * @default 0
             */
            total_requests: number;
            /**
             * Success Count
             * @default 0
             */
            success_count: number;
            /**
             * Failure Count
             * @default 0
             */
            failure_count: number;
            /**
             * Success Rate
             * @default 1
             */
            success_rate: number;
            /**
             * Total Prompt Tokens
             * @default 0
             */
            total_prompt_tokens: number;
            /**
             * Total Completion Tokens
             * @default 0
             */
            total_completion_tokens: number;
            /** Average Load Seconds */
            average_load_seconds?: number | null;
            /** Average Execution Seconds */
            average_execution_seconds?: number | null;
            /** Average Completion Tokens Per Second */
            average_completion_tokens_per_second?: number | null;
            /** Models */
            models?: components["schemas"]["ModelRuntimeMetrics"][];
            /** Capabilities */
            capabilities?: components["schemas"]["CapabilityRuntimeMetrics"][];
            /** Applications */
            applications?: components["schemas"]["ApplicationRuntimeMetrics"][];
        };
        /** RuntimeSchedulerStats */
        RuntimeSchedulerStats: {
            /** Max Concurrent Requests */
            max_concurrent_requests: number;
            /** Queue Limit */
            queue_limit: number;
            /** Queue Timeout Seconds */
            queue_timeout_seconds: number;
            /**
             * Decode Priority Enabled
             * @default false
             */
            decode_priority_enabled: boolean;
            /**
             * Long Prefill Token Threshold
             * @default 0
             */
            long_prefill_token_threshold: number;
            /**
             * Prefill Isolation Enabled
             * @default false
             */
            prefill_isolation_enabled: boolean;
            /**
             * Prefill Isolation Max Concurrent Requests
             * @default 0
             */
            prefill_isolation_max_concurrent_requests: number;
            /**
             * Prefill Isolation Decode Reserve
             * @default 0
             */
            prefill_isolation_decode_reserve: number;
            /** Active Requests */
            active_requests: number;
            /** Queued Requests */
            queued_requests: number;
            /**
             * Active Decode Requests
             * @default 0
             */
            active_decode_requests: number;
            /**
             * Active Prefill Requests
             * @default 0
             */
            active_prefill_requests: number;
            /**
             * Queued Decode Requests
             * @default 0
             */
            queued_decode_requests: number;
            /**
             * Queued Prefill Requests
             * @default 0
             */
            queued_prefill_requests: number;
            /** Peak Active Requests */
            peak_active_requests: number;
            /** Max Observed Queue Depth */
            max_observed_queue_depth: number;
            /**
             * Max Observed Decode Queue Depth
             * @default 0
             */
            max_observed_decode_queue_depth: number;
            /**
             * Max Observed Prefill Queue Depth
             * @default 0
             */
            max_observed_prefill_queue_depth: number;
            /** Total Queued Requests */
            total_queued_requests: number;
            /** Rejected Requests */
            rejected_requests: number;
            /** Timed Out Requests */
            timed_out_requests: number;
            /**
             * Total Queue Wait Seconds
             * @default 0
             */
            total_queue_wait_seconds: number;
            /**
             * Average Queue Wait Seconds
             * @default 0
             */
            average_queue_wait_seconds: number;
            /**
             * Max Queue Wait Seconds
             * @default 0
             */
            max_queue_wait_seconds: number;
            /**
             * Decode Priority Requests
             * @default 0
             */
            decode_priority_requests: number;
            /**
             * Prefill Heavy Requests
             * @default 0
             */
            prefill_heavy_requests: number;
            /**
             * Prioritized Decode Grants
             * @default 0
             */
            prioritized_decode_grants: number;
            /**
             * Isolated Prefill Requests
             * @default 0
             */
            isolated_prefill_requests: number;
            /**
             * Native Window Milliseconds
             * @default 0
             */
            native_window_milliseconds: number;
            /**
             * Native Max Batch Size
             * @default 0
             */
            native_max_batch_size: number;
            /**
             * Native Total Batches
             * @default 0
             */
            native_total_batches: number;
            /**
             * Native Total Requests
             * @default 0
             */
            native_total_requests: number;
            /**
             * Native Batched Requests
             * @default 0
             */
            native_batched_requests: number;
            /**
             * Native Coalesced Requests
             * @default 0
             */
            native_coalesced_requests: number;
            /**
             * Native Total Queue Delay Seconds
             * @default 0
             */
            native_total_queue_delay_seconds: number;
            /**
             * Native Average Queue Delay Seconds
             * @default 0
             */
            native_average_queue_delay_seconds: number;
            /**
             * Native Max Queue Delay Seconds
             * @default 0
             */
            native_max_queue_delay_seconds: number;
            /**
             * Native Average Batch Size
             * @default 0
             */
            native_average_batch_size: number;
            /**
             * Native Average Batch Utilization
             * @default 0
             */
            native_average_batch_utilization: number;
            /**
             * Frontier Window Milliseconds
             * @default 0
             */
            frontier_window_milliseconds: number;
            /**
             * Frontier Max Batch Size
             * @default 0
             */
            frontier_max_batch_size: number;
            /**
             * Frontier Total Batches
             * @default 0
             */
            frontier_total_batches: number;
            /**
             * Frontier Total Requests
             * @default 0
             */
            frontier_total_requests: number;
            /**
             * Frontier Batched Requests
             * @default 0
             */
            frontier_batched_requests: number;
            /**
             * Frontier Coalesced Requests
             * @default 0
             */
            frontier_coalesced_requests: number;
            /**
             * Frontier Total Queue Delay Seconds
             * @default 0
             */
            frontier_total_queue_delay_seconds: number;
            /**
             * Frontier Average Queue Delay Seconds
             * @default 0
             */
            frontier_average_queue_delay_seconds: number;
            /**
             * Frontier Max Queue Delay Seconds
             * @default 0
             */
            frontier_max_queue_delay_seconds: number;
            /**
             * Frontier Average Batch Size
             * @default 0
             */
            frontier_average_batch_size: number;
            /**
             * Frontier Average Batch Utilization
             * @default 0
             */
            frontier_average_batch_utilization: number;
        };
        /** RuntimeStats */
        RuntimeStats: {
            /**
             * Runtime Instance Id
             * @default legacy
             */
            runtime_instance_id: string;
            /** Started At */
            started_at?: string | null;
            /**
             * Process Id
             * @default 0
             */
            process_id: number;
            /**
             * Hostname
             * @default unknown
             */
            hostname: string;
            platform: components["schemas"]["HostPlatformSnapshot"];
            readiness: components["schemas"]["ServiceReadinessSummary"];
            /** Runtime Policy */
            runtime_policy: string;
            /** Request Max Bytes */
            request_max_bytes: number;
            /** Api Key Required */
            api_key_required: boolean;
            /** Active Sessions */
            active_sessions: number;
            /** Queue Depth */
            queue_depth: number;
            /** Active Jobs */
            active_jobs: number;
            /** Current Loaded Models */
            current_loaded_models?: string[];
            /** Residencies */
            residencies?: components["schemas"]["ModelResidencySnapshot"][];
            /** Runtime Packs */
            runtime_packs?: components["schemas"]["PackReport"][];
            /** Feature Packs */
            feature_packs?: components["schemas"]["PackReport"][];
            /** Runtimes */
            runtimes?: {
                [key: string]: unknown;
            }[];
            serving_core: components["schemas"]["ServingCoreSnapshot"];
            request_scheduler: components["schemas"]["RuntimeSchedulerStats"];
            load_scheduler: components["schemas"]["RuntimeSchedulerStats"];
            request_metrics: components["schemas"]["RuntimeRequestMetrics"];
            benchmark_summary: components["schemas"]["BenchmarkSummary"];
            measured_capability_registry?: components["schemas"]["MeasuredCapabilityRegistrySummary"] | null;
            /**
             * Validation Manifest Count
             * @default 0
             */
            validation_manifest_count: number;
            /** Target Platforms */
            target_platforms?: components["schemas"]["TargetPlatformValidation"][];
            /** Cluster */
            cluster?: {
                [key: string]: unknown;
            } | null;
            /** Performance Features */
            performance_features?: components["schemas"]["PerformanceFeatureStatus"][];
            /** Performance Core Evidence */
            performance_core_evidence?: components["schemas"]["PerformanceCoreEvidenceRecord"][];
            optimization_defaults?: components["schemas"]["OptimizationDefaultsSummary"] | null;
            runtime_support_strategy?: components["schemas"]["RuntimeSupportStrategy"] | null;
            standards_acceptance_contract?: components["schemas"]["StandardsAcceptanceContract"];
        };
        /**
         * RuntimeSupportPath
         * @enum {string}
         */
        RuntimeSupportPath: "packaged" | "bridge";
        /** RuntimeSupportPathSummary */
        RuntimeSupportPathSummary: {
            /** Path Id */
            path_id: string;
            /** Label */
            label: string;
            /** Role */
            role: string;
            /** Install Profile */
            install_profile?: string | null;
            /** Host Scope */
            host_scope: string;
            /** Runtime Affinities */
            runtime_affinities?: string[];
            /**
             * Benchmark Backed Defaults
             * @default false
             */
            benchmark_backed_defaults: boolean;
            /** Lewlm Managed Layers */
            lewlm_managed_layers?: string[];
            /** Backend Native Layers */
            backend_native_layers?: string[];
            /** Performance Core Evidence */
            performance_core_evidence?: components["schemas"]["PerformanceCoreEvidenceRecord"][];
            /** Notes */
            notes?: string[];
        };
        /** RuntimeSupportStrategy */
        RuntimeSupportStrategy: {
            /**
             * Format
             * @default lewlm-runtime-support-strategy-v1
             */
            format: string;
            /** Primary Path Id */
            primary_path_id: string;
            /** First Class Non Apple Path Id */
            first_class_non_apple_path_id?: string | null;
            /** Paths */
            paths?: components["schemas"]["RuntimeSupportPathSummary"][];
            /** Notes */
            notes?: string[];
        };
        /**
         * SamplingControlReport
         * @description What a runtime did with the requested sampling controls.
         */
        SamplingControlReport: {
            /** Runtime */
            runtime: string;
            /** Requested */
            requested?: {
                [key: string]: unknown;
            };
            /** Applied */
            applied?: {
                [key: string]: unknown;
            };
            /**
             * Unsupported
             * @description Controls the caller requested that this backend cannot honor.
             */
            unsupported?: string[];
            /**
             * Deterministic
             * @description True only when a seed was requested and the backend actually applied it.
             * @default false
             */
            deterministic: boolean;
        };
        /**
         * ServiceReadinessState
         * @enum {string}
         */
        ServiceReadinessState: "ready" | "partial" | "blocked";
        /**
         * ServiceReadinessSummary
         * @description Machine-readable readiness summary for host-app consumers.
         */
        ServiceReadinessSummary: {
            status: components["schemas"]["ServiceReadinessState"];
            host_platform: components["schemas"]["HostPlatformSnapshot"];
            /**
             * Discovered Model Count
             * @default 0
             */
            discovered_model_count: number;
            /**
             * Runnable Model Count
             * @default 0
             */
            runnable_model_count: number;
            /**
             * Capability Count
             * @default 0
             */
            capability_count: number;
            /**
             * Ready Capability Count
             * @default 0
             */
            ready_capability_count: number;
            /** Capabilities */
            capabilities?: components["schemas"]["HostCapabilityReadiness"][];
            /** Notes */
            notes?: string[];
        };
        /** ServingAdmissionState */
        ServingAdmissionState: {
            /** Queue Lane */
            queue_lane?: ("decode" | "prefill") | null;
            /**
             * Prefill Heavy
             * @default false
             */
            prefill_heavy: boolean;
            /**
             * Decode Priority Requested
             * @default false
             */
            decode_priority_requested: boolean;
            /**
             * Decode Priority Active
             * @default false
             */
            decode_priority_active: boolean;
            /**
             * Prefill Isolation Requested
             * @default false
             */
            prefill_isolation_requested: boolean;
            /**
             * Prefill Isolation Active
             * @default false
             */
            prefill_isolation_active: boolean;
            /** Prompt Token Estimate */
            prompt_token_estimate?: number | null;
            /** Chunk Count */
            chunk_count?: number | null;
        };
        /** ServingBatchState */
        ServingBatchState: {
            /**
             * Batched
             * @default false
             */
            batched: boolean;
            /**
             * Backend Owned
             * @default false
             */
            backend_owned: boolean;
            /**
             * Batch Size
             * @default 1
             */
            batch_size: number;
            /**
             * Batch Position
             * @default 0
             */
            batch_position: number;
            /**
             * Batch Window Milliseconds
             * @default 0
             */
            batch_window_milliseconds: number;
            /**
             * Queue Delay Milliseconds
             * @default 0
             */
            queue_delay_milliseconds: number;
        };
        /** ServingCoreSnapshot */
        ServingCoreSnapshot: {
            /**
             * Version
             * @default v1
             * @constant
             */
            version: "v1";
            /**
             * Total Sequences Started
             * @default 0
             */
            total_sequences_started: number;
            /**
             * Total Sequences Completed
             * @default 0
             */
            total_sequences_completed: number;
            /**
             * Total Sequences Failed
             * @default 0
             */
            total_sequences_failed: number;
            /**
             * Total Cancellation Requests
             * @default 0
             */
            total_cancellation_requests: number;
            /**
             * Active Sequence Count
             * @default 0
             */
            active_sequence_count: number;
            /**
             * Active Stream Count
             * @default 0
             */
            active_stream_count: number;
            /**
             * Recent Sequence Count
             * @default 0
             */
            recent_sequence_count: number;
            /** Active Phase Counts */
            active_phase_counts?: {
                [key: string]: number;
            };
            /** Active Sequences */
            active_sequences?: components["schemas"]["ServingSequenceSnapshot"][];
            /** Recent Sequences */
            recent_sequences?: components["schemas"]["ServingSequenceSnapshot"][];
        };
        /**
         * ServingPhase
         * @enum {string}
         */
        ServingPhase: "created" | "queued" | "admitted" | "model_loading" | "prefill" | "decode" | "completed" | "failed";
        /** ServingPhaseTransition */
        ServingPhaseTransition: {
            phase: components["schemas"]["ServingPhase"];
            /** Detail */
            detail?: string | null;
            /** Entered At */
            entered_at?: string;
        };
        /** ServingProfileApplication */
        ServingProfileApplication: {
            /**
             * Status
             * @enum {string}
             */
            status: "selected" | "disabled" | "not_found" | "runtime_mismatch" | "unavailable";
            /**
             * Source
             * @default persisted_autotune
             */
            source: string;
            /**
             * Capability
             * @default chat
             */
            capability: string;
            /**
             * Workload Class
             * @default text_only
             */
            workload_class: string;
            /** Profile Id */
            profile_id?: string | null;
            /** Runtime */
            runtime?: string | null;
            /** Reason */
            reason: string;
            /** Recommendation Reason */
            recommendation_reason?: string | null;
            /** Recommended At */
            recommended_at?: string | null;
            /** Artifact Id */
            artifact_id?: string | null;
            /** Accepted Settings */
            accepted_settings?: {
                [key: string]: number | string | boolean | null;
            };
            /** Rejected Settings */
            rejected_settings?: {
                [key: string]: components["schemas"]["ServingProfileRejectedSetting"];
            };
            /** Effective Settings */
            effective_settings?: {
                [key: string]: number | string | boolean | null;
            };
        };
        /**
         * ServingProfileInventory
         * @description Stored serving profiles, so the tuning loop has a memory to read back.
         *
         *     Profiles are keyed by host, model, runtime and workload class, and a
         *     generation applies whichever one matches; this lists what exists rather
         *     than only what the last autotune run produced.
         */
        ServingProfileInventory: {
            /** Count */
            count: number;
            /** Items */
            items?: components["schemas"]["ServingProfileRecommendation"][];
            /**
             * Unreadable Count
             * @default 0
             */
            unreadable_count: number;
        };
        /** ServingProfileRecommendation */
        ServingProfileRecommendation: {
            /** Profile Id */
            profile_id: string;
            /** Model Id */
            model_id: string;
            /** Capability */
            capability: string;
            /** Workload Class */
            workload_class: string;
            /** Runtime */
            runtime: string;
            host_platform: components["schemas"]["HostPlatformSnapshot"];
            /** Prompt */
            prompt: string;
            /**
             * Recommended At
             * Format: date-time
             */
            recommended_at: string;
            /**
             * Selection Objective
             * @default latency_first
             */
            selection_objective: string;
            /** Reason */
            reason: string;
            /** Settings Overrides */
            settings_overrides?: {
                [key: string]: number | string | boolean | null;
            };
            /** Effective Settings */
            effective_settings?: {
                [key: string]: number | string | boolean | null;
            };
            /** Metrics */
            metrics?: {
                [key: string]: number | string | boolean | null;
            };
            /** Quantization Profile */
            quantization_profile?: string | null;
            /** Selected Speculation Mode */
            selected_speculation_mode?: string | null;
            /** Active Kernel Path */
            active_kernel_path?: string | null;
            /** Active Cache Features */
            active_cache_features?: string[];
            artifact?: components["schemas"]["BenchmarkArtifactReference"] | null;
            /** Notes */
            notes?: string[];
            /** Candidate Summaries */
            candidate_summaries?: components["schemas"]["AutotuneCandidateSummary"][];
        };
        /** ServingProfileRejectedSetting */
        ServingProfileRejectedSetting: {
            /** Requested Value */
            requested_value?: number | string | boolean | null;
            /** Reason */
            reason: string;
        };
        /** ServingQueueResidency */
        ServingQueueResidency: {
            queue_type: components["schemas"]["ServingQueueType"];
            /** Wait Milliseconds */
            wait_milliseconds: number;
        };
        /**
         * ServingQueueType
         * @enum {string}
         */
        ServingQueueType: "batch_window" | "runtime_request" | "model_load";
        /** ServingRuntimeAdapter */
        ServingRuntimeAdapter: {
            /** Runtime Name */
            runtime_name: string;
            /** Capability */
            capability: string;
            kind: components["schemas"]["ServingRuntimeAdapterKind"];
            /**
             * Backend Batching
             * @default false
             */
            backend_batching: boolean;
            /**
             * Chunked Prefill
             * @default false
             */
            chunked_prefill: boolean;
            /**
             * Prefill Isolation
             * @default false
             */
            prefill_isolation: boolean;
            /** Notes */
            notes?: string[];
        };
        /**
         * ServingRuntimeAdapterKind
         * @enum {string}
         */
        ServingRuntimeAdapterKind: "request_scoped" | "lewlm_owned_batch" | "backend_native_batch";
        /** ServingSequenceSnapshot */
        ServingSequenceSnapshot: {
            /** Request Id */
            request_id: string;
            /** Requested Model Id */
            requested_model_id?: string | null;
            /** Model Id */
            model_id: string;
            /** Runtime Name */
            runtime_name: string;
            /** Capability */
            capability: string;
            /**
             * Streaming
             * @default false
             */
            streaming: boolean;
            /** @default none */
            streaming_owner: components["schemas"]["StreamingOwner"];
            runtime_adapter: components["schemas"]["ServingRuntimeAdapter"];
            /** @default created */
            phase: components["schemas"]["ServingPhase"];
            /**
             * Active
             * @default true
             */
            active: boolean;
            /**
             * Cancellation Requested
             * @default false
             */
            cancellation_requested: boolean;
            /** Cancellation Reason */
            cancellation_reason?: string | null;
            /** Failure */
            failure?: string | null;
            /**
             * Queue Residency Milliseconds
             * @default 0
             */
            queue_residency_milliseconds: number;
            /** Queue Residencies */
            queue_residencies?: components["schemas"]["ServingQueueResidency"][];
            admission?: components["schemas"]["ServingAdmissionState"];
            batch?: components["schemas"]["ServingBatchState"];
            /** Phase History */
            phase_history?: components["schemas"]["ServingPhaseTransition"][];
        };
        /** SessionCreateRequest */
        SessionCreateRequest: {
            /** Title */
            title?: string | null;
            /**
             * Context Policy
             * @default full_history
             * @enum {string}
             */
            context_policy: "full_history" | "last_turn" | "summary_and_last_turn";
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** SessionDeleteResponse */
        SessionDeleteResponse: {
            /**
             * Status
             * @default deleted
             * @constant
             */
            status: "deleted";
            /** Session Id */
            session_id: string;
        };
        /**
         * SessionDetail
         * @description Stored session metadata plus its turns.
         */
        SessionDetail: {
            /** Session Id */
            session_id: string;
            /** Title */
            title?: string | null;
            /**
             * Context Policy
             * @default full_history
             * @enum {string}
             */
            context_policy: "full_history" | "last_turn" | "summary_and_last_turn";
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /**
             * Message Count
             * @default 0
             */
            message_count: number;
            /**
             * Turn Count
             * @default 0
             */
            turn_count: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at?: string;
            /** Turns */
            turns?: components["schemas"]["SessionTurnRecord"][];
        };
        /**
         * SessionExportBundle
         * @description Portable export bundle for a persisted session.
         */
        SessionExportBundle: {
            /**
             * Version
             * @default 1
             */
            version: number;
            session: components["schemas"]["SessionRecord"];
            /** Turns */
            turns?: components["schemas"]["SessionTurnRecord"][];
        };
        /** SessionImportRequest */
        SessionImportRequest: {
            bundle: components["schemas"]["SessionExportBundle"];
            /** Title */
            title?: string | null;
        };
        /** SessionListResponse */
        SessionListResponse: {
            /** Count */
            count: number;
            /** Items */
            items: components["schemas"]["SessionRecord"][];
        };
        /** SessionMessagesResponse */
        SessionMessagesResponse: {
            /** Session Id */
            session_id: string;
            /** Count */
            count: number;
            /** Messages */
            messages: components["schemas"]["GenerateMessage"][];
        };
        /**
         * SessionRecord
         * @description Stored chat session metadata.
         */
        SessionRecord: {
            /** Session Id */
            session_id: string;
            /** Title */
            title?: string | null;
            /**
             * Context Policy
             * @default full_history
             * @enum {string}
             */
            context_policy: "full_history" | "last_turn" | "summary_and_last_turn";
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /**
             * Message Count
             * @default 0
             */
            message_count: number;
            /**
             * Turn Count
             * @default 0
             */
            turn_count: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at?: string;
        };
        /**
         * SessionTurnRecord
         * @description Single persisted turn inside a session.
         */
        SessionTurnRecord: {
            /** Turn Id */
            turn_id: string;
            /** Session Id */
            session_id: string;
            /**
             * Request Kind
             * @enum {string}
             */
            request_kind: "chat.completions" | "responses" | "cli.chat";
            /** Input Messages */
            input_messages?: components["schemas"]["GenerateMessage"][];
            response_message: components["schemas"]["GenerateMessage"];
            /** Requested Model Id */
            requested_model_id?: string | null;
            /** Model Id */
            model_id: string;
            /**
             * Max Tokens
             * @default 512
             */
            max_tokens: number;
            /**
             * Temperature
             * @default 0.7
             */
            temperature: number;
            /**
             * Finish Reason
             * @default stop
             */
            finish_reason: string;
            /** Usage */
            usage?: {
                [key: string]: number;
            };
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
        };
        /**
         * SessionUpdateRequest
         * @description Partial update for a session. Omitted fields are left unchanged.
         */
        SessionUpdateRequest: {
            /** Title */
            title?: string | null;
            /** Context Policy */
            context_policy?: ("full_history" | "last_turn" | "summary_and_last_turn") | null;
            /**
             * Metadata
             * @description Metadata to apply. Merged into existing metadata unless `replace_metadata` is true.
             */
            metadata?: {
                [key: string]: unknown;
            } | null;
            /**
             * Replace Metadata
             * @description Replace stored metadata outright instead of merging.
             * @default false
             */
            replace_metadata: boolean;
        };
        /** SkillListResponse */
        SkillListResponse: {
            /** Count */
            count: number;
            /** Items */
            items: components["schemas"]["BuiltInSkillDescriptor"][];
        };
        /** SpeechTranscriptCleanupInput */
        SpeechTranscriptCleanupInput: {
            /**
             * Title
             * @default Transcript Cleanup
             */
            title: string;
            /** Transcript Text */
            transcript_text: string;
            /** Language */
            language?: string | null;
        };
        /** SpeechTranscriptCleanupRequest */
        SpeechTranscriptCleanupRequest: {
            /** Authorized Actions */
            authorized_actions?: string[];
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             */
            correlation_id?: string | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            skill: "speech_transcript_cleanup";
            output_format: components["schemas"]["DocumentOutputFormat"];
            /** File Name */
            file_name?: string | null;
            input: components["schemas"]["SpeechTranscriptCleanupInput"];
        };
        /**
         * StandardsAcceptanceContract
         * @description Shared 2026 standards vocabulary and state legend for public LewLM surfaces.
         */
        StandardsAcceptanceContract: {
            /**
             * Format
             * @default lewlm-standards-acceptance-contract-v1
             */
            format: string;
            /** Acceptance States */
            acceptance_states?: components["schemas"]["StandardsAcceptanceStateDefinition"][];
            /** Vocabulary */
            vocabulary?: components["schemas"]["StandardsVocabularyEntry"][];
            /** Related Signal Fields */
            related_signal_fields?: string[];
            /** Notes */
            notes?: string[];
        };
        /**
         * StandardsAcceptanceState
         * @description Normalized Milestone 120 acceptance states for 2026 standards terms.
         * @enum {string}
         */
        StandardsAcceptanceState: "lewlm_owned" | "backend_native" | "partial" | "fallback" | "unsupported" | "unverified";
        /**
         * StandardsAcceptanceStateDefinition
         * @description Human-readable definition for one Milestone 120 acceptance state.
         */
        StandardsAcceptanceStateDefinition: {
            state: components["schemas"]["StandardsAcceptanceState"];
            /** Summary */
            summary: string;
        };
        /**
         * StandardsVocabularyCategory
         * @description High-level grouping for the shared 2026 standards vocabulary.
         * @enum {string}
         */
        StandardsVocabularyCategory: "memory_and_context" | "structured_output_and_reasoning" | "speculation" | "dependency_baseline" | "multimodal_document_and_semantic" | "agent_interoperability";
        /**
         * StandardsVocabularyEntry
         * @description One reserved 2026 standards vocabulary term and its intended meaning.
         */
        StandardsVocabularyEntry: {
            name: components["schemas"]["StandardsVocabularyTerm"];
            category: components["schemas"]["StandardsVocabularyCategory"];
            /** Summary */
            summary: string;
            /** Accepted States */
            accepted_states?: components["schemas"]["StandardsAcceptanceState"][];
            /** Notes */
            notes?: string[];
        };
        /**
         * StandardsVocabularyTerm
         * @description Normative vocabulary keys reserved by the 2026 standards contract.
         * @enum {string}
         */
        StandardsVocabularyTerm: "kv_offload" | "kv_quantization" | "hybrid_memory" | "pd_disaggregation" | "distributed_kv_transfer" | "strict_tool_parser" | "reasoning_tags" | "parallel_tool_calls" | "streaming_tool_calls" | "responses_api_events" | "mtp_speculation" | "eagle_speculation" | "dflash_speculation" | "ngram_draft_speculation" | "reasoning_budget_speculation" | "transformers_v5_ready" | "cuda13_ready" | "pytorch211_ready" | "cxx20_ready" | "multimodal_omni" | "document_ocr_transformer" | "long_context_embedding" | "local_agent_sandbox";
        /** StorageHealth */
        StorageHealth: {
            /** Healthy */
            healthy: boolean;
            /** Database Path */
            database_path: string;
            /** Schema Version */
            schema_version: number;
            /** Model Count */
            model_count: number;
        };
        /**
         * StreamingOwner
         * @enum {string}
         */
        StreamingOwner: "none" | "lewlm";
        /**
         * StructuredOutputIssue
         * @description Single structured-output validation issue.
         */
        StructuredOutputIssue: {
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Path */
            path?: (string | number)[];
        };
        /**
         * StructuredOutputResult
         * @description Public structured-output status attached to generation responses.
         */
        StructuredOutputResult: {
            /**
             * Requested
             * @default false
             */
            requested: boolean;
            /** Contract */
            contract?: (components["schemas"]["TextResponseFormat"] | components["schemas"]["JSONSchemaResponseFormat"] | components["schemas"]["GrammarResponseFormat"]) | null;
            /**
             * Enforcement
             * @default none
             * @enum {string}
             */
            enforcement: "none" | "prompt_guided" | "decode_time";
            /**
             * Decoder Enforced
             * @default false
             */
            decoder_enforced: boolean;
            /**
             * Fallback Used
             * @default false
             */
            fallback_used: boolean;
            /** Fallback Reason */
            fallback_reason?: string | null;
            /** Parsed Output */
            parsed_output?: unknown | null;
            validation?: components["schemas"]["StructuredOutputValidation"];
        };
        /**
         * StructuredOutputRuntimeStatus
         * @description Runtime-side enforcement status recorded during generation.
         */
        StructuredOutputRuntimeStatus: {
            /** Runtime */
            runtime?: string | null;
            /**
             * Mode
             * @default text
             * @enum {string}
             */
            mode: "text" | "json_schema" | "grammar";
            /**
             * Enforcement
             * @default prompt_guided
             * @enum {string}
             */
            enforcement: "prompt_guided" | "decode_time";
            /**
             * Decoder Enforced
             * @default false
             */
            decoder_enforced: boolean;
            /**
             * Fallback Used
             * @default false
             */
            fallback_used: boolean;
            /** Fallback Reason */
            fallback_reason?: string | null;
        };
        /**
         * StructuredOutputValidation
         * @description Post-generation validation metadata for a structured-output request.
         */
        StructuredOutputValidation: {
            /**
             * State
             * @default not_requested
             * @enum {string}
             */
            state: "not_requested" | "valid" | "invalid" | "unavailable";
            /**
             * Validator
             * @default none
             * @enum {string}
             */
            validator: "none" | "json_parse_only" | "full_json_schema" | "grammar";
            /** Message */
            message?: string | null;
            /** Issues */
            issues?: components["schemas"]["StructuredOutputIssue"][];
        };
        /** StyleToken */
        StyleToken: {
            /** Name */
            name: string;
            /** Value */
            value: string;
            /** Applies To */
            applies_to?: string | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** TableBlock */
        TableBlock: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "table";
            /** Headers */
            headers?: string[];
            /** Rows */
            rows?: string[][];
            /** Caption */
            caption?: string | null;
            /** Style Tokens */
            style_tokens?: string[];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /** TargetPlatformRuntimeStatus */
        TargetPlatformRuntimeStatus: {
            /** Runtime Name */
            runtime_name: string;
            /** Runtime Affinity */
            runtime_affinity: string;
            /** Supported */
            supported: boolean;
            /** Reason */
            reason?: string | null;
            /** Readiness State */
            readiness_state: string;
            /** Verification Method */
            verification_method: string;
            /** Install Hint */
            install_hint?: string | null;
        };
        /** TargetPlatformValidation */
        TargetPlatformValidation: {
            /** System */
            system: string;
            /** Machine */
            machine: string;
            /** Supported Runtime Count */
            supported_runtime_count: number;
            /** Unsupported Runtime Count */
            unsupported_runtime_count: number;
            /** Compatible Model Count */
            compatible_model_count: number;
            /** Incompatible Model Count */
            incompatible_model_count: number;
            /** Blocked Model Count */
            blocked_model_count: number;
            /**
             * Fallback Model Count
             * @default 0
             */
            fallback_model_count: number;
            /** Compatible Models */
            compatible_models?: string[];
            /** Incompatible Models */
            incompatible_models?: string[];
            /** Blocked Models */
            blocked_models?: string[];
            /** Fallback Models */
            fallback_models?: string[];
            /** Readiness State */
            readiness_state: string;
            /** Verification Method */
            verification_method: string;
            /**
             * Validation Manifest Count
             * @default 0
             */
            validation_manifest_count: number;
            /**
             * Verified Model Count
             * @default 0
             */
            verified_model_count: number;
            /** Verified Models */
            verified_models?: string[];
            /** Verified Hosts */
            verified_hosts?: string[];
            /** Notes */
            notes?: string[];
            /** Runtimes */
            runtimes?: components["schemas"]["TargetPlatformRuntimeStatus"][];
        };
        /**
         * TextResponseFormat
         * @description Explicit plain-text response format.
         */
        TextResponseFormat: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "text";
        };
        /** TokenCountRequest */
        TokenCountRequest: {
            /** Model */
            model?: string | null;
            /** Text */
            text: string;
            /**
             * Max Tokens
             * @description When set, also return the text truncated at an exact token boundary.
             */
            max_tokens?: number | null;
            /** Correlation Id */
            correlation_id?: string | null;
        };
        /** TokenCountResponse */
        TokenCountResponse: {
            /** Request Id */
            request_id: string;
            /** Created */
            created: number;
            /** Model */
            model: string;
            /**
             * Token Count
             * @description Exact token count from the selected model's own tokenizer.
             */
            token_count: number;
            /** Character Count */
            character_count: number;
            /**
             * Truncated
             * @default false
             */
            truncated: boolean;
            /**
             * Truncated Text
             * @description Text cut at a deterministic token boundary. Null unless `max_tokens` was set and exceeded.
             */
            truncated_text?: string | null;
            /** Truncated Token Count */
            truncated_token_count?: number | null;
            routing: components["schemas"]["RoutingDecision"];
            metadata: components["schemas"]["ExecutionMetadata"];
        };
        /**
         * ToolCallParseIssue
         * @description One explicit reason a tool-call candidate was not accepted.
         */
        ToolCallParseIssue: {
            /**
             * Code
             * @enum {string}
             */
            code: "invalid_json" | "unrecognized_shape" | "missing_name" | "unknown_tool" | "arguments_not_object" | "schema_violation";
            /** Message */
            message: string;
            /** Candidate Index */
            candidate_index: number;
        };
        /**
         * ToolCallParseResult
         * @description Strict parse outcome for one model output text.
         */
        ToolCallParseResult: {
            /**
             * Status
             * @enum {string}
             */
            status: "no_tool_calls" | "parsed" | "partial" | "failed";
            /**
             * Parser
             * @default lewlm_strict_tool_parser
             */
            parser: string;
            /** Tool Calls */
            tool_calls?: components["schemas"]["ParsedToolCall"][];
            /** Issues */
            issues?: components["schemas"]["ToolCallParseIssue"][];
            /**
             * Remaining Text
             * @default
             */
            remaining_text: string;
            /**
             * Parallel
             * @default false
             */
            parallel: boolean;
        };
        /** ToolExecutionEnvelope */
        ToolExecutionEnvelope: {
            /** Request Id */
            request_id: string;
            /** Tool */
            tool: string;
            /** Idempotency Key */
            idempotency_key?: string | null;
            /**
             * Idempotent Replay
             * @default false
             */
            idempotent_replay: boolean;
            trace: components["schemas"]["ToolExecutionTrace"];
            /** Result */
            result?: {
                [key: string]: unknown;
            };
        };
        /** ToolExecutionTrace */
        ToolExecutionTrace: {
            /** Tool */
            tool: string;
            /** Version */
            version: string;
            /**
             * Execution Mode
             * @default local
             * @constant
             */
            execution_mode: "local";
            /**
             * Actor
             * @enum {string}
             */
            actor: "api" | "cli";
            /** Required Authorization */
            required_authorization: string;
            /**
             * Started At
             * Format: date-time
             */
            started_at?: string;
            /**
             * Completed At
             * Format: date-time
             */
            completed_at?: string;
            /**
             * Duration Ms
             * @default 0
             */
            duration_ms: number;
            /** Summary */
            summary: string;
            /** Details */
            details?: {
                [key: string]: unknown;
            };
        };
        /** ToolListResponse */
        ToolListResponse: {
            /** Count */
            count: number;
            /** Items */
            items: components["schemas"]["LocalToolDescriptor"][];
        };
        /**
         * UploadedSourceToolInput
         * @description A document supplied as bytes, with caller-owned identity.
         */
        UploadedSourceToolInput: {
            /**
             * Source Id
             * @description Caller-provided opaque identifier echoed back on every result.
             */
            source_id: string;
            /** File Name */
            file_name: string;
            /** Content Base64 */
            content_base64: string;
            /** Media Type */
            media_type?: string | null;
            /**
             * Expected Sha256
             * @description When set, LewLM refuses the source unless the received bytes match.
             */
            expected_sha256?: string | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
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
        /**
         * ValidationState
         * @enum {string}
         */
        ValidationState: "valid" | "warning" | "invalid";
        /** WorkloadOptimizationDefault */
        WorkloadOptimizationDefault: {
            /** Workload Class */
            workload_class: string;
            /** Runtime */
            runtime?: string | null;
            /** Runtime Affinity */
            runtime_affinity?: string | null;
            /** Request Modality */
            request_modality?: string | null;
            /** Modality Path */
            modality_path?: string | null;
            /** Profile Id */
            profile_id?: string | null;
            /**
             * Profile Status
             * @default unavailable
             */
            profile_status: string;
            /**
             * Benchmark Backed
             * @default false
             */
            benchmark_backed: boolean;
            /** Reason */
            reason: string;
            /** Recommendation Reason */
            recommendation_reason?: string | null;
        };
        /** AudioTranscriptionCreateRequest */
        AudioTranscriptionCreateRequest: {
            /**
             * Model
             * @default null
             */
            model: string | null;
            /** Audio Base64 */
            audio_base64: string;
            /**
             * File Name
             * @default audio.wav
             */
            file_name: string;
            /**
             * Language
             * @default null
             */
            language: string | null;
            /**
             * Prompt
             * @default null
             */
            prompt: string | null;
        };
        /**
         * AudioTranscriptionMultipartRequest
         * @description Form fields accepted by the multipart form of `/v1/audio/transcriptions`.
         *
         *     The route hand-parses the form because it serves two body shapes, so this
         *     model exists to publish the field names rather than to validate them.
         */
        AudioTranscriptionMultipartRequest: {
            /**
             * File
             * Format: binary
             * @description Audio file to transcribe.
             */
            file: string;
            /**
             * Model
             * @description Model id to transcribe with. LewLM routes to a transcription-capable model when omitted.
             * @default null
             */
            model: string | null;
            /**
             * Language
             * @description Spoken-language hint for the decoder.
             * @default null
             */
            language: string | null;
            /**
             * Prompt
             * @description Optional decoding prompt passed to the backend.
             * @default null
             */
            prompt: string | null;
        };
        /** ChatMessage */
        ChatMessage: {
            /**
             * Role
             * @default user
             * @enum {string}
             */
            role: "system" | "developer" | "user" | "assistant" | "tool";
            /** Content */
            content: string | (components["schemas"]["InputTextPart"] | components["schemas"]["InputImagePart"] | components["schemas"]["InputFilePart"] | components["schemas"]["InputAudioPart"])[];
        };
        /**
         * CitationContextPackage
         * @description Reusable source and chunk packages supplied by a host application.
         */
        CitationContextPackage: {
            /** Sources */
            sources?: components["schemas"]["IngestedDocumentSource"][];
            /** Chunks */
            chunks?: components["schemas"]["DocumentChunk"][];
        };
        /** InputAudioPart */
        InputAudioPart: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "audio" | "input_audio";
            /**
             * Path
             * @default null
             */
            path: string | null;
            /**
             * Upload Name
             * @default null
             */
            upload_name: string | null;
            /**
             * Language
             * @default null
             */
            language: string | null;
            /**
             * Prompt
             * @default null
             */
            prompt: string | null;
        };
        /** InputFilePart */
        InputFilePart: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "file" | "input_file";
            /**
             * Path
             * @default null
             */
            path: string | null;
            /**
             * Upload Name
             * @default null
             */
            upload_name: string | null;
        };
        /** InputImagePart */
        InputImagePart: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "image" | "input_image";
            /**
             * Path
             * @default null
             */
            path: string | null;
            /**
             * Upload Name
             * @default null
             */
            upload_name: string | null;
            /**
             * Detail
             * @default auto
             * @enum {string}
             */
            detail: "auto" | "low" | "high";
        };
        /** InputTextPart */
        InputTextPart: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "input_text" | "text";
            /** Text */
            text: string;
        };
        /**
         * PromptMCPToolDefinition
         * @description Prompt-only local MCP tool metadata surfaced during compilation.
         */
        PromptMCPToolDefinition: {
            /** Name */
            name: string;
            /**
             * Description
             * @default null
             */
            description: string | null;
            /** Input Schema */
            input_schema?: {
                [key: string]: unknown;
            };
            /** Server */
            server: string;
        };
        /**
         * PromptToolDefinition
         * @description Declarative tool metadata that can be folded into a prompt plan.
         */
        PromptToolDefinition: {
            /** Name */
            name: string;
            /**
             * Description
             * @default null
             */
            description: string | null;
            /** Input Schema */
            input_schema?: {
                [key: string]: unknown;
            };
        };
        /**
         * SamplingControls
         * @description Caller-requested decode controls beyond temperature.
         *
         *     Backends differ in which of these they expose, so LewLM passes through what
         *     a runtime supports and reports the rest as unsupported rather than dropping
         *     them silently — a caller that asked for a seed needs to know whether it
         *     actually got determinism.
         */
        SamplingControls: {
            /**
             * Top P
             * @default null
             */
            top_p: number | null;
            /**
             * Top K
             * @default null
             */
            top_k: number | null;
            /**
             * Min P
             * @default null
             */
            min_p: number | null;
            /**
             * Repetition Penalty
             * @default null
             */
            repetition_penalty: number | null;
            /**
             * Presence Penalty
             * @default null
             */
            presence_penalty: number | null;
            /**
             * Frequency Penalty
             * @default null
             */
            frequency_penalty: number | null;
            /**
             * Seed
             * @description Set for reproducible sampling where the backend supports it.
             * @default null
             */
            seed: number | null;
            /**
             * Stop
             * @description Stop sequences that end generation.
             */
            stop?: string[];
        };
        /** ChatCompletionRequest */
        ChatCompletionRequest: {
            /**
             * Model
             * @default null
             */
            model: string | null;
            /**
             * Session Id
             * @default null
             */
            session_id: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             * @default null
             */
            correlation_id: string | null;
            /** Messages */
            messages: components["schemas"]["ChatMessage"][];
            /** @default null */
            citation_context: components["schemas"]["CitationContextPackage"] | null;
            /**
             * Max Tokens
             * @default 512
             */
            max_tokens: number;
            /**
             * Temperature
             * @default 0.7
             */
            temperature: number;
            /**
             * @description Decode controls beyond temperature. Backends differ in support; `metadata.sampling` reports which were applied and which were not.
             * @default null
             */
            sampling: components["schemas"]["SamplingControls"] | null;
            /**
             * Apply Serving Profile
             * @default true
             */
            apply_serving_profile: boolean;
            /**
             * Stream
             * @default false
             */
            stream: boolean;
            /** @default null */
            reasoning_visibility: components["schemas"]["ReasoningVisibility"] | null;
            /**
             * System Prompt
             * @default null
             */
            system_prompt: string | null;
            /**
             * Developer Prompt
             * @default null
             */
            developer_prompt: string | null;
            /**
             * Pretext Path
             * @default null
             */
            pretext_path: string | null;
            /**
             * Skills Path
             * @default null
             */
            skills_path: string | null;
            /**
             * Response Format
             * @default null
             */
            response_format: (components["schemas"]["TextResponseFormat"] | components["schemas"]["JSONSchemaResponseFormat"] | components["schemas"]["GrammarResponseFormat"]) | null;
            /**
             * Response Format Path
             * @default null
             */
            response_format_path: string | null;
            /**
             * Output Schema
             * @default null
             */
            output_schema: {
                [key: string]: unknown;
            } | null;
            /**
             * Output Schema Path
             * @default null
             */
            output_schema_path: string | null;
            /** Tools */
            tools?: components["schemas"]["PromptToolDefinition"][];
            /**
             * Tools Path
             * @default null
             */
            tools_path: string | null;
            /** Mcp Tools */
            mcp_tools?: components["schemas"]["PromptMCPToolDefinition"][];
            /**
             * Mcp Tools Path
             * @default null
             */
            mcp_tools_path: string | null;
            /**
             * Include Prompt Trace
             * @default false
             */
            include_prompt_trace: boolean;
        };
        /** ChatCompletionChunkChoice */
        ChatCompletionChunkChoice: {
            /**
             * Index
             * @default 0
             */
            index: number;
            delta: components["schemas"]["ChatCompletionDelta"];
            /**
             * Finish Reason
             * @default null
             */
            finish_reason: string | null;
        };
        /** ChatCompletionDelta */
        ChatCompletionDelta: {
            /**
             * Role
             * @default null
             */
            role: string | null;
            /**
             * Content
             * @default null
             */
            content: string | null;
            /** @default null */
            reasoning: components["schemas"]["ReasoningOutput"] | null;
        };
        /** ChatCompletionChunk */
        ChatCompletionChunk: {
            /** Id */
            id: string;
            /**
             * Object
             * @default chat.completion.chunk
             * @constant
             */
            object: "chat.completion.chunk";
            /** Created */
            created: number;
            /** Model */
            model: string;
            /** Choices */
            choices: components["schemas"]["ChatCompletionChunkChoice"][];
            /** Citations */
            citations?: components["schemas"]["GeneratedCitationReference"][];
            /**
             * @description Token accounting. Present on the final chunk only, since it is not knowable before then.
             * @default null
             */
            usage: components["schemas"]["CompletionUsage"] | null;
            /** @default null */
            metadata: components["schemas"]["ExecutionMetadata"] | null;
            /** @default null */
            structured_output: components["schemas"]["StructuredOutputResult"] | null;
            /** @default null */
            tool_calls: components["schemas"]["ToolCallParseResult"] | null;
            /**
             * @description Compiled-prompt trace when `include_prompt_trace` was set. Present on the final chunk only, so inspecting the prompt does not cost the caller its stream.
             * @default null
             */
            prompt_trace: components["schemas"]["PromptCompilationTrace"] | null;
            /** @default null */
            serving_profile: components["schemas"]["ServingProfileApplication"] | null;
        };
        /** ResponseInputMessage */
        ResponseInputMessage: {
            /**
             * Role
             * @default user
             * @enum {string}
             */
            role: "system" | "developer" | "user" | "assistant" | "tool";
            /** Content */
            content: string | (components["schemas"]["InputTextPart"] | components["schemas"]["InputImagePart"] | components["schemas"]["InputFilePart"] | components["schemas"]["InputAudioPart"])[];
        };
        /** ResponseCreateRequest */
        ResponseCreateRequest: {
            /**
             * Model
             * @default null
             */
            model: string | null;
            /**
             * Session Id
             * @default null
             */
            session_id: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier echoed back through metadata and events.
             * @default null
             */
            correlation_id: string | null;
            /** Input */
            input: string | components["schemas"]["ResponseInputMessage"][];
            /** @default null */
            citation_context: components["schemas"]["CitationContextPackage"] | null;
            /**
             * Max Output Tokens
             * @default 512
             */
            max_output_tokens: number;
            /**
             * Temperature
             * @default 0.7
             */
            temperature: number;
            /**
             * @description Decode controls beyond temperature. Backends differ in support; `metadata.sampling` reports which were applied and which were not.
             * @default null
             */
            sampling: components["schemas"]["SamplingControls"] | null;
            /**
             * Apply Serving Profile
             * @default true
             */
            apply_serving_profile: boolean;
            /**
             * Stream
             * @default false
             */
            stream: boolean;
            /** @default null */
            reasoning_visibility: components["schemas"]["ReasoningVisibility"] | null;
            /**
             * System Prompt
             * @default null
             */
            system_prompt: string | null;
            /**
             * Developer Prompt
             * @default null
             */
            developer_prompt: string | null;
            /**
             * Pretext Path
             * @default null
             */
            pretext_path: string | null;
            /**
             * Skills Path
             * @default null
             */
            skills_path: string | null;
            /**
             * Response Format
             * @default null
             */
            response_format: (components["schemas"]["TextResponseFormat"] | components["schemas"]["JSONSchemaResponseFormat"] | components["schemas"]["GrammarResponseFormat"]) | null;
            /**
             * Response Format Path
             * @default null
             */
            response_format_path: string | null;
            /**
             * Output Schema
             * @default null
             */
            output_schema: {
                [key: string]: unknown;
            } | null;
            /**
             * Output Schema Path
             * @default null
             */
            output_schema_path: string | null;
            /** Tools */
            tools?: components["schemas"]["PromptToolDefinition"][];
            /**
             * Tools Path
             * @default null
             */
            tools_path: string | null;
            /** Mcp Tools */
            mcp_tools?: components["schemas"]["PromptMCPToolDefinition"][];
            /**
             * Mcp Tools Path
             * @default null
             */
            mcp_tools_path: string | null;
            /**
             * Include Prompt Trace
             * @default false
             */
            include_prompt_trace: boolean;
        };
        /** ResponseChunk */
        ResponseChunk: {
            /** Id */
            id: string;
            /**
             * Object
             * @default response.chunk
             * @constant
             */
            object: "response.chunk";
            /** Created */
            created: number;
            /** Model */
            model: string;
            /**
             * Delta
             * @default null
             */
            delta: string | null;
            /** @default null */
            reasoning: components["schemas"]["ReasoningOutput"] | null;
            /**
             * Done
             * @default false
             */
            done: boolean;
            /** Citations */
            citations?: components["schemas"]["GeneratedCitationReference"][];
            /**
             * @description Token accounting. Present on the final chunk only, since it is not knowable before then.
             * @default null
             */
            usage: components["schemas"]["CompletionUsage"] | null;
            /** @default null */
            metadata: components["schemas"]["ExecutionMetadata"] | null;
            /** @default null */
            structured_output: components["schemas"]["StructuredOutputResult"] | null;
            /** @default null */
            tool_calls: components["schemas"]["ToolCallParseResult"] | null;
            /**
             * @description Compiled-prompt trace when `include_prompt_trace` was set. Present on the final chunk only, so inspecting the prompt does not cost the caller its stream.
             * @default null
             */
            prompt_trace: components["schemas"]["PromptCompilationTrace"] | null;
            /** @default null */
            serving_profile: components["schemas"]["ServingProfileApplication"] | null;
        };
        /**
         * EventScope
         * @enum {string}
         */
        EventScope: "system" | "request" | "job";
        /**
         * EventType
         * @enum {string}
         */
        EventType: "system.ready" | "operation.progress" | "request.accepted" | "request.queued" | "request.failed" | "request.completed" | "prefill.started" | "model.scan.started" | "model.scan.completed" | "model.scan.failed" | "model.load.requested" | "model.load.joined" | "model.loading" | "model.loaded" | "model.load.failed" | "model.usage.acquired" | "model.usage.released" | "model.drain.requested" | "model.draining" | "model.unload.blocked" | "model.unloading" | "model.unloaded" | "model.unload.failed" | "audio.chunk" | "audio.transcription.started" | "audio.transcription.completed" | "audio.transcription.failed" | "audio.speech.started" | "audio.speech.completed" | "audio.speech.failed" | "document.parse.started" | "document.parse.completed" | "document.parse.failed" | "document.render.started" | "document.render.completed" | "document.render.failed" | "document.transform.started" | "document.transform.completed" | "document.transform.failed" | "cluster.token.issued" | "cluster.worker.enrolled" | "cluster.worker.heartbeat" | "cluster.plan.updated" | "cluster.pipeline.stage.completed" | "cluster.pipeline.completed" | "cluster.worker.recovered" | "autotune.completed" | "token.delta" | "reasoning.delta" | "speculation.started" | "speculation.accepted" | "tool.pending" | "tool.started" | "tool.finished" | "tool.failed";
        /**
         * StreamEvent
         * @description An event emitted by LewLM subsystems.
         */
        StreamEvent: {
            /** Event Id */
            event_id?: string;
            type: components["schemas"]["EventType"];
            /** @default system */
            scope: components["schemas"]["EventScope"];
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Payload */
            payload?: {
                [key: string]: unknown;
            };
            /**
             * Request Id
             * @default null
             */
            request_id: string | null;
            /**
             * Correlation Id
             * @description Caller correlation identifier for the request that produced this event.
             * @default null
             */
            correlation_id: string | null;
            /**
             * Model Id
             * @default null
             */
            model_id: string | null;
            /**
             * Runtime
             * @default null
             */
            runtime: string | null;
            /**
             * Capability
             * @default null
             */
            capability: string | null;
            /**
             * Operation
             * @default null
             */
            operation: string | null;
            /**
             * Stage
             * @default null
             */
            stage: string | null;
            /**
             * Status
             * @default null
             */
            status: string | null;
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
    create_chat_completion_v1_chat_completions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "model": "local-chat-model",
                 *       "messages": [
                 *         {
                 *           "role": "user",
                 *           "content": "Return a grounded JSON summary of LewLM for a host application."
                 *         }
                 *       ],
                 *       "citation_context": {
                 *         "sources": [
                 *           {
                 *             "source_id": "source-1",
                 *             "path": "/tmp/integration-bundle.md",
                 *             "source_type": "markdown",
                 *             "source_name": "integration-bundle.md",
                 *             "source_label": "LewLM Integration Bundle",
                 *             "media_type": "text/markdown",
                 *             "metadata": {}
                 *           }
                 *         ],
                 *         "chunks": [
                 *           {
                 *             "chunk_id": "chunk-1",
                 *             "text": "This bundle is app-agnostic and checked in so host applications can map their own contracts onto LewLM without reading implementation files.",
                 *             "source_id": "source-1",
                 *             "section_id": "section-1",
                 *             "source_label": "LewLM Integration Bundle",
                 *             "section_label": "LewLM Integration Bundle / Summary",
                 *             "section_heading": "Summary",
                 *             "section_level": 1,
                 *             "source_name": "integration-bundle.md",
                 *             "source_path": "/tmp/integration-bundle.md",
                 *             "source_type": "markdown",
                 *             "metadata": {
                 *               "chunk_index": 0
                 *             }
                 *           }
                 *         ]
                 *       },
                 *       "response_format": {
                 *         "type": "json_schema",
                 *         "name": "lewlm_summary",
                 *         "schema": {
                 *           "type": "object",
                 *           "properties": {
                 *             "summary": {
                 *               "type": "string"
                 *             }
                 *           },
                 *           "required": [
                 *             "summary"
                 *           ],
                 *           "additionalProperties": false
                 *         }
                 *       },
                 *       "include_prompt_trace": true,
                 *       "stream": false
                 *     }
                 */
                "application/json": components["schemas"]["ChatCompletionRequest"];
                /**
                 * @example {
                 *       "payload_json": "{\"messages\":[{\"role\":\"user\",\"content\":[{\"type\":\"input_text\",\"text\":\"Describe the upload named diagram_0.\"},{\"type\":\"input_image\",\"upload_name\":\"diagram_0\"}]}],\"stream\":false}",
                 *       "diagram_0": "(binary file part)"
                 *     }
                 */
                "multipart/form-data": {
                    /** @description JSON-encoded ChatCompletionRequest payload. */
                    payload_json: string;
                } & {
                    [key: string]: string;
                };
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChatCompletionResponse"];
                    /** @example data: {"id":"req-chat-001","object":"chat.completion.chunk","created":1760000000,"model":"local-chat-model","choices":[{"index":0,"delta":{"role":"assistant","content":"LewLM exposes a stable backend contract."}}],"citations":[]} */
                    "text/event-stream": string;
                };
            };
        };
    };
    create_response_v1_responses_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "model": "local-chat-model",
                 *       "input": "Return a grounded JSON summary of LewLM for a host application.",
                 *       "citation_context": {
                 *         "sources": [
                 *           {
                 *             "source_id": "source-1",
                 *             "path": "/tmp/integration-bundle.md",
                 *             "source_type": "markdown",
                 *             "source_name": "integration-bundle.md",
                 *             "source_label": "LewLM Integration Bundle",
                 *             "media_type": "text/markdown",
                 *             "metadata": {}
                 *           }
                 *         ],
                 *         "chunks": [
                 *           {
                 *             "chunk_id": "chunk-1",
                 *             "text": "This bundle is app-agnostic and checked in so host applications can map their own contracts onto LewLM without reading implementation files.",
                 *             "source_id": "source-1",
                 *             "section_id": "section-1",
                 *             "source_label": "LewLM Integration Bundle",
                 *             "section_label": "LewLM Integration Bundle / Summary",
                 *             "section_heading": "Summary",
                 *             "section_level": 1,
                 *             "source_name": "integration-bundle.md",
                 *             "source_path": "/tmp/integration-bundle.md",
                 *             "source_type": "markdown",
                 *             "metadata": {
                 *               "chunk_index": 0
                 *             }
                 *           }
                 *         ]
                 *       },
                 *       "response_format": {
                 *         "type": "json_schema",
                 *         "name": "lewlm_summary",
                 *         "schema": {
                 *           "type": "object",
                 *           "properties": {
                 *             "summary": {
                 *               "type": "string"
                 *             }
                 *           },
                 *           "required": [
                 *             "summary"
                 *           ],
                 *           "additionalProperties": false
                 *         }
                 *       },
                 *       "include_prompt_trace": true,
                 *       "stream": false
                 *     }
                 */
                "application/json": components["schemas"]["ResponseCreateRequest"];
                /**
                 * @example {
                 *       "payload_json": "{\"input\":[{\"role\":\"user\",\"content\":[{\"type\":\"input_text\",\"text\":\"Describe the upload named note_0.\"},{\"type\":\"input_file\",\"upload_name\":\"note_0\"}]}],\"stream\":false}",
                 *       "note_0": "(binary file part)"
                 *     }
                 */
                "multipart/form-data": {
                    /** @description JSON-encoded ResponseCreateRequest payload. */
                    payload_json: string;
                } & {
                    [key: string]: string;
                };
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResponseCreateResponse"];
                    /** @example data: {"id":"req-response-001","object":"response.chunk","created":1760000000,"model":"local-chat-model","delta":"LewLM exposes a stable backend contract.","done":false,"citations":[]} */
                    "text/event-stream": string;
                };
            };
        };
    };
    cluster_status_v1_cluster_status_get: {
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
                    "application/json": components["schemas"]["ClusterStatus"];
                };
            };
        };
    };
    issue_cluster_token_v1_cluster_tokens_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClusterTokenIssueRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClusterIssueTokenResponse"];
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
    enroll_cluster_worker_v1_cluster_workers_enroll_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClusterEnrollWorkerRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClusterEnrollWorkerResponse"];
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
    cluster_worker_heartbeat_v1_cluster_workers_heartbeat_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClusterHeartbeatRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
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
    cluster_plan_v1_cluster_plans_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClusterPlanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DistributedExecutionPlan"];
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
    cluster_pipeline_stage_v1_cluster_worker_pipeline_stage_post: {
        parameters: {
            query?: never;
            header?: {
                authorization?: string | null;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClusterStageRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClusterStageResponse"];
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
    generate_document_v1_documents_generate_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentGenerateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentGenerateResponse"];
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
    ingest_document_v1_documents_ingest_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentIngestRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentIngestResponse"];
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
    transform_document_v1_documents_transform_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContractTextReplacementRequest"] | components["schemas"]["ReceiptExtractionRequest"] | components["schemas"]["OCRAssistedExtractionRequest"] | components["schemas"]["BrandedDocumentTemplateRequest"] | components["schemas"]["FileTemplateTransformRequest"] | components["schemas"]["DocumentComparisonRequest"] | components["schemas"]["MeetingTranscriptNotesRequest"] | components["schemas"]["LongDocumentMemoRequest"] | components["schemas"]["SpeechTranscriptCleanupRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DocumentTransformResponse"];
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
    stream_events_v1_events_get: {
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
                    "application/json": unknown;
                    /**
                     * @example event: request.completed
                     *     data: {"event_id":"evt-001","type":"request.completed","scope":"request","created_at":"2026-04-17T17:46:33Z","payload":{"request_id":"req-chat-001","path":"/v1/chat/completions"}}
                     */
                    "text/event-stream": string;
                };
            };
        };
    };
    health_v1_health_get: {
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
    list_sessions_v1_sessions_get: {
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
                    "application/json": components["schemas"]["SessionListResponse"];
                };
            };
        };
    };
    create_session_v1_sessions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SessionCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionRecord"];
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
    get_session_v1_sessions__session_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
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
                    "application/json": components["schemas"]["SessionDetail"];
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
    delete_session_v1_sessions__session_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
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
                    "application/json": components["schemas"]["SessionDeleteResponse"];
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
    update_session_v1_sessions__session_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SessionUpdateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionRecord"];
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
    get_session_messages_v1_sessions__session_id__messages_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
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
                    "application/json": components["schemas"]["SessionMessagesResponse"];
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
    export_session_v1_sessions__session_id__export_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
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
                    "application/json": components["schemas"]["SessionExportBundle"];
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
    import_session_v1_sessions_import_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SessionImportRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionDetail"];
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
    lewlm_capabilities_v1_lewlm_capabilities_get: {
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
                    "application/json": components["schemas"]["LewLMMiddlewareCapabilitiesReport"];
                };
            };
        };
    };
    probe_lewlm_capabilities_v1_lewlm_probes_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LewLMProbeRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LewLMProbeResponse"];
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
    plan_lewlm_conversion_v1_lewlm_conversions_plan_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LewLMConversionPlanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConversionTargetPlanningReport"];
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
    create_lewlm_conversion_v1_lewlm_conversions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConversionJobRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobRecord"];
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
    get_lewlm_conversion_v1_lewlm_conversions__job_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                job_id: string;
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
                    "application/json": components["schemas"]["JobRecord"];
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
    create_lewlm_benchmark_v1_lewlm_benchmarks_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LewLMBenchmarkRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
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
    lewlm_model_artifacts_v1_lewlm_models__model_id__artifacts_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                model_id: string;
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
                    "application/json": components["schemas"]["ModelArtifactLineageReport"];
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
    list_models_v1_models_get: {
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
                    "application/json": components["schemas"]["ModelInventory"];
                };
            };
        };
    };
    get_model_v1_models__model_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                model_id: string;
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
                    "application/json": components["schemas"]["ModelDetail"];
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
    model_capabilities_v1_models__model_id__capabilities_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                model_id: string;
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
                    "application/json": components["schemas"]["ModelCapabilityReport"];
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
    scan_models_v1_models_scan_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ModelScanRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ModelScanSummary"];
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
    convert_model_v1_models_convert_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConversionJobRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["JobRecord"];
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
    warm_model_v1_models__model_id__warm_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                model_id: string;
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
                    "application/json": components["schemas"]["ModelLifecycleResponse"];
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
    unload_model_v1_models__model_id__unload_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                model_id: string;
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
                    "application/json": components["schemas"]["ModelLifecycleResponse"];
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
    drain_model_v1_models__model_id__drain_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                model_id: string;
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
                    "application/json": components["schemas"]["ModelLifecycleResponse"];
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
    create_drain_operation_v1_models__model_id__drain_operations_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                model_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AsyncDrainRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LifecycleOperationRecord"];
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
    model_residency_v1_models__model_id__residency_get: {
        parameters: {
            query?: {
                runtime?: string | null;
            };
            header?: never;
            path: {
                model_id: string;
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
                    "application/json": components["schemas"]["ModelResidencySnapshot"] | null;
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
    create_embeddings_v1_embeddings_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmbeddingCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmbeddingCreateResponse"];
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
    rerank_documents_v1_rerank_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RerankCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RerankCreateResponse"];
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
    retrieve_context_v1_retrieval_context_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "query": "typed helper for host applications",
                 *       "candidate_sources": [
                 *         {
                 *           "source_id": "source-1",
                 *           "path": "/tmp/app-notes.md",
                 *           "source_type": "markdown",
                 *           "source_name": "app-notes.md",
                 *           "source_label": "app-notes.md"
                 *         }
                 *       ],
                 *       "candidate_chunks": [
                 *         {
                 *           "chunk_id": "chunk-1",
                 *           "text": "LewLM exposes typed helper methods for host applications.",
                 *           "source_id": "source-1",
                 *           "section_id": "section-1",
                 *           "source_label": "app-notes.md",
                 *           "section_label": "app-notes.md / Section 1"
                 *         },
                 *         {
                 *           "chunk_id": "chunk-2",
                 *           "text": "This unrelated note is about weather forecasts.",
                 *           "source_id": "source-1",
                 *           "section_id": "section-2",
                 *           "source_label": "app-notes.md",
                 *           "section_label": "app-notes.md / Section 2"
                 *         }
                 *       ],
                 *       "top_k": 1
                 *     }
                 */
                "application/json": components["schemas"]["RetrievalContextRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RetrievalContextResponse"];
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
    count_tokens_v1_tokenize_count_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TokenCountRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TokenCountResponse"];
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
    transcribe_audio_v1_audio_transcriptions_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["AudioTranscriptionMultipartRequest"];
                "application/json": components["schemas"]["AudioTranscriptionCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AudioTranscriptionCreateResponse"];
                };
            };
        };
    };
    list_audio_voices_v1_audio_voices_get: {
        parameters: {
            query?: {
                model?: string | null;
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
                    "application/json": components["schemas"]["AudioVoiceInventory"];
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
    synthesize_speech_v1_audio_speech_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AudioSpeechCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AudioSpeechCreateResponse"];
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
    runtime_info_v1_runtime_get: {
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
                    "application/json": components["schemas"]["RuntimeInfo"];
                };
            };
        };
    };
    runtime_residencies_v1_runtime_residencies_get: {
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
                    "application/json": components["schemas"]["ModelResidencySnapshot"][];
                };
            };
        };
    };
    get_lifecycle_operation_v1_model_lifecycle_operations__operation_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                operation_id: string;
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
                    "application/json": components["schemas"]["LifecycleOperationRecord"];
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
    cancel_lifecycle_operation_v1_model_lifecycle_operations__operation_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                operation_id: string;
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
                    "application/json": components["schemas"]["LifecycleOperationRecord"];
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
    get_job_v1_jobs__job_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                job_id: string;
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
                    "application/json": components["schemas"]["JobRecord"];
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
    cache_stats_v1_cache_stats_get: {
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
                    "application/json": components["schemas"]["CacheStats"];
                };
            };
        };
    };
    runtime_stats_v1_runtime_stats_get: {
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
                    "application/json": components["schemas"]["RuntimeStats"];
                };
            };
        };
    };
    cluster_stats_v1_cluster_stats_get: {
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
                    "application/json": components["schemas"]["ClusterStatus"];
                };
            };
        };
    };
    list_serving_profiles_v1_serving_profiles_get: {
        parameters: {
            query?: {
                model?: string | null;
                capability?: string | null;
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
                    "application/json": components["schemas"]["ServingProfileInventory"];
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
    autotune_v1_benchmarks_autotune_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AutotuneRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ServingProfileRecommendation"];
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
    list_skills_v1_skills_get: {
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
                    "application/json": components["schemas"]["SkillListResponse"];
                };
            };
        };
    };
    get_skill_v1_skills__skill_name__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                skill_name: string;
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
                    "application/json": components["schemas"]["BuiltInSkillDescriptor"];
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
    list_tools_v1_tools_get: {
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
                    /**
                     * @example {
                     *       "count": 1,
                     *       "items": [
                     *         {
                     *           "name": "documents.generate",
                     *           "version": "1.0.0",
                     *           "description": "Render a structured DocumentIR payload into a deterministic output artifact.",
                     *           "execution_mode": "local",
                     *           "required_authorization": "document_generate",
                     *           "result_type": "artifact",
                     *           "input_schema": {
                     *             "type": "object",
                     *             "properties": {
                     *               "output_format": {
                     *                 "type": "string"
                     *               },
                     *               "document": {
                     *                 "type": "object"
                     *               },
                     *               "file_name": {
                     *                 "type": "string"
                     *               },
                     *               "idempotency_key": {
                     *                 "type": "string"
                     *               }
                     *             },
                     *             "required": [
                     *               "output_format",
                     *               "document"
                     *             ]
                     *           },
                     *           "tags": [
                     *             "documents",
                     *             "generation",
                     *             "local"
                     *           ],
                     *           "aliases": [
                     *             "document_generate"
                     *           ]
                     *         }
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["ToolListResponse"];
                };
            };
        };
    };
    get_tool_v1_tools__tool_name__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tool_name: string;
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
                    /**
                     * @example {
                     *       "name": "documents.generate",
                     *       "version": "1.0.0",
                     *       "description": "Render a structured DocumentIR payload into a deterministic output artifact.",
                     *       "execution_mode": "local",
                     *       "required_authorization": "document_generate",
                     *       "result_type": "artifact",
                     *       "input_schema": {
                     *         "type": "object",
                     *         "properties": {
                     *           "output_format": {
                     *             "type": "string"
                     *           },
                     *           "document": {
                     *             "type": "object"
                     *           },
                     *           "file_name": {
                     *             "type": "string"
                     *           },
                     *           "idempotency_key": {
                     *             "type": "string"
                     *           }
                     *         },
                     *         "required": [
                     *           "output_format",
                     *           "document"
                     *         ]
                     *       },
                     *       "tags": [
                     *         "documents",
                     *         "generation",
                     *         "local"
                     *       ],
                     *       "aliases": [
                     *         "document_generate"
                     *       ]
                     *     }
                     */
                    "application/json": components["schemas"]["LocalToolDescriptor"];
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
    execute_tool_v1_tools_execute_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentGenerateToolRequest"] | components["schemas"]["DocumentIngestToolRequest"] | components["schemas"]["DocumentTransformToolRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "request_id": "tool-001",
                     *       "tool": "documents.generate",
                     *       "idempotent_replay": false,
                     *       "trace": {
                     *         "tool": "documents.generate",
                     *         "version": "1.0.0",
                     *         "execution_mode": "local",
                     *         "actor": "api",
                     *         "required_authorization": "document_generate",
                     *         "started_at": "2026-04-18T22:00:00Z",
                     *         "completed_at": "2026-04-18T22:00:00Z",
                     *         "duration_ms": 14,
                     *         "summary": "Generated one deterministic markdown artifact.",
                     *         "details": {
                     *           "file_name": "starter-proof.md"
                     *         }
                     *       },
                     *       "result": {
                     *         "artifact": {
                     *           "file_name": "starter-proof.md",
                     *           "media_type": "text/markdown",
                     *           "output_format": "markdown"
                     *         }
                     *       }
                     *     }
                     */
                    "application/json": components["schemas"]["ToolExecutionEnvelope"];
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
