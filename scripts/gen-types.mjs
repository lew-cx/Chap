#!/usr/bin/env node
/**
 * Generate Chap's TypeScript view of LewLM from LewLM's own published contract.
 *
 * Chap hand-writes no LewLM types. Two sources, exactly complementary:
 *
 *   examples/integration-bundle.json  19 root schemas + shared $defs, and the
 *                                     ONLY place the streaming and request
 *                                     shapes are published
 *   OpenAPI 3.1                       all 52 routes and 246 component schemas,
 *                                     which omit every streaming/request shape
 *
 * Verified: the six types missing from `components.schemas`
 * (ChatCompletionRequest, ChatCompletionChunk, ResponseCreateRequest,
 * ResponseChunk, StreamEvent, EventType) are exactly the six the bundle
 * supplies. So the two generators never overlap and nothing needs deduping.
 * If that ever stops being true, step 2's collision assertion fails loudly.
 *
 * Usage:
 *   node scripts/gen-types.mjs                       # OpenAPI from the LewLM venv
 *   node scripts/gen-types.mjs --openapi url         # ...from a running server
 *   node scripts/gen-types.mjs --openapi file        # ...from vendor/openapi.json
 *   node scripts/gen-types.mjs --check               # regenerate and diff; CI drift gate
 */

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { compile } from 'json-schema-to-typescript';
import openapiTS, { astToString } from 'openapi-typescript';

const execFileAsync = promisify(execFile);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LEWLM_HOME = process.env.LEWLM_HOME ?? resolve(ROOT, '../LewLM');
const OUT = join(ROOT, 'packages/lewlm/src/generated');
const VENDOR = join(ROOT, 'vendor');

const BANNER = [
  '/**',
  ' * DO NOT EDIT.',
  ' *',
  ' * Generated from LewLM\'s published contract by `npm run gen:types`.',
  ' * Edit LewLM, not this file. See docs/lewlm-gaps.md for what the contract',
  ' * is missing and why some shapes look the way they do.',
  ' */',
  '',
].join('\n');

/**
 * The bundle keys its 19 schemas by surface name, and their `title` fields are
 * the type names we want — except one, which is null. Keeping this table
 * explicit means a future null title fails a lookup instead of emitting an
 * anonymous type nobody can import.
 */
const BUNDLE_TYPE_NAMES = {
  'chat.request': 'ChatCompletionRequest',
  'chat.response': 'ChatCompletionResponse',
  'chat.stream': 'ChatCompletionChunk',
  'responses.request': 'ResponseCreateRequest',
  'responses.response': 'ResponseCreateResponse',
  'responses.stream': 'ResponseChunk',
  'embeddings.request': 'EmbeddingCreateRequest',
  'embeddings.response': 'EmbeddingCreateResponse',
  'retrieval.request': 'RetrievalContextRequest',
  'retrieval.response': 'RetrievalContextResponse',
  'rerank.request': 'RerankCreateRequest',
  'rerank.response': 'RerankCreateResponse',
  'documents.ingest.request': 'DocumentIngestRequest',
  'documents.ingest.response': 'DocumentIngestResponse',
  'documents.generate.request': 'DocumentGenerateRequest',
  'documents.generate.response': 'DocumentGenerateResponse',
  'documents.transform.request': 'DocumentTransformRequest',
  'documents.transform.response': 'DocumentTransformResponse',
  'events.stream': 'StreamEvent',
};

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : (args[i + 1] ?? fallback);
};
const CHECK = args.includes('--check');
const OPENAPI_SOURCE = flag('openapi', 'venv');
const BASE_URL = flag('base', 'http://127.0.0.1:8080');

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

// ---------------------------------------------------------------------------
// 1. Resolve the OpenAPI document
// ---------------------------------------------------------------------------

/**
 * LewLM builds its OpenAPI document without binding a port, so the default path
 * needs no running server — just the checkout's venv. Verified: 52 paths,
 * 246 component schemas.
 */
