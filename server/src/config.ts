/** Server configuration, read once from the environment. */

export interface ChapConfig {
  port: number;
  lewlmBaseUrl: string;
  lewlmApiKey: string | undefined;
  docktizoBaseUrl: string;
  /** Serve web/dist as static files. Off in dev, where Vite serves the SPA. */
  serveStatic: boolean;
  /** Where the vector store lives. LewLM owns no vector storage by design. */
  vectorStorePath: string;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ChapConfig {
  return {
    port: Number(env['CHAP_PORT'] ?? 8787),
    lewlmBaseUrl: trimTrailingSlash(env['LEWLM_BASE_URL'] ?? 'http://127.0.0.1:8080'),
    lewlmApiKey: env['LEWLM_API_KEY'] || undefined,
    docktizoBaseUrl: trimTrailingSlash(env['DOCKTIZO_BASE_URL'] ?? 'http://127.0.0.1:8090'),
    serveStatic: env['NODE_ENV'] === 'production',
    vectorStorePath: env['CHAP_VECTOR_STORE'] ?? '.chap/vectors.sqlite',
  };
}
