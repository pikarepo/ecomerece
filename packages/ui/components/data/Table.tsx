/** @jsxImportSource react */
import { ArrowDown, ArrowUp, ChevronRight, ChevronsUpDown, GripVertical } from 'lucide-react';
import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export type SortDirection = 'asc' | 'desc';

/** A single sort clause — one entry per sorted column. */
export interface TableSort {
  key: string;
  direction: SortDirection;
}

/** `stack` reflows rows into label/value cards below `md` instead of scrolling. */
export type TableResponsive = 'scroll' | 'stack';

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
  /** Label used beside a cell under `responsive="stack"` (falls back to header/key). */
  stackLabel?: string;
  headerClassName?: string;
  cellClassName?: string;

  /* ── batch 81 merged / frozen / resized / editable ───────────────────── */

  /** Merge this cell across N columns (header + body). */
  colSpan?: number;
  /** Merge this cell across N rows (body). */
  rowSpan?: number;
  /** Keep the column pinned while the table scrolls horizontally. */
  frozen?: 'left' | 'right';
  /** Explicit px offset for a pinned column (left edge / right edge). */
  frozenOffset?: number;
  /** Rendered column width (px) — also the starting width for resizing. */
  width?: number;
  /** Inline editing: opt a column out with `editable: false`. */
  editable?: boolean;
  /** Raw string used to seed the edit input (falls back to a string cell). */
  editValue?: (row: T) => string;
  /** Accessible label for the edit input (falls back to header/key). */
  editLabel?: string;
}

export interface TableColumnGroup {
  label: ReactNode;
  span: number;
  align?: 'left' | 'right' | 'center';
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
  /**
   * Group header row rendered above the column headers (batch 17 completion).
   * Spans follow column order and should sum to `columns.length`; hidden
   * (`show`) columns are not hidden inside the group row.
   */
  columnGroups?: TableColumnGroup[];

  /* ── batch 80 variants ───────────────────────────────────────────────── */

  /** Zebra-stripe body rows. */
  striped?: boolean;
  /** Cell grid lines: a rule between every column plus a hairline border. */
  bordered?: boolean;
  /**
   * Flush table: no card chrome, no row dividers and no outer border. Wins
   * over `bordered` and `cardRows`.
   */
  borderless?: boolean;
  /** Tint every row on hover, even without `onRowClick`. */
  hoverable?: boolean;
  /** Separate rows into cards (spacing + rounded row backgrounds). */
  cardRows?: boolean;
  /** `stack` reflows rows into label/value cards below `md`. Default `scroll`. */
  responsive?: TableResponsive;
  /**
   * Master-detail: render an expandable detail row beneath each row. Adds a
   * leading expand-toggle column.
   */
  renderDetail?: (row: T) => ReactNode;
  /**
   * Nested/tree: return child rows to render indented beneath an expanded row.
   * Adds a leading expand-toggle column.
   */
  getSubRows?: (row: T) => T[] | undefined;
  /** Controlled expanded row keys. */
  expandedKeys?: Array<string | number>;
  /** Initial expanded keys when uncontrolled. */
  defaultExpandedKeys?: Array<string | number>;
  onExpandedKeysChange?: (keys: Array<string | number>) => void;
  /** Accessible label for a collapsed toggle. Default "Expand row". */
  expandLabel?: string;
  /** Accessible label for an expanded toggle. Default "Collapse row". */
  collapseLabel?: string;

  /* ── batch 81 table power ────────────────────────────────────────────── */