async function openapiFromVenv() {
  const python = join(LEWLM_HOME, '.venv/bin/python');
  if (!existsSync(python)) throw new Error(`no venv at ${python} (set LEWLM_HOME)`);
  const { stdout } = await execFileAsync(
    python,
    ['-c', 'import json,sys; from lewlm.api.app import create_app; json.dump(create_app().openapi(), sys.stdout)'],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  return stdout;
}

async function openapiFromUrl() {
  const res = await fetch(`${BASE_URL}/v1/openapi.json`);
  if (!res.ok) throw new Error(`GET ${BASE_URL}/v1/openapi.json -> ${res.status}`);
  return res.text();
}

async function resolveOpenapi() {
  const attempts =
    OPENAPI_SOURCE === 'file'
      ? [['file', () => readFile(join(VENDOR, 'openapi.json'), 'utf8')]]
      : OPENAPI_SOURCE === 'url'
        ? [['url', openapiFromUrl], ['file', () => readFile(join(VENDOR, 'openapi.json'), 'utf8')]]
        : [['venv', openapiFromVenv], ['url', openapiFromUrl], ['file', () => readFile(join(VENDOR, 'openapi.json'), 'utf8')]];

  const failures = [];
  for (const [name, load] of attempts) {
    try {
      const raw = await load();
      console.log(`  openapi   <- ${name}`);
      return raw;
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
    }
  }
  throw new Error(`could not resolve OpenAPI.\n    ${failures.join('\n    ')}`);
}

/**
 * LewLM normalizes its own OpenAPI document (`src/lewlm/api/openapi.py`), so
 * every reference resolves against `components/schemas` and nothing is left
 * inlined. Chap used to hoist and rewrite those references itself; that code is
 * gone.
 *
 * This guard remains because the failure mode is otherwise baffling — an
 * un-normalized document makes openapi-typescript emit dozens of
 * "Can't resolve $ref" lines that say nothing about the cause.
 */
function assertResolvable(document) {
  let inlined = 0;
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object') return;
    if (node.$defs) inlined += Object.keys(node.$defs).length;
    Object.values(node).forEach(visit);
  };
  visit(document.paths ?? {});

  if (inlined > 0) {
    throw new Error(
      `OpenAPI leaves ${inlined} definitions inlined under \`paths\`, whose ` +
        '`#/$defs/...` references cannot resolve.\n' +
        '  LewLM should normalize these in src/lewlm/api/openapi.py.',
    );
  }
}

// ---------------------------------------------------------------------------
// 2. Compose the bundle into one schema
// ---------------------------------------------------------------------------

/**
 * The 19 schemas each carry their own copy of the $defs they reference. Merging
 * them into one $defs map lets us compile in a single pass, so a type shared by
 * two surfaces is one TypeScript interface rather than two structurally
 * identical ones with mangled names.
 *
 * Currently zero definitions collide. The assertion is a tripwire: if LewLM
 * ever publishes two different shapes under one name, this fails the build
 * rather than silently picking whichever came last.
 */
/**
 * Pydantic emits a `title` on every field, and json-schema-to-typescript turns
 * any titled subschema into a named type — so `temperature: float` becomes
 * `temperature?: Temperature1` instead of `temperature?: number`. Dropping
 * titles below the root keeps scalars inline and the output readable.
 */
function stripNestedTitles(node, isRoot = false) {
  if (Array.isArray(node)) return node.forEach((item) => stripNestedTitles(item));
  if (!node || typeof node !== 'object') return;
  if (!isRoot) delete node.title;
  for (const [key, value] of Object.entries(node)) {
    // $defs entries are roots in their own right and must keep their names.
    if (key === '$defs') {
      for (const def of Object.values(value ?? {})) stripNestedTitles(def, true);
    } else {
      stripNestedTitles(value);
    }
  }
}

