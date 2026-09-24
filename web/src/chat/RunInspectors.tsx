/**
 * What LewLM did with the run, after the fact.
 *
 * Each inspector reads one field of the final event and reports it verbatim.
 * Nothing here interprets, smooths over or hides a result — when structured
 * output falls back to prompt-guided, or a tool call fails to parse, that is the
 * interesting outcome and the reason to have a bench at all.
 */

import type {
  GeneratedCitationReference,
  PromptCompilationTrace,
  StreamErrorEnvelope,
  StructuredOutputResult,
  ToolCallParseResult,
} from '@chap/lewlm';

import { Disclosure } from '../components/Disclosure.tsx';
import { CopyButton, Json } from '../components/Json.tsx';
import { Stat } from '../components/Field.tsx';
import type { BuiltRequest } from './request.ts';
import { toCurl } from './request.ts';

export interface RunResult {
  finishReason: string | null;
  error: StreamErrorEnvelope | null;
  citations: GeneratedCitationReference[];
  structuredOutput: StructuredOutputResult | null;
  toolCalls: ToolCallParseResult | null;
  promptTrace: PromptCompilationTrace | null;
  request: BuiltRequest;
}

export function RunInspectors({ result }: { result: RunResult }) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="panel grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="finish reason" value={result.finishReason ?? 'unknown'} />
        <Stat label="complete" value={result.error ? 'no — partial output' : result.finishReason === 'length' ? 'no — token limit' : 'yes'} />
      </div>
      {result.error && (
        <Disclosure label="stream interrupted" flagged hint={result.error.code} open>
          <p className="text-sm" style={{ color: 'var(--skin-danger)' }}>{result.error.message}</p>
          <Json value={result.error} />
        </Disclosure>
      )}
      {result.citations.length > 0 && <Citations citations={result.citations} />}
      {result.structuredOutput?.requested && (
        <StructuredOutput result={result.structuredOutput} />
      )}
      {result.toolCalls && <ToolCalls result={result.toolCalls} />}
      {result.promptTrace && <PromptTrace trace={result.promptTrace} />}
      <RequestInspector request={result.request} />
    </div>
  );
}

function Citations({ citations }: { citations: GeneratedCitationReference[] }) {
  return (
    <Disclosure label="citations" hint={`${citations.length} resolved`}>
      <div className="flex flex-col gap-1">
        {citations.map((citation) => (
          <div key={citation.reference_id} className="row flex items-baseline gap-3 py-1">
            <span className="numeric" style={{ color: 'var(--skin-accent)' }}>
              {citation.reference_id}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">
              {citation.source_label}
              {citation.section_label ? ` · ${citation.section_label}` : ''}
            </span>
            {/* The chunk id is what makes a citation checkable rather than
                decorative — it points at the exact text that was supplied. */}
            <span className="numeric" style={{ color: 'var(--skin-faint)' }}>
              {citation.chunk_id ?? citation.source_id}
            </span>
          </div>
        ))}
      </div>
    </Disclosure>
  );
}

function StructuredOutput({ result }: { result: StructuredOutputResult }) {
  const issues = result.validation?.issues ?? [];
  const fellBack = result.fallback_used === true;
  const invalid = result.validation?.state === 'invalid';

  return (
    <Disclosure
      label="structured output"
      flagged={fellBack || invalid}
      hint={`${result.enforcement ?? 'none'}${fellBack ? ' · fell back' : ''}${
        invalid ? ' · invalid' : ''
      }`}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="enforcement" value={result.enforcement ?? '—'} />
        <Stat label="decoder enforced" value={result.decoder_enforced ? 'yes' : 'no'} />
        <Stat label="validation" value={result.validation?.state ?? '—'} />
        <Stat label="validator" value={result.validation?.validator ?? '—'} />
      </div>

      {/*
       * The most important line on this panel. `decode_time` means the runtime
       * could not produce invalid output; `prompt_guided` means it was merely
       * asked nicely, and the reason says why the stronger guarantee was
       * unavailable. Chap shows the difference rather than reporting success.
       */}
      {fellBack && (
        <p className="mt-2 text-sm" style={{ color: 'var(--skin-warn)' }}>
          fell back to {result.enforcement}: {result.fallback_reason ?? 'no reason given'}
        </p>
      )}

      {issues.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {issues.map((issue, index) => (
            <p key={index} className="numeric" style={{ color: 'var(--skin-danger)' }}>
              {issue.path?.length ? `${issue.path.join('.')} — ` : ''}
              {issue.code}: {issue.message}
            </p>
          ))}
        </div>
      )}

      {result.parsed_output !== undefined && result.parsed_output !== null && (
        <div className="mt-2">
          <Json value={result.parsed_output} />
        </div>
      )}
    </Disclosure>
  );
}

