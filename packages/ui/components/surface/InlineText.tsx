/** @jsxImportSource react */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/* ── Mention / Hashtag ─────────────────────────────────────────────────── */

export interface MentionProps extends HTMLAttributes<HTMLElement> {
  /** The handle without the leading `@` (rendered with it). */
  children?: ReactNode;
  /** Optional link target; renders an `<a>` when present. */
  href?: string;
}

/** Inline `@mention` — accent text, link when `href` is given. */
export function Mention({ href, className, ...rest }: MentionProps) {
  const cls = cn('font-medium text-accent', className);
  if (href) {
    return (
      <a href={href} className={cn(cls, 'hover:underline')} {...rest}>
        @{rest.children}
      </a>
    );
  }
  return (
    <span className={cls} {...rest}>
      @{rest.children}
    </span>
  );
}

export interface HashtagProps extends HTMLAttributes<HTMLElement> {
  /** The tag without the leading `#` (rendered with it). */
  children?: ReactNode;
  /** Optional link target; renders an `<a>` when present. */
  href?: string;
}

/** Inline `#hashtag` — accent text, link when `href` is given. */
export function Hashtag({ href, className, ...rest }: HashtagProps) {
  const cls = cn('font-medium text-accent', className);
  if (href) {
    return (
      <a href={href} className={cn(cls, 'hover:underline')} {...rest}>
        #{rest.children}
      </a>
    );
  }
  return (
    <span className={cls} {...rest}>
      #{rest.children}
    </span>
  );
}

/* ── Emoji ─────────────────────────────────────────────────────────────── */

export interface EmojiProps extends HTMLAttributes<HTMLSpanElement> {
  /** One or more emoji characters. */
  children?: ReactNode;
  /** Accessible name; when omitted the emoji is decorative (`aria-hidden`). */
  label?: string;
}

/** Emoji wrapper — keeps emoji on the text baseline and controls a11y. */
export function Emoji({ label, className, ...rest }: EmojiProps) {
  return (
    <span
      className={cn('inline-block leading-none', className)}
      {...(label
        ? { role: 'img' as const, 'aria-label': label }
        : { 'aria-hidden': true as const })}
      {...rest}
    />
  );
}

/* ── Text diff ─────────────────────────────────────────────────────────── */

export interface TextDiffProps {
  /** Original text. */
  before: string;
  /** Revised text. */
  after: string;
  /** Split unit for the diff; `word` (default) or `char`. */
  by?: 'word' | 'char';
  className?: string;
}

type DiffPart = { kind: 'same' | 'del' | 'ins'; text: string };

function tokenize(text: string, by: 'word' | 'char'): string[] {
  if (by === 'char') return Array.from(text);
  // keep trailing whitespace with each word so re-joining is lossless
  return text.match(/\S+\s*|\s+/g) ?? [];
}

/** Classic LCS diff over tokens; O(n·m) — fine for short UI strings. */
function diffTokens(a: string[], b: string[]): DiffPart[] {
  const n = a.length;
  const m = b.length;
  const table: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const parts: DiffPart[] = [];
  const push = (kind: DiffPart['kind'], text: string) => {
    const last = parts[parts.length - 1];
    if (last && last.kind === kind) last.text += text;
    else parts.push({ kind, text });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push('same', a[i]);
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      push('del', a[i]);
      i++;
    } else {
      push('ins', b[j]);
      j++;
    }
  }
  while (i < n) push('del', a[i++]);
  while (j < m) push('ins', b[j++]);
  return parts;
}

/**
 * Word- (or char-) level diff between two strings. Removals render in `<del>`
 * (danger tokens, struck), additions in `<ins>` (success tokens, underlined).
 */
export function TextDiff({ before, after, by = 'word', className }: TextDiffProps) {
  const parts = diffTokens(tokenize(before, by), tokenize(after, by));
  return (
    <span className={cn('text-sm text-ink-2', className)}>
      {parts.map((part, i) => {
        if (part.kind === 'del') {
          return (
            <del key={i} className="bg-danger/12 text-danger line-through decoration-danger/60">
              {part.text}
            </del>
          );
        }
        if (part.kind === 'ins') {
          return (
            <ins key={i} className="bg-success/12 text-success no-underline">
              {part.text}
            </ins>
          );
        }
        return <span key={i}>{part.text}</span>;
      })}
    </span>
  );
}
