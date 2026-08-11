/**
 * Server configuration, read once from the environment.
 *
 * LewLM and nothing else. A module's own settings are read by the module, from
 * `ModuleContext.env` — otherwise every installed tool would leave a permanent
 * mark on core's config even after it was removed.
 */

export interface ChapConfig {
  host: string;
  port: number;
  lewlmBaseUrl: string;
  lewlmApiKey: string | undefined;
  /** Serve web/dist as static files. Off in dev, where Vite serves the SPA. */
  serveStatic: boolean;
  /** Where modules keep state. Chap creates it; each module owns a path inside. */
  dataDir: string;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ChapConfig {
  return {
    host: env['CHAP_HOST'] || '127.0.0.1',
    port: Number(env['CHAP_PORT'] ?? 8787),
    lewlmBaseUrl: trimTrailingSlash(env['LEWLM_BASE_URL'] ?? 'http://127.0.0.1:8080'),
    lewlmApiKey: env['LEWLM_API_KEY'] || undefined,
    serveStatic: env['NODE_ENV'] === 'production',
    dataDir: env['CHAP_DATA_DIR'] ?? '.chap',
  };
}