function ToolCalls({ result }: { result: ToolCallParseResult }) {
  const calls = result.tool_calls ?? [];
  const issues = result.issues ?? [];

  return (
    <Disclosure
      label="tool calls"
      flagged={result.status === 'failed' || result.status === 'partial'}
      hint={`${result.status}${calls.length ? ` · ${calls.map((call) => call.name).join(', ')}` : ''}`}
    >
      {/* Parsed and validated by LewLM against the declared input schemas.
          Chap parses nothing — that was the whole argument of gap G2. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="parser" value={result.parser ?? '—'} />
        <Stat label="calls" value={calls.length} />
        <Stat label="parallel" value={result.parallel ? 'yes' : 'no'} />
        <Stat label="issues" value={issues.length} />
      </div>

      {calls.length > 0 && (
        <div className="mt-2">
          <Json value={calls} />
        </div>
      )}

      {issues.map((issue, index) => (
        <p key={index} className="numeric mt-1" style={{ color: 'var(--skin-warn)' }}>
          {issue.code}: {issue.message}
        </p>
      ))}
    </Disclosure>
  );
}

function PromptTrace({ trace }: { trace: PromptCompilationTrace }) {
  return (
    <Disclosure label="prompt trace" hint={trace.selected_template}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="template" value={trace.selected_template} />
        <Stat label="template version" value={trace.model_prompt_template?.version ?? '—'} />
        <Stat label="matched on" value={trace.model_prompt_template?.source ?? '—'} />
        <Stat label="messages" value={trace.message_count} />
        <Stat label="roles" value={(trace.message_roles ?? []).join(' ') || '—'} />
        <Stat label="attachments" value={(trace.attachment_plan ?? []).length} />
        <Stat label="tools" value={(trace.tool_plan ?? []).length} />
        <Stat label="contract" value={trace.output_contract?.format ?? 'text'} />
      </div>

      {(trace.overrides ?? []).map((override, index) => (
        <p key={index} className="numeric mt-1" style={{ color: 'var(--skin-faint)' }}>
          {override.scope}: {override.summary}
        </p>
      ))}

      {/*
       * The compiled prompt, exactly as the model received it — template markers
       * and all. This is the single most useful thing on the screen when a
       * session's context policy or a skill file is not doing what you expect.
       */}
      {trace.serialized_model_prompt && (
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="micro-label">serialized prompt</span>
            <CopyButton text={trace.serialized_model_prompt} />
          </div>
          <Json value={trace.serialized_model_prompt} maxHeight="24rem" />
        </div>
      )}
    </Disclosure>
  );
}

function RequestInspector({ request }: { request: BuiltRequest }) {
  const body = JSON.stringify(request.payload, null, 2);
  const curl = toCurl(request, location.origin);

  return (
    <Disclosure label="request" hint={request.endpoint}>
      <div className="mb-1 flex items-center justify-between">
        <span className="micro-label">body</span>
        <div className="flex gap-2">
          <CopyButton text={body} label="copy json" />
          <CopyButton text={curl} label="copy curl" />
        </div>
      </div>
      <Json value={body} />
    </Disclosure>
  );
}
