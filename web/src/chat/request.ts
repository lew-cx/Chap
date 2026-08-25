/**
 * Composer state → a LewLM request.
 *
 * One function builds the payload and one type describes the state, so the
 * request inspector shows exactly what went over the wire — it re-renders the
 * same object `send()` passes to the client, not a reconstruction of it.
 *
 * The two surfaces differ only in field names (`messages`/`input`,
 * `max_tokens`/`max_output_tokens`); everything else is shared, which is the
 * point worth demonstrating.
 */

import {
  partTypeFor,
  type ChatCompletionRequest,
  type ChatMessage,
  type CitationContextPackage,
  type GrammarResponseFormat,
  type JSONSchemaResponseFormat,
  type ReasoningVisibility,
  type ResponseCreateRequest,
  type ResponseInputMessage,
  type SamplingControls,
  type Upload,
} from '@chap/lewlm';

import { compactSampling } from './SamplingPanel.tsx';

export type Surface = 'chat' | 'responses';
export type FormatMode = 'text' | 'json_schema' | 'grammar';

export interface FormatState {
  mode: FormatMode;
  /** JSON Schema source, edited as text so an invalid draft stays editable. */
  schemaText: string;
  grammarText: string;
  syntax: string;
  name: string;
  strict: boolean;
}

/** One pasted passage the model may cite. */
export interface ContextSource {
  label: string;
  text: string;
}

export interface Attachment {
  uploadName: string;
  file: File;
}

export interface ComposerState {
  surface: Surface;
  stream: boolean;
  model: string;
  /**
   * Held as typed text, not as a number.
   *
   * `Number('')` is `0`, so a field that coerces on every keystroke cannot be
   * cleared — it snaps back to zero as the last digit goes, and sends a request
   * asking for zero tokens. The bounds below are applied once, on the way into
   * the payload, which is also the only place they can be enforced honestly.
   */
  maxTokens: string;
  temperature: string;
  sampling: SamplingControls;
  reasoningVisibility: ReasoningVisibility;
  applyServingProfile: boolean;
  includePromptTrace: boolean;
  systemPrompt: string;
  format: FormatState;
  context: ContextSource[];
  /**
   * When set, LewLM owns the history: Chap sends only the new message and the
   * session's `context_policy` decides what the model sees.
   */
  sessionId: string | null;
}

/** Bounds for the two free-typed numbers, shared by the inputs and the builder. */
export const MAX_TOKENS = { min: 1, max: 4096, fallback: 256 };
export const TEMPERATURE = { min: 0, max: 2, fallback: 0.7 };

/** A typed number, clamped to its field's range. Blank and junk take the default. */
export function clamped(raw: string, bounds: { min: number; max: number; fallback: number }): number {
  const parsed = Number(raw);
  if (raw.trim() === '' || !Number.isFinite(parsed)) return bounds.fallback;
  return Math.min(bounds.max, Math.max(bounds.min, parsed));
}

export const INITIAL_FORMAT: FormatState = {
  mode: 'text',
  schemaText: '{\n  "type": "object",\n  "properties": {\n    "answer": { "type": "string" }\n  },\n  "required": ["answer"]\n}',
  grammarText: 'root ::= "yes" | "no"',
  syntax: 'gbnf',
  name: 'chap_output',
  strict: true,
};

export interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

type ResponseFormat = JSONSchemaResponseFormat | GrammarResponseFormat | { type: 'text' };

/**
 * The response format, or the reason it cannot be built. Returned rather than
 * thrown so the composer can disable Send and show the parse error in place
 * instead of failing after a round trip.
 */
export function parseFormat(format: FormatState): { value: ResponseFormat | null; error: string | null } {
  if (format.mode === 'text') return { value: null, error: null };

  if (format.mode === 'grammar') {
    return format.grammarText.trim()
      ? {
          value: {
            type: 'grammar',
            grammar: format.grammarText,
            syntax: format.syntax,
            name: format.name || null,
            strict: format.strict,
          },
          error: null,
        }
      : { value: null, error: 'grammar is empty' };
  }

  try {
    const schema = JSON.parse(format.schemaText) as Record<string, unknown>;
    return {
      value: { type: 'json_schema', schema, name: format.name || null, strict: format.strict },
      error: null,
    };
  } catch (cause) {
    return { value: null, error: (cause as Error).message };
  }
}

/**
 * The id each pasted passage will actually carry, aligned to `sources` — `null`
 * where a source is dropped for being empty.
 *
 * Exported because the panel has to label a passage with the id that is sent,
 * not with its position on screen. Numbering the two independently is what let
 * them disagree: an empty source above a filled one shifted every id below it,
 * and the panel went on showing the unshifted ones.
 */
export function citationIds(sources: readonly ContextSource[]): (string | null)[] {
  let next = 0;
  return sources.map((source) => (source.text.trim() ? `chap-${next++}` : null));
}

