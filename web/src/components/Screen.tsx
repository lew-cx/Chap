/**
 * The frame every non-chat screen shares: a tab strip and a scrolling body.
 *
 * Both shells hand `main` a definite height and no page scroll, so the body here
 * owns its own overflow. Ops, Lab and Settings all use this, which is why none of
 * them has to think about layout.
 */

import { type ComponentType, type ReactNode } from 'react';

import { ErrorBoundary } from './ErrorBoundary.tsx';
import { useNav } from '../store/nav.ts';

/**
 * One tab. A descriptor rather than a bare string because a module contributes
 * tabs by concatenation, and a `tab === 'x' && <X/>` chain cannot absorb an array
 * that is not known when the file is written.
 */
export interface ScreenTab {
  id: string;
  /** Defaults to `id`, which is what every tab in Chap displays today. */
  label?: string;
  component: ComponentType;
}

export function Screen({ tabs, actions }: { tabs: readonly ScreenTab[]; actions?: ReactNode }) {
  // The tab is part of the route, so Ops -> Events survives a reload and fits in
  // a link. An unknown id in the URL falls back to the first tab rather than
  // rendering nothing.
  const active = useNav((state) => state.tab);
  const setTab = useNav((state) => state.setTab);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];
  const Body = current?.component;

  return (
    <div className="flex h-full flex-col">
      <div className="hairline flex flex-wrap items-center gap-2 border-b px-4 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="chip"
            aria-pressed={tab.id === current?.id}
            onClick={() => setTab(tab.id)}
          >
            {tab.label ?? tab.id}
          </button>
        ))}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
      {/* A flex column so a panel that wants the remaining height can ask for it
          with `flex-1` instead of hard-coding one. Ordinary block content stacks
          exactly as it did. */}
      <div className="scroll-thin flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        {/* Keyed by tab: switching away from a broken panel clears the failure. */}
        <ErrorBoundary key={current?.id} label={current?.label ?? current?.id}>
          {Body && <Body />}
        </ErrorBoundary>
      </div>
    </div>
  );
}

/** A titled block. Grouping is most of what makes a dense console readable. */
export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-4">
      <h2 className="micro-label mb-2 flex items-center gap-2">
        {title}
        {hint != null && (
          <span className="numeric" style={{ color: 'var(--skin-faint)' }}>
            {hint}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

/** Everything Chap cannot show yet, said plainly rather than left blank. */
export function Missing({ children }: { children: ReactNode }) {
  return (
    <p className="micro-label" style={{ color: 'var(--skin-faint)' }}>
      {children}
    </p>
  );
}

/**
 * An empty state that sits in the middle of the space it is explaining rather
 * than at the top of it. Top-anchored placeholders read as a panel that failed to
 * load; centred ones read as a panel with nothing in it yet.
 */
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-32 flex-1 items-center justify-center p-6 text-center">
      <p className="micro-label">{children}</p>
    </div>
  );
}
