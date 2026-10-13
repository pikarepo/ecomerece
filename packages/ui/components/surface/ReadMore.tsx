/** @jsxImportSource react */
import { type CSSProperties, type ReactNode, useId, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface ReadMoreProps {
  /** The long content to collapse. */
  children?: ReactNode;
  /** Collapsed height in lines (default 3). */
  lines?: number;
  /** Toggle label when collapsed (default "Read more"). */
  moreLabel?: string;
  /** Toggle label when expanded (default "Show less"). */
  lessLabel?: string;
  /** Controlled expansion state. */
  expanded?: boolean;
  /** Called on toggle (uncontrolled mode). */
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

/**
 * Disclosure that clamps content to `lines` lines and reveals a toggle.
 * Uncontrolled by default; pass `expanded` to control it.
 */
export function ReadMore({
  children,
  lines = 3,
  moreLabel = 'Read more',
  lessLabel = 'Show less',
  expanded: controlledExpanded,
  onExpandedChange,
  className,
}: ReadMoreProps) {
  const id = useId();
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlledExpanded ?? uncontrolled;

  const toggle = () => {
    const next = !open;
    if (controlledExpanded === undefined) setUncontrolled(next);
    onExpandedChange?.(next);
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div
        id={id}
        style={
          open
            ? undefined
            : ({
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: lines,
                overflow: 'hidden',
              } as CSSProperties)
        }
      >
        {children}
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={id}
        className={cn(
          'text-sm font-medium text-accent hover:underline',
          'active:scale-[var(--press-scale)] transition-transform duration-skin ease-skin',
          focusRing(),
        )}
      >
        {open ? lessLabel : moreLabel}
      </button>
    </div>
  );
}
