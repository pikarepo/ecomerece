/** @jsxImportSource react */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface DatePickerProps {
  value: string | null; // ISO date "YYYY-MM-DD"
  onValueChange: (value: string | null) => void;
  min?: string; // ISO date
  max?: string; // ISO date
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

function toDate(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function DatePicker({
  value,
  onValueChange,
  min,
  max,
  disabled = false,
  label,
  placeholder = 'Select date',
  className,
}: DatePickerProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  const initial = selected ?? new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const minDate = toDate(min ?? null);
  const maxDate = toDate(max ?? null);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);

  const isDisabledDate = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const pick = (day: number) => {
    if (isDisabledDate(day)) return;
    onValueChange(toIso(new Date(viewYear, viewMonth, day)));
    setOpen(false);
  };

  const displayValue = selected
    ? selected.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  // Build calendar grid with leading empty cells
  const cells: Array<number | null> = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className={cn('relative w-full', className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label ?? 'Date picker'}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'mat-raised flex w-full items-center justify-between rounded-control px-4 py-2.5 text-sm',
          'transition-all duration-skin ease-skin',
          displayValue ? 'text-ink' : 'text-ink-3',
          disabled && 'cursor-not-allowed opacity-50',
          focusRing(),
        )}
      >
        <span>{displayValue || placeholder}</span>
        <span className="ml-2 text-ink-4" aria-hidden="true">
          📅
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Calendar"
          aria-modal="true"
          className="mat-overlay absolute left-0 top-full z-20 mt-1.5 w-72 rounded-card p-4 shadow-lg"
        >
          {/* header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={prevMonth}
              className={cn(
                'rounded-control p-1 text-ink-3 hover:text-ink transition-colors duration-skin ease-skin',
                focusRing(),
              )}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <span className="text-sm font-semibold text-ink">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={nextMonth}
              className={cn(
                'rounded-control p-1 text-ink-3 hover:text-ink transition-colors duration-skin ease-skin',
                focusRing(),
              )}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* day names */}
          <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-ink-3">
            {DAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* grid */}
          {/* biome-ignore lint/a11y/useSemanticElements: calendar grid uses ARIA grid role on a CSS-grid div */}
          <div
            className="grid grid-cols-7 gap-0.5"
            role="grid"
            aria-label={`${MONTHS[viewMonth]} ${viewYear}`}
          >
            {cells.map((day, i) => {
              if (day === null) return <span key={`empty-${i}`} />;
              const iso = toIso(new Date(viewYear, viewMonth, day));
              const isSelected = iso === value;
              const off = isDisabledDate(day);
              return (
                // biome-ignore lint/a11y/useSemanticElements: gridcell inside role=grid is correct ARIA
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  aria-label={iso}
                  aria-selected={isSelected}
                  aria-disabled={off || undefined}
                  disabled={off}
                  onClick={() => pick(day)}
                  className={cn(
                    'rounded-control py-1 text-sm transition-colors duration-skin ease-skin',
                    isSelected
                      ? 'bg-accent font-semibold text-ink'
                      : 'text-ink-2 hover:bg-surface-2',
                    off && 'cursor-not-allowed text-ink-4 opacity-50',
                    focusRing(),
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* clear */}
          {value && (
            <button
              type="button"
              onClick={() => {
                onValueChange(null);
                setOpen(false);
              }}
              className={cn(
                'mt-3 w-full rounded-control py-1.5 text-xs text-ink-3 hover:text-ink transition-colors duration-skin ease-skin',
                focusRing(),
              )}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
