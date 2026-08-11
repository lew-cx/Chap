/**
 * Chat streaming, normalized.
 *
 * LewLM has two text-generation surfaces with different chunk shapes:
 * `/v1/chat/completions` emits `ChatCompletionChunk` (OpenAI-ish, deltas nested
 * under `choices[0].delta`) and `/v1/responses` emits `ResponseChunk` (flat
 * `delta` string, explicit `done`). Both are mapped onto one union here, so the
 * entire chat UI is written once and switching surfaces is a one-line change.
 *
 * This is the only file in the package with real logic. Every narrowing rule
 * below is a verified LewLM behaviour, noted where it is easy to get wrong.
 */

import type { Client, RequestOptions } from './http.ts';
import { connectionError } from './errors.ts';
import { readSSE } from './sse.ts';
import type {
  ChatCompletionChunk,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ExecutionMetadata,
  GeneratedCitationReference,
  PromptCompilationTrace,
  ReasoningOutput,
  ResponseChunk,
  ResponseCreateRequest,
  ResponseCreateResponse,
  CompletionUsage,
  ServingProfileApplication,
  StructuredOutputResult,
  ToolCallParseResult,
} from './types.ts';

export type ChatStreamEvent =
  /** First chunk. Carries the serving profile, which appears nowhere else. */
  | { type: 'open'; servingProfile: ServingProfileApplication | null }
  | { type: 'text'; delta: string }
  /**
   * Not a delta. LewLM sends the whole `ReasoningOutput` object on every token,
   * so the consumer must REPLACE its reasoning state, not append to it.
   */
  | { type: 'reasoning'; reasoning: ReasoningOutput }
  /** Terminal payload: everything LewLM only knows once generation finished. */
  | {
      type: 'final';
      finishReason: string | null;
      citations: GeneratedCitationReference[];
      metadata: ExecutionMetadata | null;
      structuredOutput: StructuredOutputResult | null;
      /**
       * LewLM parses tool calls out of the model's output and validates them
       * against the declared `tools` schemas. Chap does no parsing of its own.
       * `null` when no tools were declared — distinct from a `status` of
       * `no_tool_calls`, which means tools were offered and none were called.
       */
      toolCalls: ToolCallParseResult | null;
      /**
       * Real token counts, not a delta count. `usage.measured` distinguishes
       * figures from the runtime's own tokenizer from estimates, so a rate
       * readout can refuse to show a number it cannot stand behind.
       */
      usage: CompletionUsage | null;
      /**
       * How LewLM actually assembled the prompt, when `include_prompt_trace`
       * asked for it. Present on the terminal chunk of both streaming surfaces
       * and on both sync responses, so inspecting the prompt no longer costs
       * the transport.
       */
      promptTrace: PromptCompilationTrace | null;
    }
  | { type: 'done' };

export interface StreamOptions {
  signal?: AbortSignal | undefined;
  /** Multipart attachments. When present the request is sent as form data. */
  form?: FormData | undefined;
  /** Groups this generation with related calls such as sentence synthesis. */
  correlationId?: string | undefined;
}

function requestOptions(payload: unknown, options: StreamOptions): RequestOptions {
  if (options.form) {
    // LewLM reads the JSON body from a `payload_json` part on multipart requests.
    options.form.set('payload_json', JSON.stringify(payload));
    return {
      form: options.form,
      accept: 'text/event-stream',
      signal: options.signal,
      correlationId: options.correlationId,
    };
  }
  return {
    json: payload,
    accept: 'text/event-stream',
    signal: options.signal,
    correlationId: options.correlationId,
  };
}

/** Stream `/v1/chat/completions`. */
export async function* streamChat(
  client: Client,
  request: ChatCompletionRequest,
  options: StreamOptions = {},
): AsyncGenerator<ChatStreamEvent> {
  const res = await client.raw(
    'POST',
    '/v1/chat/completions',
    requestOptions({ ...request, stream: true }, options),
  );

  let opened = false;

  for await (const frame of readSSE(res)) {
    if (frame.data === '[DONE]') {
      yield { type: 'done' };
      return;
    }

    const chunk = JSON.parse(frame.data) as ChatCompletionChunk;

    // `serving_profile` is attached to the first chunk only, so this is the one
    // opportunity to read which profile LewLM applied to the run.
    if (!opened) {
      opened = true;
      yield { type: 'open', servingProfile: chunk.serving_profile ?? null };
    }

    const choice = chunk.choices[0];
    if (choice?.delta.reasoning) {
      yield { type: 'reasoning', reasoning: choice.delta.reasoning };
    }
    if (choice?.delta.content) {
      yield { type: 'text', delta: choice.delta.content };
    }

    // The chunk bearing a finish_reason also carries citations, metadata and
    // structured output. It arrives before `[DONE]`.
    if (choice?.finish_reason != null) {
      yield {
        type: 'final',
        finishReason: choice.finish_reason,
        citations: chunk.citations ?? [],
        metadata: chunk.metadata ?? null,
        structuredOutput: chunk.structured_output ?? null,
        toolCalls: chunk.tool_calls ?? null,
        usage: chunk.usage ?? null,
        promptTrace: chunk.prompt_trace ?? null,
      };
    }
  }

  // LewLM always terminates with `[DONE]`; EOF before it is a dropped response,
  // not a successful partial answer.
  throw connectionError(new Error('Chat stream ended before its [DONE] marker.'));
}