function composeBundle(bundle) {
  const defs = {};
  const collisions = [];

  for (const [surface, schema] of Object.entries(bundle.schemas)) {
    for (const [name, def] of Object.entries(schema.$defs ?? {})) {
      const incoming = JSON.stringify(def);
      const existing = defs[name];
      if (existing && JSON.stringify(existing) !== incoming) {
        collisions.push(`${name} (redefined by ${surface})`);
        continue;
      }
      defs[name] = def;
    }
  }

  if (collisions.length > 0) {
    throw new Error(
      `integration-bundle.json defines conflicting shapes for:\n    ${collisions.join('\n    ')}\n` +
        '  Two surfaces disagree about one type name. Resolve in LewLM before regenerating.',
    );
  }

  for (const [surface, schema] of Object.entries(bundle.schemas)) {
    const name = BUNDLE_TYPE_NAMES[surface];
    if (!name) throw new Error(`no type name mapped for bundle surface "${surface}"`);
    const { $defs: _defs, $schema: _schema, ...root } = schema;
    defs[name] = { ...root, title: name };
  }

  for (const def of Object.values(defs)) stripNestedTitles(def, true);

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'LewLMBundle',
    type: 'object',
    additionalProperties: false,
    $defs: defs,
  };
}

// ---------------------------------------------------------------------------
// 3. Runtime constants
// ---------------------------------------------------------------------------

/**
 * Both runtime lists come straight from the bundle now.
 *
 * `ERROR_CODES` used to be regex-scraped out of `src/lewlm/core/errors.py`
 * because the contract published no catalog — the single least defensible thing
 * in this generator. LewLM now publishes `errors[]` with the status, the
 * retryability and the description for each code, generated from the exception
 * classes themselves, so the scrape is gone and the catalog cannot drift.
 */
