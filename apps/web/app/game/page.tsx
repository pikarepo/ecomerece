import type { Metadata } from 'next';
import Link from 'next/link';
import { DriveGame } from '../../components/game/DriveGame';

export const metadata: Metadata = {
  title: 'Lane Runner — Drive',
  description: 'A 2D car dodger on the engine physics kernel (DESIGN.md Part VIII).',
};

export default function GamePage() {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-canvas">
      <header className="flex items-center justify-between gap-3 border-b border-line/20 bg-surface-1/90 px-3 py-2 backdrop-blur-md sm:px-4">
        <Link
          href="/"
          className="mat-control inline-flex min-h-9 items-center gap-1 rounded-control px-3 text-xs font-medium text-ink transition-all duration-skin ease-skin active:scale-[var(--press-scale)]"
        >
          ← Back
        </Link>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-sm font-bold tracking-tight text-ink">Lane Runner</h1>
          <p className="hidden text-[11px] text-ink-3 sm:block">
            Car dodger · 3–8 lanes · fixed-timestep physics kernel
          </p>
        </div>
        <Link
          href="/design"
          className="mat-control hidden min-h-9 items-center rounded-control px-3 text-xs font-medium text-ink transition-all duration-skin ease-skin active:scale-[var(--press-scale)] sm:inline-flex"
        >
          Skins
        </Link>
        <span className="w-[74px] sm:hidden" aria-hidden />
      </header>
      <div className="flex min-h-0 w-full flex-1 items-stretch justify-center p-2 sm:items-center sm:p-4">
        <DriveGame />
      </div>
    </main>
  );
}
