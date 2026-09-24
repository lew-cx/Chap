import assert from 'node:assert/strict';
import test from 'node:test';

import { subscribeEvents } from './events.ts';
import type { Client, RequestOptions } from './http.ts';

test('event reconnect sends the last cursor and delivers LewLM replay markers', async () => {
  const seenOptions: RequestOptions[] = [];
  let call = 0;
  const frames = [
    'id: epoch:1\nevent: request.accepted\ndata: {"cursor":"epoch:1","type":"request.accepted"}\n\n',
    'event: events.resumed\ndata: {"type":"events.resumed","payload":{"lost":0,"replayed":1}}\n\n' +
      'id: epoch:2\nevent: request.completed\ndata: {"cursor":"epoch:2","type":"request.completed"}\n\n',
  ];
  const client: Client = {
    options: {},
    raw: async (_method, _path, options = {}) => {
      seenOptions.push(options);
      return new Response(frames[Math.min(call++, 1)]);
    },
    request: async () => { throw new Error('not used'); },
  };
  const controller = new AbortController();
  const types: string[] = [];
  await subscribeEvents(client, {
    signal: controller.signal,
    filter: { exclude_types: ['token.delta'] },
    onEvent: (event) => {
      types.push(event.type);
      if (event.type === 'request.completed') controller.abort();
    },
  });

  assert.equal(seenOptions.length, 2);
  assert.equal(seenOptions[1]?.headers?.['Last-Event-ID'], 'epoch:1');
  assert.deepEqual(types, ['request.accepted', 'events.resumed', 'request.completed']);
});
