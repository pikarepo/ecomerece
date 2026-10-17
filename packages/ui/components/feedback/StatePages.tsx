/** @jsxImportSource react */

import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  Construction,
  FileQuestion,
  Link2Off,
  MailCheck,
  PartyPopper,
  ServerCrash,
  ShieldAlert,
  WifiOff,
  Wrench,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../controls/Button';
import { Progress } from '../data/Progress';

type ShellTone = 'neutral' | 'success' | 'warning' | 'danger';

const toneCircle: Record<ShellTone, string> = {
  neutral: 'bg-surface-3',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  danger: 'bg-danger/10',
};

const toneIcon: Record<ShellTone, string> = {
  neutral: 'text-ink-3',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

interface StatePageShellProps {
  icon: LucideIcon;
  tone?: ShellTone;
  /** Small mono kicker above the icon (e.g. “Bad request”). */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Content between description and actions (code chip, notes, bars). */
  mid?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Shared centred layout for every state page (mirrors `EmptyState` metrics). */
function StatePageShell({
  icon: Icon,
  tone = 'neutral',
  eyebrow,
  title,
  description,
  mid,
  actions,
  className,
}: StatePageShellProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}
    >
      {eyebrow && (
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-ink-3">{eyebrow}</p>
      )}
      <span
        className={cn('flex size-16 items-center justify-center rounded-full', toneCircle[tone])}
      >
        <Icon className={cn('size-7', toneIcon[tone])} aria-hidden="true" />
      </span>
      <p className="mt-4 text-xl font-semibold tracking-tight">{title}</p>
      {description && <p className="mt-1 max-w-[42ch] text-sm text-ink-2">{description}</p>}
      {mid}
      {actions && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      )}
    </div>
  );
}

/* ─────────────────────────── offline ─────────────────────────── */

export interface OfflineStateProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Re-check connectivity (browsers report `navigator.onLine`). */
  onRetry?: () => void;
  retryLabel?: string;
  /** Sync note under the copy, e.g. “Last synced 2 minutes ago”. */
  status?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Offline state — distinct from `ErrorState` (a failed fetch inside a view):
 * this is the whole-surface “no connection” page.
 */
export function OfflineState({
  title = "You're offline",
  description = 'Check your connection and try again — everything you have already loaded stays available.',
  onRetry,
  retryLabel = 'Try again',
  status,
  action,
  className,
}: OfflineStateProps) {
  return (
    <StatePageShell
      icon={WifiOff}
      tone="warning"
      title={title}
      description={description}
      mid={status && <p className="mt-2 font-mono text-xs text-ink-3">{status}</p>}
      actions={
        <>
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {action}
        </>
      }
      className={className}
    />
  );
}

/* ───────────────────────── error pages ───────────────────────── */

export type StatePageErrorCode = 400 | 403 | 404 | 500 | 503;

export const ERROR_PAGE_COPY: Record<
  StatePageErrorCode,
  { label: string; title: string; description: string; tone: ShellTone; icon: LucideIcon }
> = {
  400: {
    label: 'Bad request',
    title: 'That request didn’t work',
    description: 'The address may be incomplete or malformed. Check the URL and try again.',
    tone: 'warning',
    icon: AlertCircle,
  },
  403: {
    label: 'Forbidden',
    title: 'You don’t have access to this page',
    description: 'Your account is signed in, but this area requires different permissions.',
    tone: 'warning',
    icon: ShieldAlert,
  },
  404: {
    label: 'Not found',
    title: 'We couldn’t find that page',
    description: 'The link may be outdated, or the page may have moved or never existed.',
    tone: 'neutral',
    icon: FileQuestion,
  },
  500: {
    label: 'Server error',
    title: 'Something broke on our side',
    description:
      'The error has been logged. Retrying usually helps; if it keeps happening, tell us.',
    tone: 'danger',
    icon: ServerCrash,
  },
  503: {
    label: 'Service unavailable',
    title: 'We’re temporarily down',
    description: 'Scheduled maintenance or high load. We should be back within a few minutes.',
    tone: 'warning',
    icon: Wrench,
  },
};

export interface ErrorPageProps {
  code: StatePageErrorCode;
  title?: ReactNode;
  description?: ReactNode;
  /** Convenience: renders the primary “Try again” button when given. */
  onRetry?: () => void;
  retryLabel?: string;
  /** Primary action slot (replaces the retry button when both are given). */
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  /** Mono details box (request id, timestamp…). */
  details?: ReactNode;
  className?: string;
}

/**
 * Full-page HTTP status surface (400/403/404/500/503) — oversized mono status
 * code + label, tone-mapped icon, copy from `ERROR_PAGE_COPY` (all overridable).
 * The kit's 404 mirrors Next's `not-found` so non-Next hosts can reuse it.
 */
export function ErrorPage({
  code,
  title,
  description,
  onRetry,
  retryLabel = 'Try again',
  primaryAction,
  secondaryAction,
  details,
  className,
}: ErrorPageProps) {
  const copy = ERROR_PAGE_COPY[code];
  return (
    <StatePageShell
      icon={copy.icon}
      tone={copy.tone}
      eyebrow={copy.label}
      title={title ?? copy.title}
      description={description ?? copy.description}
      mid={
        <>
          <p className="mt-4 font-mono text-6xl font-semibold leading-none tabular-nums text-ink-4">
            {code}
            <span className="sr-only"> — {copy.label}</span>
          </p>
          {details && (
            <div className="mt-4 max-w-[46ch] truncate rounded-control bg-surface-3 px-3 py-2 font-mono text-xs text-ink-2">
              {details}
            </div>
          )}
        </>
      }
      actions={
        <>
          {primaryAction ??
            (onRetry && (
              <Button variant="primary" onClick={onRetry}>
                {retryLabel}
              </Button>
            ))}
          {secondaryAction}
        </>
      }
      className={className}
    />
  );
}

