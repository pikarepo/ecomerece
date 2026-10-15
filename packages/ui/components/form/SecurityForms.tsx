/** @jsxImportSource react */

/**
 * Security forms (todo/09 batch 70): 2FA setup (QR + manual key + code verify),
 * recovery-codes sheet, passkey prompt and a spam honeypot field.
 *
 * Markup contract: `mat-*` role classes + theme tokens only — never `--m-*`.
 */

import { AlertTriangle, Check, Copy, Eye, EyeOff, Fingerprint, RefreshCw } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../controls/Button';
import { OTP } from './OTP';

/* ── 2FA setup ─────────────────────────────────────────────────────────── */

export type TwoFactorStatus = 'idle' | 'verifying' | 'verified' | 'error';

export interface TwoFactorSetupProps {
  /** Human label of the issuer, e.g. "Acme Store". */
  issuer: string;
  /** Account the code protects, usually the email. */
  account: string;
  /** Base32 shared secret shown as manual-entry fallback (grouped by 4). */
  secret: string;
  /** otpauth:// URI for clients that render their own QR. */
  otpauthUri?: string;
  /** QR image produced by the backend; when absent only the manual key is shown. */
  qrSrc?: string;
  /** Called with the entered 6-digit code when Verify is pressed. */
  onVerify?: (code: string) => void;
  status?: TwoFactorStatus;
  /** Error copy shown under the code input when `status="error"`. */
  errorMessage?: string;
  className?: string;
}

const groupSecret = (secret: string): string =>
  secret
    .replace(/\s+/g, '')
    .toUpperCase()
    .match(/.{1,4}/g)
    ?.join(' ') ?? secret;

