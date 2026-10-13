/** @jsxImportSource react */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type PinnedEdge = 'top' | 'bottom' | 'left' | 'right';

export type PinnedRole = 'chrome' | 'overlay' | 'panel';

const EDGE: Record<PinnedEdge, string> = {
  top: 'inset-x-0 top-0 border-b rounded-b-sheet',
  bottom: 'inset-x-0 bottom-0 border-t rounded-t-sheet',
  left: 'inset-y-0 left-0 border-r rounded-r-sheet',
  right: 'inset-y-0 right-0 border-l rounded-l-sheet',
};

const ROLE: Record<PinnedRole, string> = {
  chrome: 'mat-chrome',
  overlay: 'mat-overlay',
  panel: 'mat-panel',
};

export interface PinnedPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Which viewport edge the panel is pinned to (default `bottom`). */
  edge?: PinnedEdge;
  /** Skin material that paints the panel (default `overlay`). */
  role?: PinnedRole;
}

/**
 * A panel pinned to a viewport edge (Every Layout "Fixed/pinned panel").
 * Floats above content via `position: fixed`.
 */
export function PinnedPanel({
  edge = 'bottom',
  role = 'overlay',
  className,
  ...rest
}: PinnedPanelProps) {
  return (
    <div
      data-edge={edge}
      className={cn('fixed z-raised border-line/10', EDGE[edge], ROLE[role], className)}
      {...rest}
    />
  );
}