/* ──────────────────────── under construction ──────────────────────── */

export interface UnderConstructionPageProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Expected-ready note, e.g. “ETA: Friday”. */
  eta?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function UnderConstructionPage({
  title = 'Under construction',
  description = 'We’re rebuilding this area. It will be back better than before.',
  eta,
  action,
  className,
}: UnderConstructionPageProps) {
  return (
    <StatePageShell
      icon={Construction}
      tone="warning"
      eyebrow="Work in progress"
      title={title}
      description={description}
      mid={
        <>
          <div aria-hidden="true" className="mt-4 w-40">
            <Progress variant="indeterminate" value={0} />
          </div>
          {eta && <p className="mt-2 font-mono text-xs text-ink-3">{eta}</p>}
        </>
      }
      actions={action}
      className={className}
    />
  );
}

/* ────────────────────────── expired link ────────────────────────── */

export interface ExpiredLinkPageProps {
  title?: ReactNode;
  description?: ReactNode;
  /** When the link stopped working (rendered under the copy). */
  expiresAt?: ReactNode;
  onResend?: () => void;
  resendLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  action?: ReactNode;
  className?: string;
}

export function ExpiredLinkPage({
  title = 'This link has expired',
  description = 'For your security, time-limited links stop working. Request a fresh one and continue where you left off.',
  expiresAt,
  onResend,
  resendLabel = 'Send a new link',
  homeHref,
  homeLabel = 'Back to home',
  action,
  className,
}: ExpiredLinkPageProps) {
  return (
    <StatePageShell
      icon={Link2Off}
      tone="warning"
      eyebrow="Link expired"
      title={title}
      description={description}
      mid={expiresAt && <p className="mt-2 font-mono text-xs text-ink-3">{expiresAt}</p>}
      actions={
        <>
          {onResend && (
            <Button variant="primary" onClick={onResend}>
              {resendLabel}
            </Button>
          )}
          {homeHref && (
            <a
              href={homeHref}
              className="inline-flex min-h-11 items-center rounded-control px-4 text-sm font-medium text-ink-2 transition-all duration-skin ease-skin hover:text-ink"
            >
              {homeLabel}
            </a>
          )}
          {action}
        </>
      }
      className={className}
    />
  );
}

/* ────────────────────────── thank you ────────────────────────── */

export interface ThankYouPageProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Reference chip (order number, ticket id…) rendered mono. */
  reference?: ReactNode;
  action?: ReactNode;
  homeHref?: string;
  homeLabel?: string;
  className?: string;
}

export function ThankYouPage({
  title = 'Thank you!',
  description = 'Your submission went through. We’ll take it from here.',
  reference,
  action,
  homeHref,
  homeLabel = 'Back to home',
  className,
}: ThankYouPageProps) {
  return (
    <StatePageShell
      icon={PartyPopper}
      tone="success"
      title={title}
      description={description}
      mid={
        reference && (
          <p className="mt-3 rounded-chip bg-surface-3 px-2.5 py-1 font-mono text-xs text-ink-2">
            {reference}
          </p>
        )
      }
      actions={
        <>
          {action}
          {homeHref && (
            <a
              href={homeHref}
              className="inline-flex min-h-11 items-center rounded-control px-4 text-sm font-medium text-ink-2 transition-all duration-skin ease-skin hover:text-ink"
            >
              {homeLabel}
            </a>
          )}
        </>
      }
      className={className}
    />
  );
}

/* ─────────────────────── verification pending ─────────────────────── */

export interface VerificationPendingPageProps {
  title?: ReactNode;
  /** Rendered into the default description when no `description` is given. */
  maskedEmail?: ReactNode;
  description?: ReactNode;
  /** Note under the copy (“Didn’t arrive? Check spam”). */
  hint?: ReactNode;
  onResend?: () => void;
  resendLabel?: string;
  action?: ReactNode;
  className?: string;
}

export function VerificationPendingPage({
  title = 'Verify your email',
  maskedEmail,
  description,
  hint,
  onResend,
  resendLabel = 'Resend email',
  action,
  className,
}: VerificationPendingPageProps) {
  const copy =
    description ??
    (maskedEmail
      ? `We sent a verification link to ${maskedEmail}. It can take a minute to arrive.`
      : 'We sent you a verification link. It can take a minute to arrive.');
  return (
    <StatePageShell
      icon={MailCheck}
      title={title}
      description={copy}
      mid={
        <>
          <div aria-hidden="true" className="mt-4 w-40">
            <Progress variant="indeterminate" value={0} />
          </div>
          {hint && <p className="mt-2 text-xs text-ink-3">{hint}</p>}
        </>
      }
      actions={
        <>
          {onResend && (
            <Button variant="primary" onClick={onResend}>
              {resendLabel}
            </Button>
          )}
          {action}
        </>
      }
      className={className}
    />
  );
}
