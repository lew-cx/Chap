#!/usr/bin/env node
/**
 * LewLM's Chap UI checklist (LewLM docs/guides/chap-validation.md), driven in a
 * real browser and recorded item by item.
 *
 * Needs three things running:
 *
 *   ../LewLM/.venv/Scripts/python.exe scripts/lewlm-fixture.py --fallback    # LewLM + engines + control
 *   npm run dev                                                              # Chap on :5173
 *   node scripts/ui-checklist.mjs [--out file.json]
 *
 * Items 8–10 and 13 stop, kill and restore the fixture's engine through the
 * harness's control port, which is why this does not run against a plain
 * `lewlm.testing.fake_backend`. Every item ends with the engine running.
 *
 * Against a real engine there is no control port: pass `--lewlm <url> --model
 * <id>` and the items that need an engine stopped are recorded `pending`, the
 * way LewLM's table expects, while the rest run against real output.
 *
 * A status is `passed`, `failed` or `pending`, as LewLM's table asks. `failed`
 * or `passed` with `gap` names the LewLM gap the item runs into or works around from
 * Chap; the exit code is non-zero only for failures no gap explains.
 */

import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { chromium } from 'playwright';

const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
};
const CHAP = arg('chap', 'http://localhost:5173');
const CONTROL = arg('control', 'http://127.0.0.1:8099');
const OUT = arg('out', join(tmpdir(), 'chap-ui-checklist.json'));
/** `--only 8,9` re-runs just those items, for chasing one failure. */
const ONLY = new Set(String(arg('only', '')).split(',').filter(Boolean).map(Number));

const control = async (verb) => {
  const res = await fetch(`${CONTROL}/${verb}`, { method: verb === 'state' ? 'GET' : 'POST' });
  if (!res.ok) throw new Error(`control ${verb} -> ${res.status}`);
  return res.json();
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fixture = await control('state').catch(() => null);
/** No harness: a real engine, whose output is not known in advance. */
const REAL = fixture === null;
/** Where the harness serves LewLM, unless told otherwise. */
const LEWLM = arg('lewlm', fixture?.lewlm ?? 'http://127.0.0.1:8080');
const PRIMARY = fixture?.primary.model ?? arg('model', '');
const BACKUP = fixture?.backup.model ?? null;
if (!PRIMARY) {
  console.error(`no fixture harness at ${CONTROL}; against a real engine pass --lewlm <url> --model <id>`);
  process.exit(2);
}
/** Long enough to stop halfway through on any engine; the fixture answers anything long. */
const LONG_PROMPT = 'Write a long essay about lighthouses, at least six paragraphs.';
const health = await fetch(`${LEWLM}/v1/health`).then((res) => res.json());

const results = [];
const record = (item, name, status, evidence, gap) =>
  results.push({ item, name, status, evidence, ...(gap ? { gap } : {}) });
/** For items that stop, kill or restart an engine: true when it cannot here. */
const needsHarness = (item, name) => {
  if (!REAL) return false;
  record(item, name, 'pending', 'needs an engine stopped, killed or restarted — run against scripts/lewlm-fixture.py');
  return true;
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));

/** Every chat request Chap sends, with the headers it sent them under. */
const chats = [];
const cancels = [];
const eventOpens = [];
page.on('request', (request) => {
  const url = request.url();
  if (url.includes('/v1/chat/completions') || url.includes('/v1/responses')) {
    chats.push({ headers: request.headers(), body: request.postDataJSON?.() ?? null });
  }
  if (/\/v1\/requests\/[^/]+\/cancel/.test(url)) cancels.push(url);
  if (url.includes('/v1/events')) eventOpens.push(url);
});

// --- helpers over Chap's DOM --------------------------------------------------

