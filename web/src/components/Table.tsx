/**
 * A dense read-only table.
 *
 * Columns are declared as data so a screen states what it shows rather than how
 * it lays it out, and so the grid lines that Bench draws and Showroom hides come
 * from the `row` recipe in both cases.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  /** Right-aligned numerics read better in a column of figures. */
  numeric?: boolean;
  width?: string;
  /**
   * Cap the column and let its content truncate inside. Without one, a single
   * 64-character model id widens the table past its container and pushes the
   * columns after it out of the viewport — including the one carrying LewLM's
   * reason for refusing the model, which is the most useful cell on the screen.
   */
  maxWidth?: string;
}

export function Table<T>({
  columns,
  rows,
  empty = 'nothing to show',
  onSelect,
  selected,
}: {
  columns: Column<T>[];
  rows: readonly T[];
  empty?: string;
  onSelect?: (row: T) => void;
  selected?: (row: T) => boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [clipped, setClipped] = useState(false);

  /*
   * A thin auto-hiding scrollbar is not a hint that a column fell off the right
   * edge. This draws a fade there while one has, so the overflow is visible
   * wherever it happens rather than only where someone thought to look.
   */
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const measure = () =>
      setClipped(element.scrollWidth - element.clientWidth - element.scrollLeft > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', measure);
    };
  }, [rows, columns]);

  // Centred in the space the table would have filled. A top-anchored line under
  // a section heading reads as a panel that failed to load rather than an empty
  // one, and every screen here has at least one table that is legitimately empty.
  if (rows.length === 0) {
    return (
      <div className="flex min-h-24 items-center justify-center p-4 text-center">
        <p className="micro-label">{empty}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={scroller} className="scroll-thin overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="micro-label hairline border-b pb-1 pr-3 font-normal"
                style={{
                  width: column.width,
                  maxWidth: column.maxWidth,
                  textAlign: column.numeric ? 'right' : 'left',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className="row"
              onClick={onSelect ? () => onSelect(row) : undefined}
              style={{
                cursor: onSelect ? 'pointer' : undefined,
                background: selected?.(row) ? 'var(--skin-accent-wash)' : undefined,
              }}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`pr-3 align-top ${column.numeric ? 'numeric' : 'text-sm'} ${
                    column.maxWidth ? 'truncate' : ''
                  }`}
                  style={{
                    maxWidth: column.maxWidth,
                    textAlign: column.numeric ? 'right' : 'left',
                    paddingBlock: '0.35rem',
                  }}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {clipped && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10"
          style={{ background: 'linear-gradient(to right, transparent, var(--skin-bg))' }}
        />
      )}
    </div>
  );
}
