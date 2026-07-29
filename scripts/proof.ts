#!/usr/bin/env -S npx tsx
/**
 * Headless end-to-end proof of the transport layer.
 *
 * Two jobs:
 *
 *  1. Exercise @chap/lewlm against a live LewLM with no browser and no React,
 *     so a UI bug can never masquerade as an integration bug.
 *
 *  2. Act as the regression suite for docs/lewlm-gaps.md. Each `gap` probe
 *     asserts the CURRENT, BROKEN behaviour. When a gap is fixed in LewLM the
 *     probe flips to `FIXED`, which is the signal that Chap can delete a
 *     workaround. A gap probe that starts passing is good news, not a failure.
 *
 * Usage:
 *   npx tsx scripts/proof.ts [--base http://127.0.0.1:8080] [--model <id>]
 */

import {
  buildMultipart,
  chat,
  createClient,
  isAbort,
  LewLMApiError,
  readSSE,
  respond,
  streamChat,
  ERRORS,
  type ChatStreamEvent,
  type HealthResponse,
  type ModelCapabilityReport,
  type ModelInventory,
  type SingleModel,
} from '../packages/lewlm/src/index.ts';

const args = process.argv.slice(2);
const flag = (name: string, fallback: string): string => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : (args[i + 1] ?? fallback);
};

const BASE = flag('base', 'http://127.0.0.1:8080');
const client = createClient({ baseUrl: BASE, applicationId: 'chap-proof' });

type Status = 'PASS' | 'FAIL' | 'GAP' | 'FIXED' | 'SKIP';
const results: { status: Status; name: string; note: string }[] = [];

function record(status: Status, name: string, note = '') {
  results.push({ status, name, note });
  const mark = { PASS: ' ok ', FAIL: 'FAIL', GAP: 'gap ', FIXED: 'FIXD', SKIP: 'skip' }[status];
  console.log(`  [${mark}] ${name}${note ? `  ${note}` : ''}`);
}

async function check(name: string, fn: () => Promise<string | void>) {
  try {
    record('PASS', name, (await fn()) || '');
  } catch (error) {
    record('FAIL', name, error instanceof Error ? error.message : String(error));
  }
}

/**
 * A probe for a known gap. `expectBroken` returns a note when the broken
 * behaviour is still present, or null when LewLM has been fixed.
 */