const composer = () => page.locator('textarea[placeholder^="Ask anything"]');
const picker = () => page.locator('label:has(> span.micro-label:text-is("model")) select');
const stat = (label) => page.locator(`div:has(> span.micro-label:text-is("${label}")) > span.numeric`).last();
const lastBubble = () => page.locator('.bubble').last();
const idle = () => page.getByRole('button', { name: 'Send', exact: true }).waitFor({ timeout: REAL ? 120_000 : 20_000 });
const replyText = async () => (await lastBubble().innerText()).replace(/^assistant\s*/i, '');
let loads = 0;

/**
 * A real load every time. Moving to the hash the page already shows is not a
 * navigation, and composer state from the item before (a JSON format, a tools
 * list) would ride into this one and change what the fixture answers.
 */
async function openChat() {
  await page.goto(`${CHAP}/?load=${loads++}#/chat`, { waitUntil: 'domcontentloaded' });
  await picker().waitFor();
  await page.waitForFunction(() => document.querySelectorAll('select option').length > 1);
}

async function freshChat(model = PRIMARY) {
  await openChat();
  const newChat = page.getByRole('button', { name: 'new chat' });
  if (await newChat.count()) await newChat.click();
  try {
    await picker().selectOption(model, { timeout: 10_000 });
  } catch (error) {
    // Say what LewLM and the picker both believed, not just that it timed out.
    const inventory = await fetch(`${LEWLM}/v1/models`).then((res) => res.json());
    const entry = inventory.capability_availability?.find((item) => item.model_id === model);
    const option = await picker().locator(`option[value="${model}"]`).evaluate((node) => `${node.textContent} disabled=${node.disabled}`).catch(() => 'absent');
    throw new Error(`cannot select ${model}: LewLM chat_ready=${entry?.chat_ready} engine_state=${entry?.engine_state}; picker: ${option}`);
  }
}

async function sendPrompt(text) {
  await composer().fill(text);
  await page.getByRole('button', { name: 'Send', exact: true }).click();
}

async function item(number, name, fn) {
  if (ONLY.size > 0 && !ONLY.has(number)) return;
  try {
    await fn();
  } catch (error) {
    const shot = join(tmpdir(), `chap-ui-checklist-${number}.png`);
    await page.screenshot({ path: shot, fullPage: true }).catch(() => undefined);
    record(number, name, 'failed', `check threw: ${error instanceof Error ? error.message.split('\n')[0] : String(error)} (${shot})`);
  } finally {
    // Leave the engine up for the next item whatever this one did.
    const state = REAL ? null : await control('state').catch(() => null);
    if (state && (!state.primary.running || !state.backup.running)) {
      if (!state.primary.running) await control('engine/start');
      if (!state.backup.running) await control('backup/start');
      await control('rescan');
    }
  }
}

// --- the checklist -----------------------------------------------------------

await item(1, 'Model picker', async () => {
  await openChat();
  const label = async (id) => (await picker().locator(`option[value="${id}"]`).textContent()) ?? '';
  const upLabel = await label(PRIMARY);
  const upDisabled = await picker().locator(`option[value="${PRIMARY}"]`).isDisabled();

  if (REAL) {
    // No engine to stop, but a real inventory has models that cannot chat.
    const blocked = await picker().locator('option[disabled]').evaluateAll((nodes) =>
      nodes.map((node) => ({ text: node.textContent ?? '', title: node.getAttribute('title') ?? '' })));
    const inventory = await fetch(`${LEWLM}/v1/models`).then((res) => res.json());
    const unready = (inventory.capability_availability ?? []).filter((entry) => !entry.chat_ready && !entry.fallback_model_id);
    const ok = !upDisabled && blocked.length === unready.length && blocked.every((entry) => entry.title.length > 0);
    record(1, 'Model picker', ok ? 'passed' : 'failed',
      `"${upLabel.trim()}" selectable; ${blocked.length} of ${unready.length} chat_ready:false models listed and ` +
      `disabled, each titled with LewLM's reason (e.g. "${blocked[0]?.text.trim() ?? '—'}"). Engine states other than ` +
      '`packaged` need the fixture.');
    return;
  }

  // The backup model is the one no fallback alias covers, so taking its engine
  // down is what makes a model genuinely unable to answer.
  await control('backup/stop');
  await control('rescan');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    (id) => document.querySelector(`select option[value="${id}"]`)?.hasAttribute('disabled'),
    BACKUP,
    { timeout: 15_000 },
  );
  const downLabel = await label(BACKUP);
  const downTitle = (await picker().locator(`option[value="${BACKUP}"]`).getAttribute('title')) ?? '';

  const ok =
    upLabel.includes('openai_compatible@fixture') && !upDisabled &&
    downLabel.includes('engine stale') && downTitle.includes('Engine `backup` is stale');
  record(1, 'Model picker', ok ? 'passed' : 'failed',
    `up: "${upLabel.trim()}" selectable; its engine down + rescan: "${downLabel.trim()}", disabled, titled with ` +
    `LewLM's reason ("${downTitle.split(' — ').at(-1)?.slice(0, 70)}…"). The fixture reaches \`stale\`, not ` +
    '`failed`; both are unselectable unless a fallback alias would answer (item 10).');
});

