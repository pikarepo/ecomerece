/** @jsxImportSource react */
import type { ComponentPropsWithoutRef } from 'react';
import { LineClamp } from './LineClamp';

export interface LineClampTextProps extends ComponentPropsWithoutRef<'p'> {
  lines?: number;
}

export function LineClampText({ lines = 2, className, ...props }: LineClampTextProps) {
  return <LineClamp as="p" lines={lines} className={className} {...props} />;
}
