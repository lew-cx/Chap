/**
 * Chap's server. Two jobs today:
 *   1. put the SPA and LewLM on one origin (see proxy.ts for why)
 *   2. serve the built SPA in production
 *
 * The third is the vector store under `/_chap/collections`, which is the only
 * domain logic in Chap. It exists because LewLM deliberately owns no vector
 * storage — see collections.ts for how the work divides.
 *
 * Upload staging was planned here too and never had to be built: `documents/ingest`
 * now accepts bytes directly (docs/lewlm-gaps.md, G8).
 */

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { collections } from './collections.ts';
import { loadConfig } from './config.ts';
import { pipe } from './proxy.ts';

const config = loadConfig();
const app = new Hono();

/** Chap's own liveness, distinct from LewLM's `/v1/health`. */
app.get('/_chap/health', (c) =>
  c.json({
    status: 'ok',
    service: 'chap-server',
    lewlm_base_url: config.lewlmBaseUrl,
    docktizo_base_url: config.docktizoBaseUrl,
    api_key_configured: Boolean(config.lewlmApiKey),
  }),
);

// Chap's own retrieval store. Not a proxy — the only route here that thinks.
mkdirSync(dirname(config.vectorStorePath), { recursive: true });
app.route('/_chap/collections', collections(config, config.vectorStorePath));

// LewLM. Every route, every method, streaming preserved.
app.all('/v1/*', (c) => pipe(c, config.lewlmBaseUrl, config));

// DocKtizo. The seam exists so the integration is a config change, not a
// refactor. Today it reaches a service that is mostly unimplemented.
app.all('/dk/*', (c) => pipe(c, config.docktizoBaseUrl, config, '/dk'));

if (config.serveStatic) {
  app.use('/*', serveStatic({ root: './web/dist' }));
  app.get('/*', serveStatic({ path: './web/dist/index.html' }));
}

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`chap-server  http://127.0.0.1:${info.port}`);
  console.log(`  /v1/*  ->  ${config.lewlmBaseUrl}`);
  console.log(`  /dk/*  ->  ${config.docktizoBaseUrl}`);
  console.log(`  /_chap/collections  ->  ${config.vectorStorePath}`);
});
