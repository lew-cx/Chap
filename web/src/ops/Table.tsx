/**
 * A dense read-only table.
 *
 * Columns are declared as data so a screen states what it shows rather than how
 * it lays it out, and so the grid lines that Bench draws and Showroom hides come
 * from the `row` recipe in both cases.
 */

import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  /** Right-aligned numerics read better in a column of figures. */
  numeric?: boolean;
  width?: string;
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
  if (rows.length === 0) return <p className="micro-label">{empty}</p>;

  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="micro-label hairline border-b pb-1 pr-3 font-normal"
                style={{ width: column.width, textAlign: column.numeric ? 'right' : 'left' }}
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
                  className={`pr-3 align-top ${column.numeric ? 'numeric' : 'text-sm'}`}
                  style={{ textAlign: column.numeric ? 'right' : 'left', paddingBlock: '0.35rem' }}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