/**
 * Pasted passages, packaged the way `/v1/documents/ingest` would package a real
 * document — so the citations LewLM returns resolve against the same ids, and
 * M9 can swap the retrieval store in behind an unchanged shape.
 */
export function buildCitationContext(sources: ContextSource[]): CitationContextPackage | null {
  const ids = citationIds(sources);
  const usable = sources
    .map((source, index) => ({ source, id: ids[index] ?? null }))
    .filter((entry): entry is { source: ContextSource; id: string } => entry.id !== null);
  if (usable.length === 0) return null;

  const named = usable.map((entry, position) => ({
    ...entry,
    name: entry.source.label || `source ${position + 1}`,
  }));

  return {
    sources: named.map((entry) => ({
      source_id: entry.id,
      source_type: 'text',
      source_name: entry.name,
      source_label: entry.name,
    })),
    chunks: named.map((entry) => ({
      chunk_id: `${entry.id}#0`,
      text: entry.source.text,
      source_id: entry.id,
      section_id: `${entry.id}:body`,
      source_label: entry.name,
      section_label: 'body',
    })),
  };
}

/** Content parts for a message that carries attachments. */
function contentParts(text: string, attachments: Attachment[]) {
  return [
    { type: 'text' as const, text },
    ...attachments.map((attachment) => ({
      type: partTypeFor(attachment.file.type),
      upload_name: attachment.uploadName,
    })),
  ];
}

export interface BuiltRequest {
  endpoint: '/v1/chat/completions' | '/v1/responses';
  payload: ChatCompletionRequest | ResponseCreateRequest;
  uploads: Upload[];
}

export function buildRequest(
  state: ComposerState,
  history: Turn[],
  prompt: string,
  attachments: Attachment[],
): BuiltRequest {
  const sampling = compactSampling(state.sampling);
  const format = parseFormat(state.format).value;
  const citationContext = buildCitationContext(state.context);

  // Every field both surfaces share, spelled once.
  const shared = {
    ...(state.model ? { model: state.model } : {}),
    ...(state.sessionId ? { session_id: state.sessionId } : {}),
    temperature: clamped(state.temperature, TEMPERATURE),
    stream: state.stream,
    apply_serving_profile: state.applyServingProfile,
    reasoning_visibility: state.reasoningVisibility,
    ...(state.includePromptTrace ? { include_prompt_trace: true } : {}),
    ...(state.systemPrompt.trim() ? { system_prompt: state.systemPrompt } : {}),
    ...(sampling ? { sampling } : {}),
    ...(format ? { response_format: format } : {}),
    ...(citationContext ? { citation_context: citationContext } : {}),
  };

  const content = attachments.length > 0 ? contentParts(prompt, attachments) : prompt;
  const uploads: Upload[] = attachments.map((attachment) => ({
    uploadName: attachment.uploadName,
    file: attachment.file,
    fileName: attachment.file.name,
  }));

  // With a session attached, resending the transcript would duplicate what
  // LewLM already stores and would bypass the session's context policy.
  const priorTurns = state.sessionId ? [] : history;

  if (state.surface === 'responses') {
    const input: ResponseInputMessage[] = [
      ...priorTurns.map((turn) => ({ role: turn.role, content: turn.text })),
      { role: 'user', content },
    ];
    return {
      endpoint: '/v1/responses',
      payload: { ...shared, input, max_output_tokens: clamped(state.maxTokens, MAX_TOKENS) },
      uploads,
    };
  }

  const messages: ChatMessage[] = [
    ...priorTurns.map((turn) => ({ role: turn.role, content: turn.text })),
    { role: 'user', content },
  ];
  return {
    endpoint: '/v1/chat/completions',
    payload: { ...shared, messages, max_tokens: clamped(state.maxTokens, MAX_TOKENS) },
    uploads,
  };
}

/**
 * The same request as a runnable `curl`, against Chap's own origin — the proxy
 * adds the API key, so what you paste into a terminal is what the browser sent.
 */
export function toCurl(built: BuiltRequest, origin: string): string {
  const streaming = (built.payload as { stream?: boolean }).stream !== false;
  const lines = [
    `curl ${streaming ? '-N ' : ''}${origin}${built.endpoint} \\`,
    `  -H 'content-type: application/json' \\`,
    `  -H 'accept: ${streaming ? 'text/event-stream' : 'application/json'}' \\`,
    `  -H 'x-lewlm-application-id: chap' \\`,
    `  -d '${JSON.stringify(built.payload).replace(/'/g, `'\\''`)}'`,
  ];
  if (built.uploads.length > 0) {
    // Multipart is not worth reconstructing as a copyable command; say so.
    lines.push(
      `\n# ${built.uploads.length} attachment(s) were sent as multipart parts;`,
      `# this command omits them and sends the JSON body only.`,
    );
  }
  return lines.join('\n');
}
