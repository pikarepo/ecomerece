/** @jsxImportSource react */

import { Minus, Plus } from 'lucide-react';
import type { CSSProperties } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Slider } from './Slider';

/**
 * Slider extras (todo/09 batch 63): marks, value tooltip, vertical, range
 * histogram and a stepper slider. The base `Slider` (native range input with a
 * styled track/thumb) stays the source of truth; these wrap it. `mat-*` + tokens.
 */

const THUMB = 20;
const THUMB_HALF = THUMB / 2;

function fractionOf(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

function thumbLeft(value: number, min: number, max: number): string {
  return `calc(${THUMB_HALF}px + ${fractionOf(value, min, max)} * (100% - ${THUMB}px))`;
}

export interface SliderMark {
  value: number;
  label?: string;
}

export interface MarksSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  marks?: SliderMark[];
  label?: string;
  className?: string;
}

export function MarksSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step,
  marks = [],
  label,
  className,
}: MarksSliderProps) {
  return (
    <div className={cn(className)}>
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        label={label}
      />
      <div className="relative h-5">
        {marks.map((mark) => (
          <span
            key={mark.value}
            data-mark
            aria-hidden
            className="absolute top-0 h-1.5 w-0.5 rounded-full bg-line"
            style={{ left: thumbLeft(mark.value, min, max) }}
          />
        ))}
        {marks.map((mark) => (
          <span
            key={mark.value}
            className="absolute top-2 -translate-x-1/2 text-[0.65rem] text-ink-3"
            style={{ left: thumbLeft(mark.value, min, max) }}
          >
            {mark.label ?? mark.value}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface TooltipSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export function TooltipSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step,
  label,
  className,
}: TooltipSliderProps) {
  return (
    <div className={cn('relative pt-7', className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-control bg-ink px-2 py-0.5 text-xs font-medium tabular-nums text-surface-3"
        style={{ left: thumbLeft(value, min, max) }}
      >
        {value}
      </span>
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        label={label}
      />
    </div>
  );
}

export interface VerticalSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  height?: number;
  className?: string;
}

export function VerticalSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  height = 160,
  className,
}: VerticalSliderProps) {
  const orient = { writingMode: 'vertical-lr', direction: 'rtl' } as CSSProperties;
  return (
    <input
      type="range"
      data-orientation="vertical"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      aria-valuetext={String(value)}
      onChange={(e) => onValueChange(Number(e.target.value))}
      onInput={(e) => onValueChange(Number((e.currentTarget as HTMLInputElement).value))}
      className={cn('cursor-pointer', focusRing(), className)}
      style={{ ...orient, height }}
    />
  );
}

export interface HistogramSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  bins: number[];
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export function HistogramSlider({
  value,
  onValueChange,
  bins,
  min = 0,
  max = 100,
  step,
  label,
  className,
}: HistogramSliderProps) {
  const peak = Math.max(1, ...bins);
  return (
    <div className={cn(className)}>
      <div
        role="img"
        aria-label={`${label ?? 'Value'} distribution`}
        className="mb-1 flex h-16 items-end gap-0.5"
      >
        {bins.map((count, i) => (
          <span
            key={i}
            data-bin
            className="flex-1 rounded-t-sm bg-accent/40"
            style={{ height: `${Math.max(4, (count / peak) * 100)}%` }}
          />
        ))}
      </div>
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        label={label}
      />
    </div>
  );
}

export interface StepperSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

export function StepperSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 10,
  label,
  className,
}: StepperSliderProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const btn =
    'mat-control grid size-8 shrink-0 place-items-center rounded-full text-ink-2 transition-all duration-skin ease-skin active:scale-[var(--press-scale)]';
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onValueChange(clamp(value - step))}
        className={cn(btn, 'disabled:opacity-50', focusRing())}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">
        <Slider
          value={value}
          onValueChange={onValueChange}
          min={min}
          max={max}
          step={1}
          label={label}
        />
      </div>
      <button
        type="button"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onValueChange(clamp(value + step))}
        className={cn(btn, 'disabled:opacity-50', focusRing())}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
