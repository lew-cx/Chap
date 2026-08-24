/**
 * @chap/lewlm — the entire LewLM integration surface.
 *
 * Zero runtime dependencies, no React, isomorphic. Everything Chap knows about
 * LewLM lives in this package; if application code elsewhere starts reasoning
 * about LewLM's contract, that logic belongs here instead.
 *
 * `npm run loc:budget` counts the hand-written lines below `src/` and fails the
 * build when they grow past the budget. That number is the point of the project.
 */

export { createClient } from './http.ts';
export type { Client, ClientOptions, HttpMethod, RequestOptions } from './http.ts';

export {
  connectionError,
  isAbort,
  isLewLMErrorEnvelope,
  LewLMApiError,
  toLewLMError,
} from './errors.ts';
export type { LewLMErrorEnvelope } from './errors.ts';

export { readSSE } from './sse.ts';
export type { SSEFrame } from './sse.ts';

export {
  chat,
  chatCompletion,
  createResponse,
  respond,
  streamChat,
  streamResponses,
} from './stream.ts';
export type { ChatStreamEvent, StreamOptions } from './stream.ts';

export { subscribeEvents } from './events.ts';
export type { EventFilter, EventStreamStatus, EventSubscription } from './events.ts';

export { buildMultipart, partTypeFor } from './multipart.ts';
export type { Upload } from './multipart.ts';

export * from './types.ts';
