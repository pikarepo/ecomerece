/** @jsxImportSource react */
import { Minus, Plus } from 'lucide-react';
import { type ChangeEvent, useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface NumberInputProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizes = {
  sm: 'h-9 text-sm',
  md: 'h-11 text-sm',
  lg: 'h-12 text-base',
} as const;

const btn =
  'flex w-10 shrink-0 items-center justify-center text-ink-2 transition-colors duration-skin ease-skin hover:text-ink disabled:pointer-events-none disabled:text-ink-4';

function clampValue(n: number, min?: number, max?: number): number {
  let out = n;
  if (min !== undefined) out = Math.max(min, out);
  if (max !== undefined) out = Math.min(max, out);
  return out;
}

export function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled,
  size = 'md',
  label,
  className,
}: NumberInputProps) {
  const inputId = useId();
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (n: number) => onValueChange(clampValue(n, min, max));

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setDraft(raw);
    const parsed = Number(raw);
    if (raw.trim() !== '' && !Number.isNaN(parsed)) commit(parsed);
  };

  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  const stepBy = (delta: number) => {
    setDraft(null);
    commit(value + step * delta);
  };

  return (
    <div className={cn('inline-flex flex-col gap-1', className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-ink-2">
          {label}
        </label>
      )}
      <div
        className={cn(
          'mat-control inline-flex items-stretch overflow-hidden rounded-control',
          sizes[size],
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <button
          type="button"
          aria-label="Decrease"
          disabled={disabled || atMin}
          onClick={() => stepBy(-1)}
          className={cn(btn, focusRing())}
        >
          <Minus className="size-4" />
        </button>
        <span aria-hidden="true" className="w-px self-stretch bg-line/12" />
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          role="spinbutton"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          disabled={disabled}
          value={draft ?? String(value)}
          onChange={handleInput}
          onBlur={() => setDraft(null)}
          className={cn(
            'w-14 min-w-0 bg-transparent text-center text-ink tabular-nums outline-none',
            focusRing(),
          )}
        />
        <span aria-hidden="true" className="h-full w-px bg-line/12" />
        <button
          type="button"
          aria-label="Increase"
          onClick={() => stepBy(1)}
          disabled={disabled || atMax}
          className={btn}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
