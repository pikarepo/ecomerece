/** @jsxImportSource react */
import { ExternalLink } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

export type LinkVariant = 'default' | 'subtle' | 'underline' | 'unstyled';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode;
  variant?: LinkVariant;
  /** Show an external-link icon when href opens a new tab. Default auto (true when target="_blank"). */
  showExternal?: boolean;
  className?: string;
}

const variantClass: Record<LinkVariant, string> = {
  default:
    'text-accent underline-offset-2 hover:underline transition-colors duration-skin ease-skin',
  subtle: 'text-ink-2 hover:text-ink transition-colors duration-skin ease-skin',
  underline:
    'text-ink underline underline-offset-2 decoration-line/50 hover:decoration-ink transition-colors duration-skin ease-skin',
  unstyled: '',
};

export function Link({
  children,
  variant = 'default',
  showExternal,
  className,
  target,
  rel,
  ...rest
}: LinkProps) {
  const isExternal = target === '_blank';
  const safeRel = isExternal ? [rel, 'noopener noreferrer'].filter(Boolean).join(' ') : rel;
  const showIcon = showExternal ?? isExternal;

  return (
    <a
      target={target}
      rel={safeRel || undefined}
      className={cn(
        'inline-flex items-center gap-1 rounded-chip',
        variantClass[variant],
        focusRing(),
        className,
      )}
      {...rest}
    >
      {children}
      {showIcon && <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />}
    </a>
  );
}
