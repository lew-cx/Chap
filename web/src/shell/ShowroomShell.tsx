/**
 * Showroom layout — the display environment.
 *
 * One centred column under floating chrome, over the gradient the token layer
 * paints on `body`. The telemetry rail becomes a drawer.
 *
 * The rail is HIDDEN, never removed: Showroom must not become a lesser app.
 * The same data is one click away rather than absent. If a field ever gets
 * dropped for Showroom, the token architecture has failed and we are building
 * two apps.
 */

import { useState } from 'react';

import type { ShellSlots } from './AppShell.tsx';

export function ShowroomShell({ nav, main, rail, status }: ShellSlots) {
  const [railOpen, setRailOpen] = useState(false);

  return (
    <div className="relative h-full overflow-hidden">
      {/* Slow parallax on the backdrop. Bench collapses the duration to zero. */}
      <div className="drift pointer-events-none absolute inset-[-10%] -z-10" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-center p-5">
        <div className="panel-bare flex items-center gap-1 px-2 py-1.5">{nav}</div>
      </header>

      <div className="absolute right-5 top-5 z-20">
        <button
          type="button"
          onClick={() => setRailOpen((open) => !open)}
          className="panel-bare flex items-center gap-2 px-3 py-2"
          aria-expanded={railOpen}
          aria-label="Toggle telemetry"
        >
          {status}
        </button>
      </div>

      {/*
       * `main` gets a definite height in both shells — screens own their own
       * internal scrolling. Without that, a screen's `h-full flex` collapses,
       * its scroller has no height, and any scrollIntoView() escapes upward and
       * drags the floating chrome off-screen.
       */}
      <main className="absolute inset-0 flex min-h-0 px-5 pb-6 pt-24">
        <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col">{main}</div>
      </main>

      {/*
       * Hidden, not unmounted — the rail's SSE subscription lives in the app
       * store, so keeping it mounted costs nothing and keeps the data live.
       */}
      <aside
        className="panel-bare scroll-thin absolute bottom-5 right-5 top-20 z-10 w-96 overflow-y-auto transition-[opacity,transform] duration-300 ease-(--ease-skin)"
        style={{
          opacity: railOpen ? 1 : 0,
          transform: railOpen ? 'translateX(0)' : 'translateX(calc(100% + 1.5rem))',
          pointerEvents: railOpen ? 'auto' : 'none',
        }}
        aria-hidden={!railOpen}
      >
        {rail}
      </aside>
    </div>
  );
}
