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
 *
 * The chrome is one flex row, not a centred pill with a second pill floating
 * over it. Overlaying them worked until the viewport was narrow enough for them
 * to meet, and then the absolutely positioned one won and covered the last nav
 * entry — which, once a module contributes a screen, is the module's.
 */

import { useState } from 'react';

import { useMediaQuery } from '../lib/useMediaQuery.ts';
import type { ShellSlots } from './AppShell.tsx';

/** Below this the drawer would cover the composer it is meant to sit beside. */
const DRAWER_BESIDE = '(min-width: 1024px)';

export function ShowroomShell({ nav, main, rail, status }: ShellSlots) {
  const [railOpen, setRailOpen] = useState(false);
  const drawerBeside = useMediaQuery(DRAWER_BESIDE);

  // Inset rather than overlay wherever there is room to. A drawer that hides the
  // Send button stops you doing the one thing a live event stream is worth
  // watching during.
  const inset = railOpen && drawerBeside;

  return (
    <div className="relative h-full overflow-hidden">
      {/* Slow parallax on the backdrop. Bench collapses the duration to zero. */}
      <div className="drift pointer-events-none absolute inset-[-10%] -z-10" />

      <header className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-center gap-2 p-5">
        <div className="panel-bare scroll-thin flex min-w-0 max-w-full items-center gap-1 overflow-x-auto px-2 py-1.5">
          {nav}
        </div>

        <button
          type="button"
          onClick={() => setRailOpen((open) => !open)}
          className="panel-bare flex shrink-0 items-center gap-2 px-3 py-2"
          aria-expanded={railOpen}
          aria-label="Toggle telemetry"
        >
          {status}
        </button>
      </header>

      {/*
       * `main` gets a definite height in both shells — screens own their own
       * internal scrolling. Without that, a screen's `h-full flex` collapses,
       * its scroller has no height, and any scrollIntoView() escapes upward and
       * drags the floating chrome off-screen.
       */}
      <main
        className="absolute inset-0 flex min-h-0 px-5 pb-6 pt-24 transition-[padding] duration-300 ease-(--ease-skin)"
        style={inset ? { paddingRight: '27rem' } : undefined}
      >
        <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col">{main}</div>
      </main>

      {/*
       * Hidden, not unmounted — the rail's SSE subscription lives in the app
       * store, so keeping it mounted costs nothing and keeps the data live.
       *
       * `inert` is the load-bearing attribute. `opacity: 0` and
       * `pointer-events: none` stop the mouse and not the keyboard, so the 33
       * controls in here stayed tabbable inside a subtree a screen reader had
       * been told was not there.
       */}
      <aside
        className="panel-bare scroll-thin absolute bottom-5 right-5 top-20 z-10 w-96 max-w-[calc(100%-2.5rem)] overflow-y-auto transition-[opacity,transform] duration-300 ease-(--ease-skin)"
        style={{
          opacity: railOpen ? 1 : 0,
          transform: railOpen ? 'translateX(0)' : 'translateX(calc(100% + 1.5rem))',
          pointerEvents: railOpen ? 'auto' : 'none',
        }}
        aria-hidden={!railOpen}
        inert={!railOpen}
      >
        {rail}
      </aside>
    </div>
  );
}
