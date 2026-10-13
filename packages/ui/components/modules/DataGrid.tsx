/** @jsxImportSource react */

import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';
import { cn } from '../../lib/cn';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  width?: number;
  sortable?: boolean;
}

export interface DataGridProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  density?: 'comfortable' | 'compact';
  className?: string;
}

export function DataGrid<T>({
  rows,
  columns,
  getRowId,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  density = 'comfortable',
  className,
}: DataGridProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => (density === 'compact' ? 32 : 48),
    overscan: 5,
  });

  const sortedRows = useMemo(() => {
    if (!sortColumn || !onSort) return rows;
    const col = columns.find((c) => c.key === sortColumn);
    if (!col) return rows;
    return [...rows].sort((a, b) => {
      const aVal = col.cell(a);
      const bVal = col.cell(b);
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [rows, sortColumn, sortDirection, columns, onSort]);

  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    const newDir = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDir);
  };

  const densityClass = density === 'compact' ? 'py-1.5 px-3 text-sm' : 'py-3 px-4 text-sm';

  return (
    <div className={cn('mat-card rounded-card overflow-hidden', className)}>
      <div className="overflow-auto" ref={containerRef} style={{ height: '400px' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left font-medium text-ink-3 whitespace-nowrap',
                    densityClass,
                    'border-b border-line/10',
                    col.sortable ? 'cursor-pointer select-none' : '',
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-ink-4">
                        {sortColumn === col.key ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ▲'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-ink-3">
                  No data
                </td>
              </tr>
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = sortedRows[virtualRow.index];
                return (
                  <tr
                    key={getRowId(row)}
                    className={cn(
                      'border-b border-line/5 transition-colors',
                      'hover:bg-surface-2',
                      densityClass,
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="whitespace-nowrap">
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
