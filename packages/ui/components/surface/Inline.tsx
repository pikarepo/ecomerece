/** @jsxImportSource react */
import { type HTMLAttributes, type ReactNode, useId } from 'react';
import { cn } from '../../lib/cn';

export type InlineBadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const BADGE_TONE: Record<InlineBadgeTone, string> = {
  neutral: 'bg-surface-3 text-ink-2',
  accent: 'bg-accent/12 text-accent',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
};

export interface InlineBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  tone?: InlineBadgeTone;
}

/** Small pill for inline status/labels (compact sibling of `Chip`). */
export function InlineBadge({ tone = 'neutral', className, ...rest }: InlineBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-1.5 py-0.5 text-xs font-medium',
        BADGE_TONE[tone],
        className,
      )}
      {...rest}
    />
  );
}

export interface AbbrProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/** Abbreviation that reveals its expansion on hover (`title`). */
export function Abbr({ className, ...rest }: AbbrProps) {
  return (
    <abbr
      className={cn('cursor-help underline decoration-dotted underline-offset-2', className)}
      {...rest}
    />
  );
}

export interface DefinitionProps {
  /** The term to annotate. */
  term: ReactNode;
  /** Definition revealed on hover/focus. */
  definition: ReactNode;
  className?: string;
}

/** Inline term with a tooltip definition (hover or keyboard focus). */
export function Definition({ term, definition, className }: DefinitionProps) {
  const id = useId();
  return (
    <span className={cn('group relative inline-block', className)}>
      <button
        type="button"
        aria-describedby={id}
        className={cn(
          'cursor-help text-left underline decoration-dotted underline-offset-2',
          'focus-visible:outline-none',
        )}
      >
        <dfn>{term}</dfn>
      </button>
      <span
        role="tooltip"
        id={id}
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-raised mb-2 -translate-x-1/2 whitespace-nowrap',
          'rounded-control bg-surface-3 px-2 py-1 text-xs text-ink shadow-lg',
          'opacity-0 transition-opacity duration-skin ease-skin group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        {definition}
      </span>
    </span>
  );
}

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/** Inline monospace code span. */
export function Code({ className, ...rest }: CodeProps) {
  return (
    <code
      className={cn(
        'rounded-chip bg-surface-3 px-1.5 py-0.5 font-mono text-xs text-ink',
        className,
      )}
      {...rest}
    />
  );
}
