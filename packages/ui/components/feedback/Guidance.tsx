/** @jsxImportSource react */

import type { LucideIcon } from 'lucide-react';
import { Check, Circle, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/cn';
import { Portal } from '../../lib/Portal';
import { Button } from '../controls/Button';
import { Progress } from '../data/Progress';
import { ProgressDots } from '../navigation/Stepper';
import { Modal } from '../overlay/Modal';
import { Popover } from '../overlay/Popover';

const NEW_CHIP =
  'rounded-chip bg-accent/12 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent';

/* ───────────────────────── inline help ───────────────────────── */

export interface InlineHelpProps {
  /** Trigger content; defaults to a “?” icon with an sr-only “Help”. */
  label?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * Dotted “?” affordance inline with copy — opens a small explanation
 * (click-triggered, Escape/outside-click close). Distinct from `Tooltip`
 * (hover gloss) and `HelpPanel` (full contextual drawer).
 */
export function InlineHelp({
  label,
  title,
  children,
  side = 'bottom',
  className,
}: InlineHelpProps) {
  return (
    <Popover
      side={side}
      className={cn('w-72', className)}
      trigger={
        label ? (
          <span className="font-medium text-accent underline-offset-2 hover:underline">
            {label}
          </span>
        ) : (
          <span className="inline-flex text-ink-3 transition-colors duration-skin ease-skin hover:text-ink">
            <HelpCircle className="size-4" aria-hidden="true" />
            <span className="sr-only">Help</span>
          </span>
        )
      }
      content={
        <div className="p-2 text-sm">
          {title && <p className="font-semibold">{title}</p>}
          <p className={cn('text-ink-2', title && 'mt-1')}>{children}</p>
        </div>
      }
    />
  );
}

/* ──────────────────────── contextual help panel ──────────────────────── */

export interface HelpPanelItem {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  href?: string;
}

export interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Intro copy rendered above the item list. */
  children?: ReactNode;
  items?: HelpPanelItem[];
  footer?: ReactNode;
  className?: string;
}

/**
 * Contextual help drawer — right-edge `Modal` listing articles for the current
 * screen. Pair with `useOverlay`-driven Escape/close (inherited from `Modal`).
 */
export function HelpPanel({
  open,
  onClose,
  title = 'Help',
  children,
  items,
  footer,
  className,
}: HelpPanelProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      side="right"
      scrollable
      footer={footer}
      className={className}
    >
      {children}
      {items && items.length > 0 && (
        <ul className="mt-1 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-0.5">
              {item.href ? (
                <a
                  href={item.href}
                  className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                >
                  {item.label}
                </a>
              ) : (
                <p className="text-sm font-medium">{item.label}</p>
              )}
              {item.description && <p className="text-xs text-ink-2">{item.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

/* ──────────────────────── product tour ──────────────────────── */

export interface TourStep {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** CSS selector of the element to spotlight (omit for a plain card). */
  target?: string;
}

export interface ProductTourProps {
  open: boolean;
  steps: TourStep[];
  /** Controlled step index; omit for internal state from `defaultIndex`. */
  step?: number;
  onStepChange?: (index: number) => void;
  defaultIndex?: number;
  onComplete?: () => void;
  /** Escape also triggers this — never a silent close. */
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  finishLabel?: string;
  skipLabel?: string;
  ariaLabel?: string;
  className?: string;
}

interface TourRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
}

/**
 * Step/spotlight walkthrough: dark scrim, a ringed hole over the step's
 * `target` (re-measured on resize) and a card with Back/Next/Skip, “Step X of
 * N” and clickable `ProgressDots`. Card is centred when the step has no target.
 */
export function ProductTour({
  open,
  steps,
  step,
  onStepChange,
  defaultIndex = 0,
  onComplete,
  onSkip,
  nextLabel = 'Next',
  backLabel = 'Back',
  finishLabel = 'Finish',
  skipLabel = 'Skip',
  ariaLabel = 'Product tour',
  className,
}: ProductTourProps) {
  const [internal, setInternal] = useState(defaultIndex);
  const index = step ?? internal;
  const setIndex = (next: number) => {
    setInternal(next);
    onStepChange?.(next);
  };
  const safeIndex = steps.length === 0 ? 0 : Math.min(Math.max(index, 0), steps.length - 1);
  const current = steps[safeIndex];
  const last = safeIndex >= steps.length - 1;

  const [rect, setRect] = useState<TourRect | null>(null);
  useEffect(() => {
    if (!open || !current?.target) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector<HTMLElement>(current.target as string);
      if (!el) {
        setRect(null);
        return;
      }
      const box = el.getBoundingClientRect();
      setRect({
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
        bottom: box.bottom,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open, current?.target]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onSkip?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onSkip]);

  if (!open || !current) return null;

  return (
    <Portal>
      <div aria-hidden="true" data-tour-scrim="" className="fixed inset-0 z-modal bg-ink/60" />
      {rect && (
        <div
          aria-hidden="true"
          data-tour-spotlight=""
          className="pointer-events-none fixed z-modal rounded-card ring-2 ring-accent transition-all duration-skin ease-skin"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        data-tour-card=""
        style={
          rect
            ? {
                top: rect.bottom + 12,
                left: Math.max(8, rect.left),
                position: 'fixed',
              }
            : undefined
        }
        className={cn(
          'mat-overlay z-modal w-80 rounded-card p-4',
          !rect && 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          className,
        )}
      >
        <p className="font-mono text-xs text-ink-3">
          Step {safeIndex + 1} of {steps.length}
        </p>
        <p className="mt-1 text-sm font-semibold">{current.title}</p>
        {current.description && (
          <p className="mt-1 text-xs leading-relaxed text-ink-2">{current.description}</p>
        )}
        <ProgressDots
          count={steps.length}
          value={safeIndex}
          onChange={setIndex}
          label="Tour steps"
          className="mt-3 justify-start"
        />
        <div className="mt-3 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {skipLabel}
          </Button>
          <div className="ml-auto flex gap-2">
            {safeIndex > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setIndex(safeIndex - 1)}>
                {backLabel}
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => (last ? onComplete?.() : setIndex(safeIndex + 1))}
            >
              {last ? finishLabel : nextLabel}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ──────────────────────── checklist widget ──────────────────────── */

export interface GuidanceChecklistItem {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  done?: boolean;
  href?: string;
}

export interface ChecklistWidgetProps {
  title?: ReactNode;
  items: GuidanceChecklistItem[];
  /** Wire to your store; rows toggle visually via `onToggle`. */
  onToggle?: (id: string, done: boolean) => void;
  /** Fires once when a toggle completes the list. */
  onDone?: () => void;
  action?: ReactNode;
  className?: string;
}

/** Onboarding/get-started checklist with progress bar and per-item toggles. */
export function ChecklistWidget({
  title = 'Get started',
  items,
  onToggle,
  onDone,
  action,
  className,
}: ChecklistWidgetProps) {
  const doneCount = items.filter((item) => item.done).length;
  const total = items.length;
  const percent = total === 0 ? 0 : (doneCount / total) * 100;

  return (
    <div className={cn('rounded-card border border-line/10 p-4', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <p className="font-mono text-xs tabular-nums text-ink-3">
          {doneCount} of {total} done
        </p>
      </div>
      <div className="mt-2">
        <Progress value={percent} label="Checklist progress" />
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5">
            <button
              type="button"
              aria-pressed={item.done}
              aria-label={typeof item.label === 'string' ? item.label : item.id}
              onClick={() => {
                if (!onToggle) return;
                onToggle(item.id, !item.done);
                if (!item.done && doneCount + 1 === total) onDone?.();
              }}
              className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-chip border transition-all duration-skin ease-skin',
                item.done ? 'border-accent bg-accent text-accent-ink' : 'border-line/30 text-ink-4',
              )}
            >
              {item.done ? (
                <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
              ) : (
                <Circle className="size-2.5" aria-hidden="true" />
              )}
            </button>
            <div className="min-w-0">
              {item.href ? (
                <a
                  href={item.href}
                  className={cn(
                    'text-sm font-medium underline-offset-2 hover:underline',
                    item.done && 'text-ink-4 line-through',
                  )}
                >
                  {item.label}
                </a>
              ) : (
                <p className={cn('text-sm font-medium', item.done && 'text-ink-4 line-through')}>
                  {item.label}
                </p>
              )}
              {item.description && <p className="text-xs text-ink-2">{item.description}</p>}
            </div>
          </li>
        ))}
      </ul>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ──────────────────────── tips carousel ──────────────────────── */

export interface GuidanceTip {
  id: string;
  title: ReactNode;
  body?: ReactNode;
}

export interface TipsCarouselProps {
  tips: GuidanceTip[];
  /** Controlled index; omit for internal state. */
  index?: number;
  onIndexChange?: (index: number) => void;
  defaultIndex?: number;
  nextLabel?: string;
  prevLabel?: string;
  className?: string;
}

/** Single-tip card with prev/next controls, `ProgressDots` and polite live region. */
export function TipsCarousel({
  tips,
  index,
  onIndexChange,
  defaultIndex = 0,
  nextLabel = 'Next tip',
  prevLabel = 'Previous tip',
  className,
}: TipsCarouselProps) {
  const [internal, setInternal] = useState(defaultIndex);
  const active = index ?? internal;
  const safe = tips.length === 0 ? 0 : Math.min(Math.max(active, 0), tips.length - 1);
  const set = (next: number) => {
    setInternal(next);
    onIndexChange?.(next);
  };
  const tip = tips[safe];
  if (!tip) return null;

  return (
    <div aria-live="polite" className={cn('rounded-card border border-line/10 p-4', className)}>
      <div className="flex items-center gap-2 text-xs text-ink-3">
        <Lightbulb className="size-4 text-accent" aria-hidden="true" />
        <span className="font-mono">
          Tip {safe + 1} of {tips.length}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold">{tip.title}</p>
      {tip.body && <p className="mt-1 text-sm text-ink-2">{tip.body}</p>}
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => set((safe - 1 + tips.length) % tips.length)}
        >
          {prevLabel}
        </Button>
        <ProgressDots
          count={tips.length}
          value={safe}
          onChange={set}
          label="Tips"
          className="ml-auto"
        />
        <Button variant="ghost" size="sm" onClick={() => set((safe + 1) % tips.length)}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────── feature announcement ───────────────────── */

export interface FeatureAnnouncementProps {
  /** Trigger content; default is an underlined “What’s new” + NEW chip. */
  trigger?: ReactNode;
  badge?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Screenshot/illustration slot (render it small). */
  media?: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  /** “Got it” — notify the owner the announcement was seen. */
  onDismiss?: () => void;
  dismissLabel?: string;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

/** Anchor with a NEW chip that reveals a feature card (arrow, media, CTA). */
export function FeatureAnnouncement({
  trigger,
  badge,
  title,
  description,
  media,
  ctaLabel,
  ctaHref,
  onCta,
  onDismiss,
  dismissLabel = 'Got it',
  side = 'bottom',
  align = 'start',
  className,
}: FeatureAnnouncementProps) {
  return (
    <Popover
      side={side}
      align={align}
      arrow
      className={cn('w-80', className)}
      trigger={
        trigger ?? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline-offset-2 hover:underline">
            What’s new
            <span className={NEW_CHIP}>New</span>
          </span>
        )
      }
      content={
        <div className="p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            {badge ?? <span className={NEW_CHIP}>New</span>}
            <p className="font-semibold">{title}</p>
          </div>
          {description && <p className="mt-1 text-ink-2">{description}</p>}
          {media && <div className="mt-3 overflow-hidden rounded-control">{media}</div>}
          {(ctaLabel || onDismiss) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {ctaLabel &&
                (ctaHref ? (
                  <a
                    href={ctaHref}
                    onClick={onCta}
                    className="inline-flex min-h-9 items-center rounded-control bg-accent px-3 text-xs font-semibold text-accent-ink"
                  >
                    {ctaLabel}
                  </a>
                ) : (
                  <Button variant="primary" size="sm" onClick={onCta}>
                    {ctaLabel}
                  </Button>
                ))}
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  {dismissLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}

/* ────────────────────────── changelog popup ────────────────────────── */

export interface ChangelogEntry {
  version: string;
  date?: ReactNode;
  title: ReactNode;
  items?: string[];
  latest?: boolean;
}

export interface ChangelogPopupProps {
  /** Trigger content; default is a “Changelog” link. */
  trigger?: ReactNode;
  title?: ReactNode;
  /** Newest first. */
  entries: ChangelogEntry[];
  viewAllHref?: string;
  viewAllLabel?: string;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

/** “Changelog” anchor opening a version-history popover. */
export function ChangelogPopup({
  trigger,
  title = 'What changed',
  entries,
  viewAllHref,
  viewAllLabel = 'View all releases',
  side = 'bottom',
  align = 'start',
  className,
}: ChangelogPopupProps) {
  return (
    <Popover
      side={side}
      align={align}
      className={cn('w-80', className)}
      trigger={
        trigger ?? (
          <span className="text-sm font-medium text-accent underline-offset-2 hover:underline">
            Changelog
          </span>
        )
      }
      content={
        <div className="p-3 text-sm">
          <p className="font-semibold">{title}</p>
          <ul className="mt-2 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
            {entries.map((entry) => (
              <li key={entry.version} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-chip bg-surface-3 px-1.5 py-0.5 font-mono text-xs text-ink-2">
                    v{entry.version}
                  </span>
                  {entry.latest && <span className={NEW_CHIP}>Latest</span>}
                  {entry.date && <span className="text-xs text-ink-3">{entry.date}</span>}
                </div>
                <p className="text-sm font-medium">{entry.title}</p>
                {entry.items && entry.items.length > 0 && (
                  <ul className="flex flex-col gap-0.5">
                    {entry.items.map((item) => (
                      <li key={item} className="flex gap-2 text-xs text-ink-2">
                        <span aria-hidden="true" className="text-ink-4">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="mt-3 inline-block text-xs font-medium text-accent underline-offset-2 hover:underline"
            >
              {viewAllLabel}
            </a>
          )}
        </div>
      }
    />
  );
}

/* ────────────────────────── onboarding modal ────────────────────────── */

export interface OnboardingFeature {
  id: string;
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
}

export interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  /** Primary “Get started” action. */
  onStart: () => void;
  brand?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  features?: OnboardingFeature[];
  children?: ReactNode;
  startLabel?: string;
  skipLabel?: string;
  className?: string;
}

/** First-run welcome dialog: brand, headline, feature bullets, Get started/Skip. */
export function OnboardingModal({
  open,
  onClose,
  onStart,
  brand,
  title = 'Welcome aboard',
  description,
  features,
  children,
  startLabel = 'Get started',
  skipLabel = 'Skip',
  className,
}: OnboardingModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className={className}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {skipLabel}
          </Button>
          <Button variant="primary" onClick={onStart}>
            {startLabel}
          </Button>
        </>
      }
    >
      {brand && <div className="mb-2">{brand}</div>}
      <p className="text-xl font-semibold tracking-tight">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
      {children}
      {features && features.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {features.map((feature) => {
            const Icon = feature.icon ?? Sparkles;
            return (
              <li key={feature.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-control bg-accent/12 text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{feature.title}</p>
                  {feature.description && (
                    <p className="text-xs text-ink-2">{feature.description}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
