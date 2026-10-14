/** @jsxImportSource react */

import {
  Apple,
  Chrome,
  Facebook,
  Github,
  LayoutGrid,
  Play,
  QrCode,
  Twitter,
  Wallet,
} from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Identity / payment / store buttons (todo/09 batch 61): "sign in with"
 * providers, wallet buttons, app-store badges and a QR-download panel.
 * `mat-*` + theme token utilities only.
 */

export type AuthProvider = 'apple' | 'google' | 'github' | 'microsoft' | 'facebook' | 'x';
export type WalletProvider = 'apple-pay' | 'google-pay' | 'paypal';
export type AppStore = 'app-store' | 'google-play';

const AUTH_BRAND: Record<AuthProvider, { label: string; Icon: typeof Apple }> = {
  apple: { label: 'Apple', Icon: Apple },
  google: { label: 'Google', Icon: Chrome },
  github: { label: 'GitHub', Icon: Github },
  microsoft: { label: 'Microsoft', Icon: LayoutGrid },
  facebook: { label: 'Facebook', Icon: Facebook },
  x: { label: 'X', Icon: Twitter },
};

const WALLET_BRAND: Record<WalletProvider, { label: string; Icon: typeof Apple }> = {
  'apple-pay': { label: 'Apple Pay', Icon: Apple },
  'google-pay': { label: 'Google Pay', Icon: Chrome },
  paypal: { label: 'PayPal', Icon: Wallet },
};

const STORE_BRAND: Record<AppStore, { top: string; bottom: string; Icon: typeof Apple }> = {
  'app-store': { top: 'Download on the', bottom: 'App Store', Icon: Apple },
  'google-play': { top: 'Get it on', bottom: 'Google Play', Icon: Play },
};

const CONTROL =
  'mat-control text-ink inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-medium transition-all duration-skin ease-skin hover:opacity-90 active:scale-[var(--press-scale)] disabled:pointer-events-none disabled:opacity-60';

export interface SignInButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: AuthProvider;
  /** Override the default "Sign in with {provider}" label. */
  label?: string;
  /** Full-width button (common on auth screens). */
  block?: boolean;
}

export function SignInButton({ provider, label, block, className, ...rest }: SignInButtonProps) {
  const { label: brand, Icon } = AUTH_BRAND[provider];
  return (
    <button
      type="button"
      data-provider={provider}
      className={cn(CONTROL, block && 'w-full', focusRing(), className)}
      {...rest}
    >
      <Icon className="size-4" aria-hidden />
      <span>{label ?? `Sign in with ${brand}`}</span>
    </button>
  );
}

export interface WalletButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: WalletProvider;
  block?: boolean;
}

export function WalletButton({ provider, block, className, ...rest }: WalletButtonProps) {
  const { label, Icon } = WALLET_BRAND[provider];
  return (
    <button
      type="button"
      data-wallet={provider}
      className={cn(
        'mat-primary text-accent-ink inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition-all duration-skin ease-skin hover:opacity-90 active:scale-[var(--press-scale)] disabled:pointer-events-none disabled:opacity-60',
        block && 'w-full',
        focusRing(),
        className,
      )}
      {...rest}
    >
      <Icon className="size-4" aria-hidden />
      <span>{label}</span>
    </button>
  );
}

export interface AppStoreBadgeProps {
  store: AppStore;
  href?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
}

export function AppStoreBadge({ store, href, onClick, className, label }: AppStoreBadgeProps) {
  const { top, bottom, Icon } = STORE_BRAND[store];
  const content = (
    <>
      <Icon className="size-6 shrink-0" aria-hidden />
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[0.6rem] uppercase tracking-wide opacity-80">{top}</span>
        <span className="text-sm font-semibold">{bottom}</span>
      </span>
    </>
  );
  const cls = cn(
    'inline-flex items-center gap-2 rounded-control border border-line/30 bg-ink px-3 py-1.5 text-surface-3 transition-all duration-skin ease-skin hover:opacity-90 active:scale-[var(--press-scale)]',
    focusRing(),
    className,
  );
  if (href) {
    return (
      <a href={href} aria-label={label ?? `${top} ${bottom}`} className={cls}>
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      aria-label={label ?? `${top} ${bottom}`}
      onClick={onClick}
      className={cls}
    >
      {content}
    </button>
  );
}

export interface QrDownloadProps {
  /** QR image source (data URL or path). Omit to pass `children`. */
  src?: string;
  children?: ReactNode;
  /** Caption under the code. */
  label?: string;
  /** Optional href that the whole panel links to. */
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const QR_SIZE = { sm: 'size-24', md: 'size-32', lg: 'size-40' } as const;

export function QrDownload({
  src,
  children,
  label = 'Scan to download',
  href,
  size = 'md',
  className,
}: QrDownloadProps) {
  const panel = (
    <figure className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'mat-well flex items-center justify-center overflow-hidden rounded-card border border-line/30 p-2',
          QR_SIZE[size],
        )}
      >
        {src ? (
          <img src={src} alt={label} className="size-full object-contain" />
        ) : (
          (children ?? <QrCode className="size-1/2 text-ink-3" aria-hidden />)
        )}
      </div>
      <figcaption className="text-xs font-medium text-ink-2">{label}</figcaption>
    </figure>
  );
  if (href) {
    return (
      <a href={href} className="inline-block">
        {panel}
      </a>
    );
  }
  return panel;
}
