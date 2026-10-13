/** @jsxImportSource react */
import { BadgePercent, Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export type PromoCodeState = 'available' | 'applied' | 'invalid';

const stateClasses: Record<PromoCodeState, string> = {
  available: 'mat-control text-ink',
  applied: 'bg-success/12 text-success',
  invalid: 'bg-danger/12 text-danger',
};

export interface PromoCodeProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {
  code: string;
  description?: ReactNode;
  state?: PromoCodeState;
  onApply?: () => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * Promo-code chip (DESIGN.md Appendix E.5, batch 18). Renders as a static chip
 * when no handlers are supplied, otherwise as an interactive apply/remove pill.
 */
export function PromoCode({
  code,
  description,
  state = 'available',
  onApply,
  onRemove,
  className,
  ...props
}: PromoCodeProps) {
  const applied = state === 'applied';
  const invalid = state === 'invalid';

  const body = (
    <>
      <BadgePercent className="size-3.5 shrink-0" aria-hidden />
      <span className="font-mono text-xs font-semibold tracking-wide">{code}</span>
      {description && <span className="text-xs text-ink-3">{description}</span>}
    </>
  );

  return (
    <span
      data-state={state}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1',
        stateClasses[state],
        className,
      )}
      {...props}
    >
      {onApply && !applied && !invalid ? (
        <button
          type="button"
          onClick={onApply}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-chip px-1 py-0.5 transition-colors duration-skin ease-skin hover:bg-surface-3',
            focusRing(),
          )}
        >
          {body}
          <span className="text-xs font-medium text-accent">Apply</span>
        </button>
      ) : (
        body
      )}
      {applied && <Check className="size-3.5 shrink-0" aria-hidden />}
      {applied && onRemove && (
        <button
          type="button"
          aria-label={`Remove promo code ${code}`}
          onClick={onRemove}
          className={cn(
            'rounded-chip p-0.5 transition-colors duration-skin ease-skin hover:bg-success/20',
            focusRing(),
          )}
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </span>
  );
}