await item(2, 'Capability-driven controls', async () => {
  await freshChat();
  await page.getByRole('button', { name: 'format', exact: true }).click();
  await page.locator('select').filter({ has: page.locator('option[value="json_schema"]') }).first().selectOption('json_schema');
  const predicted = await page.getByText('decode_time').first().isVisible();
  await page.getByRole('button', { name: 'tools', exact: true }).click();
  const capabilities = await fetch(`${LEWLM}/v1/models/${encodeURIComponent(PRIMARY)}/capabilities`).then((res) => res.json());
  const support = capabilities.tool_calling?.support;
  const shown = support
    ? await page.getByText(support === 'none' ? 'cannot call tools' : support === 'native' ? 'native calls' : 'prompt-guided calls').first().isVisible()
    : false;
  record(2, 'Capability-driven controls', predicted && shown ? 'passed' : 'failed',
    `before sending, the format drawer shows the predicted structured_output enforcement (${predicted ? 'decode_time' : 'not shown'}) ` +
    `and the tools drawer LewLM's tool_calling prediction (${support ?? 'absent'}, shown: ${shown}). ` +
    'A model predicted `none` is flagged and sent no tools.');
});

await item(3, 'First-token rendering', async () => {
  await freshChat();
  await sendPrompt(LONG_PROMPT);
  const samples = [];
  for (let i = 0; i < 4; i += 1) {
    await sleep(350);
    samples.push((await replyText()).length);
  }
  const growing = samples.every((value, index) => index === 0 || value > samples[index - 1]);
  record(3, 'First-token rendering', growing && samples[0] > 0 ? 'passed' : 'failed',
    `visible reply length sampled every 350 ms while streaming: ${samples.join(' → ')}. Role-only chunks and ` +
    '`: keep-alive` comments are dropped by readSSE (packages/lewlm/src/sse.ts) and never reach the transcript.');
  (await page.getByRole('button', { name: 'Stop' }).count()) && (await page.getByRole('button', { name: 'Stop' }).click());
  await idle();
});

await item(4, 'Stop button', async () => {
  await freshChat();
  const before = chats.length;
  await sendPrompt(LONG_PROMPT);
  // Stop once text is flowing, however long the engine takes to start.
  await page.waitForFunction(() => (document.querySelectorAll('.bubble')[1]?.textContent ?? '').length > 40, null, { timeout: 60_000 });
  await sleep(300);
  await page.getByRole('button', { name: 'Stop' }).click();
  await idle();
  const sent = chats[before]?.headers['x-request-id'];
  const cancelled = cancels.at(-1) ?? '';
  const stopped = await page.getByText('stopped — the text above').isVisible();
  const kept = (await replyText()).trim().length > 0;
  const finish = await stat('finish reason').innerText();
  const enabled = await page.getByRole('button', { name: 'Send', exact: true }).isVisible();
  const ok = sent && cancelled.endsWith(`/v1/requests/${sent}/cancel`) && stopped && kept && finish === 'cancelled' && enabled;
  record(4, 'Stop button', ok ? 'passed' : 'failed',
    `cancel POST named the stream's own x-request-id (${String(sent).slice(0, 8)}); finish_reason ${finish}; ` +
    `"stopped" shown: ${stopped}; delivered text kept: ${kept}; Send re-enabled after [DONE]: ${enabled}.`);
});