export function TwoFactorSetup({
  issuer,
  account,
  secret,
  otpauthUri,
  qrSrc,
  onVerify,
  status = 'idle',
  errorMessage = 'That code did not work. Try again.',
  className,
}: TwoFactorSetupProps) {
  const [code, setCode] = useState('');

  return (
    <section
      aria-label={`Two-factor authentication setup for ${issuer}`}
      className={cn('flex flex-col gap-4', className)}
    >
      {qrSrc ? (
        <div className="flex flex-col items-center gap-2">
          <img
            src={qrSrc}
            alt=""
            className="size-40 rounded-control border border-line/30 bg-white p-2"
          />
          <p className="text-xs text-ink-3">Scan with your authenticator app</p>
        </div>
      ) : (
        <p className="text-xs text-ink-3">
          Ask your backend for a QR image, or enter the setup key manually below.
        </p>
      )}

      <div className="mat-well flex flex-col gap-1 rounded-control border border-line/30 p-3">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-3">
          Manual entry key
        </span>
        <code className="font-mono text-sm tracking-wide text-ink">{groupSecret(secret)}</code>
        <span className="text-xs text-ink-3">
          {issuer} · {account}
        </span>
        {otpauthUri && (
          <span className="truncate font-mono text-[11px] text-ink-4" title={otpauthUri}>
            {otpauthUri}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <OTP
          value={code}
          onValueChange={setCode}
          label="Enter the 6-digit code"
          disabled={status === 'verifying' || status === 'verified'}
        />
        {status === 'error' && (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-danger">
            <AlertTriangle className="size-4" aria-hidden />
            {errorMessage}
          </p>
        )}
        {status === 'verified' && (
          <p role="status" className="flex items-center gap-1.5 text-sm text-success">
            <Check className="size-4" aria-hidden />
            Two-factor authentication is on.
          </p>
        )}
        <Button
          variant="primary"
          disabled={code.length < 6 || status === 'verifying' || status === 'verified'}
          isLoading={status === 'verifying'}
          loadingText="Verifying…"
          onClick={() => onVerify?.(code)}
        >
          Verify &amp; enable
        </Button>
      </div>
    </section>
  );
}

/* ── Recovery codes ────────────────────────────────────────────────────── */

export interface RecoveryCodesProps {
  codes: string[];
  /** Mask codes until reveal. Default true. */
  masked?: boolean;
  onReveal?: () => void;
  /** Called after a successful clipboard write (or copy attempt). */
  onCopyAll?: () => void;
  onRegenerate?: () => void;
  className?: string;
}

const maskCode = (code: string): string => '•'.repeat(code.length);

export function RecoveryCodes({
  codes,
  masked = true,
  onReveal,
  onCopyAll,
  onRegenerate,
  className,
}: RecoveryCodesProps) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    const list = codes.join('\n');
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(list).catch(() => {});
    }
    setCopied(true);
    onCopyAll?.();
  };

  return (
    <section aria-label="Recovery codes" className={cn('flex flex-col gap-3', className)}>
      <p className="flex items-start gap-2 rounded-control bg-warning/10 p-3 text-sm text-warning">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        Store these codes somewhere safe. Each code can be used once if you lose access to your
        authenticator app.
      </p>

      <ul
        aria-label={masked ? 'Recovery codes (hidden)' : 'Recovery codes'}
        className="mat-well grid grid-cols-1 gap-1.5 rounded-control border border-line/30 p-3 font-mono text-sm text-ink sm:grid-cols-2"
      >
        {codes.map((code, i) => (
          <li key={`${code}-${i}`} className="tabular-nums">
            {String(i + 1).padStart(2, '0')} · {masked ? maskCode(code) : code}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={onReveal}>
          {masked ? (
            <>
              <Eye className="size-4" aria-hidden /> Reveal
            </>
          ) : (
            <>
              <EyeOff className="size-4" aria-hidden /> Hide
            </>
          )}
        </Button>
        <Button variant="ghost" onClick={copyAll}>
          {copied ? (
            <>
              <Check className="size-4 text-success" aria-hidden /> Copied
            </>
          ) : (
            <>
              <Copy className="size-4" aria-hidden /> Copy all
            </>
          )}
        </Button>
        {onRegenerate && (
          <Button variant="ghost" onClick={onRegenerate}>
            <RefreshCw className="size-4" aria-hidden /> Regenerate
          </Button>
        )}
      </div>
    </section>
  );
}

/* ── Passkey prompt ────────────────────────────────────────────────────── */

export interface PasskeyPromptProps {
  onContinue?: () => void;
  onCancel?: () => void;
  continueLabel?: string;
  cancelLabel?: string;
  /** Optional hint about available platform authenticators. */
  hint?: ReactNode;
  className?: string;
}

export function PasskeyPrompt({
  onContinue,
  onCancel,
  continueLabel = 'Continue with a passkey',
  cancelLabel = 'Use your password instead',
  hint = 'Your device may ask for a fingerprint, face scan or screen lock.',
  className,
}: PasskeyPromptProps) {
  return (
    <section
      aria-label="Sign in with a passkey"
      className={cn(
        'mat-panel flex flex-col items-center gap-3 rounded-card border border-line/30 p-6 text-center',
        className,
      )}
    >
      <span className="mat-primary grid size-12 place-items-center rounded-full">
        <Fingerprint className="size-6" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-ink">Use a passkey</h3>
      <p className="max-w-xs text-sm text-ink-2">{hint}</p>
      <div className="mt-1 flex w-full flex-col gap-2">
        <Button variant="primary" fullWidth onClick={onContinue}>
          {continueLabel}
        </Button>
        <Button variant="ghost" fullWidth onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </section>
  );
}

/* ── Honeypot ──────────────────────────────────────────────────────────── */

export interface HoneypotProps {
  /** Field name bots tend to fill. Default "company". */
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/**
 * Spam trap: visually hidden, out of the tab order and labelled for
 * screen-reader bypass — humans never see or reach it, autofill/bots do.
 * Gate submissions on `value === ''`.
 */
export function Honeypot({ name = 'company', value, onValueChange, className }: HoneypotProps) {
  return (
    <div aria-hidden="true" className={cn('sr-only', className)}>
      <label htmlFor={`hp-${name}`}>Leave this field empty</label>
      <input
        id={`hp-${name}`}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onValueChange?.(e.currentTarget.value)}
        // happy-dom only fires onInput for synthetic input events
        onInput={(e) => onValueChange?.(e.currentTarget.value)}
      />
    </div>
  );
}
