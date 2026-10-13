/** @jsxImportSource react */
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export type SortDirection = 'asc' | 'desc';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  sortKey?: string;
  /**
   * Extra columns revealed only as viewport allows (DESIGN.md §18.5).
   */
  show?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  headerClassName?: string;
  cellClassName?: string;
}

export interface TableProps<T> {
  columns: Array<TableColumn<T>>;
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  sort?: { key: string; direction: SortDirection };
  onSort?: (key: string, direction: SortDirection) => void;
  density?: 'comfortable' | 'dense' | 'compact';
  maxHeight?: number;
  emptyText?: string;
  className?: string;
  /** Controlled selection. Provide together with `onSelectedKeysChange` to enable. */
  selectedKeys?: Array<string | number>;
  onSelectedKeysChange?: (keys: Array<string | number>) => void;
  /** Bulk-action bar shown above the table while rows are selected. */
  bulkBar?: (selected: Array<string | number>, clear: () => void) => ReactNode;
  /** Summary cells (aligned to `columns`) rendered in a `<tfoot>`. */
  summary?: ReactNode[];
}

const showClasses = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
  '2xl': 'hidden 2xl:table-cell',
  '3xl': 'hidden 3xl:table-cell',
  '4xl': 'hidden 4xl:table-cell',
} as const;

const densityClasses = {
  comfortable: 'px-5 py-4',
  dense: 'px-3 py-2',
  compact: 'px-2.5 py-1.5',
} as const;

function SortIndicator({ active, direction }: { active: boolean; direction?: SortDirection }) {
  if (!active) return <ChevronsUpDown className="size-3 text-ink-3" />;
  return direction === 'asc' ? (
    <ArrowUp className="size-3 text-ink" />
  ) : (
    <ArrowDown className="size-3 text-ink" />
  );
}

function SortButton({
  active,
  direction,
  onToggle,
  children,
  className,
}: {
  active: boolean;
  direction?: SortDirection;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1 text-left text-xs font-medium transition-colors duration-skin ease-skin',
        active ? 'text-ink' : 'text-ink-3 hover:text-ink',
        className,
      )}
    >
      {children}
      <SortIndicator active={active} direction={direction} />
    </button>
  );
}

/** Bare select checkbox driven by click (not change) for harness reliability. */
function SelectBox({
  checked,
  indeterminate = false,
  label,
  onClick,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      aria-checked={indeterminate ? 'mixed' : checked}
      onClick={onClick}
      readOnly
      className={cn(
        'h-4 w-4 cursor-pointer appearance-none rounded-chip border-none bg-surface-3 transition-all duration-skin ease-skin checked:bg-accent',
        indeterminate && 'bg-accent',
        focusRing(),
      )}
    />
  );
}

export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  onSort,
  density = 'dense',
  maxHeight,
  emptyText = 'No results',
  className,
  selectedKeys,
  onSelectedKeysChange,
  bulkBar,
  summary,
}: TableProps<T>) {
  const selectable = Boolean(onSelectedKeysChange);
  const selected = selectedKeys ?? [];
  const selectedSet = new Set(selected.map((k) => String(k)));
  const isSelected = (row: T) => selectedSet.has(String(rowKey(row)));

  const allSelected = rows.length > 0 && rows.every(isSelected);
  const someSelected = !allSelected && rows.some(isSelected);

  const toggleAll = () => {
    if (!onSelectedKeysChange) return;
    onSelectedKeysChange(allSelected ? [] : rows.map((r) => rowKey(r)));
  };
  const toggleRow = (row: T) => {
    if (!onSelectedKeysChange) return;
    const key = rowKey(row);
    const next = new Set(selectedSet);
    if (next.has(String(key))) next.delete(String(key));
    else next.add(String(key));
    onSelectedKeysChange(rows.filter((r) => next.has(String(rowKey(r)))).map((r) => rowKey(r)));
  };

  const colCount = columns.length + (selectable ? 1 : 0);
  const thAlign = (column: TableColumn<T>) =>
    column.align === 'right'
      ? 'text-right'
      : column.align === 'center'
        ? 'text-center'
        : 'text-left';

  return (
    <div className={cn('mat-card overflow-hidden rounded-card', className)}>
      {selectable && bulkBar && selected.length > 0 && (
        <div className="mat-overlay flex items-center gap-3 border-b border-line/10 px-3 py-2 text-sm">
          {bulkBar(selected, () => onSelectedKeysChange?.([]))}
        </div>
      )}
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <table className="w-full min-w-[640px] text-left">
          <thead className="sticky top-0 z-raised bg-surface-2">
            <tr className="border-b border-line/10">
              {selectable && (
                <th className={cn('w-10', densityClasses[density])}>
                  <SelectBox
                    label="Select all rows"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onClick={toggleAll}
                  />
                </th>
              )}
              {columns.map((column) => {
                const active = sort?.key === column.sortKey;
                const Th = (
                  <th
                    key={column.key}
                    className={cn(
                      'whitespace-nowrap font-medium',
                      densityClasses[density],
                      thAlign(column),
                      column.show && showClasses[column.show],
                      column.headerClassName,
                    )}
                  >
                    {column.sortKey && onSort ? (
                      <SortButton
                        active={active}
                        direction={sort?.direction}
                        onToggle={() =>
                          onSort(
                            column.sortKey as string,
                            active && sort?.direction === 'asc' ? 'desc' : 'asc',
                          )
                        }
                      >
                        {column.header}
                      </SortButton>
                    ) : (
                      column.header
                    )}
                  </th>
                );
                return Th;
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/5">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={colCount}
                  className={cn('text-center text-sm text-ink-3', densityClasses.dense)}
                >
                  {emptyText}
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'transition-colors duration-150',
                    onRowClick ? 'cursor-pointer hover:bg-surface-3' : '',
                    isSelected(row) ? 'bg-accent/5' : '',
                  )}
                >
                  {selectable && (
                    <td className={cn('w-10', densityClasses[density])}>
                      <SelectBox
                        label={`Select row ${key}`}
                        checked={isSelected(row)}
                        onClick={() => toggleRow(row)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'text-sm',
                        densityClasses[density],
                        column.align === 'right'
                          ? 'font-mono tabular-nums text-right text-ink-2'
                          : column.align === 'center'
                            ? 'text-center'
                            : 'text-left',
                        column.show && showClasses[column.show],
                        column.cellClassName,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          {summary && (
            <tfoot className="border-t border-line/10 bg-surface-2 font-medium text-ink">
              <tr>
                {selectable && <td className={densityClasses[density]} />}
                {columns.map((column, i) => (
                  <td
                    key={column.key}
                    className={cn(
                      densityClasses[density],
                      column.align === 'right'
                        ? 'font-mono tabular-nums text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                    )}
                  >
                    {summary[i]}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
