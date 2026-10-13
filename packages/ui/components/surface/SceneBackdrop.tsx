import { cn } from '../../lib/cn';

export function SceneBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-10 [background:var(--scene)]', className)}
    />
  );
}
