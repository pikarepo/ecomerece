/** @jsxImportSource react */

import { AtSign, Check, Eye, EyeOff, Globe, Loader2, X } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Smart inputs (todo/09 batch 44): email input with domain suggestions, URL
 * input, async username availability checker, and a password strength meter.
 * `mat-*` + theme token utilities only.
 */

const WRAP =
  'mat-raised relative flex items-center gap-2 rounded-control border border-line/30 px-3.5 py-2.5 transition-all duration-skin ease-skin focus-within:ring-2 focus-within:ring-accent';
const FIELD =
  'min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-4 focus:outline-none disabled:cursor-not-allowed';
const DEFAULT_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'proton.me'];

export interface EmailInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  domains?: string[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(function EmailInput(
  { domains = DEFAULT_DOMAINS, defaultValue = '', onValueChange, className, ...rest },
  ref,
) {
  const [value, setValue] = useState(defaultValue);
  const [at, domain = ''] = value.split('@');
  const hasAt = value.includes('@');
  const suggestion = useMemo(() => {
    if (!hasAt || !domain) return null;
    const match = domains.find((d) => d !== domain && d.startsWith(domain));
    return match ? `${at}@${match}` : null;
  }, [hasAt, domain, at, domains]);

  const update = (next: string) => {
    setValue(next);
    onValueChange?.(next);
  };

  return (
    <div className={cn('block', className)}>
      <div className={WRAP}>
        <AtSign className="size-4 shrink-0 text-ink-3" aria-hidden />
        <input
          {...rest}
          ref={ref}
          type="email"
          autoComplete="email"
          value={value}
          onChange={(e) => update(e.target.value)}
          className={FIELD}
        />
      </div>
      {suggestion && (
        <button
          type="button"
          onClick={() => update(suggestion)}
          className="mt-1.5 cursor-pointer text-xs text-accent underline-offset-2 hover:underline"
        >
          Did you mean {suggestion}?
        </button>
      )}
    </div>
  );
});

export interface UrlInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const UrlInput = forwardRef<HTMLInputElement, UrlInputProps>(function UrlInput(
  { defaultValue = '', onValueChange, className, ...rest },
  ref,
) {
  const [value, setValue] = useState(defaultValue);
  const update = (next: string) => {
    setValue(next);
    onValueChange?.(next);
  };
  const valid = value === '' || /^https?:\/\/\S+$/i.test(value);
  return (
    <div className={cn('block', className)}>
      <div className={cn(WRAP, !valid && 'ring-2 ring-warning')}>
        <Globe className="size-4 shrink-0 text-ink-3" aria-hidden />
        <input
          {...rest}
          ref={ref}
          type="url"
          inputMode="url"
          value={value}
          onChange={(e) => update(e.target.value)}
          onBlur={(e) => {
            rest.onBlur?.(e);
            if (value && !/^https?:\/\//i.test(value)) update(`https://${value}`);
          }}
          className={FIELD}
        />
      </div>
    </div>
  );
});

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

export interface UsernameInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Resolve `true` when the username is free. */
  check?: (username: string) => Promise<boolean>;
  debounceMs?: number;
}

export const UsernameInput = forwardRef<HTMLInputElement, UsernameInputProps>(
  function UsernameInput(
    { defaultValue = '', onValueChange, check, debounceMs = 300, className, ...rest },
    ref,
  ) {
    const [value, setValue] = useState(defaultValue);
    const [status, setStatus] = useState<UsernameStatus>('idle');
    const seq = useRef(0);

    useEffect(() => {
      if (!check || value.trim().length < 3) {
        setStatus('idle');
        return;
      }
      setStatus('checking');
      const id = ++seq.current;
      const t = setTimeout(async () => {
        try {
          const ok = await check(value);
          if (seq.current === id) setStatus(ok ? 'available' : 'taken');
        } catch {
          if (seq.current === id) setStatus('idle');
        }
      }, debounceMs);
      return () => clearTimeout(t);
    }, [value, check, debounceMs]);

    const update = (next: string) => {
      setValue(next);
      onValueChange?.(next);
    };

    return (
      <div className={cn('block', className)}>
        <div
          className={cn(
            WRAP,
            status === 'taken' && 'ring-2 ring-danger',
            status === 'available' && 'ring-2 ring-success',
          )}
        >
          <AtSign className="size-4 shrink-0 text-ink-3" aria-hidden />
          <input
            {...rest}
            ref={ref}
            type="text"
            autoComplete="username"
            value={value}
            onChange={(e) => update(e.target.value)}
            className={FIELD}
          />
          {status === 'checking' && (
            <Loader2 className="size-4 shrink-0 animate-spin text-ink-3" aria-hidden />
          )}
          {status === 'available' && <Check className="size-4 shrink-0 text-success" aria-hidden />}
          {status === 'taken' && <X className="size-4 shrink-0 text-danger" aria-hidden />}
        </div>
        {status !== 'idle' && (
          <span
            role="status"
            className={cn(
              'mt-1.5 block text-xs',
              status === 'available' && 'text-success',
              status === 'taken' && 'text-danger',
              status === 'checking' && 'text-ink-3',
            )}
          >
            {status === 'checking'
              ? 'Checking…'
              : status === 'available'
                ? 'Username available'
                : 'Username taken'}
          </span>
        )}
      </div>
    );
  },
);

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

const DEFAULT_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'lower', label: 'A lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'upper', label: 'An uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'number', label: 'A number', test: (v) => /\d/.test(v) },
  { id: 'symbol', label: 'A symbol', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH = ['Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];
const STRENGTH_TONE = [
  'bg-danger',
  'bg-danger',
  'bg-warning',
  'bg-warning',
  'bg-success',
  'bg-success',
];

export interface PasswordStrengthProps {
  value: string;
  rules?: PasswordRule[];
  className?: string;
  showRules?: boolean;
}

export function PasswordStrength({
  value,
  rules = DEFAULT_RULES,
  className,
  showRules = true,
}: PasswordStrengthProps) {
  const passed = rules.filter((r) => r.test(value)).length;
  const score = value ? Math.max(1, passed) : 0;
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        {/* biome-ignore lint/a11y/useSemanticElements: segmented strength bar; styled divs, not a native <meter> */}
        <div
          className="flex h-1.5 flex-1 gap-1"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={rules.length}
          aria-valuenow={passed}
          aria-label="Password strength"
        >
          {rules.map((r, i) => (
            <span
              key={r.id}
              className={cn(
                'h-full flex-1 rounded-full bg-line/25',
                i < score && STRENGTH_TONE[score],
              )}
            />
          ))}
        </div>
        {value && (
          <span className="w-12 text-right text-xs font-medium text-ink-2">{STRENGTH[score]}</span>
        )}
      </div>
      {showRules && (
        <ul className="grid gap-1 sm:grid-cols-2">
          {rules.map((r) => {
            const ok = r.test(value);
            return (
              <li
                key={r.id}
                className={cn(
                  'flex items-center gap-1.5 text-xs',
                  ok ? 'text-success' : 'text-ink-3',
                )}
              >
                {ok ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <X className="size-3.5" aria-hidden />
                )}
                {r.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  showStrength?: boolean;
  rules?: PasswordRule[];
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { defaultValue = '', onValueChange, showStrength = true, rules, className, ...rest },
    ref,
  ) {
    const [value, setValue] = useState(defaultValue);
    const [show, setShow] = useState(false);
    const update = (next: string) => {
      setValue(next);
      onValueChange?.(next);
    };
    return (
      <div className={cn('block', className)}>
        <div className={WRAP}>
          <input
            {...rest}
            ref={ref}
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => update(e.target.value)}
            className={cn(FIELD, focusRing())}
          />
          <button
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            tabIndex={-1}
            onClick={() => setShow((v) => !v)}
            className="shrink-0 text-ink-3 transition-colors hover:text-ink"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {showStrength && <PasswordStrength value={value} rules={rules} className="mt-2" />}
      </div>
    );
  },
);
