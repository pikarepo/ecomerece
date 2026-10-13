/** @jsxImportSource react */
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export interface BreadcrumbItem {
  label: ReactNode;
  /** When omitted (or on the last item) the crumb renders as plain text. */
  href?: string;
  /** Optional leading glyph (e.g. a lucide icon). */
  icon?: ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  'aria-label'?: string;
  className?: string;
  /** Custom separator between crumbs (defaults to a chevron). */
  separator?: ReactNode;
  /**
   * When set and `items.length` exceeds it, the middle crumbs are collapsed
   * into a dropdown. First crumb + the trailing `maxVisible - 1` stay visible.
   */
  maxVisible?: number;
  /** Label for the collapsed dropdown trigger (defaults to an ellipsis). */
  collapsedLabel?: ReactNode;
}

export function Breadcrumb({
  items,
  'aria-label': ariaLabel = 'Breadcrumb',
  className,
  separator,
  maxVisible,
  collapsedLabel = '…',
}: BreadcrumbProps) {
  const sep = separator ?? (
    <ChevronRight className="size-3.5 shrink-0 text-ink-4" aria-hidden="true" />
  );

  const renderCrumb = (item: BreadcrumbItem, isLast: boolean) => {
    const linked = Boolean(item.href) && !isLast;
    const label = (
      <>
        {item.icon && <span className="shrink-0">{item.icon}</span>}
        {item.label}
      </>
    );
    if (linked) {
      return (
        <a
          href={item.href}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-chip transition-colors duration-skin ease-skin hover:text-ink',
            focusRing(),
          )}
        >
          {label}
        </a>
      );
    }
    return (
      <span
        aria-current={isLast ? 'page' : undefined}
        className={cn(
          'inline-flex items-center gap-1.5',
          isLast ? 'font-medium text-ink' : undefined,
        )}
      >
        {label}
      </span>
    );
  };

  const collapsed = Boolean(maxVisible) && items.length > (maxVisible as number);

  if (!collapsed) {
    return (
      <nav aria-label={ariaLabel} className={cn('text-sm', className)}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li
                key={item.href ?? `crumb-${index}`}
                className="flex items-center gap-1.5 text-ink-3"
              >
                {index > 0 && sep}
                {renderCrumb(item, isLast)}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  const keep = Math.max(1, (maxVisible as number) - 1);
  const head = items[0];
  const tail = items.slice(items.length - keep);
  const middle = items.slice(1, items.length - keep);

  return (
    <nav aria-label={ariaLabel} className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li className="flex items-center gap-1.5 text-ink-3">
          {renderCrumb(head, items.length === 1)}
        </li>
        <li className="flex items-center gap-1.5 text-ink-3">
          {sep}
          <details className="relative">
            <summary
              className={cn(
                'inline-flex cursor-pointer list-none items-center rounded-chip px-1 text-ink-4 hover:text-ink',
                focusRing(),
              )}
              aria-label="Show hidden breadcrumbs"
            >
              {collapsedLabel}
            </summary>
            <ul className="mat-overlay absolute left-0 top-full z-50 mt-1 min-w-40 rounded-card p-1 text-sm shadow-sm">
              {middle.map((item, index) => (
                <li key={item.href ?? `collapse-${index}`}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className={cn(
                        'block rounded-control px-2 py-1.5 text-ink-3 hover:bg-surface-3 hover:text-ink',
                        focusRing(),
                      )}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="block px-2 py-1.5 text-ink-3">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        </li>
        {tail.map((item, index) => {
          const isLast = index === tail.length - 1;
          return (
            <li key={item.href ?? `tail-${index}`} className="flex items-center gap-1.5 text-ink-3">
              {sep}
              {renderCrumb(item, isLast)}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