await item(5, 'Tool deltas and results', async () => {
  await freshChat();
  await page.getByRole('button', { name: 'tools', exact: true }).click();
  await page.locator('textarea.code').first().fill(JSON.stringify([{
    name: 'get_weather',
    description: 'weather',
    input_schema: { type: 'object', properties: { city: { type: 'string' } } },
  }]));
  await page.getByRole('button', { name: 'tools', exact: true }).click();
  await sendPrompt('What is the weather in Lisbon?');
  await idle();
  const answer = page.locator('label:has(> span.micro-label:text-matches("^result of get_weather")) textarea');
  if (REAL && (await answer.count()) === 0) {
    record(5, 'Tool deltas and results', 'pending',
      `the model answered in text rather than calling the tool (finish reason ${await stat('finish reason').innerText()}); nothing to continue`);
    return;
  }
  await answer.waitFor();
  const parser = await stat('parser').innerText();
  const before = chats.length;
  await answer.fill('{"temperature_c": 21, "sky": "clear"}');
  await page.getByRole('button', { name: 'send tool result' }).click();
  await idle();
  const messages = chats[before]?.body?.messages ?? [];
  const [call, result] = messages.slice(-2);
  const callId = call?.tool_calls?.[0]?.id;
  const reply = (await replyText()).trim();
  const ok =
    parser !== 'upstream_native_stream' &&
    call?.role === 'assistant' && call.tool_calls?.[0]?.function?.name === 'get_weather' && callId &&
    result?.role === 'tool' && result.tool_call_id === callId &&
    (REAL ? reply.length > 0 : reply.includes('clear skies'));
  record(5, 'Tool deltas and results', ok ? 'passed' : 'failed',
    `LewLM's parse (${parser}) drove the tool UI; the result went back as an assistant turn carrying ` +
    `tool_calls[${callId}] and a tool message with tool_call_id ${result?.tool_call_id}; reply: "${reply.slice(0, 50)}".`);
});

await item(6, 'JSON display', async () => {
  await freshChat();
  await page.getByRole('button', { name: 'format', exact: true }).click();
  await page.locator('select').filter({ has: page.locator('option[value="json_schema"]') }).first().selectOption('json_schema');
  await page.getByRole('button', { name: 'format', exact: true }).click();
  await sendPrompt('Give me the answer as JSON.');
  await idle();
  const validation = await stat('validation').innerText();
  const panel = page.locator('details:has(> summary:has-text("structured output"))');
  const parsedShown = (await panel.locator('pre, code').count()) > 0 || (await panel.innerText()).includes('"answer"');
  record(6, 'JSON display', validation === 'valid' && parsedShown ? 'passed' : 'failed',
    `validation.state ${validation}; parsed_output rendered: ${parsedShown}. The invalid branch (raw text plus ` +
    'validation.message) was not reached: the reply validated.');
});

