/**
 * A fixed-row-height windowed list.
 *
 * The event stream emits one record per generated token, so rendering the whole
 * buffer is not an option — 5,000 rows of DOM would make the bench stutter
 * exactly when it is busiest. Rows are uniform height here, which makes the maths
 * trivial and a virtualization dependency unnecessary.
 */

import { useRef, useState, type ReactNode } from 'react';

interface Props<T> {
  items: readonly T[];
  rowHeight: number;
  children: (item: T, index: number) => ReactNode;
  /** Keeps the viewport pinned to the newest row while it is already at the end. */
  follow?: boolean;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  rowHeight,
  children,
  follow = false,
  overscan = 6,
  className = '',
}: Props<T>) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(0);

  // Follow only when the user has not scrolled away — yanking someone back to
  // the bottom while they are reading an event is the classic log-viewer sin.
  const atEnd = height === 0 || scrollTop + height >= items.length * rowHeight - rowHeight * 2;
  if (follow && atEnd && viewport.current) {
    queueMicrotask(() => {
      const node = viewport.current;
      if (node) node.scrollTop = node.scrollHeight;
    });
  }

  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visible = Math.ceil(height / rowHeight) + overscan * 2;
  const slice = items.slice(first, first + visible);

  return (
    <div
      ref={(node) => {
        viewport.current = node;
        if (node && node.clientHeight !== height) setHeight(node.clientHeight);
      }}
      className={`scroll-thin overflow-y-auto ${className}`}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * rowHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: first * rowHeight, left: 0, right: 0 }}>
          {slice.map((item, index) => (
            <div key={first + index} style={{ height: rowHeight }}>
              {children(item, first + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
