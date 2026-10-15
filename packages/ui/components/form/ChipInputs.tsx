/** @jsxImportSource react */

import { Mail, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Text-editing chip inputs (todo/09 batch 64): tag input, key:value token input
 * and validated email chips. All bind `onChange` + `onInput` (happy-dom only
 * fires `input`) and support Enter / comma to commit + Backspace to pop.
 * `mat-*` + tokens only.
 */

const WRAP =
  'mat-raised flex min-h-11 flex-wrap items-center gap-1.5 rounded-control border border-line/30 px-2.5 py-1.5 transition-all duration-skin ease-skin focus-within:ring-2 focus-within:ring-accent';
const FIELD =
  'min-w-24 flex-1 bg-transparent px-1 py-1 text-sm text-ink placeholder:text-ink-4 focus:outline-none';

const splitParts = (value: string) =>
  value
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

interface ChipWrapProps {
  children: ReactNode;
  onRemove: () => void;
  label: string;
  tone?: 'default' | 'accent';
}

function ChipWrap({ children, onRemove, label, tone = 'default' }: ChipWrapProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full py-0.5 pl-2.5 pr-1 text-xs font-medium',
        tone === 'accent' ? 'bg-accent/15 text-accent' : 'bg-surface-1 text-ink-2',
      )}
    >
      {children}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className={cn(
          'grid size-4 place-items-center rounded-full hover:bg-surface-2',
          focusRing(),
        )}
      >
        <X className="size-3" aria-hidden />
      </button>
    </span>
  );
}

export interface TagInputProps {
  values?: string[];
  onValuesChange?: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  suggestions?: string[];
  className?: string;
}

export function TagInput({
  values = [],
  onValuesChange,
  placeholder = 'Add a tag…',
  label = 'Tags',
  suggestions = [],
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const next = [...values];
    for (const part of splitParts(raw)) if (!next.includes(part)) next.push(part);
    onValuesChange?.(next);
    setDraft('');
  };
  const remove = (tag: string) => onValuesChange?.(values.filter((v) => v !== tag));

  return (
    <div className={cn(WRAP, className)}>
      {values.map((tag) => (
        <ChipWrap key={tag} label={tag} onRemove={() => remove(tag)}>
          {tag}
        </ChipWrap>
      ))}
      <input
        value={draft}
        aria-label={label}
        placeholder={placeholder}
        list={suggestions.length ? `${label}-suggestions` : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onInput={(e) => setDraft((e.currentTarget as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(draft);
          } else if (e.key === 'Backspace' && draft === '' && values.length) {
            remove(values[values.length - 1]);
          }
        }}
        className={FIELD}
      />
      {suggestions.length > 0 && (
        <datalist id={`${label}-suggestions`}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}
    </div>
  );
}

export interface Token {
  key: string;
  value: string;
}

export interface TokenInputProps {
  tokens?: Token[];
  onTokensChange?: (tokens: Token[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

function parseToken(raw: string): Token | null {
  const [key, ...rest] = raw.split(':');
  const value = rest.join(':').trim();
  if (!key?.trim() || !value) return null;
  return { key: key.trim(), value };
}

export function TokenInput({
  tokens = [],
  onTokensChange,
  placeholder = 'key:value…',
  label = 'Tokens',
  className,
}: TokenInputProps) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const next = [...tokens];
    for (const part of splitParts(raw)) {
      const token = parseToken(part);
      if (token && !next.some((t) => t.key === token.key)) next.push(token);
    }
    onTokensChange?.(next);
    setDraft('');
  };
  const remove = (key: string) => onTokensChange?.(tokens.filter((t) => t.key !== key));

  return (
    <div className={cn(WRAP, className)}>
      {tokens.map((token) => (
        <ChipWrap
          key={token.key}
          tone="accent"
          label={token.key}
          onRemove={() => remove(token.key)}
        >
          <span className="opacity-70">{token.key}:</span>
          {token.value}
        </ChipWrap>
      ))}
      <input
        value={draft}
        aria-label={label}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onInput={(e) => setDraft((e.currentTarget as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add(draft);
          } else if (e.key === 'Backspace' && draft === '' && tokens.length) {
            remove(tokens[tokens.length - 1].key);
          }
        }}
        className={FIELD}
      />
    </div>
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EmailChipsInputProps {
  emails?: string[];
  onEmailsChange?: (emails: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function EmailChipsInput({
  emails = [],
  onEmailsChange,
  placeholder = 'name@company.com…',
  label = 'Recipients',
  className,
}: EmailChipsInputProps) {
  const [draft, setDraft] = useState('');
  const [invalid, setInvalid] = useState(false);

  const add = (raw: string) => {
    const parts = splitParts(raw);
    if (parts.length === 0) return;
    const good = parts.filter((p) => EMAIL_RE.test(p));
    const bad = parts.length - good.length;
    const next = [...emails];
    for (const email of good) if (!next.includes(email)) next.push(email);
    onEmailsChange?.(next);
    setDraft('');
    setInvalid(bad > 0);
  };
  const remove = (email: string) => onEmailsChange?.(emails.filter((e) => e !== email));

  return (
    <div className={cn(WRAP, invalid && 'ring-2 ring-danger', className)}>
      {emails.map((email) => (
        <ChipWrap key={email} label={email} onRemove={() => remove(email)}>
          <Mail className="size-3" aria-hidden />
          {email}
        </ChipWrap>
      ))}
      <input
        type="email"
        value={draft}
        aria-label={label}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onInput={(e) => setDraft((e.currentTarget as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(draft);
          } else if (e.key === 'Backspace' && draft === '' && emails.length) {
            remove(emails[emails.length - 1]);
          }
        }}
        onBlur={() => add(draft)}
        className={FIELD}
      />
      {invalid && (
        <span className="w-full px-1 text-xs text-danger">Some addresses were invalid.</span>
      )}
    </div>
  );
}
