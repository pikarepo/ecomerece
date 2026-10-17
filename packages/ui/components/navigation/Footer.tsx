/** @jsxImportSource react */

/**
 * Footer variants (todo/09 batch 76): a sitemap-style mega footer, a
 * brand-forward fat footer, a sticky action bar and a social link bar.
 *
 * Markup contract: `mat-*` role classes + theme tokens only — never `--m-*`.
 */

import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Container, Heading, HStack, Stack, Text } from '../surface/Primitives';
import { Link } from './Link';

/* ── shared models ────────────────────────────────────────────────────── */

export interface FooterLink {
  label: string;
  href: string;
  /** Opens in a new tab (adds `target`/`rel`). Default false. */
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

function LinkColumn({ column }: { column: FooterColumn }) {
  return (
    <div>
      <Heading level={6} tone="ink-3">
        {column.title}
      </Heading>
      <ul className="mt-3 space-y-2">
        {column.links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              variant="subtle"
              target={link.external ? '_blank' : undefined}
              className="text-sm"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 1. social bar ────────────────────────────────────────────────────── */

export interface SocialBarProps {
  links: SocialLink[];
  /** Accessible name for the nav. Default "Social links". */
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Row of social icon links. Each opens in a new tab and carries an
 * `aria-label` + native `title`; the group is a labelled `<nav>`.
 */
export function SocialBar({
  links,
  label = 'Social links',
  size = 'md',
  className,
}: SocialBarProps) {
  const box = size === 'sm' ? 'size-9' : 'size-10';
  const icon = size === 'sm' ? 'size-4' : 'size-5';
  return (
    <nav aria-label={label} className={cn('flex flex-wrap items-center gap-2', className)}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className={cn(
              'mat-control grid place-items-center rounded-full text-ink-2 transition-colors duration-skin ease-skin hover:text-ink',
              box,
              focusRing(),
            )}
          >
            <Icon className={icon} aria-hidden="true" />
          </a>
        );
      })}
    </nav>
  );
}

/* ── 2. mega footer ───────────────────────────────────────────────────── */

export interface MegaFooterProps {
  /** Brand slot (wordmark + blurb). */
  brand?: ReactNode;
  columns: FooterColumn[];
  /** Newsletter form slot. */
  newsletter?: ReactNode;
  social?: SocialLink[];
  /** Legal/copyright content (bottom-left). */
  legal?: ReactNode;
  /** Small legal links (bottom-right). */
  legalLinks?: FooterLink[];
  className?: string;
}

/**
 * Sitemap-style mega footer: a brand/newsletter block beside up to four link
 * columns, then a bottom bar with the social bar, legal copy and legal links.
 */
export function MegaFooter({
  brand,
  columns,
  newsletter,
  social,
  legal,
  legalLinks,
  className,
}: MegaFooterProps) {
  return (
    <footer className={cn('mat-ground border-t border-line/15', className)}>
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {(brand || newsletter) && (
            <Stack gap={4} className="col-span-2 lg:col-span-2">
              {brand}
              {newsletter}
            </Stack>
          )}
          {columns.map((column) => (
            <LinkColumn key={column.title} column={column} />
          ))}
        </div>

        {(social || legal || legalLinks) && (
          <div className="mt-10 flex flex-col gap-4 border-t border-line/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <HStack gap={4}>
              {social && <SocialBar links={social} size="sm" />}
              {legal && (
                <Text size="xs" tone="ink-3">
                  {legal}
                </Text>
              )}
            </HStack>
            {legalLinks && (
              <HStack gap={4}>
                {legalLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    variant="subtle"
                    target={link.external ? '_blank' : undefined}
                    className="text-xs"
                  >
                    {link.label}
                  </Link>
                ))}
              </HStack>
            )}
          </div>
        )}
      </Container>
    </footer>
  );
}

/* ── 3. fat footer ────────────────────────────────────────────────────── */

export interface FatFooterProps {
  /** Large brand wordmark (rendered oversized). */
  brand: ReactNode;
  tagline?: ReactNode;
  columns?: FooterColumn[];
  social?: SocialLink[];
  legal?: ReactNode;
  className?: string;
}

/**
 * Brand-forward "fat" footer: an oversized wordmark + tagline (and social bar)
 * on the left, compact link columns on the right, closed by a legal rule.
 */
export function FatFooter({
  brand,
  tagline,
  columns = [],
  social,
  legal,
  className,
}: FatFooterProps) {
  return (
    <footer className={cn('mat-ground border-t border-line/15', className)}>
      <Container className="py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <Stack gap={3} className="max-w-md">
            <div className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{brand}</div>
            {tagline && (
              <Text size="sm" tone="ink-2">
                {tagline}
              </Text>
            )}
            {social && <SocialBar links={social} />}
          </Stack>
          {columns.length > 0 && (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-12">
              {columns.map((column) => (
                <LinkColumn key={column.title} column={column} />
              ))}
            </div>
          )}
        </div>
        {legal && (
          <div className="mt-12 border-t border-line/15 pt-6">
            <Text size="xs" tone="ink-3">
              {legal}
            </Text>
          </div>
        )}
      </Container>
    </footer>
  );
}

/* ── 4. sticky footer ─────────────────────────────────────────────────── */

export interface StickyFooterProps {
  children: ReactNode;
  /** Right-aligned action slot (buttons). */
  actions?: ReactNode;
  /** Show a dismiss (✕) button; wire the handler here. */
  onDismiss?: () => void;
  /** Accessible name for the dismiss button. Default "Dismiss". */
  dismissLabel?: string;
  className?: string;
}

/**
 * Sticky action bar pinned to the bottom of its scroll container
 * (`sticky bottom-0`) — cookie/consent bars, bulk-action trays, save bars.
 * Optional trailing actions and a dismiss button.
 */
export function StickyFooter({
  children,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
}: StickyFooterProps) {
  return (
    <footer
      className={cn(
        'mat-chrome sticky bottom-0 z-chrome border-t border-line/20 px-4 py-3',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-shell flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 text-sm text-ink-2">{children}</div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        {onDismiss && (
          <button
            type="button"
            aria-label={dismissLabel}
            title={dismissLabel}
            onClick={onDismiss}
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-full text-ink-3 transition-colors duration-skin ease-skin hover:bg-surface-2 hover:text-ink',
              focusRing(),
            )}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </footer>
  );
}