async function buildEnums(bundle) {
  const eventTypes = bundle.schemas['events.stream']?.$defs?.EventType?.enum;
  if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
    throw new Error('events.stream.$defs.EventType.enum missing from the bundle');
  }

  const errors = bundle.errors;
  if (!Array.isArray(errors) || errors.length === 0) {
    throw new Error('errors[] missing from the bundle — regenerate it from LewLM');
  }
  const sorted = [...errors].sort((a, b) => a.code.localeCompare(b.code));

  return [
    BANNER,
    '/** Every event LewLM can emit on `/v1/events`. Source: integration-bundle.json. */',
    `export const EVENT_TYPES = ${JSON.stringify(eventTypes.sort(), null, 2)} as const;`,
    '',
    'export type KnownEventType = (typeof EVENT_TYPES)[number];',
    '',
    '/** Every error LewLM can return, with the status and retryability it carries. */',
    `export const ERRORS = ${JSON.stringify(sorted, null, 2)} as const;`,
    '',
    `export const ERROR_CODES = ${JSON.stringify(sorted.map((entry) => entry.code), null, 2)} as const;`,
    '',
    'export type KnownErrorCode = (typeof ERROR_CODES)[number];',
    '',
    '/** Codes LewLM says are worth retrying unchanged. */',
    'export const RETRYABLE_ERROR_CODES: ReadonlySet<string> = new Set(',
    '  ERRORS.filter((entry) => entry.retryable).map((entry) => entry.code),',
    ');',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function generate() {
  const bundlePath = join(LEWLM_HOME, 'examples/integration-bundle.json');
  const bundleRaw = await readFile(bundlePath, 'utf8');
  const bundle = JSON.parse(bundleRaw);
  if (bundle.bundle_format !== 'lewlm-integration-bundle-v1') {
    throw new Error(`unexpected bundle_format "${bundle.bundle_format}"`);
  }
  console.log(`  bundle    <- ${bundlePath}`);

  const openapiRaw = await resolveOpenapi();
  const openapi = JSON.parse(openapiRaw);
  assertResolvable(openapi);

  const composed = composeBundle(bundle);
  const bundleTs =
    BANNER +
    (await compile(composed, 'LewLMBundle', {
      bannerComment: '',
      additionalProperties: false,
      declareExternallyReferenced: true,
      unreachableDefinitions: true,
      style: { singleQuote: true, printWidth: 100 },
    }));

  const openapiTs = BANNER + astToString(await openapiTS(openapi));
  const enumsTs = await buildEnums(bundle);

  const metaTs = [
    BANNER,
    'export const CONTRACT = {',
    `  lewlmVersion: ${JSON.stringify(openapi.info?.version ?? 'unknown')},`,
    `  bundleFormat: ${JSON.stringify(bundle.bundle_format)},`,
    `  routeCount: ${Object.keys(openapi.paths ?? {}).length},`,
    `  componentCount: ${Object.keys(openapi.components?.schemas ?? {}).length},`,
    `  bundleSha256: ${JSON.stringify(sha256(bundleRaw))},`,
    `  openapiSha256: ${JSON.stringify(sha256(openapiRaw))},`,
    `  generatedAt: ${JSON.stringify(new Date().toISOString())},`,
    '} as const;',
    '',
  ].join('\n');

  // Example payloads for the Lab's document-skill prefills. Copied rather than
  // retyped so they stay exactly what LewLM ships.
  const fixtures = (await readdir(join(LEWLM_HOME, 'examples')))
    .filter((name) => name.endsWith('.json') && name !== 'integration-bundle.json');

  return {
    files: {
      'bundle.ts': bundleTs,
      'openapi.ts': openapiTs,
      'enums.ts': enumsTs,
      'meta.ts': metaTs,
    },
    fixtures,
    openapiRaw,
    stats: {
      routes: Object.keys(openapi.paths ?? {}).length,
      components: Object.keys(openapi.components?.schemas ?? {}).length,
      bundleDefs: Object.keys(composed.$defs).length,
      events: JSON.parse(enumsTs.match(/EVENT_TYPES = (\[[\s\S]*?\]) as const/)[1]).length,
    },
  };
}

/** `generatedAt` changes every run, so drift checks must ignore it. */
const stripVolatile = (source) => source.replace(/^\s*generatedAt:.*$/m, '');

async function main() {
  console.log(CHECK ? 'gen:types --check' : 'gen:types');
  const { files, fixtures, openapiRaw, stats } = await generate();

  if (CHECK) {
    const stale = [];
    for (const [name, content] of Object.entries(files)) {
      const path = join(OUT, name);
      const existing = existsSync(path) ? await readFile(path, 'utf8') : '';
      if (stripVolatile(existing) !== stripVolatile(content)) stale.push(name);
    }
    if (stale.length > 0) {
      console.error(`\n  STALE: ${stale.join(', ')}`);
      console.error('  LewLM\'s contract changed. Run `npm run gen:types` and review the diff.\n');
      process.exit(1);
    }
    console.log('\n  generated types match LewLM\'s current contract\n');
    return;
  }

  await mkdir(OUT, { recursive: true });
  await mkdir(join(OUT, 'fixtures'), { recursive: true });
  await mkdir(VENDOR, { recursive: true });

  for (const [name, content] of Object.entries(files)) {
    await writeFile(join(OUT, name), content);
  }
  for (const name of fixtures) {
    await cp(join(LEWLM_HOME, 'examples', name), join(OUT, 'fixtures', name));
  }
  // Snapshot so a machine without a LewLM checkout can still regenerate.
  await writeFile(join(VENDOR, 'openapi.json'), openapiRaw);

  console.log(`\n  ${stats.routes} routes, ${stats.components} components`);
  console.log(`  ${stats.bundleDefs} bundle types, ${stats.events} event types`);
  console.log(`  ${fixtures.length} fixtures\n`);
}

main().catch((error) => {
  console.error(`\ngen:types failed\n  ${error.message}\n`);
  process.exit(1);
});