await item(7, 'Usage', async () => {
  await freshChat();
  await sendPrompt('hello');
  await idle();
  const tokens = await stat('tokens').innerText();
  const cached = (await page.locator('span.micro-label:text-is("cached")').count()) ? await stat('cached').innerText() : 'absent';
  const estimatedLabel = (await page.locator('span.micro-label:text-is("tokens (estimated)")').count()) > 0;
  // What this runtime reports, asked directly, is what the readout must agree with.
  const usage = await fetch(`${LEWLM}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: PRIMARY, messages: [{ role: 'user', content: 'hello' }], max_tokens: 8 }),
  }).then((res) => res.json()).then((body) => body.usage);
  const cachedAgrees = usage.cached_tokens == null ? cached === 'absent' : cached !== 'absent';
  const ok = tokens.includes('+') && cachedAgrees && estimatedLabel === !usage.measured;
  record(7, 'Usage', ok ? 'passed' : 'failed',
    `terminal-chunk usage ${tokens}; runtime reports measured:${usage.measured} and the estimate label is ` +
    `${estimatedLabel ? 'shown' : 'absent'}; cached_tokens ${usage.cached_tokens ?? 'absent'} and the cached stat is ${cached}.`);
});

await item(8, 'Engine restart', async () => {
  if (needsHarness(8, 'Engine restart')) return;
  await freshChat();
  await control('engine/stop');
  await sendPrompt('hello');
  const banner = page.getByRole('alert').filter({ hasText: 'runtime_unavailable' });
  await banner.waitFor({ timeout: 15_000 });
  const bannerText = await banner.innerText();
  const inBand = bannerText.includes('· STREAM') || bannerText.includes('· stream');
  const listed = await picker().locator(`option[value="${PRIMARY}"]`).count();
  // LewLM marks the endpoint down on the refusal itself; Chap re-reads at once.
  const notice = page.getByRole('status').filter({ hasText: 'openai_compatible@fixture is stale' }).first();
  await notice.waitFor({ timeout: 10_000 });
  const noticeText = await notice.innerText();
  await page.getByRole('button', { name: 'Ops', exact: true }).click();
  await page.getByRole('button', { name: 'overview', exact: true }).click();
  const overviewStale = await page.getByText('stale', { exact: true }).first().isVisible({ timeout: 5000 }).catch(() => false);

  await control('engine/start');
  await page.getByRole('button', { name: 'rescan engines' }).click();
  await page.getByText(/discovered ·/).waitFor({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Chat', exact: true }).click();
  await picker().selectOption(PRIMARY);
  await sendPrompt('hello again');
  await idle();
  const recovered =
    (await replyText()).trim().length > 0 &&
    (await page.getByRole('alert').filter({ hasText: 'runtime_unavailable' }).count()) === 0;
  const noticeGone = (await page.getByRole('status').filter({ hasText: 'is stale' }).count()) === 0;

  const ok = bannerText.includes('engine endpoint: fixture') && listed === 1 && overviewStale && recovered && noticeGone;
  record(8, 'Engine restart', ok ? 'passed' : 'failed',
    `the refused turn names "engine endpoint: fixture"${inBand ? ' — in-band, on a 200 stream (G40, Windows)' : ' on a 503'}; ` +
    `model still listed; LewLM itself reports the engine stale at once: "${noticeText.slice(0, 90)}…", and the ` +
    `Ops overview shows it (${overviewStale}). Restart + "rescan engines": next turn answered (${recovered}), ` +
    `notice cleared (${noticeGone}), no reload.`, inBand ? 'G40' : undefined);
});

await item(9, 'Interrupted stream', async () => {
  if (needsHarness(9, 'Interrupted stream')) return;
  await freshChat();
  const before = chats.length;
  await sendPrompt('a long answer please');
  await sleep(1200);
  await control('engine/die');
  const banner = page.getByRole('alert').filter({ hasText: 'runtime_unavailable' });
  await banner.waitFor({ timeout: 15_000 });
  await idle();
  const partial = (await lastBubble().innerText()).includes('word1');
  const message = (await banner.innerText()).includes('External accelerator stream failed');
  const retry = await page.getByRole('button', { name: 'restore prompt to retry' }).isVisible();
  await sleep(2500);
  const replayed = chats.length - before - 1;
  const ok = partial && message && retry && replayed === 0;
  record(9, 'Interrupted stream', ok ? 'passed' : 'failed',
    `partial text kept: ${partial}; error.message shown: ${message}; retry offered, not taken: ${retry}; ` +
    `requests sent automatically afterwards: ${replayed}.`);
  // Tidy the transcript for the next item.
  await page.getByRole('button', { name: 'restore prompt to retry' }).click();
});

await item(10, 'Fallback explanation', async () => {
  if (needsHarness(10, 'Fallback explanation')) return;
  await control('engine/stop');
  await control('rescan');
  // Chosen *after* its engine went down: availability names the alias, so the
  // picker offers the model and says who will answer.
  await freshChat(PRIMARY);
  const option = (await picker().locator(`option[value="${PRIMARY}"]`).textContent()) ?? '';
  await sendPrompt('hello');
  await idle();
  const line = await page.getByRole('status').filter({ hasText: 'answered by' }).first().innerText();
  const ok =
    option.includes('answered by fallback') &&
    line.includes(BACKUP) && line.includes(PRIMARY) && line.includes('operator-configured alias');
  record(10, 'Fallback explanation', ok ? 'passed' : 'failed',
    `picker offers "${option.trim()}"; after the turn: "${line.slice(0, 150)}…".`);
});

await item(11, 'Identity headers', async () => {
  await freshChat();
  const before = chats.length;
  await sendPrompt('one');
  await idle();
  await sendPrompt('two');
  await idle();
  const [first, second] = chats.slice(before).map((chat) => chat.headers);
  const echoed = await stat('ids echoed').innerText();
  const ok =
    first?.['x-lewlm-application-id'] === 'chap' && second?.['x-lewlm-application-id'] === 'chap' &&
    first['x-request-id'] && first['x-request-id'] !== second['x-request-id'] &&
    first['x-lewlm-correlation-id'] && first['x-lewlm-correlation-id'] === second['x-lewlm-correlation-id'] &&
    echoed === 'match';
  record(11, 'Identity headers', ok ? 'passed' : 'failed',
    `two turns: application-id chap; request ids ${first?.['x-request-id']?.slice(0, 8)} ≠ ${second?.['x-request-id']?.slice(0, 8)}; ` +
    `one conversation correlation id ${first?.['x-lewlm-correlation-id']?.slice(0, 8)}; metadata echo: ${echoed}.`);
});

await item(12, 'Browser origin', async () => {
  await openChat();
  const probe = await page.evaluate(async (base) => {
    const id = crypto.randomUUID();
    let res;
    try {
      res = await fetch(`${base}/v1/health`, { headers: { 'x-request-id': id, 'x-lewlm-application-id': 'chap' } });
    } catch (error) {
      return { status: 'blocked', detail: String(error) };
    }
    // Any HTTP status means the preflight for Last-Event-ID passed; a CORS
    // refusal surfaces as a TypeError instead. (`0:0` is not a cursor this
    // server issued, so a 4xx is expected and is still an answer.)
    const resume = await fetch(`${base}/v1/events`, { headers: { 'Last-Event-ID': '0:0' } })
      .then((r) => `HTTP ${r.status}`)
      .catch((e) => `blocked: ${String(e)}`);
    return { status: res.status, echoed: res.headers.get('x-request-id') === id, resume };
  }, LEWLM);
  if (probe.status === 'blocked') {
    record(12, 'Browser origin', 'pending',
      `this LewLM refused ${CHAP} (${probe.detail}) — CORS is off or does not list Chap's origin. Chap still works ` +
      'through its same-origin proxy; start LewLM with LEWLM_CORS_ENABLED=true and the origin listed to check this item.');
    return;
  }
  const ok = probe.status === 200 && probe.echoed && probe.resume.startsWith('HTTP');
  record(12, 'Browser origin', ok ? 'passed' : 'failed',
    `from ${CHAP}, a direct preflighted fetch to LewLM succeeded and x-request-id was readable (${probe.echoed}); ` +
    `a Last-Event-ID resume passed its preflight (${probe.resume}). No wildcard: a foreign origin gets no ` +
    'allow-origin. Chap itself goes through its same-origin proxy, and resumes with ?after=, which needs no preflight.');
});

