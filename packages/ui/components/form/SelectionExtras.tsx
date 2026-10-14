/** @jsxImportSource react */

import { Check, Image as ImageIcon, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Selection extras (todo/09 batch 62): tile select, image select grid, swatch
 * select, toggle chips, NPS scale, Likert and thumbs. Selection uses toggle
 * buttons (`aria-pressed`) rather than ARIA radio roles that biome flags.
 * `mat-*` + tokens only.
 */

export interface TileOption {
  value: string;
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

export interface TileSelectProps {
  options: TileOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  className?: string;
}

export function TileSelect({ options, value, onValueChange, label = 'Options', className }: TileSelectProps) {
  return (
    <div role="toolbar" aria-label={label} className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onValueChange?.(opt.value)}
            className={cn(
              'mat-card flex items-start gap-3 rounded-card border p-3 text-left transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
              selected ? 'border-accent ring-2 ring-accent' : 'border-line/30 hover:bg-surface-1',
              focusRing(),
            )}
          >
            {Icon && (
              <span
                className={cn(
                  'grid size-9 shrink-0 place-items-center rounded-control',
                  selected ? 'bg-accent text-accent-ink' : 'bg-surface-1 text-ink-2',
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink">{opt.label}</span>
              {opt.description && <span className="block text-xs text-ink-3">{opt.description}</span>}
            </span>
            {selected && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

export interface ImageOption {
  id: string;
  src: string;
  alt?: string;
  label?: string;
}

export interface ImageSelectGridProps {
  items: ImageOption[];
  selected?: string[];
  onSelectedChange?: (selected: string[]) => void;
  label?: string;
  columns?: number;
  className?: string;
}

export function ImageSelectGrid({
  items,
  selected = [],
  onSelectedChange,
  label = 'Images',
  columns = 3,
  className,
}: ImageSelectGridProps) {
  const toggle = (id: string) => {
    onSelectedChange?.(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id],
    );
  };
  return (
    <div
      role="toolbar"
      aria-label={label}
      className={cn('grid gap-3', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={isSelected}
            aria-label={item.label ?? item.alt ?? item.id}
            onClick={() => toggle(item.id)}
            className={cn(
              'relative aspect-square overflow-hidden rounded-card border transition-all duration-skin ease-skin',
              isSelected ? 'border-accent ring-2 ring-accent' : 'border-line/30 hover:opacity-90',
              focusRing(),
            )}
          >
            {item.src ? (
              <img src={item.src} alt={item.alt ?? ''} className="size-full object-cover" />
            ) : (
              <span className="grid size-full place-items-center bg-surface-1 text-ink-3">
                <ImageIcon className="size-6" aria-hidden />
              </span>
            )}
            {isSelected && (
              <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-accent text-accent-ink">
                <Check className="size-3.5" aria-hidden />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface SwatchOption {
  value: string;
  label?: string;
}

export interface SwatchSelectProps {
  colors: Array<string | SwatchOption>;
  value?: string;
  values?: string[];
  onValueChange?: (value: string) => void;
  onValuesChange?: (values: string[]) => void;
  multiple?: boolean;
  label?: string;
  className?: string;
}

export function SwatchSelect({
  colors,
  value,
  values = [],
  onValueChange,
  onValuesChange,
  multiple = false,
  label = 'Colour',
  className,
}: SwatchSelectProps) {
  const swatches = colors.map((c) => (typeof c === 'string' ? { value: c } : c));
  const isOn = (v: string) => (multiple ? values.includes(v) : value === v);
  const pick = (v: string) => {
    if (!multiple) {
      onValueChange?.(v);
      return;
    }
    onValuesChange?.(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  };
  return (
    <div role="toolbar" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {swatches.map((sw) => (
        <button
          key={sw.value}
          type="button"
          aria-pressed={isOn(sw.value)}
          aria-label={sw.label ?? sw.value}
          title={sw.label ?? sw.value}
          onClick={() => pick(sw.value)}
          className={cn(
            'grid size-9 place-items-center rounded-full border transition-transform duration-skin ease-skin hover:scale-[1.06]',
            isOn(sw.value) ? 'border-accent ring-2 ring-accent' : 'border-line/40',
            focusRing(),
          )}
          style={{ backgroundColor: sw.value }}
        >
          {isOn(sw.value) && (
            <Check className="size-4 text-accent-ink mix-blend-difference" aria-hidden />
          )}
        </button>
      ))}
    </div>
  );
}

export interface ToggleChipOption {
  value: string;
  label: string;
}

export interface ToggleChipGroupProps {
  options: ToggleChipOption[];
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  label?: string;
  className?: string;
}

export function ToggleChipGroup({
  options,
  values = [],
  onValuesChange,
  label = 'Filters',
  className,
}: ToggleChipGroupProps) {
  const toggle = (v: string) =>
    onValuesChange?.(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <div role="toolbar" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => {
        const on = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(opt.value)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
              on ? 'bg-accent text-accent-ink' : 'mat-control text-ink-2 hover:bg-surface-1',
              focusRing(),
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export interface NpsScaleProps {
  value?: number | null;
  onValueChange?: (value: number) => void;
  lowLabel?: string;
  highLabel?: string;
  className?: string;
}

export function NpsScale({
  value = null,
  onValueChange,
  lowLabel = 'Not at all likely',
  highLabel = 'Extremely likely',
  className,
}: NpsScaleProps) {
  return (
    <div className={cn('w-full', className)}>
      <div role="toolbar" aria-label="Net promoter score" className="flex justify-between gap-1">
        {Array.from({ length: 11 }, (_, n) => n).map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={n === value}
            aria-label={`${n}`}
            onClick={() => onValueChange?.(n)}
            className={cn(
              'grid h-9 min-w-9 flex-1 place-items-center rounded-control border text-sm font-medium transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
              n === value
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-line/30 text-ink-2 hover:bg-surface-1',
              focusRing(),
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-ink-3">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export const DEFAULT_LIKERT = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
];

export interface LikertScaleProps {
  value?: number | null;
  onValueChange?: (value: number) => void;
  options?: string[];
  label?: string;
  className?: string;
}

export function LikertScale({
  value = null,
  onValueChange,
  options = DEFAULT_LIKERT,
  label = 'Choose one',
  className,
}: LikertScaleProps) {
  return (
    <div role="toolbar" aria-label={label} className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((opt, i) => {
        const n = i + 1;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={n === value}
            aria-label={opt}
            title={opt}
            onClick={() => onValueChange?.(n)}
            className={cn(
              'grid h-9 w-9 place-items-center rounded-full border text-sm font-medium transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
              n === value
                ? 'border-accent bg-accent text-accent-ink'
                : 'border-line/30 text-ink-2 hover:bg-surface-1',
              focusRing(),
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

export interface LikertItem {
  id: string;
  statement: string;
}

export interface LikertGroupProps {
  items: LikertItem[];
  values?: Record<string, number>;
  onValueChange?: (id: string, value: number) => void;
  options?: string[];
  className?: string;
}

export function LikertGroup({
  items,
  values = {},
  onValueChange,
  options,
  className,
}: LikertGroupProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-1.5">
          <span className="text-sm text-ink">{item.statement}</span>
          <LikertScale
            value={values[item.id] ?? null}
            options={options}
            label={item.statement}
            onValueChange={(v) => onValueChange?.(item.id, v)}
          />
        </div>
      ))}
    </div>
  );
}

export type ThumbsValue = 'up' | 'down';

export interface ThumbsRatingProps {
  value?: ThumbsValue | null;
  onValueChange?: (value: ThumbsValue) => void;
  upLabel?: string;
  downLabel?: string;
  className?: string;
}

export function ThumbsRating({
  value = null,
  onValueChange,
  upLabel = 'Helpful',
  downLabel = 'Not helpful',
  className,
}: ThumbsRatingProps) {
  return (
    <div role="toolbar" aria-label="Was this helpful?" className={cn('flex gap-2', className)}>
      <button
        type="button"
        aria-pressed={value === 'up'}
        onClick={() => onValueChange?.('up')}
        className={cn(
          'mat-control inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-sm transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
          value === 'up' ? 'text-success ring-2 ring-success' : 'text-ink-2 hover:bg-surface-1',
          focusRing(),
        )}
      >
        <ThumbsUp className="size-4" aria-hidden />
        {upLabel}
      </button>
      <button
        type="button"
        aria-pressed={value === 'down'}
        onClick={() => onValueChange?.('down')}
        className={cn(
          'mat-control inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-sm transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
          value === 'down' ? 'text-danger ring-2 ring-danger' : 'text-ink-2 hover:bg-surface-1',
          focusRing(),
        )}
      >
        <ThumbsDown className="size-4" aria-hidden />
        {downLabel}
      </button>
    </div>
  );
}
