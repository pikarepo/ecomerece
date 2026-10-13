/** @jsxImportSource react */
import { type ClipboardEvent, type KeyboardEvent, useId, useRef } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface OTPProps {
  /** Number of digits. Default 6. */
  length?: number;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  /** Mask digits like a password. */
  mask?: boolean;
  label?: string;
  /** aria-describedby hint text; also rendered as visible hint if provided. */
  hint?: string;
  className?: string;
}

export function OTP({
  length = 6,
  value,
  onValueChange,
  disabled = false,
  mask = false,
  label,
  hint,
  className,
}: OTPProps) {
  const groupId = useId();
  const hintId = hint ? `${groupId}-hint` : undefined;
  const refs = useRef<Array<HTMLInputElement | null>>(Array(length).fill(null));

  /** Normalise to exactly `length` chars, digits only. */
  const digits = value.replace(/\D/g, '').slice(0, length).padEnd(length, '');

  const focus = (i: number) => refs.current[i]?.focus();

  const emit = (next: string) => onValueChange(next.replace(/\D/g, '').slice(0, length));

  const handleInput = (e: React.FormEvent<HTMLInputElement>, i: number) => {
    const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    if (!raw) return;
    // Paste-into-single-box: raw might be > 1 char
    const chars = raw.slice(0, length - i);
    const arr = digits.split('');
    for (let j = 0; j < chars.length; j++) arr[i + j] = chars[j];
    emit(arr.join(''));
    // Advance focus to the slot after the last filled char
    const next = Math.min(i + chars.length, length - 1);
    focus(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) {
        const arr = digits.split('');
        arr[i] = '';
        emit(arr.join('').replace(/ /g, ''));
      } else if (i > 0) {
        const arr = digits.split('');
        arr[i - 1] = '';
        emit(arr.join('').replace(/ /g, ''));
        focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focus(Math.max(i - 1, 0));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focus(Math.min(i + 1, length - 1));
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const arr = digits.split('');
      arr[i] = '';
      emit(arr.join('').replace(/ /g, ''));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, i: number) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length - i);
    const arr = digits.split('');
    for (let j = 0; j < pasted.length; j++) arr[i + j] = pasted[j];
    emit(arr.join(''));
    focus(Math.min(i + pasted.length, length - 1));
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <span id={groupId} className="mb-2 block text-sm font-medium">
          {label}
        </span>
      )}
      <fieldset
        aria-labelledby={label ? groupId : undefined}
        aria-describedby={hintId}
        className="flex gap-2 m-0 border-0 p-0"
      >
        {Array.from({ length }, (_, i) => {
          const filled = Boolean(digits[i] && digits[i] !== ' ');
          return (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type={mask ? 'password' : 'text'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[i] === ' ' ? '' : digits[i]}
              disabled={disabled}
              aria-label={`Digit ${i + 1} of ${length}`}
              data-filled={filled ? 'true' : undefined}
              onInput={(e) => handleInput(e, i)}
              onChange={() => {
                /* controlled */
              }}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={(e) => handlePaste(e, i)}
              onFocus={(e) => e.target.select()}
              className={cn(
                'mat-raised h-12 w-10 rounded-control text-center text-base font-semibold text-ink',
                'transition-all duration-skin ease-skin focus:outline-none',
                disabled && 'cursor-not-allowed opacity-50',
                focusRing(),
              )}
            />
          );
        })}
      </fieldset>
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-3">
          {hint}
        </p>
      )}
    </div>
  );
}
