import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const CHAP_SERVER = process.env['CHAP_SERVER_URL'] ?? 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // The client package ships TypeScript source, no build step.
      '@chap/lewlm': fileURLToPath(new URL('../packages/lewlm/src/index.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
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
