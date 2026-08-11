/**
 * Chap's server. Three jobs:
 *   1. put the SPA and LewLM on one origin (see proxy.ts for why)
 *   2. mount whatever modules are registered, without knowing what they are
 *   3. serve the built SPA in production
 *
 * LewLM is wired in directly because Chap is a LewLM client — that is the one
 * thing that cannot be removed. Everything else, including the vector store that
 * used to live in this directory, arrives through MODULES. See modules.ts.
 *
 * Upload staging was planned here too and never had to be built: `documents/ingest`
 * now accepts bytes directly (docs/lewlm-gaps.md, G8).
 */

import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import { loadConfig } from './config.ts';
import { MODULES, type ModuleContext } from './modules.ts';
import { pipe, type PipeTarget } from './proxy.ts';

const config = loadConfig();
const app = new Hono();
const webDist = fileURLToPath(new URL('../../web/dist/', import.meta.url));

const LEWLM: PipeTarget = {
  baseUrl: config.lewlmBaseUrl,
  headers: {
    ...(config.lewlmApiKey ? { 'x-api-key': config.lewlmApiKey } : {}),
    // Operational identity, not authentication. LewLM records it for audit and
    // reports it in bounded `request_metrics.applications` summaries.
    'x-lewlm-application-id': 'chap',
  },
};

mkdirSync(config.dataDir, { recursive: true });
const context: ModuleContext = {
  env: process.env,
  dataDir: config.dataDir,
  lewlm: { baseUrl: config.lewlmBaseUrl, apiKey: config.lewlmApiKey },
};
const modules = MODULES.map((build) => build(context));

/**
 * Chap's own liveness, plus what each module says about itself.
 *
 * The module list is the browser's only source of truth about what is installed
 * and whether it works — see web/src/lib/useModules.ts. A module that answers
 * `ready: false` still appears in the UI, carrying its own reason.
 */
app.get('/_chap/health', async (c) =>
  c.json({
    status: 'ok',
    service: 'chap-server',
    lewlm_base_url: config.lewlmBaseUrl,
    api_key_configured: Boolean(config.lewlmApiKey),
    modules: await Promise.all(
      modules.map(async (module) => ({
        id: module.id,
        label: module.label,
        prefix: module.prefix,
        env: module.env ?? [],
        ...((await module.probe?.()) ?? { ready: true, reason: null }),
      })),
    ),
  }),
);

// LewLM. Core, non-removable. Every route, every method, streaming preserved.
app.all('/v1/*', (c) => pipe(c, LEWLM));

// Modules. This loop is the only place core touches them, and it knows nothing
// about any of them beyond the shape in modules.ts.
for (const module of modules) {
  if (module.mount) app.route(module.prefix, module.mount);
  const proxy = module.proxy;
  if (proxy) app.all(`${module.prefix}/*`, (c) => pipe(c, { ...proxy, stripPrefix: module.prefix }));
}

// Last: these are catch-alls and would swallow every route above them.
if (config.serveStatic) {
  app.use('/*', serveStatic({ root: webDist }));
  app.get('/*', serveStatic({ root: webDist, path: 'index.html' }));
}

serve({ fetch: app.fetch, hostname: config.host, port: config.port }, (info) => {
  console.log('chap-server  http://' + config.host + ':' + info.port);
  console.log(`  /v1/*  ->  ${config.lewlmBaseUrl}`);
  for (const module of modules) console.log(`  ${module.prefix}/*  ->  ${module.label}`);
});