/** Stream `/v1/responses`, mapped onto the identical union. */
export async function* streamResponses(
  client: Client,
  request: ResponseCreateRequest,
  options: StreamOptions = {},
): AsyncGenerator<ChatStreamEvent> {
  const res = await client.raw(
    'POST',
    '/v1/responses',
    requestOptions({ ...request, stream: true }, options),
  );

  let opened = false;

  for await (const frame of readSSE(res)) {
    if (frame.data === '[DONE]') {
      yield { type: 'done' };
      return;
    }

    const chunk = JSON.parse(frame.data) as ResponseChunk;

    if (!opened) {
      opened = true;
      yield { type: 'open', servingProfile: chunk.serving_profile ?? null };
    }

    if (chunk.reasoning) yield { type: 'reasoning', reasoning: chunk.reasoning };
    if (chunk.delta) yield { type: 'text', delta: chunk.delta };

    // `/v1/responses` signals completion with `done`, where chat uses
    // `finish_reason`. Same terminal payload either way.
    if (chunk.done) {
      yield {
        type: 'final',
        finishReason: 'stop',
        citations: chunk.citations ?? [],
        metadata: chunk.metadata ?? null,
        structuredOutput: chunk.structured_output ?? null,
        toolCalls: chunk.tool_calls ?? null,
        usage: chunk.usage ?? null,
        promptTrace: chunk.prompt_trace ?? null,
      };
    }
  }

  throw connectionError(new Error('Responses stream ended before its [DONE] marker.'));
}

/** Non-streaming `/v1/chat/completions`. */
export function chatCompletion(
  client: Client,
  request: ChatCompletionRequest,
  options: StreamOptions = {},
): Promise<ChatCompletionResponse> {
  const payload = { ...request, stream: false };
  const opts = options.form
    ? { form: (options.form.set('payload_json', JSON.stringify(payload)), options.form) }
    : { json: payload };
  return client.request<ChatCompletionResponse>('POST', '/v1/chat/completions', {
    ...opts,
    signal: options.signal,
    correlationId: options.correlationId,
  });
}

/** Non-streaming `/v1/responses`. */
export function createResponse(
  client: Client,
  request: ResponseCreateRequest,
  options: StreamOptions = {},
): Promise<ResponseCreateResponse> {
  const payload = { ...request, stream: false };
  const opts = options.form
    ? { form: (options.form.set('payload_json', JSON.stringify(payload)), options.form) }
    : { json: payload };
  return client.request<ResponseCreateResponse>('POST', '/v1/responses', {
    ...opts,
    signal: options.signal,
    correlationId: options.correlationId,
  });
}

/*
 * A completed sync response, replayed as the event sequence a stream would have
 * produced. Streaming is a transport choice, not a different feature set, so the
 * UI should not have to branch on it — and the one thing sync genuinely has more
 * of, `prompt_trace`, rides the same `final` event.
 */

async function* replayChat(pending: Promise<ChatCompletionResponse>): AsyncGenerator<ChatStreamEvent> {
  const response = await pending;
  const choice = response.choices[0];
  yield { type: 'open', servingProfile: response.serving_profile ?? null };
  if (choice?.message.reasoning) yield { type: 'reasoning', reasoning: choice.message.reasoning };
  if (choice?.message.content) yield { type: 'text', delta: choice.message.content };
  yield {
    type: 'final',
    finishReason: choice?.finish_reason ?? null,
    citations: response.citations ?? [],
    metadata: response.metadata,
    structuredOutput: response.structured_output ?? null,
    toolCalls: response.tool_calls ?? null,
    usage: response.usage,
    promptTrace: response.prompt_trace ?? null,
  };
  yield { type: 'done' };
}

async function* replayResponse(
  pending: Promise<ResponseCreateResponse>,
): AsyncGenerator<ChatStreamEvent> {
  const response = await pending;
  yield { type: 'open', servingProfile: response.serving_profile ?? null };
  const reasoning = response.output.find((part) => part.reasoning)?.reasoning;
  if (reasoning) yield { type: 'reasoning', reasoning };
  if (response.output_text) yield { type: 'text', delta: response.output_text };
  yield {
    type: 'final',
    finishReason: 'stop',
    citations: response.citations ?? [],
    metadata: response.metadata,
    structuredOutput: response.structured_output ?? null,
    toolCalls: response.tool_calls ?? null,
    usage: response.usage ?? null,
    promptTrace: response.prompt_trace ?? null,
  };
  yield { type: 'done' };
}

/**
 * `/v1/chat/completions`, streaming or not, as one event sequence.
 * `stream: false` on the request picks the sync path.
 */
export function chat(
  client: Client,
  request: ChatCompletionRequest,
  options: StreamOptions = {},
): AsyncGenerator<ChatStreamEvent> {
  return request.stream === false
    ? replayChat(chatCompletion(client, request, options))
    : streamChat(client, request, options);
}

/** `/v1/responses`, streaming or not, as the same event sequence. */
export function respond(
  client: Client,
  request: ResponseCreateRequest,
  options: StreamOptions = {},
): AsyncGenerator<ChatStreamEvent> {
  return request.stream === false
    ? replayResponse(createResponse(client, request, options))
    : streamResponses(client, request, options);
}
