/**
 * Bench layout — the working environment.
 *
 * Three columns with everything visible at once: navigation, the active screen,
 * and a telemetry rail that never collapses. A status strip pins the runtime
 * state to the bottom edge. Nothing is behind a disclosure, because the point of
 * a bench is that you can see the whole instrument.
 */

import type { ShellSlots } from './AppShell.tsx';

export function BenchShell({ nav, main, rail, status }: ShellSlots) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <nav className="hairline flex w-52 flex-col gap-1 border-r p-3">{nav}</nav>

        {/* Definite height; the screen owns its internal scrolling. */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{main}</main>

        <aside className="rail-slot hairline scroll-thin flex-col overflow-y-auto border-l">
          {rail}
        </aside>
      </div>

      <footer className="hairline flex items-center gap-4 border-t px-3 py-1">{status}</footer>
    </div>
  );
}
