/**
 * The frame every non-chat screen shares: a tab strip and a scrolling body.
 *
 * Both shells hand `main` a definite height and no page scroll, so the body here
 * owns its own overflow. Ops, Lab and Settings all use this, which is why none of
 * them has to think about layout.
 */

import { useState, type ComponentType, type ReactNode } from 'react';

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
  const [active, setActive] = useState(tabs[0]?.id ?? '');
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
            onClick={() => setActive(tab.id)}
          >
            {tab.label ?? tab.id}
          </button>
        ))}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto p-4">{Body && <Body />}</div>
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
