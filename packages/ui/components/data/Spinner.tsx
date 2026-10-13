import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn('flex items-center justify-center py-8', className)}
    >
      <Loader2 className="size-6 animate-spin text-accent" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