  /**
   * Ordered multi-sort. Shift-click a header to add/remove a clause; the
   * active columns show a `1`, `2`, … rank. Replaces the single `sort`/`onSort`.
   */
  sorts?: TableSort[];
  onSortsChange?: (sorts: TableSort[]) => void;
  /** Enable multi-sort (Shift-click appends a clause). */
  multiSort?: boolean;
  /** Inline cell editing: click a cell, type, press Enter to commit. */
  editable?: boolean;
  /** Called with the new raw value when an editable cell commits. */
  onCellEdit?: (rowKey: string | number, columnKey: string, value: string) => void;
  /** Default placeholder for empty edit inputs. */
  editPlaceholder?: string;
  /** Resize columns by dragging the handle at the right edge of a header. */
  resizable?: boolean;
  onResize?: (columnKey: string, width: number) => void;
  /** Reorder rows by dragging (or focusing the grip and pressing ↑/↓). */
  reorderable?: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  /** Accessible label for the row drag grip. Default "Drag to reorder". */
  dragLabel?: string;
  /** Accessible label for the column resize handle. Default "Resize column". */
  resizeLabel?: string;
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

/** Assumed width when accumulating frozen offsets / seeding a resize. */
const DEFAULT_COLUMN_WIDTH = 128;
const MIN_COLUMN_WIDTH = 48;

/** Header text shown beside a cell under `responsive="stack"`. */
function stackLabelOf<T>(column: TableColumn<T>): string {
  if (column.stackLabel) return column.stackLabel;
  if (typeof column.header === 'string') return column.header;
  return column.key;
}

/** Advance a sort list: `append` adds a clause, otherwise it replaces. */
export function cycleSort(sorts: TableSort[], key: string, append: boolean): TableSort[] {
  const existing = sorts.find((s) => s.key === key);
  if (!append) {
    if (!existing) return [{ key, direction: 'asc' }];
    if (existing.direction === 'asc') return [{ key, direction: 'desc' }];
    return [];
  }
  if (!existing) return [...sorts, { key, direction: 'asc' }];
  if (existing.direction === 'asc')
    return sorts.map((s) => (s.key === key ? { ...s, direction: 'desc' as const } : s));
  return sorts.filter((s) => s.key !== key);
}

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
  order,
  onToggle,
  children,
  className,
}: {
  active: boolean;
  direction?: SortDirection;
  order?: number;
  onToggle: (event: { shiftKey: boolean }) => void;
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
      {order !== undefined && (
        <span className="rounded-chip bg-surface-3 px-1 text-[10px] leading-4 text-ink-2">
          {order}
        </span>
      )}
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
  columnGroups,
  striped = false,
  bordered = false,
  borderless = false,
  hoverable = false,
  cardRows = false,
  responsive = 'scroll',
  renderDetail,
  getSubRows,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedKeysChange,
  expandLabel = 'Expand row',
  collapseLabel = 'Collapse row',
  sorts,
  onSortsChange,
  multiSort = false,
  editable = false,
  onCellEdit,
  editPlaceholder,
  resizable = false,
  onResize,
  reorderable = false,
  onReorder,
  dragLabel = 'Drag to reorder',
  resizeLabel = 'Resize column',
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

  /* ── expansion (master-detail + nested/tree) ─────────────────────────── */

  const expandable = Boolean(renderDetail || getSubRows);
  const [internalExpanded, setInternalExpanded] = useState<Array<string | number>>(
    defaultExpandedKeys ?? [],
  );
  const expansionControlled = expandedKeys !== undefined;
  const expanded = expansionControlled ? expandedKeys : internalExpanded;
  const expandedSet = new Set(expanded.map((k) => String(k)));
  const isExpanded = (key: string | number) => expandedSet.has(String(key));
  const toggleExpanded = (key: string | number) => {
    const next = isExpanded(key)
      ? expanded.filter((k) => String(k) !== String(key))
      : [...expanded, key];
    if (!expansionControlled) setInternalExpanded(next);
    onExpandedKeysChange?.(next);
  };
  const canExpand = (row: T) => Boolean(renderDetail) || (getSubRows?.(row)?.length ?? 0) > 0;

  const renderRows: Array<{ row: T; depth: number }> = [];
  const walk = (list: T[], depth: number) => {
    for (const row of list) {
      renderRows.push({ row, depth });
      if (getSubRows && isExpanded(rowKey(row))) {
        const children = getSubRows(row);
        if (children && children.length > 0) walk(children, depth + 1);
      }
    }
  };
  walk(rows, 0);

  /* ── batch 81: inline editing ────────────────────────────────────────── */

  const [editing, setEditing] = useState<{ rk: string; ck: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  /* ── batch 81: column resizing ───────────────────────────────────────── */

  const [widths, setWidths] = useState<Record<string, number>>({});
  const resizeRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  useEffect(() => {
    if (!resizable) return;
    const move = (ev: MouseEvent) => {
      const r = resizeRef.current;
      if (!r || typeof ev.clientX !== 'number') return;
      const next = Math.max(MIN_COLUMN_WIDTH, Math.round(r.startW + (ev.clientX - r.startX)));
      setWidths((w) => ({ ...w, [r.key]: next }));
      onResize?.(r.key, next);
    };
    const up = () => {
      resizeRef.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [resizable, onResize]);

  /* ── batch 81: row reordering ────────────────────────────────────────── */

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  /* ── batch 81: multi-sort ────────────────────────────────────────────── */

  const activeDir = (sortKey?: string): SortDirection | undefined => {
    if (!sortKey) return undefined;
    if (multiSort) return sorts?.find((s) => s.key === sortKey)?.direction;
    return sort?.key === sortKey ? sort.direction : undefined;
  };
  const sortOrderOf = (sortKey?: string): number | undefined => {
    if (!multiSort || !sortKey || !sorts) return undefined;
    const i = sorts.findIndex((s) => s.key === sortKey);
    return i >= 0 ? i + 1 : undefined;
  };

  /* ── batch 81: frozen-column offsets ─────────────────────────────────── */

  const leftOff = new Map<string, number>();
  const rightOff = new Map<string, number>();
  {
    let acc = 0;
    for (const c of columns) {
      if (c.frozen === 'left') {
        leftOff.set(c.key, c.frozenOffset ?? acc);
        acc += c.width ?? DEFAULT_COLUMN_WIDTH;
      }
    }
    let racc = 0;
    for (let i = columns.length - 1; i >= 0; i--) {
      const c = columns[i];
      if (c.frozen === 'right') {
        rightOff.set(c.key, c.frozenOffset ?? racc);
        racc += c.width ?? DEFAULT_COLUMN_WIDTH;
      }
    }
  }
  const frozenStyle = (c: TableColumn<T>): React.CSSProperties | undefined => {
    if (c.frozen === 'left') return { left: leftOff.get(c.key) };
    if (c.frozen === 'right') return { right: rightOff.get(c.key) };
    return undefined;
  };
  const thFrozen = (c: TableColumn<T>) =>
    c.frozen ? cn('sticky z-raised', c.frozen === 'left' ? 'left-0' : 'right-0') : '';
  const tdFrozen = (c: TableColumn<T>) =>
    c.frozen ? cn('sticky z-raised bg-surface-1', c.frozen === 'left' ? 'left-0' : 'right-0') : '';

  const pad = densityClasses[density];
  const stack = responsive === 'stack';
  const grid = bordered && !borderless;
  const cellBorder = grid ? 'border-r border-line/10 last:border-r-0' : '';
  const cardCell =
    cardRows && !borderless ? 'bg-surface-2 first:rounded-l-card last:rounded-r-card' : '';
  const controlsHiddenOnMobile = stack ? 'hidden md:table-cell' : '';
  const colCount =
    columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (reorderable ? 1 : 0);

  const thAlign = (column: TableColumn<T>) =>
    column.align === 'right'
      ? 'text-right'
      : column.align === 'center'
        ? 'text-center'
        : 'text-left';

  const controlHeaderCells = (
    <>
      {reorderable && <th className={cn('w-8', pad)} aria-hidden />}
      {expandable && <th className={cn('w-8', pad)} aria-hidden />}
      {selectable && <th className={cn('w-10', pad)} aria-hidden />}
    </>
  );

  return (
    <div
      className={cn(
        borderless ? 'overflow-hidden' : 'mat-card overflow-hidden rounded-card',
        className,
      )}
    >
      {selectable && bulkBar && selected.length > 0 && (
        <div className="mat-overlay flex items-center gap-3 border-b border-line/10 px-3 py-2 text-sm">
          {bulkBar(selected, () => onSelectedKeysChange?.([]))}
        </div>
      )}
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <table
          className={cn(
            'w-full text-left',
            stack ? 'block md:table' : 'min-w-[640px]',
            grid ? 'border border-line/10' : '',
            cardCell ? 'border-separate border-spacing-y-2' : '',
          )}
        >
          <thead
            className={cn(
              'sticky top-0 z-raised bg-surface-2',
              stack && 'hidden md:table-header-group',
            )}
          >
            {columnGroups && columnGroups.length > 0 && (
              <tr className="border-b border-line/10">
                {controlHeaderCells}
                {columnGroups.map((group, i) => (
                  <th
                    key={`group-${i}`}
                    scope="colgroup"
                    colSpan={Math.max(1, group.span)}
                    className={cn(
                      'whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-ink-3',
                      pad,
                      group.align === 'right'
                        ? 'text-right'
                        : group.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                    )}
                  >
                    {group.label}
                  </th>
                ))}
              </tr>
            )}
            <tr className="border-b border-line/10">
              {reorderable && <th className={cn('w-8', pad)} aria-hidden />}
              {expandable && <th className={cn('w-8', pad)} aria-hidden />}
              {selectable && (
                <th className={cn('w-10', pad)}>
                  <SelectBox
                    label="Select all rows"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onClick={toggleAll}
                  />
                </th>
              )}
              {columns.map((column) => {
                const dir = activeDir(column.sortKey);
                const active = Boolean(column.sortKey) && dir !== undefined;
                const order = sortOrderOf(column.sortKey);
                const sortable =
                  Boolean(column.sortKey) && (Boolean(onSort) || Boolean(onSortsChange));
                const width = widths[column.key] ?? column.width;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    colSpan={column.colSpan}
                    style={{ ...(width ? { width } : {}), ...frozenStyle(column) }}
                    className={cn(
                      'whitespace-nowrap font-medium',
                      resizable && 'relative',
                      pad,
                      cellBorder,
                      thAlign(column),
                      thFrozen(column),
                      !stack && column.show && showClasses[column.show],
                      column.headerClassName,
                    )}
                  >
                    {sortable ? (
                      <SortButton
                        active={active}
                        direction={dir}
                        order={order}
                        onToggle={(event) => {
                          if (!column.sortKey) return;
                          if (multiSort && onSortsChange) {
                            onSortsChange(cycleSort(sorts ?? [], column.sortKey, event.shiftKey));
                          } else if (onSort) {
                            onSort(column.sortKey, active && dir === 'asc' ? 'desc' : 'asc');
                          }
                        }}
                      >
                        {column.header}
                      </SortButton>
                    ) : (
                      column.header
                    )}
                    {resizable && (
                      // biome-ignore lint/a11y/useSemanticElements: a resize handle is a pointer affordance, not a thematic break
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={resizeLabel}
                        data-testid={`resize-${column.key}`}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          resizeRef.current = {
                            key: column.key,
                            startX: event.clientX,
                            startW: width ?? DEFAULT_COLUMN_WIDTH,
                          };
                        }}
                        className="absolute inset-y-0 right-0 w-1.5 cursor-col-resize rounded-full bg-line/10 hover:bg-accent"
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody
            className={cn(
              !borderless && !cardCell && !stack ? 'divide-y divide-line/5' : '',
              stack ? 'block md:table-row-group' : '',
            )}
          >
            {rows.length === 0 && (
              <tr className={cn(stack && 'block')}>
                <td
                  colSpan={colCount}
                  className={cn('text-center text-sm text-ink-3', densityClasses.dense)}
                >
                  {emptyText}
                </td>
              </tr>
            )}
            {renderRows.map(({ row, depth }, index) => {
              const key = rowKey(row);
              const rowExpanded = isExpanded(key);
              const rowSelected = isSelected(row);
              const dropTarget = reorderable && overIndex === index && dragIndex !== null;
              return (
                <Fragment key={key}>
                  <tr
                    draggable={reorderable}
                    onDragStart={
                      reorderable
                        ? () => {
                            setDragIndex(index);
                          }
                        : undefined
                    }
                    onDragOver={
                      reorderable
                        ? (event) => {
                            event.preventDefault();
                            setOverIndex(index);
                          }
                        : undefined
                    }
                    onDrop={
                      reorderable
                        ? (event) => {
                            event.preventDefault();
                            const from = dragIndex;
                            if (from !== null && from !== index) onReorder?.(from, index);
                            setDragIndex(null);
                            setOverIndex(null);
                          }
                        : undefined
                    }
                    onDragEnd={
                      reorderable
                        ? () => {
                            setDragIndex(null);
                            setOverIndex(null);
                          }
                        : undefined
                    }
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'transition-colors duration-150',
                      onRowClick ? 'cursor-pointer' : '',
                      onRowClick || hoverable ? 'hover:bg-surface-3' : '',
                      striped && index % 2 === 1 && !rowSelected ? 'bg-surface-2/40' : '',
                      rowSelected ? 'bg-accent/5' : '',
                      dropTarget ? 'bg-accent/5 outline-dashed outline-1 outline-accent' : '',
                      stack ? 'block border-b border-line/10 md:table-row md:border-0' : '',
                    )}
                  >
                    {reorderable && (
                      <td className={cn('w-8', pad, controlsHiddenOnMobile)} aria-hidden>
                        <button
                          type="button"
                          draggable
                          aria-label={dragLabel}
                          data-testid={`reorder-${key}`}
                          onKeyDownCapture={(event) => {
                            if (event.key === 'ArrowUp' && index > 0) {
                              event.preventDefault();
                              onReorder?.(index, index - 1);
                            } else if (event.key === 'ArrowDown' && index < rows.length - 1) {
                              event.preventDefault();
                              onReorder?.(index, index + 1);
                            }
                          }}
                          className={cn(
                            'inline-flex size-6 cursor-grab items-center justify-center rounded-chip text-ink-4 transition-colors duration-skin ease-skin hover:text-ink',
                            focusRing(),
                          )}
                        >
                          <GripVertical className="size-4" aria-hidden />
                        </button>
                      </td>
                    )}
                    {expandable && (
                      <td
                        className={cn('w-8', pad, controlsHiddenOnMobile)}
                        style={depth > 0 ? { paddingLeft: depth * 16 } : undefined}
                      >
                        {canExpand(row) ? (
                          <button
                            type="button"
                            aria-expanded={rowExpanded}
                            aria-label={rowExpanded ? collapseLabel : expandLabel}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleExpanded(key);
                            }}
                            className={cn(
                              'inline-flex size-6 items-center justify-center rounded-chip text-ink-3 transition-colors duration-skin ease-skin hover:text-ink',
                              focusRing(),
                            )}
                          >
                            <ChevronRight
                              className={cn(
                                'size-4 shrink-0 transition-transform duration-skin ease-skin',
                                rowExpanded && 'rotate-90',
                              )}
                              aria-hidden="true"
                            />
                          </button>
                        ) : (
                          <span aria-hidden="true" className="inline-block size-6" />
                        )}
                      </td>
                    )}
                    {selectable && (
                      <td className={cn('w-10', pad, controlsHiddenOnMobile)}>
                        <SelectBox
                          label={`Select row ${key}`}
                          checked={rowSelected}
                          onClick={() => toggleRow(row)}
                        />
                      </td>
                    )}
                    {columns.map((column) => {
                      const isThisEditing =
                        editing !== null && editing.rk === String(key) && editing.ck === column.key;
                      const canEdit = editable && column.editable !== false;
                      const content = stack ? (
                        <>
                          <span className="text-xs font-medium text-ink-3 md:hidden">
                            {stackLabelOf(column)}
                          </span>
                          <span className="min-w-0 text-right md:text-left">
                            {column.cell(row)}
                          </span>
                        </>
                      ) : (
                        column.cell(row)
                      );
                      const width = widths[column.key] ?? column.width;
                      return (
                        <td
                          key={column.key}
                          colSpan={column.colSpan}
                          rowSpan={column.rowSpan}
                          style={{ ...(width ? { width } : {}), ...frozenStyle(column) }}
                          className={cn(
                            'text-sm',
                            pad,
                            cellBorder,
                            column.align === 'right'
                              ? 'font-mono tabular-nums text-right text-ink-2'
                              : column.align === 'center'
                                ? 'text-center'
                                : 'text-left',
                            !stack && column.show && showClasses[column.show],
                            column.cellClassName,
                            cardCell,
                            tdFrozen(column),
                            stack ? 'flex items-center justify-between gap-4 md:table-cell' : '',
                          )}
                        >
                          {isThisEditing ? (
                            <input
                              type="text"
                              ref={(el) => el?.focus()}
                              value={editValue}
                              placeholder={editPlaceholder}
                              aria-label={column.editLabel ?? stackLabelOf(column)}
                              onInput={(event) =>
                                setEditValue((event.target as HTMLInputElement).value)
                              }
                              onKeyDownCapture={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  onCellEdit?.(key, column.key, editValue);
                                  setEditing(null);
                                } else if (event.key === 'Escape') {
                                  event.preventDefault();
                                  setEditing(null);
                                }
                              }}
                              className={cn(
                                'w-full rounded-chip border border-line/10 bg-surface-1 px-1 py-0.5 text-sm text-ink outline-none',
                                focusRing(),
                              )}
                            />
                          ) : canEdit ? (
                            <button
                              type="button"
                              data-testid={`cell-${key}-${column.key}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditing({ rk: String(key), ck: column.key });
                                setEditValue(
                                  column.editValue
                                    ? column.editValue(row)
                                    : typeof column.cell(row) === 'string'
                                      ? (column.cell(row) as string)
                                      : '',
                                );
                              }}
                              className="block w-full rounded-chip px-1 text-left hover:bg-surface-3"
                            >
                              {content}
                            </button>
                          ) : (
                            content
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {renderDetail && rowExpanded && (
                    <tr
                      className={cn(
                        'bg-surface-2/40',
                        stack ? 'block border-b border-line/10 md:table-row md:border-0' : '',
                      )}
                    >
                      <td colSpan={colCount} className={pad}>
                        {renderDetail(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
          {summary && (
            <tfoot className="border-t border-line/10 bg-surface-2 font-medium text-ink">
              <tr>
                {reorderable && <td className={pad} />}
                {expandable && <td className={pad} />}
                {selectable && <td className={pad} />}
                {columns.map((column, i) => (
                  <td
                    key={column.key}
                    colSpan={column.colSpan}
                    className={cn(
                      pad,
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