async function gap(id: string, name: string, expectBroken: () => Promise<string | null>) {
  try {
    const note = await expectBroken();
    if (note === null) record('FIXED', `${id} ${name}`, 'LewLM fixed this — Chap can drop its workaround');
    else record('GAP', `${id} ${name}`, note);
  } catch (error) {
    record('FAIL', `${id} ${name}`, error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  console.log(`\nchap proof  ->  ${BASE}\n`);

  // --- transport ----------------------------------------------------------

  let modelId = flag('model', '');
  let chatCandidates: string[] = [];
  const chatCandidatesThatRan = new Set<string>();

  await check('health', async () => {
    const health = await client.request<HealthResponse>('GET', '/v1/health');
    if (health.status !== 'ok') throw new Error(`status=${health.status}`);
    return `${health.service} ${health.version}`;
  });

  await check('models', async () => {
    const inventory = await client.request<ModelInventory>('GET', '/v1/models');
    if (inventory.count === 0) throw new Error('no models in registry');
    if (modelId) return `${inventory.count} models, using ${modelId}`;

    // One request answers "what exists" and "what can run". Chap reads exactly
    // this and nothing else, so the proof reads it the same way.
    chatCandidates = (inventory.capability_availability ?? [])
      .filter((entry) => entry.chat_ready)
      .map((entry) => entry.model_id);

    return `${inventory.count} models, ${chatCandidates.length} chat-ready`;
  });

  await check('inventory annotation matches the authoritative report', async () => {
    // The cheap annotation is the one the UI trusts. This is the only place
    // Chap pays for the N+1 it deleted, and it pays it once, in a script, to
    // prove the shortcut is sound.
    const inventory = await client.request<ModelInventory>('GET', '/v1/models');
    const annotated = new Map(
      (inventory.capability_availability ?? []).map((entry) => [entry.model_id, entry.chat_ready]),
    );

    const disagreements: string[] = [];
    await Promise.all(
      inventory.items.map(async (item) => {
        const report = await client
          .request<{ capabilities: { capability: string; supported: boolean }[] }>(
            'GET',
            `/v1/models/${item.model_id}/capabilities`,
          )
          .catch(() => null);
        const authoritative =
          report?.capabilities.find((c) => c.capability === 'chat')?.supported ?? false;
        if (authoritative !== (annotated.get(item.model_id) ?? false)) {
          disagreements.push(`${item.model_id}: report=${authoritative} annotation=${annotated.get(item.model_id)}`);
        }
      }),
    );

    if (disagreements.length > 0) throw new Error(disagreements.join('; '));
    return `${inventory.items.length} models agree`;
  });

  await check('every chat-ready model actually loads', async () => {
    /*
     * `chat_ready` used to be a claim the runtime could contradict: it was
     * computed from the registry, so a Gemma 4 bundle advertised chat and then
     * died with "Model type gemma4 not supported". Since the routing patch it is
     * checked against what the installed runtime packages can build.
     *
     * This asserts the stronger property the UI now depends on — that every
     * model offered as selectable can produce a token. If it ever fails again,
     * the localStorage demotion cache Chap deleted is the thing to reconsider.
     */
    if (chatCandidates.length === 0) throw new Error('no chat-ready models to verify');

    const failures: string[] = [];
    for (const candidate of chatCandidates) {
      try {
        let streamed = false;
        for await (const event of streamChat(client, {
          model: candidate,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 4,
        })) {
          if (event.type === 'text') {
            streamed = true;
            break;
          }
        }
        if (streamed) chatCandidatesThatRan.add(candidate);
        else failures.push(`${candidate}: no tokens`);
      } catch (error) {
        failures.push(`${candidate}: ${error instanceof LewLMApiError ? error.code : String(error)}`);
      }
    }

    if (failures.length > 0) throw new Error(failures.join('; '));
    return `${chatCandidates.length}/${chatCandidates.length} chat-ready models streamed`;
  });

  // Any chat-ready model will do now that the check above proved they all run.
  // This used to be a trial-and-error loop over the candidates.
  if (!modelId) {
    modelId = [...chatCandidatesThatRan][0] ?? '';
    record(
      modelId ? 'PASS' : 'SKIP',
      'usable model',
      modelId
        ? modelId
        : `${chatCandidates.length} advertised chat, none could load — see the environment notes in docs/lewlm-gaps.md`,
    );
  }

  if (!modelId) {
    record('SKIP', 'streaming', 'no chat-ready model on this host');
  } else {
    await check('streaming chat', async () => {
      const seen: ChatStreamEvent['type'][] = [];
      let text = '';
      let servingProfileOnOpen = false;
      let finalMetadata = false;

      for await (const event of streamChat(client, {
        model: modelId,
        messages: [{ role: 'user', content: 'Reply with exactly: ready' }],
        max_tokens: 16,
      })) {
        seen.push(event.type);
        if (event.type === 'open') servingProfileOnOpen = event.servingProfile !== null;
        if (event.type === 'text') text += event.delta;
        if (event.type === 'final') finalMetadata = event.metadata !== null;
      }

      // The union must arrive in contract order.
      if (seen[0] !== 'open') throw new Error(`first event was ${seen[0]}, expected open`);
      if (seen.at(-1) !== 'done') throw new Error(`last event was ${seen.at(-1)}, expected done`);
      if (!seen.includes('text')) throw new Error('no text deltas');
      if (!seen.includes('final')) throw new Error('no final event');
      if (!servingProfileOnOpen) throw new Error('serving_profile missing from first chunk');
      if (!finalMetadata) throw new Error('execution metadata missing from final chunk');
      if (!text.trim()) throw new Error('assembled text was empty');

      return `${seen.filter((t) => t === 'text').length} deltas, "${text.trim().slice(0, 30)}"`;
    });

    await check('tool calls parsed by LewLM', async () => {
      // Chap declares tools and reads back a validated parse result. It does no
      // parsing of its own — parse_tool_calls lives in LewLM and stays there.
      let toolCalls = undefined as ReturnType<typeof Object> | undefined;
      let seen: { status: string; names: string[]; issues: number } | null = null;

      for await (const event of streamChat(client, {
        model: modelId,
        messages: [
          {
            role: 'user',
            content: 'What is the weather in Oslo? Use the available tool.',
          },
        ],
        max_tokens: 128,
        tools: [
          {
            name: 'get_weather',
            description: 'Look up the current weather for a city.',
            input_schema: {
              type: 'object',
              properties: { city: { type: 'string' } },
              required: ['city'],
              additionalProperties: false,
            },
          },
        ],
      })) {
        if (event.type === 'final' && event.toolCalls) {
          toolCalls = event.toolCalls;
          seen = {
            status: event.toolCalls.status,
            names: (event.toolCalls.tool_calls ?? []).map((call) => call.name),
            issues: (event.toolCalls.issues ?? []).length,
          };
        }
      }

      if (!toolCalls) throw new Error('tool_calls absent from the final chunk');
      // A small local model may or may not choose to call the tool; what must
      // hold is that LewLM returns a typed, validated verdict either way.
      const valid = ['no_tool_calls', 'parsed', 'partial', 'failed'].includes(seen!.status);
      if (!valid) throw new Error(`unexpected status ${seen!.status}`);
      return `status=${seen!.status} calls=[${seen!.names.join(',')}] issues=${seen!.issues}`;
    });

    await check('no tools declared -> tool_calls null', async () => {
      // The distinction matters: null means "not asked", whereas no_tool_calls
      // means "asked and declined". Conflating them produces phantom issues on
      // ordinary prose replies.
      for await (const event of streamChat(client, {
        model: modelId,
        messages: [{ role: 'user', content: 'Say hello.' }],
        max_tokens: 16,
      })) {
        if (event.type === 'final') {
          if (event.toolCalls !== null) {
            throw new Error(`expected null, got ${JSON.stringify(event.toolCalls)}`);
          }
          return 'null';
        }
      }
      throw new Error('no final event');
    });

    await check('abort mid-stream', async () => {
      const controller = new AbortController();
      let deltas = 0;
      try {
        for await (const event of streamChat(
          client,
          {
            model: modelId,
            messages: [{ role: 'user', content: 'Count slowly from one to fifty.' }],
            max_tokens: 200,
          },
          { signal: controller.signal },
        )) {
          if (event.type === 'text' && ++deltas === 3) controller.abort();
        }
        throw new Error('stream completed despite abort');
      } catch (error) {
        if (!isAbort(error)) throw error;
      }
      return `aborted after ${deltas} deltas`;
    });

    // --- M3: one union across both surfaces and both transports -------------

    await check('responses surface -> same union', async () => {
      const seen: ChatStreamEvent['type'][] = [];
      let text = '';
      for await (const event of respond(client, {
        model: modelId,
        input: [{ role: 'user', content: 'Reply with exactly: ready' }],
        max_output_tokens: 16,
      })) {
        seen.push(event.type);
        if (event.type === 'text') text += event.delta;
      }
      if (seen[0] !== 'open') throw new Error(`first event was ${seen[0]}`);
      if (seen.at(-1) !== 'done') throw new Error(`last event was ${seen.at(-1)}`);
      if (!seen.includes('final')) throw new Error('no final event');
      if (!text.trim()) throw new Error('assembled text was empty');
      return `${seen.filter((t) => t === 'text').length} deltas, identical event order to chat`;
    });

    await check('sync run replays as the same union', async () => {
      // `stream: false` must produce the same event sequence, so the UI never
      // branches on transport. The one difference is prompt_trace, which only
      // a non-streaming run can carry.
      const seen: ChatStreamEvent['type'][] = [];
      let trace = false;
      for await (const event of chat(client, {
        model: modelId,
        messages: [{ role: 'user', content: 'Say hello.' }],
        max_tokens: 16,
        stream: false,
        include_prompt_trace: true,
      })) {
        seen.push(event.type);
        if (event.type === 'final') trace = event.promptTrace !== null;
      }
      // Same order and the same terminal events as a stream; only the number of
      // `text` events differs, because sync has the whole answer at once.
      const shape = seen.filter((type) => type !== 'reasoning').join(',');
      if (shape !== 'open,text,final,done') throw new Error(`sequence was ${seen.join(',')}`);
      if (!trace) throw new Error('include_prompt_trace returned no trace');
      return `${seen.join(',')} + prompt_trace`;
    });

    await check('citation context reaches the prompt', async () => {
      // Chap packages pasted passages the way documents.ingest would. The proof
      // that the contract worked is the compiled prompt, not the model's mood.
      const passage = 'The Ordovician bell tower in Harkwell is exactly 41 metres tall.';
      for await (const event of chat(client, {
        model: modelId,
        messages: [{ role: 'user', content: 'How tall is the Harkwell bell tower?' }],
        max_tokens: 48,
        stream: false,
        include_prompt_trace: true,
        citation_context: {
          sources: [
            {
              source_id: 'chap-0',
              source_type: 'text',
              source_name: 'harkwell',
              source_label: 'harkwell',
            },
          ],
          chunks: [
            {
              chunk_id: 'chap-0#0',
              text: passage,
              source_id: 'chap-0',
              section_id: 'chap-0:body',
              source_label: 'harkwell',
              section_label: 'body',
            },
          ],
        },
      })) {
        if (event.type !== 'final') continue;
        const prompt = event.promptTrace?.serialized_model_prompt ?? '';
        if (!prompt.includes('41 metres')) throw new Error('chunk text absent from the prompt');
        return `chunk compiled in, ${event.citations.length} citation(s) resolved`;
      }
      throw new Error('no final event');
    });

    await check('structured output reports its enforcement', async () => {
      for await (const event of chat(client, {
        model: modelId,
        messages: [{ role: 'user', content: 'Give me an answer field saying hello.' }],
        max_tokens: 64,
        stream: false,
        response_format: {
          type: 'json_schema',
          name: 'chap_output',
          strict: true,
          schema: {
            type: 'object',
            properties: { answer: { type: 'string' } },
            required: ['answer'],
          },
        },
      })) {
        if (event.type !== 'final') continue;
        const result = event.structuredOutput;
        if (!result?.requested) throw new Error('structured_output absent or not marked requested');
        // Whether it enforced or fell back is the runtime's business; that it
        // says which, honestly, is the contract Chap depends on.
        return `enforcement=${result.enforcement} decoder=${result.decoder_enforced} fallback=${result.fallback_used} validation=${result.validation?.state}`;
      }
      throw new Error('no final event');
    });

    await check('capability report predicts the structured-output outcome', async () => {
      /*
       * G18. The prediction and the result are the same shape, so this compares
       * them field for field rather than eyeballing two approximations: ask the
       * capability report what will happen, then make it happen.
       */
      const report = await client.request<ModelCapabilityReport>(
        'GET',
        `/v1/models/${encodeURIComponent(modelId)}/capabilities`,
      );
      const predicted = report.structured_output?.json_schema;
      if (!predicted) throw new Error('capabilities report no structured_output');

      for await (const event of chat(client, {
        model: modelId,
        messages: [{ role: 'user', content: 'Give me an answer field saying hello.' }],
        max_tokens: 64,
        stream: false,
        response_format: {
          type: 'json_schema',
          name: 'chap_output',
          strict: true,
          schema: { type: 'object', properties: { answer: { type: 'string' } }, required: ['answer'] },
        },
      })) {
        if (event.type !== 'final') continue;
        const actual = event.structuredOutput;
        if (actual?.enforcement !== predicted.enforcement) {
          throw new Error(`predicted ${predicted.enforcement}, got ${actual?.enforcement}`);
        }
        if (actual.decoder_enforced !== predicted.decoder_enforced) {
          throw new Error('decoder_enforced disagreed with the prediction');
        }
        return `predicted and got ${actual.enforcement}, decoder_enforced=${actual.decoder_enforced}`;
      }
      throw new Error('no final event');
    });

    await check('multipart attachment reaches the prompt', async () => {
      const form = buildMultipart([
        {
          uploadName: 'upload_0',
          file: new Blob(['Harkwell tower survey: 41 metres.'], { type: 'text/plain' }),
          fileName: 'survey.txt',
        },
      ]);

      for await (const event of chat(
        client,
        {
          model: modelId,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Summarize the attached survey.' },
                { type: 'input_file', upload_name: 'upload_0' },
              ],
            },
          ],
          max_tokens: 48,
          stream: false,
          include_prompt_trace: true,
        },
        { form },
      )) {
        if (event.type !== 'final') continue;
        const plan = event.promptTrace?.attachment_plan ?? [];
        if (plan.length === 0) throw new Error('attachment absent from the prompt plan');
        const entry = plan[0]!;
        return `${entry.attachment_type} ${entry.media_type ?? ''} ${entry.extracted_text_characters ?? 0} chars extracted`;
      }
      throw new Error('no final event');
    });
  }

  await check('single-model route', async () => {
    // G20. Chap used to filter the inventory client-side to find one model.
    // The route returns the manifest *and* its readiness annotation together,
    // which is the pairing the picker needs.
    const record = await client.request<SingleModel>(
      'GET',
      `/v1/models/${encodeURIComponent(modelId || 'none')}`,
    );
    if (record.model.model_id !== modelId) throw new Error('wrong model returned');
    return `${record.model.conversion_status} · chat_ready=${record.capability_availability?.chat_ready}`;
  });

  await check('error catalog is published, not scraped', async () => {
    /*
     * G12. `ERROR_CODES` came out of a regex over LewLM's implementation source
     * until the bundle started publishing `errors[]`. This asserts the published
     * statuses match what the API actually returns, which is the property that
     * makes the catalog worth trusting.
     */
    if (ERRORS.length === 0) throw new Error('no published error catalog');

    const notFound = ERRORS.find((entry) => entry.code === 'model_not_found');
    if (!notFound) throw new Error('model_not_found missing from the catalog');

    try {
      await client.request('POST', '/v1/chat/completions', {
        json: { model: 'definitely-not-a-model', messages: [{ role: 'user', content: 'hi' }] },
      });
      throw new Error('expected a failure');
    } catch (error) {
      if (!(error instanceof LewLMApiError)) throw error;
      if (error.status !== notFound.http_status) {
        throw new Error(`catalog says ${notFound.http_status}, API returned ${error.status}`);
      }
      return `${ERRORS.length} codes, model_not_found=${notFound.http_status} as published`;
    }
  });

  await check('typed error envelope', async () => {
    try {
      await client.request('GET', '/v1/models/definitely-not-a-model/capabilities');
      throw new Error('expected a 404');
    } catch (error) {
      if (!(error instanceof LewLMApiError)) throw new Error('error was not a LewLMApiError');
      if (error.synthesized) throw new Error(`no envelope: ${error.code}`);
      return `${error.status} ${error.code}`;
    }
  });

  await check('connection error is typed', async () => {
    const dead = createClient({ baseUrl: 'http://127.0.0.1:9' });
    try {
      await dead.request('GET', '/v1/health');
      throw new Error('expected a connection failure');
    } catch (error) {
      if (!(error instanceof LewLMApiError)) throw new Error('error was not a LewLMApiError');
      if (error.code !== 'connection_error') throw new Error(`code was ${error.code}`);
      return error.code;
    }
  });

  // --- gap probes ---------------------------------------------------------

  console.log('');

  await gap('G11', 'error envelope on malformed requests', async () => {
    const res = await fetch(`${BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: 'not-a-list' }),
    });
    const body = await res.text();
    if (body.includes('"error"') && body.includes('"invalid_request"')) return null;
    return `malformed body -> ${res.status} ${res.headers.get('content-type')}, no envelope`;
  });

  await gap('G1', 'CORS is available', async () => {
    // Preflight is the real test: a browser POSTing JSON with Chap's audit
    // headers needs OPTIONS to succeed and the headers to be allow-listed.
    const res = await fetch(`${BASE}/v1/chat/completions`, {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type,x-request-id,x-lewlm-application-id',
      },
    });
    if (res.headers.get('access-control-allow-origin')) return null;
    // Default-off is correct; this only reports what this server is doing.
    return 'CORS off on this server — start with LEWLM_CORS_ENABLED=true to serve a browser directly';
  });

  await gap('G6', 'token counting endpoint', async () => {
    const res = await fetch(`${BASE}/v1/tokenize/count`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: 'hello world' }),
    });
    if (res.ok) return null;
    return `POST /v1/tokenize/count -> ${res.status}; context meter must estimate`;
  });

  await gap('G9', 'sessions can be renamed', async () => {
    const created = await client.request<{ session_id: string }>('POST', '/v1/sessions', {
      json: { title: 'before' },
    });
    try {
      const updated = await client.request<{ title?: string | null }>(
        'PATCH',
        `/v1/sessions/${created.session_id}`,
        { json: { title: 'after' } },
      );
      return updated.title === 'after' ? null : `PATCH returned title=${updated.title}`;
    } catch (error) {
      return `PATCH /v1/sessions/{id} -> ${(error as LewLMApiError).status}; title is write-once`;
    } finally {
      await client.request('DELETE', `/v1/sessions/${created.session_id}`).catch(() => undefined);
    }
  });

  await gap('G7', 'chat honors client x-request-id', async () => {
    const supplied = crypto.randomUUID();
    const res = await client.raw('GET', '/v1/models', { headers: { 'x-request-id': supplied } });
    if (res.headers.get('x-request-id') === supplied) return null;
    return `sent ${supplied.slice(0, 8)}, echoed ${res.headers.get('x-request-id')?.slice(0, 8)}`;
  });

  await gap('G8', 'documents.ingest accepts uploads', async () => {
    const body = Buffer.from('# Hello\n\nA note body.').toString('base64');
    const res = await fetch(`${BASE}/v1/documents/ingest`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sources: [{ source_id: 's1', file_name: 'note.md', content_base64: body }],
      }),
    });
    if (res.ok) return null;
    return `byte upload -> ${res.status}; Chap must stage files into file_access_roots`;
  });

  await gap('G21', 'inventory reports capability', async () => {
    const inventory = await client.request<ModelInventory>('GET', '/v1/models');
    if (inventory.capability_availability?.length) return null;
    return '/v1/models carries no readiness; a picker must fan out N+1 probes';
  });

  if (modelId) {
    await gap('G4', 'streaming reports usage', async () => {
      for await (const event of streamChat(client, {
        model: modelId,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 8,
      })) {
        if (event.type === 'final') {
          if (event.usage) return null;
          return 'final chunk carries no `usage`; tokens/sec cannot be computed';
        }
      }
      return 'no final event';
    });

    await gap('G23', 'streaming carries prompt_trace', async () => {
      // `usage` landed on the final chunk when G4 was fixed; `prompt_trace` now
      // rides the same terminal chunk, so inspecting the prompt no longer costs
      // the transport.
      for await (const event of streamChat(client, {
        model: modelId,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 8,
        include_prompt_trace: true,
      })) {
        if (event.type === 'final') {
          if (event.promptTrace) return null;
          return 'include_prompt_trace is accepted but no chunk carries the trace';
        }
      }
      return 'no final event';
    });

    await gap('G22', 'prompt teaches the tool-call format', async () => {
      const result = await client.request<{ tool_calls?: { status: string } | null }>(
        'POST',
        '/v1/chat/completions',
        {
          json: {
            model: modelId,
            messages: [{ role: 'user', content: 'Weather in Oslo?' }],
            max_tokens: 120,
            tools: [
              {
                name: 'get_weather',
                description: 'Look up current weather for a city.',
                input_schema: {
                  type: 'object',
                  properties: { city: { type: 'string' } },
                  required: ['city'],
                },
              },
            ],
          },
        },
      );
      if (result.tool_calls?.status === 'parsed') return null;
      return `no system_prompt injection -> ${result.tool_calls?.status}`;
    });

    await gap('G5', 'sampling controls are applied', async () => {
      const result = await client.request<{
        metadata?: { sampling?: { applied?: Record<string, unknown>; unsupported?: string[] } };
      }>('POST', '/v1/chat/completions', {
        json: {
          model: modelId,
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 8,
          sampling: { top_p: 0.9, seed: 42 },
        },
      });
      const report = result.metadata?.sampling;
      if (!report) return 'no metadata.sampling report at all';
      if (Object.keys(report.applied ?? {}).length > 0) return null;
      // Reported honestly, just not honored by this backend. Not a contract
      // gap — a backend capability note — so it is recorded, not failed.
      return `contract present; this runtime honors none of [${(report.unsupported ?? []).join(', ')}]`;
    });
  }

  // --- summary ------------------------------------------------------------

  const failed = results.filter((r) => r.status === 'FAIL').length;
  const gaps = results.filter((r) => r.status === 'GAP').length;
  const fixed = results.filter((r) => r.status === 'FIXED').length;

  console.log(
    `\n  ${results.filter((r) => r.status === 'PASS').length} passed · ${failed} failed · ` +
      `${gaps} gaps confirmed · ${fixed} gaps fixed upstream\n`,
  );
  if (fixed > 0) console.log('  A FIXD line means Chap can now delete a workaround.\n');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\nproof crashed\n ', error, '\n');
  process.exit(1);
});
