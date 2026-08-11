import assert from 'node:assert/strict';
import test from 'node:test';

import { LewLMApiError } from './errors.ts';
import type { Client, RequestOptions } from './http.ts';
import { streamChat } from './stream.ts';
import type { ChatCompletionRequest } from './types.ts';

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
  for await (const event of streamChat(client, request, { correlationId: 'turn-1' })) {
    events.push(event.type);
  }

  assert.equal(seen?.correlationId, 'turn-1');
  assert.deepEqual(events, ['done']);
});
