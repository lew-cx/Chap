import assert from 'node:assert/strict';
import test from 'node:test';

import { LewLMApiError } from './errors.ts';
import type { Client, RequestOptions } from './http.ts';
import { streamChat, streamResponses } from './stream.ts';
import type { ChatCompletionRequest, ResponseCreateRequest } from './types.ts';

const request = {} as ChatCompletionRequest;

test('a chat stream rejects EOF before its terminal marker', async () => {
  const body =
    'data: ' +
    JSON.stringify({ choices: [{ delta: { content: 'partial' }, finish_reason: null }] }) +
    '\n\n';
  const client: Client = {
    options: {},
    raw: async () => new Response(body),
    request: async () => {
      throw new Error('not used');
    },
  };

  await assert.rejects(
    async () => {
      for await (const _event of streamChat(client, request)) {
        // Consume until the generator observes the premature EOF.
      }
    },
    (cause: unknown) =>
      cause instanceof LewLMApiError &&
      cause.code === 'connection_error' &&
      cause.message.includes('[DONE]'),
  );
});

test('streaming forwards the caller correlation id', async () => {
  let seen: RequestOptions | undefined;
  const client: Client = {
    options: {},
    raw: async (_method, _path, options) => {
      seen = options;
      return new Response('data: [DONE]\n\n');
    },
    request: async () => {
      throw new Error('not used');
    },
  };

  const events = [];
  for await (const event of streamChat(client, request, { correlationId: 'turn-1', requestId: 'req-1' })) {
    events.push(event.type);
  }

  assert.equal(seen?.correlationId, 'turn-1');
  assert.equal(seen?.headers?.['x-request-id'], 'req-1');
  assert.deepEqual(events, ['done']);
});

test("a streamed tool call is LewLM's verdict, not Chap's parse of the deltas", async () => {
  // Since G34 the terminal chunk carries LewLM's parsed, schema-validated
  // result even when the engine streamed native fragments. Chap passes it
  // through and reassembles nothing: fragments with no verdict yield none.
  const verdict = {
    status: 'parsed',
    parser: 'lewlm_strict_tool_parser',
    tool_calls: [{ call_id: 'call-1', name: 'weather', arguments: { city: 'Lisbon' } }],
    issues: [],
    parallel: false,
  };
  const fragments = [
    { choices: [{ delta: { tool_calls: [{ index: 0, id: 'call-1', function: { name: 'weather', arguments: '{"city":' } }] }, finish_reason: null }] },
    { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '"Lisbon"}' } }] }, finish_reason: null }] },
  ];
  const run = async (terminal: unknown) => {
    const body = [...fragments, terminal].map((frame) => `data: ${JSON.stringify(frame)}\n\n`).join('') + 'data: [DONE]\n\n';
    let final;
    for await (const event of streamChat(streamClient(body), request)) if (event.type === 'final') final = event;
    return final?.toolCalls;
  };
  assert.deepEqual(await run({ choices: [{ delta: {}, finish_reason: 'tool_calls' }], tool_calls: verdict }), verdict);
  assert.equal(await run({ choices: [{ delta: {}, finish_reason: 'tool_calls' }], tool_calls: null }), null);
});

test('responses expose finish reasons and terminal in-band errors', async () => {
  const error = { code: 'runtime_unavailable', message: 'engine stopped', partial_output: true };
  const body = `data: ${JSON.stringify({ delta: 'partial', done: false })}\n\n` +
    `data: ${JSON.stringify({ done: true, finish_reason: 'error', error })}\n\n` +
    'data: [DONE]\n\n';
  let final;
  for await (const event of streamResponses(streamClient(body), {} as ResponseCreateRequest)) {
    if (event.type === 'final') final = event;
  }
  assert.equal(final?.finishReason, 'error');
  assert.deepEqual(final?.error, error);
});

function streamClient(body: string): Client {
  return {
    options: {},
    raw: async () => new Response(body),
    request: async () => { throw new Error('not used'); },
  };
}