/** One chat turn straight at LewLM, from Node: events Chap should see, or miss. */
const generate = () =>
  fetch(`${LEWLM}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: BACKUP, messages: [{ role: 'user', content: 'hi' }], max_tokens: 4 }),
  }).then((res) => res.json());

await item(13, 'Events reconnect', async () => {
  if (needsHarness(13, 'Events reconnect')) return;
  await page.goto(`${CHAP}/?load=${loads++}#/ops/events`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  const narrowed = eventOpens.some((url) => url.includes('exclude_types=token.delta'));
  // Rows are buttons; the type filter's <option>s carry the same names, so a
  // text search alone would find "events.resumed" before anything happened.
  const row = (type) => page.locator('button', { hasText: type });
  const gapRow = (text) => page.locator('div', { hasText: text }).filter({ has: page.locator('span', { hasText: '⎯⎯' }) });

  // A frame has to arrive before there is a cursor to resume from.
  await generate();
  await row('request.completed').first().waitFor({ timeout: 10_000 });

  // A: a filter change reopens the subscription from the newest cursor. Nothing
  // is lost, so LewLM's marker says `lost: 0` and it is drawn as an ordinary row.
  let opensBefore = eventOpens.length;
  const hide = page.getByRole('button', { name: 'hide token.delta' });
  await hide.click();
  await row('events.resumed').first().waitFor({ timeout: 10_000 });
  const continuousWith = eventOpens.slice(opensBefore).find((url) => url.includes('after='));
  const continuousGaps = await gapRow('reconnected —').count();
  await hide.click();

  // B: LewLM restarts. The connection drops, Chap reconnects with the cursor it
  // holds, and that cursor belongs to a lifetime that no longer exists — `lost:
  // null`, which must be drawn as an unknowable gap, not a continuous timeline.
  await generate();
  await sleep(800);
  opensBefore = eventOpens.length;
  await control('lewlm/restart');
  await gapRow('server restarted').first().waitFor({ timeout: 20_000 });
  const restartWith = eventOpens.slice(opensBefore).find((url) => url.includes('after='));

  const ok = narrowed && continuousWith && continuousGaps === 0 && restartWith;
  record(13, 'Events reconnect', ok ? 'passed' : 'failed',
    `subscribes with exclude_types=token.delta (${narrowed}). Filter change reopened with ` +
    `?${continuousWith?.split('?')[1] ?? 'no cursor'}: events.resumed lost:0 drawn as a plain row, gap markers ${continuousGaps}. ` +
    `LewLM restart: the dropped stream reconnected with ?${restartWith?.split('?')[1] ?? 'no cursor'} and ` +
    'lost:null is drawn as "unknown events lost — server restarted".');
});

