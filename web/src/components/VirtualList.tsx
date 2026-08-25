/**
 * A fixed-row-height windowed list.
 *
 * The event stream emits one record per generated token, so rendering the whole
 * buffer is not an option — 5,000 rows of DOM would make the bench stutter
 * exactly when it is busiest. Rows are uniform height here, which makes the maths
 * trivial and a virtualization dependency unnecessary.
 */

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

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

  /*
   * In a layout effect, not in the render body. Scheduling a scroll from render
   * meant a render React discarded or replayed still moved the viewport, which
   * is a side effect at exactly the moment React reserves the right to not have
   * happened.
   */
  useLayoutEffect(() => {
    if (!follow || !atEnd) return;
    const node = viewport.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [follow, atEnd, items.length, rowHeight]);

  /*
   * Measured by an observer rather than by an inline ref callback. The callback
   * runs on every render and converges, but a window resize with no scroll never
   * triggers one — so the visible-row count stayed at the old viewport's size.
   */
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const measure = () => setHeight(node.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visible = Math.ceil(height / rowHeight) + overscan * 2;
  const slice = items.slice(first, first + visible);

  return (
    <div
      ref={viewport}
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
