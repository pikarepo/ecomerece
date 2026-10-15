/** @jsxImportSource react */

import { ArrowDown, ArrowUp, ArrowUpDown, Bookmark, Filter, Plus, Trash2, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Search & filter (todo/09 batch 69): sort builder, filter builder, saved
 * views, date-range presets and a faceted filter panel. `mat-*` + tokens.
 */

export type SortDir = 'asc' | 'desc';

export interface SortRule {
  field: string;
  dir: SortDir;
}

export interface SortBuilderProps {
  fields?: { id: string; label: string }[];
  value?: SortRule[];
  onChange?: (rules: SortRule[]) => void;
  className?: string;
}

export function SortBuilder({ fields = [], value = [], onChange, className }: SortBuilderProps) {
  const set = (rules: SortRule[]) => onChange?.(rules);
  return (
    <fieldset
      className={cn('m-0 min-w-0 border-0 p-0 flex flex-col gap-2', className)}
      aria-label="Sort builder"
    >
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-3">
        <ArrowUpDown className="size-3.5" aria-hidden />
        Sort by
      </p>
      {value.map((rule, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            aria-label={`Sort field ${i + 1}`}
            value={rule.field}
            onChange={(e) =>
              set(value.map((r, j) => (j === i ? { ...r, field: e.target.value } : r)))
            }
            className={cn('mat-well rounded-control px-2 py-1.5 text-sm text-ink', focusRing())}
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label={rule.dir === 'asc' ? 'Toggle to descending' : 'Toggle to ascending'}
            onClick={() =>
              set(
                value.map((r, j) =>
                  j === i ? { ...r, dir: r.dir === 'asc' ? 'desc' : 'asc' } : r,
                ),
              )
            }
            className={cn(
              'inline-flex items-center gap-1 rounded-control bg-surface-1 px-2 py-1.5 text-sm text-ink-2',
              focusRing(),
            )}
          >
            {rule.dir === 'asc' ? (
              <ArrowUp className="size-3.5" aria-hidden />
            ) : (
              <ArrowDown className="size-3.5" aria-hidden />
            )}
            {rule.dir === 'asc' ? 'Asc' : 'Desc'}
          </button>
          <button
            type="button"
            aria-label={`Remove sort ${i + 1}`}
            onClick={() => set(value.filter((_, j) => j !== i))}
            className={cn('rounded-control p-1.5 text-ink-4 hover:text-danger', focusRing())}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => set([...value, { field: fields[0]?.id ?? 'id', dir: 'asc' }])}
        className={cn(
          'inline-flex w-fit items-center gap-1.5 rounded-control px-2 py-1.5 text-sm text-accent hover:bg-surface-1',
          focusRing(),
        )}
      >
        <Plus className="size-4" aria-hidden />
        Add sort
      </button>
    </fieldset>
  );
}

export interface FilterRule {
  field: string;
  operator: string;
  value: string;
}

export const DEFAULT_OPERATORS = [
  'is',
  'is not',
  'contains',
  'is greater than',
  'is less than',
  'is empty',
] as const;

export interface FilterBuilderProps {
  fields?: { id: string; label: string }[];
  operators?: string[];
  value?: FilterRule[];
  onChange?: (rules: FilterRule[]) => void;
  className?: string;
}

export function FilterBuilder({
  fields = [],
  operators = ['is', 'is not', 'contains', 'is greater than', 'is less than', 'is empty'],
  value = [],
  onChange,
  className,
}: FilterBuilderProps) {
  const set = (rules: FilterRule[]) => onChange?.(rules);
  const patch = (i: number, part: Partial<FilterRule>) =>
    set(value.map((r, j) => (j === i ? { ...r, ...part } : r)));
  return (
    <fieldset
      className={cn('m-0 min-w-0 border-0 p-0 flex flex-col gap-2', className)}
      aria-label="Filter builder"
    >
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-3">
        <Filter className="size-3.5" aria-hidden />
        Filters
      </p>
      {value.map((rule, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            aria-label={`Filter field ${i + 1}`}
            value={rule.field}
            onChange={(e) => patch(i, { field: e.target.value })}
            className={cn('mat-well rounded-control px-2 py-1.5 text-sm text-ink', focusRing())}
          >
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            aria-label={`Filter operator ${i + 1}`}
            value={rule.operator}
            onChange={(e) => patch(i, { operator: e.target.value })}
            className={cn('mat-well rounded-control px-2 py-1.5 text-sm text-ink', focusRing())}
          >
            {operators.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          <input
            aria-label={`Filter value ${i + 1}`}
            value={rule.value}
            onChange={(e) => patch(i, { value: e.target.value })}
            className={cn(
              'mat-well min-w-0 flex-1 rounded-control px-2 py-1.5 text-sm text-ink',
              focusRing(),
            )}
          />
          <button
            type="button"
            aria-label={`Remove filter ${i + 1}`}
            onClick={() => set(value.filter((_, j) => j !== i))}
            className={cn('rounded-control p-1.5 text-ink-4 hover:text-danger', focusRing())}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          set([...value, { field: fields[0]?.id ?? 'field', operator: 'is', value: '' }])
        }
        className={cn(
          'inline-flex w-fit items-center gap-1.5 rounded-control px-3 py-1.5 text-sm text-accent hover:bg-surface-1',
          focusRing(),
        )}
      >
        <Plus className="size-4" aria-hidden />
        Add filter
      </button>
    </fieldset>
  );
}

export interface SavedView {
  id: string;
  name: string;
  count?: number;
}

export interface SavedViewsProps {
  views: SavedView[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onSave?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function SavedViews({
  views,
  activeId,
  onSelect,
  onSave,
  onDelete,
  className,
}: SavedViewsProps) {
  return (
    <fieldset
      className={cn('m-0 min-w-0 border-0 p-0 flex flex-col gap-1', className)}
      aria-label="Saved views"
    >
      {views.map((view) => (
        <div key={view.id} className="group flex items-center gap-1">
          <button
            type="button"
            aria-pressed={view.id === activeId}
            onClick={() => onSelect?.(view.id)}
            className={cn(
              'flex min-w-0 flex-1 items-center gap-2 rounded-control px-2 py-1.5 text-left text-sm',
              view.id === activeId ? 'bg-accent/10 text-accent' : 'text-ink-2 hover:bg-surface-1',
              focusRing(),
            )}
          >
            <Bookmark className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{view.name}</span>
            {typeof view.count === 'number' && (
              <span className="ml-auto shrink-0 rounded-full bg-surface-1 px-1.5 text-xs tabular-nums text-ink-3">
                {view.count}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label={`Delete view ${view.name}`}
            onClick={() => onDelete?.(view.id)}
            className={cn(
              'shrink-0 rounded-control p-1 text-ink-4 opacity-0 hover:text-danger group-hover:opacity-100',
              focusRing(),
            )}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onSave?.()}
        className={cn(
          'inline-flex w-fit items-center gap-1.5 rounded-control px-2 py-1.5 text-sm text-accent hover:bg-surface-1',
          focusRing(),
        )}
      >
        <Plus className="size-3.5" aria-hidden />
        Save current view
      </button>
    </fieldset>
  );
}

export type DateRangePreset = 'today' | '7d' | '30d' | 'month' | 'year' | 'custom';

export interface DateRangePresetsProps {
  presets?: DateRangePreset[];
  active?: DateRangePreset;
  onSelect?: (preset: DateRangePreset) => void;
  className?: string;
}

const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  month: 'This month',
  year: 'This year',
  custom: 'Custom',
};

export function DateRangePresets({
  presets = ['today', '7d', '30d', 'month', 'year', 'custom'],
  active,
  onSelect,
  className,
}: DateRangePresetsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Date range presets"
      className={cn('flex flex-wrap gap-1.5', className)}
    >
      {presets.map((preset) => (
        <button
          key={preset}
          type="button"
          aria-pressed={preset === active}
          onClick={() => onSelect?.(preset)}
          className={cn(
            'rounded-chip px-3 py-1.5 text-sm font-medium transition-colors duration-skin ease-skin',
            preset === active
              ? 'bg-accent text-accent-ink'
              : 'bg-surface-1 text-ink-2 hover:text-ink',
            focusRing(),
          )}
        >
          {PRESET_LABELS[preset]}
        </button>
      ))}
    </div>
  );
}

export interface FacetOption {
  value: string;
  label: string;
  count?: number;
}

export interface FacetGroup {
  id: string;
  label: string;
  options: FacetOption[];
}

export interface FacetedFilterPanelProps {
  groups: FacetGroup[];
  selected?: Record<string, string[]>;
  onChange?: (selected: Record<string, string[]>) => void;
  onClear?: () => void;
  className?: string;
}

export function FacetedFilterPanel({
  groups,
  selected = {},
  onChange,
  onClear,
  className,
}: FacetedFilterPanelProps) {
  const toggle = (groupId: string, value: string) => {
    const current = selected[groupId] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange?.({ ...selected, [groupId]: next });
  };
  const activeCount = Object.values(selected).reduce((n, arr) => n + arr.length, 0);
  return (
    <fieldset
      className={cn('m-0 min-w-0 border-0 p-0 flex flex-col gap-5', className)}
      aria-label="Faceted filters"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => onClear?.()}
            className={cn('text-xs text-ink-3 hover:text-ink', focusRing())}
          >
            Clear all
          </button>
        )}
      </div>
      {groups.map((group) => (
        <fieldset key={group.id} className="flex flex-col gap-1.5">
          <legend className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-3">
            {group.label}
          </legend>
          {group.options.map((option) => {
            const checked = (selected[group.id] ?? []).includes(option.value);
            return (
              <label
                key={option.value}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-control px-1.5 py-1 text-sm',
                  checked ? 'text-ink' : 'text-ink-2 hover:bg-surface-1',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(group.id, option.value)}
                  className="size-4 rounded border-line accent-[var(--m-accent)] focus-visible:outline-none"
                />
                <span className="flex-1 truncate">{option.label}</span>
                {typeof option.count === 'number' && (
                  <span className="text-xs tabular-nums text-ink-4">{option.count}</span>
                )}
              </label>
            );
          })}
        </fieldset>
      ))}
    </fieldset>
  );
}
