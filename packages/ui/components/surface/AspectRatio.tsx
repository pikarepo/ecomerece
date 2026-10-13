/** @jsxImportSource react */
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface AspectRatioProps {
  /** Ratio as a number, e.g. 16/9, 4/3, 1. Default 16/9. */
  ratio?: number;
  children?: ReactNode;
  className?: string;
}

export function AspectRatio({ ratio = 16 / 9, children, className }: AspectRatioProps) {
  return (
    <div
      data-ratio={ratio}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
      className={cn('relative w-full', className)}
    >
      <div className="absolute inset-0 h-full w-full overflow-hidden">{children}</div>
    </div>
  );
}
