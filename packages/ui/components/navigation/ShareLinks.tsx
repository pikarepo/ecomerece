/** @jsxImportSource react */

/**
 * Copy & share affordances (todo/09 batch 78 §E). `PermalinkCopier` copies a
 * stable permalink (optionally with an `#anchor`) and flips to a "Copied"
 * state; `ShareLink` prefers the platform Web Share API and falls back to a
 * clipboard copy when the sheet is unavailable.
 *
 * The clipboard write is best-effort: insecure contexts or a denied permission
 * leave the button unchanged instead of throwing.
 *
 * Markup contract: `mat-*` role classes + theme tokens only — never `--m-*`.
 */

import { Check, Link2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ButtonProps } from '../controls/Button';
import { Button } from '../controls/Button';

/** Best-effort clipboard write; resolves true only when the text was written. */
async function writeToClipboard(text: string): Promise<boolean> {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (!clipboard?.writeText) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Current page URL, or '' outside a browser. */
function currentUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

/** `true` shortly after a successful copy, resetting after `resetDelay` ms. */
function useCopiedFlag(resetDelay: number) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), resetDelay);
    return () => clearTimeout(timer);
  }, [copied, resetDelay]);
  return [copied, setCopied] as const;
}

/* ── Permalink / anchor copier ─────────────────────────────────────────── */

export interface PermalinkCopierProps {
  /** Base URL — defaults to the current location. */
  url?: string;
  /** Fragment id to append as `#anchor`. */
  anchor?: string;
  /** Full text to copy; wins over `url` + `anchor`. */
  value?: string;
  /** Visible label. Default "Copy link". */
  label?: string;
  /** Label while the copied state shows. Default "Copied". */
  copiedLabel?: string;
  /** How long the copied state sticks, in ms. Default 2000. */
  resetDelay?: number;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  disabled?: boolean;
  /** Called with the copied text after a successful write. */
  onCopied?: (text: string) => void;
  className?: string;
}

/**
 * Copies a permalink — `value`, else `url` (or the current location) with an
 * optional `#anchor` — and shows a check + `copiedLabel` for a moment.
 */
export function PermalinkCopier({
  url,
  anchor,
  value,
  label = 'Copy link',
  copiedLabel = 'Copied',
  resetDelay = 2000,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  onCopied,
  className,
}: PermalinkCopierProps) {
  const [copied, setCopied] = useCopiedFlag(resetDelay);

  const copy = async () => {
    const base = (url ?? currentUrl()).split('#')[0];
    const text = value ?? (anchor ? `${base}#${anchor}` : base);
    if (!(await writeToClipboard(text))) return;
    setCopied(true);
    onCopied?.(text);
  };

  return (
    <Button variant={variant} size={size} disabled={disabled} onClick={copy} className={className}>
      {copied ? (
        <Check className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <Link2 className="size-4 shrink-0" aria-hidden="true" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </Button>
  );
}

/* ── Share-link copier ────────────────────────────────────────────────── */

export type ShareMethod = 'share' | 'clipboard' | 'unavailable';

export interface ShareResult {
  method: ShareMethod;
  url: string;
}

export interface ShareLinkProps {
  /** Canonical URL to share — defaults to the current location. */
  url?: string;
  /** Title passed to the platform share sheet. */
  title?: string;
  /** Body text passed to the platform share sheet. */
  text?: string;
  /** Skip the platform sheet and always copy to the clipboard. */
  copyOnly?: boolean;
  /** Visible label. Default "Share". */
  label?: string;
  /** Label while the copied state shows. Default "Link copied". */
  copiedLabel?: string;
  /** How long the copied state sticks, in ms. Default 2000. */
  resetDelay?: number;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  disabled?: boolean;
  /** Reports how the link was shared (a dismissed sheet reports nothing). */
  onShare?: (result: ShareResult) => void;
  className?: string;
}

/**
 * Shares `url` through `navigator.share` when available (and not `copyOnly`),
 * otherwise copies it and shows a check + `copiedLabel`.
 */
export function ShareLink({
  url,
  title,
  text,
  copyOnly = false,
  label = 'Share',
  copiedLabel = 'Link copied',
  resetDelay = 2000,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  onShare,
  className,
}: ShareLinkProps) {
  const [copied, setCopied] = useCopiedFlag(resetDelay);

  const share = async () => {
    const target = url ?? currentUrl();
    const canShare =
      !copyOnly && typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    if (canShare) {
      try {
        await navigator.share({ title, text, url: target });
        onShare?.({ method: 'share', url: target });
        return;
      } catch (error) {
        // A user-dismissed share sheet is not a failure — don't copy behind their back.
        if (
          typeof error === 'object' &&
          error !== null &&
          (error as { name?: string }).name === 'AbortError'
        ) {
          return;
        }
      }
    }

    const ok = await writeToClipboard(target);
    if (ok) setCopied(true);
    onShare?.({ method: ok ? 'clipboard' : 'unavailable', url: target });
  };

  return (
    <Button variant={variant} size={size} disabled={disabled} onClick={share} className={className}>
      {copied ? (
        <Check className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <Share2 className="size-4 shrink-0" aria-hidden="true" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </Button>
  );
}
