/**
 * Bench layout — the working environment.
 *
 * Three columns with everything visible at once: navigation, the active screen,
 * and a telemetry rail. A status strip pins the runtime state to the bottom
 * edge. Nothing is behind a disclosure, because the point of a bench is that you
 * can see the whole instrument.
 *
 * "Everything at once" is a claim about a desk, not about a viewport. A fixed
 * 208px nav and a fixed rail leave the transcript whatever is left, and what was
 * left at 768px was narrower than the telemetry beside it. So there are two
 * widths at which the layout gives way, in the order that costs least: the rail
 * becomes a toggled overlay first, and the nav becomes a top strip second. Both
 * keep every control reachable — the rail is hidden, never removed.
 */

import { useState } from 'react';

import { useMediaQuery } from '../lib/useMediaQuery.ts';
import type { ShellSlots } from './AppShell.tsx';

/** Below this the rail and a usable transcript do not both fit. */
const RAIL_BESIDE = '(min-width: 1100px)';
/** Below this a 208px nav column costs more than the screen it is navigating. */
const NAV_BESIDE = '(min-width: 760px)';

export function BenchShell({ nav, main, rail, status }: ShellSlots) {
  const railBeside = useMediaQuery(RAIL_BESIDE);
  const navBeside = useMediaQuery(NAV_BESIDE);
  const [railOpen, setRailOpen] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className={`relative flex min-h-0 flex-1 ${navBeside ? '' : 'flex-col'}`}>
        <nav
          className={
            navBeside
              ? 'hairline flex w-52 shrink-0 flex-col gap-1 border-r p-3'
              : 'hairline scroll-thin flex shrink-0 gap-1 overflow-x-auto border-b p-2'
          }
        >
          {nav}
        </nav>

        {/* Definite height; the screen owns its internal scrolling. */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{main}</main>

        <aside
          className={
            railBeside
              ? 'rail-slot hairline scroll-thin flex-col overflow-y-auto border-l'
              : 'hairline scroll-thin absolute inset-y-0 right-0 z-20 w-80 max-w-full flex-col overflow-y-auto border-l'
          }
          style={
            railBeside
              ? undefined
              : {
                  backgroundColor: 'var(--skin-bg)',
                  boxShadow: 'var(--skin-shadow-lift)',
                  display: railOpen ? 'flex' : 'none',
                }
          }
          // Hidden by `display: none` rather than opacity, so nothing behind it
          // is focusable and no `inert` is needed to make that true.
          aria-hidden={railBeside ? undefined : !railOpen}
        >
          {rail}
        </aside>
      </div>

      <footer className="hairline flex items-center gap-4 border-t px-3 py-1">
        {status}
        {!railBeside && (
          <button
            type="button"
            className="chip ml-auto"
            aria-pressed={railOpen}
            aria-expanded={railOpen}
            onClick={() => setRailOpen((open) => !open)}
          >
            telemetry
          </button>
        )}
      </footer>
    </div>
  );
}
