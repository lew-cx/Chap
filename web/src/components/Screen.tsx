/**
 * The frame every non-chat screen shares: a tab strip and a scrolling body.
 *
 * Both shells hand `main` a definite height and no page scroll, so the body here
 * owns its own overflow. Ops, Lab and Settings all use this, which is why none of
 * them has to think about layout.
 */

import type { ReactNode } from 'react';

export function Screen<T extends string>({
  tabs,
  active,
  onSelect,
  actions,
  children,
}: {
  tabs: readonly T[];
  active: T;
  onSelect: (tab: T) => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="hairline flex flex-wrap items-center gap-2 border-b px-4 py-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className="chip"
            aria-pressed={tab === active}
            onClick={() => onSelect(tab)}
          >
            {tab}
          </button>
        ))}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
      <div className="scroll-thin flex-1 overflow-y-auto p-4">{children}</div>
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
