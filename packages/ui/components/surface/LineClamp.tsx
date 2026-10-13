/** @jsxImportSource react */
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '../../lib/cn';

export interface LineClampProps extends ComponentPropsWithoutRef<'div'> {
  as?: ElementType;
  lines?: number;
  clamp?: number | string;
}

export function LineClamp({
  as: Comp = 'div',
  lines,
  clamp,
  style,
  className,
  ...props
}: LineClampProps) {
  const lineClamp = clamp ?? (lines ? `${lines}` : undefined);

  return (
    <Comp
      {...props}
      className={cn('overflow-hidden', className)}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: 'vertical',
        ...(style ?? {}),
      }}
    />
  );
}
