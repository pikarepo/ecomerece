import { cn } from '../lib/cn';

interface FocusRingProps {
  className?: string;
}

export function focusRing({ className }: FocusRingProps = {}): string {
  return cn(
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
    className,
  );
}
