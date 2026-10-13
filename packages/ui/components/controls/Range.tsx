/** @jsxImportSource react */
import { type CSSProperties, type FormEvent, useId } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/** Must match the `size-5` class on the visual + native thumbs. */
const THUMB = 20;
const THUMB_HALF = THUMB / 2;

export type RangeValue = [number, number];

export interface RangeProps {
  min?: number;
  max?: number;
  step?: number;
  value: RangeValue;
  onValueChange: (value: RangeValue) => void;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

function clamp(n: number, low: number, high: number): number {
  return Math.min(Math.max(n, low), high);
}

function fraction(n: number, min: number, max: number): number {
  if (max === min) return 0;
  return (n - min) / (max - min);
}

/** Native-thumb travel: insets keep the handle aligned with the track ends. */
function offset(f: number): string {
  return `calc(${THUMB_HALF}px + ${f} * (100% - ${THUMB}px))`;
}

const inputReset =
  'pointer-events-none absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent ' +
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 ' +
  '[&::-webkit-slider-thumb]:bg-transparent [&::-moz-range-thumb]:size-5 ' +
  '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent ' +
  '[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent';

export function Range({
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  label,
  showValue = false,
  disabled = false,
  className,
}: RangeProps) {
  const groupId = useId();
  const [low, high] = value;

  const lowStyle: CSSProperties = {
    left: offset(fraction(low, min, max)),
    transform: 'translate(-50%, -50%)',
  };
  const highStyle: CSSProperties = {
    left: offset(fraction(high, min, max)),
    transform: 'translate(-50%, -50%)',
  };
  const fillStyle: CSSProperties = {
    left: offset(fraction(low, min, max)),
    right: `calc(${THUMB_HALF}px + ${1 - fraction(high, min, max)} * (100% - ${THUMB}px))`,
  };

  const changeLow = (event: FormEvent<HTMLInputElement>) => {
    const next = Number((event.target as HTMLInputElement).value);
    onValueChange([clamp(next, min, high), high]);
  };
  const changeHigh = (event: FormEvent<HTMLInputElement>) => {
    const next = Number((event.target as HTMLInputElement).value);
    onValueChange([low, clamp(next, low, max)]);
  };

  return (
    <div className={cn('w-full', disabled && 'opacity-50', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {label && (
            <span id={groupId} className="text-sm font-medium">
              {label}
            </span>
          )}
          {showValue && (
            <span className="ml-auto font-mono tabular-nums text-xs text-ink-3">
              {low} – {high}
            </span>
          )}
        </div>
      )}
      <div className="relative h-6">
        <span className="mat-well absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 rounded-full bg-accent transition-[left,right] duration-skin ease-skin"
            style={fillStyle}
          />
        </span>
        <span
          aria-hidden="true"
          data-thumb="low"
          className="mat-raised pointer-events-none absolute top-1/2 size-5 rounded-full transition-[left] duration-skin ease-skin"
          style={lowStyle}
        />
        <span
          aria-hidden="true"
          data-thumb="high"
          className="mat-raised pointer-events-none absolute top-1/2 size-5 rounded-full transition-[left] duration-skin ease-skin"
          style={highStyle}
        />
        <input
          type="range"
          min={min}
          max={high}
          step={step}
          value={low}
          disabled={disabled}
          aria-label={label ? `${label} minimum` : 'Minimum'}
          aria-valuetext={showValue ? String(low) : undefined}
          onChange={changeLow}
          className={cn(inputReset, focusRing())}
        />
        <input
          type="range"
          min={low}
          max={max}
          step={step}
          value={high}
          disabled={disabled}
          aria-label={label ? `${label} maximum` : 'Maximum'}
          aria-valuetext={showValue ? String(high) : undefined}
          onChange={changeHigh}
          className={cn(inputReset, focusRing())}
        />
      </div>
    </div>
  );
}
