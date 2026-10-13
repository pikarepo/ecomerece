/** @jsxImportSource react */
import { type CSSProperties, type InputHTMLAttributes, useCallback, useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/** Visual + native thumb size in px — must match the `size-5` class below. */
const THUMB = 20;
const THUMB_HALF = THUMB / 2;

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  label,
  showValue = false,
  disabled,
  className,
  id,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...rest
}: SliderProps) {
  const autoId = useId();
  const sliderId = id ?? autoId;
  const [dragging, setDragging] = useState(false);

  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const fraction = percent / 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(Number(e.target.value));
    },
    [onValueChange],
  );

  // Match the browser's native thumb travel: the thumb centre runs from
  // half-a-thumb to width − half-a-thumb, NOT 0..100%. Without the insets the
  // custom thumb drifts from the pointer and overshoots the track at the ends.
  // Keep the transform constant (and *inline*) so the Y-centering can never be
  // clobbered by a Tailwind translate class.
  const thumbStyle: CSSProperties = {
    left: `calc(${THUMB_HALF}px + ${fraction} * (100% - ${THUMB}px))`,
    transform: 'translate(-50%, -50%)',
  };

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      setDragging(true);
      onPointerDown?.(e);
    },
    [onPointerDown],
  );
  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      setDragging(false);
      onPointerUp?.(e);
    },
    [onPointerUp],
  );
  const abortDrag = useCallback(
    (e: React.PointerEvent<HTMLInputElement>) => {
      setDragging(false);
      onPointerCancel?.(e);
    },
    [onPointerCancel],
  );

  // Only animate when NOT dragging: keyboard/click steps ease, dragging is 1:1.
  const thumbMotion = dragging ? '' : 'transition-[left] duration-skin ease-skin';

  return (
    <div className={cn('w-full', disabled && 'opacity-50', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showValue && (
            <span className="ml-auto font-mono tabular-nums text-xs text-ink-3">{value}</span>
          )}
        </div>
      )}
      <div className="relative h-6">
        {/* track = Level-1 well (inset in every skin, §13) */}
        <span className="mat-well absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full">
          <span
            aria-hidden="true"
            className={cn(
              'block h-full rounded-full bg-accent',
              dragging ? '' : 'transition-[width] duration-skin ease-skin',
            )}
            style={{ width: `${percent}%` }}
          />
        </span>
        {/* thumb = Level-3 raised — positioned with the native thumb insets so
            it tracks the pointer exactly and never overshoots the track ends */}
        <span
          aria-hidden="true"
          data-dragging={dragging ? 'true' : undefined}
          className={cn(
            'mat-raised pointer-events-none absolute top-1/2 size-5 rounded-full',
            thumbMotion,
          )}
          style={thumbStyle}
        />
        {/* invisible native input captures pointer + keyboard; its thumb is
            sized to the visual thumb so the travel maths line up */}
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={showValue ? String(value) : undefined}
          onChange={handleChange}
          onPointerDown={startDrag}
          onPointerUp={endDrag}
          onPointerCancel={abortDrag}
          onLostPointerCapture={abortDrag}
          className={cn(
            'absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent',
            // strip native chrome; the styled track/thumb below carry the visuals.
            // Thumb is size-5 (both engines) to match the visual thumb + insets above.
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
            '[&::-webkit-slider-thumb]:bg-transparent [&::-moz-range-thumb]:size-5',
            '[&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:border-0',
            '[&::-webkit-slider-runnable-track]:bg-transparent',
            '[&::-moz-range-track]:bg-transparent',
            focusRing(),
          )}
          {...rest}
        />
      </div>
    </div>
  );
}
