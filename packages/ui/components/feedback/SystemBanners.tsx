/** @jsxImportSource react */
import { Bell, Download, RefreshCw, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../controls/Button';
import { Switch } from '../controls/Switch';
import { Modal } from '../overlay/Modal';

type BannerTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

/** Same tinted-rule treatment as `Banner` (tone = semantics, never decoration). */
const toneEdges: Record<BannerTone, string> = {
  neutral: 'bg-surface-3 border border-line/10',
  info: 'bg-info/10 border border-info/20',
  success: 'bg-success/10 border border-success/20',
  warning: 'bg-warning/10 border border-warning/20',
  danger: 'bg-danger/10 border border-danger/20',
  accent: 'bg-accent/10 border border-accent/20',
};

const toneDots: Record<BannerTone, string> = {
  neutral: 'bg-line/30',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  accent: 'bg-accent',
};

/* ─────────────────────────── announcement ─────────────────────────── */

export interface AnnouncementBannerProps {
  /** Visibility is controlled by the caller; `onDismiss` is where you flip it. */
  open?: boolean;
  message: ReactNode;
  tone?: Extract<BannerTone, 'neutral' | 'info' | 'success' | 'warning'>;
  linkHref?: string;
  linkLabel?: string;
  onLinkClick?: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Slim strip for site-wide announcements (status, maintenance window, launch).
 * Inline (not fixed) — place it at the top of the page/layout.
 */
export function AnnouncementBanner({
  open = true,
  message,
  tone = 'info',
  linkHref,
  linkLabel,
  onLinkClick,
  onDismiss,
  dismissLabel = 'Dismiss',
  ariaLabel = 'Announcement',
  className,
}: AnnouncementBannerProps) {
  if (!open) return null;
  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        'relative flex items-center gap-3 rounded-control px-4 py-2.5 text-sm',
        toneEdges[tone],
        className,
      )}
    >
      <span aria-hidden="true" className={cn('size-2 shrink-0 rounded-full', toneDots[tone])} />
      <p className="min-w-0 flex-1">{message}</p>
      {linkHref && linkLabel && (
        <a
          href={linkHref}
          onClick={onLinkClick}
          className="shrink-0 font-medium text-accent underline-offset-2 hover:underline"
        >
          {linkLabel}
        </a>
      )}
      {onDismiss && (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-3 transition-all duration-skin ease-skin hover:bg-surface-3 hover:text-ink"
        >
          <X className="size-4" />
        </button>
      )}
    </section>
  );
}

/* ───────────────────────────── promo ───────────────────────────── */

