import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface AppShellProps {
  /**
   * Optional fixed-width left region (sidebar/master). Renders at md:tall.
   */
  sidebar?: ReactNode;
  /**
   * Optional 72px icon rail. Renders at lg.
   */
  rail?: ReactNode;
  /**
   * Main fluid region — always rendered.
   */
  children: ReactNode;
  /**
   * Optional fixed-width right region (inspector). Renders at xl.
   */
  inspector?: ReactNode;
  /**
   * Optional fourth region, 4xl+ only. Positioned right of the inspector.
   */
  fourth?: ReactNode;
  className?: string;
}

/**
 * The recomposition shell (§18.4). Chrome is fixed-width above 1024; the main pane
 * is the only fluid region and absorbs width by subdividing. `min-w-0` on the fluid
 * child prevents horizontal page scroll.
 */
export function AppShell({ sidebar, rail, children, inspector, fourth, className }: AppShellProps) {
  return (
    <div
      className={cn('flex h-dvh w-full flex-col overflow-hidden', 'md:tall:flex-row', className)}
    >
      {rail}
      {sidebar}
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      {inspector}
      {fourth}
    </div>
  );
}
