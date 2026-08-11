import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const CHAP_SERVER = process.env['CHAP_SERVER_URL'] ?? 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Array form, because the module rule needs a RegExp and the object form
    // cannot express one.
    alias: [
      // The client package ships TypeScript source, no build step.
      {
        find: '@chap/lewlm',
        replacement: fileURLToPath(new URL('../packages/lewlm/src/index.ts', import.meta.url)),
      },
      // Modules ship source too. One rule, naming no module, forever.
      {
        find: /^@chap\/(module-[^/]+)\/([^/]+)$/,
        replacement: fileURLToPath(new URL('../packages/$1/src/$2', import.meta.url)),
      },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  server: {
    port: 5173,
    proxy: {
      // Dev hop: browser -> Vite -> chap-server -> LewLM.
      // In production the SPA is served by chap-server, so this hop disappears.
      '/v1': { target: CHAP_SERVER, changeOrigin: true },
      '/dk': { target: CHAP_SERVER, changeOrigin: true },
      '/_chap': { target: CHAP_SERVER, changeOrigin: true },
    },
  },
});
