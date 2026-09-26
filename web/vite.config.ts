import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type ProxyOptions } from 'vite';

const CHAP_SERVER = process.env['CHAP_SERVER_URL'] ?? 'http://127.0.0.1:8787';

/**
 * The dev hop, made as honest as the one it stands in for.
 *
 * When an upstream response ends early — LewLM restarted under an open
 * `/v1/events`, or died mid-chat — chap-server truncates the body, so the
 * browser's read fails and it reconnects. Vite's proxy did not pass that on:
 * it left the browser's half open, so under `npm run dev` the stream sat at
 * "open" forever and never resumed. Tearing the browser's connection down when
 * the upstream one ends incomplete gives dev the behaviour production has.
 */
const hop: ProxyOptions = {
  target: CHAP_SERVER,
  changeOrigin: true,
  configure: (proxy) => {
    proxy.on('proxyRes', (upstream, _req, res) => {
      upstream.on('close', () => {
        if (!upstream.complete && !res.writableEnded) res.destroy();
      });
    });
  },
};

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
    // Fail rather than drift to 5174. A second dev server beside a stale one is
    // the wrong fix: its proxy lands on whichever chap-server holds 8787, and
    // LewLM's CORS allow-list names 5173.
    strictPort: true,
    proxy: {
      // Dev hop: browser -> Vite -> chap-server -> LewLM.
      // In production the SPA is served by chap-server, so this hop disappears.
      '/v1': hop,
      '/dk': hop,
      '/_chap': hop,
    },
  },
});
