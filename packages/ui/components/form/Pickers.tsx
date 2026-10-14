/** @jsxImportSource react */

import { Check, ChevronDown, Upload, UserRound, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Light pickers (todo/09 batch 46): unit, currency, timezone and avatar.
 * One `Picker` (combobox trigger + listbox popover) backs the three data
 * pickers; `AvatarPicker` wraps a hidden file input. `mat-*` + tokens only.
 *
 * NB: React 19's `onChange` does not fire under happy-dom synthetic events, so
 * the search field also binds `onInput` (the harness dispatches `input`).
 */

export interface PickerOption {
  value: string;
  label: string;
}

export interface PickerProps {
  options: PickerOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  label: string;
  searchable?: boolean;
  className?: string;
}

export function Picker({
  options,
  value,
  onValueChange,
  label,
  searchable,
  className,
}: PickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value);
  const filtered = query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.value.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'mat-raised flex w-full items-center gap-2 rounded-control border border-line/30 px-3.5 py-2.5 text-left text-sm transition-all duration-skin ease-skin',
          open && 'ring-2 ring-accent',
          focusRing(),
        )}
      >
        <span className="min-w-0 flex-1 truncate text-ink">{selected?.label ?? 'Select…'}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-3 transition-transform duration-skin',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div className="mat-overlay absolute z-50 mt-1 w-full rounded-control border border-line/20 p-1 shadow-lg">
          {searchable && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
              placeholder="Search…"
              aria-label={`Search ${label}`}
              className="mb-1 w-full rounded-control bg-surface-1 px-2 py-1.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none"
            />
          )}
          <div role="listbox" aria-label={label} className="max-h-56 overflow-auto">
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onValueChange?.(o.value);
                  setOpen(false);
                  setQuery('');
                }}
                className="flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-sm text-ink hover:bg-surface-1"
              >
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.value === value && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-3 text-center text-xs text-ink-3">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface UnitOption {
  value: string;
  label: string;
}

export const DEFAULT_UNITS: UnitOption[] = [
  { value: 'px', label: 'Pixels (px)' },
  { value: 'rem', label: 'Root em (rem)' },
  { value: 'em', label: 'Em (em)' },
  { value: 'pt', label: 'Points (pt)' },
  { value: '%', label: 'Percent (%)' },
  { value: 'vw', label: 'Viewport width (vw)' },
  { value: 'vh', label: 'Viewport height (vh)' },
];

export interface UnitPickerProps {
  value?: string;
  onValueChange?: (unit: string) => void;
  units?: UnitOption[];
  label?: string;
  className?: string;
}

export function UnitPicker({
  value,
  onValueChange,
  units,
  label = 'Unit',
  className,
}: UnitPickerProps) {
  return (
    <Picker
      options={units ?? DEFAULT_UNITS}
      value={value}
      onValueChange={onValueChange}
      label={label}
      className={cn('w-44', className)}
    />
  );
}

export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

export const DEFAULT_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
];

export interface CurrencyPickerProps {
  value?: string;
  onValueChange?: (code: string) => void;
  currencies?: CurrencyOption[];
  label?: string;
  className?: string;
}

export function CurrencyPicker({
  value,
  onValueChange,
  currencies,
  label = 'Currency',
  className,
}: CurrencyPickerProps) {
  const list = currencies ?? DEFAULT_CURRENCIES;
  return (
    <Picker
      options={list.map((c) => ({ value: c.code, label: `${c.code} — ${c.label} (${c.symbol})` }))}
      value={value}
      onValueChange={onValueChange}
      label={label}
      searchable
      className={cn('w-64', className)}
    />
  );
}

const FALLBACK_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

function allTimezones(): string[] {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
  try {
    return intl.supportedValuesOf?.('timeZone') ?? FALLBACK_TIMEZONES;
  } catch {
    return FALLBACK_TIMEZONES;
  }
}

export interface TimezonePickerProps {
  value?: string;
  onValueChange?: (timezone: string) => void;
  timezones?: string[];
  label?: string;
  className?: string;
}

export function TimezonePicker({
  value,
  onValueChange,
  timezones,
  label = 'Timezone',
  className,
}: TimezonePickerProps) {
  const list = timezones ?? allTimezones();
  return (
    <Picker
      options={list.map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }))}
      value={value}
      onValueChange={onValueChange}
      label={label}
      searchable
      className={cn('w-64', className)}
    />
  );
}

export interface AvatarPickerProps {
  src?: string;
  name?: string;
  size?: number;
  onPick?: (file: File) => void;
  onRemove?: () => void;
  label?: string;
  className?: string;
}

export function AvatarPicker({
  src,
  name = '',
  size = 64,
  onPick,
  onRemove,
  label = 'Change avatar',
  className,
}: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div
        className="mat-card relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-line/30 text-lg font-semibold text-ink-2"
        style={{ width: size, height: size }}
      >
        {src ? (
          <img
            src={src}
            alt={name ? `${name} avatar` : 'Avatar'}
            className="size-full object-cover"
          />
        ) : initial ? (
          <span aria-hidden>{initial}</span>
        ) : (
          <UserRound className="size-1/2 text-ink-3" aria-hidden />
        )}
      </div>
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'mat-control inline-flex items-center gap-2 rounded-control px-3 py-1.5 text-sm text-ink transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
            focusRing(),
          )}
        >
          <Upload className="size-4" aria-hidden />
          {label}
        </button>
        {src && (
          <button
            type="button"
            onClick={() => onRemove?.()}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-control px-3 py-1 text-xs text-ink-3 transition-all duration-skin ease-skin hover:text-danger',
              focusRing(),
            )}
          >
            <X className="size-3.5" aria-hidden />
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Avatar file"
        className="hidden"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) onPick?.(file);
          e.currentTarget.value = '';
        }}
      />
    </div>
  );
}