export interface PromoBannerProps {
  open?: boolean;
  title: ReactNode;
  description?: ReactNode;
  /** Small chip before the title, e.g. `<Badge tone="accent">Limited time</Badge>`. */
  badge?: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Marketing strip — accent-tinted card with headline, badge slot and a primary
 * CTA. Distinct from `Banner` (neutral status message, no CTA emphasis).
 */
export function PromoBanner({
  open = true,
  title,
  description,
  badge,
  ctaLabel,
  ctaHref,
  onCta,
  secondaryLabel,
  onSecondary,
  onDismiss,
  dismissLabel = 'Dismiss',
  ariaLabel = 'Promotion',
  className,
}: PromoBannerProps) {
  if (!open) return null;
  return (
    <section
      aria-label={ariaLabel}
      className={cn('relative rounded-card p-4 pr-10', toneEdges.accent, className)}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {badge && <span className="shrink-0">{badge}</span>}
        <p className="text-sm font-semibold">{title}</p>
        {(ctaLabel && (ctaHref || onCta)) || secondaryLabel ? (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {secondaryLabel && (
              <Button variant="ghost" size="sm" onClick={onSecondary}>
                {secondaryLabel}
              </Button>
            )}
            {ctaLabel &&
              (ctaHref ? (
                <a
                  href={ctaHref}
                  onClick={onCta}
                  className="inline-flex min-h-9 items-center rounded-control bg-accent px-4 text-sm font-semibold text-accent-ink transition-all duration-skin ease-skin active:scale-[var(--press-scale)]"
                >
                  {ctaLabel}
                </a>
              ) : (
                <Button variant="primary" size="sm" onClick={onCta}>
                  {ctaLabel}
                </Button>
              ))}
          </div>
        ) : null}
      </div>
      {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
      {onDismiss && (
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={onDismiss}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-ink-3 transition-all duration-skin ease-skin hover:bg-surface-2 hover:text-ink"
        >
          <X className="size-4" />
        </button>
      )}
    </section>
  );
}

/* ─────────────────────────── cookie consent ─────────────────────────── */

export interface CookiePreferences {
  necessary: boolean;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentBannerProps {
  /** Controlled visibility (default shown). Flip it from your `onAcceptAll`/`onReject`/`onSave`. */
  open?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  policyHref?: string;
  policyLabel?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  manageLabel?: string;
  saveLabel?: string;
  onAcceptAll?: () => void;
  onReject?: () => void;
  onSave?: (prefs: CookiePreferences) => void;
  children?: ReactNode;
  className?: string;
}

const COOKIE_COPY =
  'We use cookies to run the site and, with your consent, to measure usage and personalise content.';

const CATEGORY_COPY: Record<
  keyof CookiePreferences | 'necessary',
  { title: string; body: string }
> = {
  necessary: { title: 'Strictly necessary', body: 'Required for cart, checkout and security.' },
  preferences: { title: 'Preferences', body: 'Remembers language, region and layout.' },
  analytics: { title: 'Analytics', body: 'Helps us understand what is used and what breaks.' },
  marketing: { title: 'Marketing', body: 'Measures campaigns and limits ad repetition.' },
};

/**
 * Bottom-fixed consent bar with a two-step flow: decide (reject / manage /
 * accept all) or tune the four categories and save. Visibility is controlled
 * by the caller.
 */
export function CookieConsentBanner({
  open = true,
  title = 'We value your privacy',
  description = COOKIE_COPY,
  policyHref,
  policyLabel = 'Cookie policy',
  acceptLabel = 'Accept all',
  rejectLabel = 'Reject non-essential',
  manageLabel = 'Manage preferences',
  saveLabel = 'Save preferences',
  onAcceptAll,
  onReject,
  onSave,
  children,
  className,
}: CookieConsentBannerProps) {
  const [managing, setManaging] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
  });

  if (!open) return null;

  const categories = (Object.keys(CATEGORY_COPY) as (keyof CookiePreferences)[]).map((key) => {
    const copy = CATEGORY_COPY[key];
    const required = key === 'necessary';
    return (
      <div key={key} className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">{copy.title}</p>
          <p className="text-xs text-ink-2">{copy.body}</p>
        </div>
        <Switch
          checked={required ? true : prefs[key]}
          disabled={required}
          label={copy.title}
          onCheckedChange={(next) => setPrefs((prev) => ({ ...prev, [key]: next }))}
        />
      </div>
    );
  });

  return (
    <section
      aria-label="Cookie consent"
      className={cn(
        'fixed bottom-4 left-4 right-4 z-chrome mat-overlay rounded-sheet p-4 sm:left-6 sm:right-6 sm:max-w-xl',
        '[padding-bottom:env(safe-area-inset-bottom)]',
        className,
      )}
    >
      {managing ? (
        <>
          <p className="text-sm font-semibold">Cookie preferences</p>
          <div className="mt-3 flex flex-col gap-3">{categories}</div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setManaging(false)}>
              Back
            </Button>
            <Button variant="primary" size="sm" onClick={() => onSave?.(prefs)}>
              {saveLabel}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm text-ink-2">{description}</p>
              {policyHref && (
                <a
                  href={policyHref}
                  className="mt-1 inline-block text-xs font-medium text-accent underline-offset-2 hover:underline"
                >
                  {policyLabel}
                </a>
              )}
            </div>
            <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
          </div>
          {children}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onReject}>
              {rejectLabel}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setManaging(true)}>
              {manageLabel}
            </Button>
            <Button variant="primary" size="sm" onClick={onAcceptAll}>
              {acceptLabel}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

/* ─────────────────────────── GDPR modal ─────────────────────────── */

export interface ConsentPurpose {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  /** Required purposes (e.g. strictly necessary) are locked on. */
  required?: boolean;
  defaultChecked?: boolean;
}

export interface GdprConsentModalProps {
  open: boolean;
  onClose: () => void;
  purposes?: ConsentPurpose[];
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onSave?: (selected: Record<string, boolean>) => void;
  acceptLabel?: string;
  rejectLabel?: string;
  saveLabel?: string;
  children?: ReactNode;
}

const DEFAULT_PURPOSES: ConsentPurpose[] = [
  {
    id: 'necessary',
    label: 'Strictly necessary',
    description: 'Required to run the store.',
    required: true,
  },
  { id: 'preferences', label: 'Preferences', description: 'Language, region and layout.' },
  { id: 'analytics', label: 'Analytics', description: 'Anonymous usage measurement.' },
  { id: 'marketing', label: 'Marketing', description: 'Campaign measurement and ads.' },
];

function defaultSelection(purposes: ConsentPurpose[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const purpose of purposes) {
    // Required purposes are on; everything else starts off unless the caller
    // opts in via `defaultChecked` (pre-ticked consent is not valid consent).
    out[purpose.id] = purpose.required ? true : (purpose.defaultChecked ?? false);
  }
  return out;
}

/**
 * Full consent dialog: purpose toggles (required ones locked on) with
 * reject-all / save-choices / accept-all. Selection is initialised from the
 * purposes' `required`/`defaultChecked` on mount — mount it while `open`,
 * or remount per flow, to reset.
 */
export function GdprConsentModal({
  open,
  onClose,
  purposes = DEFAULT_PURPOSES,
  onAcceptAll,
  onRejectAll,
  onSave,
  acceptLabel = 'Accept all',
  rejectLabel = 'Reject non-essential',
  saveLabel = 'Save choices',
  children,
}: GdprConsentModalProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    defaultSelection(purposes),
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage your privacy"
      description="Choose which purposes may use your data. You can change this later."
      scrollable
      footer={
        <>
          <Button variant="ghost" onClick={onRejectAll} className="mr-auto">
            {rejectLabel}
          </Button>
          <Button variant="secondary" onClick={() => onSave?.({ ...selected })}>
            {saveLabel}
          </Button>
          <Button variant="primary" onClick={onAcceptAll}>
            {acceptLabel}
          </Button>
        </>
      }
    >
      {children}
      <div className="flex flex-col gap-4">
        {purposes.map((purpose) => (
          <div key={purpose.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">{purpose.label}</p>
              {purpose.description && <p className="text-xs text-ink-2">{purpose.description}</p>}
            </div>
            <Switch
              checked={selected[purpose.id] ?? false}
              disabled={purpose.required}
              aria-label={typeof purpose.label === 'string' ? purpose.label : purpose.id}
              onCheckedChange={(next) => setSelected((prev) => ({ ...prev, [purpose.id]: next }))}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ─────────────────────────── prompt modals ─────────────────────────── */

export type PromptKind = 'install' | 'update' | 'permission';

const PROMPT_DEFAULTS: Record<
  PromptKind,
  { icon: typeof Download; title: string; description: string; confirm: string; cancel: string }
> = {
  install: {
    icon: Download,
    title: 'Install the app',
    description: 'Add it to your home screen for a faster, full-screen experience.',
    confirm: 'Install',
    cancel: 'Not now',
  },
  update: {
    icon: RefreshCw,
    title: 'Update available',
    description: 'A new version is ready — update now to get the latest fixes and features.',
    confirm: 'Update now',
    cancel: 'Later',
  },
  permission: {
    icon: Bell,
    title: 'Enable notifications',
    description: 'Get order updates and price drops. You can change this any time in settings.',
    confirm: 'Allow',
    cancel: 'Not now',
  },
};

export interface PromptModalProps {
  kind: PromptKind;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Chip rendered above the title, e.g. “New”. */
  badge?: ReactNode;
  children?: ReactNode;
}

/**
 * Install / update / permission prompts as modal dialogs (the “push prompt”
 * family) — icon well, headline, rationale, primary confirm + quiet dismiss.
 * Confirm does not close the dialog; the owner closes it from `onConfirm`.
 */
export function PromptModal({
  kind,
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  badge,
  children,
}: PromptModalProps) {
  const defaults = PROMPT_DEFAULTS[kind];
  const Icon = defaults.icon;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? defaults.title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel ?? defaults.cancel}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmLabel ?? defaults.confirm}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mat-well grid size-10 shrink-0 place-items-center rounded-control text-accent"
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          {badge && <div className="mb-1">{badge}</div>}
          <p className="text-sm text-ink-2">{description ?? defaults.description}</p>
          {children}
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────────────────── session timeout ─────────────────────────── */

/** Pure countdown formatter: `45s` below a minute, `m:ss` at or above. */
export function formatCountdown(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

export interface SessionTimeoutWarningProps {
  open: boolean;
  /** Whole seconds until the session expires. */
  secondsLeft: number;
  /** “Stay signed in” — also what Escape/backdrop trigger (safe default). */
  onStay: () => void;
  onSignOut?: () => void;
  title?: ReactNode;
  stayLabel?: string;
  signOutLabel?: string;
  /** Override the countdown rendering (defaults to `formatCountdown`). */
  format?: (seconds: number) => string;
  children?: ReactNode;
}

/**
 * Idle-session expiry warning: countdown in the copy, “Stay signed in” as the
 * primary action (Escape and backdrop also stay — never sign the user out by
 * accident), optional quiet “Sign out now”.
 */
export function SessionTimeoutWarning({
  open,
  secondsLeft,
  onStay,
  onSignOut,
  title = 'Session expiring',
  stayLabel = 'Stay signed in',
  signOutLabel = 'Sign out now',
  format = formatCountdown,
  children,
}: SessionTimeoutWarningProps) {
  const countdown = format(secondsLeft);
  const urgent = secondsLeft <= 10;
  return (
    <Modal
      open={open}
      onClose={onStay}
      title={title}
      footer={
        <>
          {onSignOut && (
            <Button variant="danger" onClick={onSignOut} className="mr-auto">
              {signOutLabel}
            </Button>
          )}
          <Button variant="primary" onClick={onStay}>
            {stayLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-2">
        You&apos;ll be signed out in{' '}
        <span
          className={cn(
            'font-mono font-semibold tabular-nums',
            urgent ? 'text-danger' : 'text-ink',
          )}
          data-urgent={urgent}
        >
          {countdown}
        </span>{' '}
        due to inactivity.
      </p>
      {children}
    </Modal>
  );
}