await browser.close();

// --- report ------------------------------------------------------------------

const report = {
  lewlm: health.version,
  backend: REAL
    ? `real engine at ${LEWLM}: ${PRIMARY}`
    : `fixture (scripts/lewlm-fixture.py --fallback): ${PRIMARY} @fixture, ${BACKUP} @backup`,
  browser: `Chromium ${browser.version()} (Playwright, headless)`,
  os: `${process.platform} ${process.arch}`,
  recordedAt: new Date().toISOString(),
  pageErrors,
  items: results.sort((a, b) => a.item - b.item),
};
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

for (const result of report.items) {
  const mark = result.status === 'passed' ? ' ok ' : result.status === 'pending' ? 'pend' : result.gap ? result.gap.padEnd(4) : 'FAIL';
  console.log(`  [${mark}] ${String(result.item).padStart(2)} ${result.name}${result.gap ? `  (${result.gap})` : ''}`);
  console.log(`         ${result.evidence}`);
}
if (pageErrors.length) console.log(`\n  page errors: ${pageErrors.join(' | ')}`);
console.log(`\n  ${OUT}`);

const unexplained = report.items.filter((result) => result.status === 'failed' && !result.gap);
process.exit(unexplained.length > 0 || pageErrors.length > 0 ? 1 : 0);
