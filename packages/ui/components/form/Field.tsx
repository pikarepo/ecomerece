import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, disabled, className, children }: FieldProps) {
  return (
    <div className={cn('block', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn('mb-1.5 block text-sm font-medium', disabled && 'text-ink-4')}
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <span role="alert" className="mt-1.5 block text-xs text-danger">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ink-3">{hint}</span>
      ) : null}
    </div>
  );
}
