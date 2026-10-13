/** @jsxImportSource react */
import { useId } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface TimePickerProps {
  /** 24-hour "HH:MM" string or null. */
  value: string | null;
  onValueChange: (value: string | null) => void;
  /** Restrict to 12-hour format with AM/PM selector. */
  hour12?: boolean;
  /** Step in minutes for the minute picker (1–60). Default 1. */
  minuteStep?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function parseTime(value: string | null): { h: number; m: number } {
  if (!value) return { h: 0, m: 0 };
  const [hStr, mStr] = value.split(':');
  return { h: Number(hStr) % 24, m: Number(mStr) % 60 };
}

export function TimePicker({
  value,
  onValueChange,
  hour12 = false,
  minuteStep = 1,
  disabled = false,
  label,
  className,
}: TimePickerProps) {
  const id = useId();
  const { h, m } = parseTime(value);
  const isPm = h >= 12;
  const displayHour = hour12 ? (h % 12 === 0 ? 12 : h % 12) : h;

  const hourMax = hour12 ? 12 : 23;
  const hourMin = hour12 ? 1 : 0;

  const emitTime = (hour24: number, minute: number) => {
    onValueChange(`${pad(hour24)}:${pad(minute)}`);
  };

  const onHourChange = (e: React.FormEvent<HTMLSelectElement>) => {
    let newH = Number((e.target as HTMLSelectElement).value);
    if (hour12) {
      if (isPm && newH !== 12) newH += 12;
      else if (!isPm && newH === 12) newH = 0;
    }
    emitTime(newH, m);
  };

  const onMinuteChange = (e: React.FormEvent<HTMLSelectElement>) => {
    emitTime(h, Number((e.target as HTMLSelectElement).value));
  };

  const onAmPmChange = (e: React.FormEvent<HTMLSelectElement>) => {
    const pm = (e.target as HTMLSelectElement).value === 'PM';
    let newH = h;
    if (pm && h < 12) newH = h + 12;
    else if (!pm && h >= 12) newH = h - 12;
    emitTime(newH, m);
  };

  const hourOptions = Array.from({ length: hourMax - hourMin + 1 }, (_, i) => i + hourMin);
  const minuteOptions = Array.from(
    { length: Math.ceil(60 / minuteStep) },
    (_, i) => i * minuteStep,
  );

  const selectClass = cn(
    'mat-raised rounded-control py-2 pl-3 pr-8 text-sm text-ink appearance-none',
    'transition-all duration-skin ease-skin focus:outline-none',
    disabled && 'cursor-not-allowed opacity-50',
    focusRing(),
  );

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={`${id}-hour`} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1.5">
        {/* hour */}
        <select
          id={`${id}-hour`}
          aria-label="Hour"
          value={displayHour}
          disabled={disabled}
          onInput={onHourChange}
          onChange={() => {
            /* controlled */
          }}
          className={selectClass}
        >
          {hourOptions.map((hr) => (
            <option key={hr} value={hr}>
              {pad(hr)}
            </option>
          ))}
        </select>

        <span className="text-sm font-semibold text-ink-3" aria-hidden="true">
          :
        </span>

        {/* minute */}
        <select
          id={`${id}-minute`}
          aria-label="Minute"
          value={m}
          disabled={disabled}
          onInput={onMinuteChange}
          onChange={() => {
            /* controlled */
          }}
          className={selectClass}
        >
          {minuteOptions.map((min) => (
            <option key={min} value={min}>
              {pad(min)}
            </option>
          ))}
        </select>

        {/* AM/PM */}
        {hour12 && (
          <select
            id={`${id}-ampm`}
            aria-label="AM or PM"
            value={isPm ? 'PM' : 'AM'}
            disabled={disabled}
            onInput={onAmPmChange}
            onChange={() => {
              /* controlled */
            }}
            className={selectClass}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        )}
      </div>
    </div>
  );
}
