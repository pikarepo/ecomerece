import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, disabled, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        'mat-raised w-full resize-y rounded-card px-4 py-3 text-sm text-ink',
        'placeholder:text-ink-3 focus:outline-none',
        'transition-all duration-skin ease-skin focus:ring-2 focus:ring-accent',
        invalid && 'ring-2 ring-danger',
        'disabled:cursor-not-allowed disabled:text-ink-4 disabled:opacity-60',
        className,
      )}
      {...rest}
    />
  );
});
