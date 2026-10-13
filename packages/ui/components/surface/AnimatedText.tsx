/** @jsxImportSource react */
import { type HTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import { cn } from '../../lib/cn';

/* ── Typewriter ────────────────────────────────────────────────────────── */

export interface TypewriterProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  /** Milliseconds per character (default 40). */
  speed?: number;
  /** Delay before typing starts (default 0). */
  startDelay?: number;
  /** Show a blinking caret (default true). */
  cursor?: boolean;
  /** Controlled character count. When omitted, animates on mount. */
  visibleChars?: number;
  onDone?: () => void;
}

/** Types `text` one character at a time, with an optional caret. */
export function Typewriter({
  text,
  speed = 40,
  startDelay = 0,
  cursor = true,
  visibleChars,
  onDone,
  className,
  ...rest
}: TypewriterProps) {
  const [count, setCount] = useState(visibleChars ?? 0);

  useEffect(() => {
    if (visibleChars !== undefined) {
      setCount(visibleChars);
      return;
    }
    let interval: ReturnType<typeof setInterval> | undefined;
    let i = 0;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) {
          if (interval) clearInterval(interval);
          onDone?.();
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, startDelay, visibleChars, onDone]);

  const shown = text.slice(0, visibleChars ?? count);
  return (
    <span
      data-done={shown.length >= text.length ? 'true' : 'false'}
      className={cn(className)}
      {...rest}
    >
      {shown}
      {cursor && (
        <span aria-hidden="true" className="ml-0.5 inline-block animate-pulse">
          |
        </span>
      )}
    </span>
  );
}

/* ── FadeInText ────────────────────────────────────────────────────────── */

export interface FadeInTextProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  /** Controlled visibility. When omitted, fades in on mount. */
  show?: boolean;
}

/** Fades its content in on mount (or when `show` flips true). */
export function FadeInText({ children, show, className, ...rest }: FadeInTextProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (show === undefined) setMounted(true);
  }, [show]);

  const visible = show ?? mounted;
  return (
    <span
      data-visible={visible ? 'true' : 'false'}
      className={cn(
        'inline-block transition-opacity duration-skin ease-skin',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

/* ── WordRotator ───────────────────────────────────────────────────────── */

export interface WordRotatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  words: string[];
  /** Rotation interval in ms (default 2200). */
  interval?: number;
  /** Controlled active index. When omitted, rotates automatically. */
  index?: number;
}

/** Cycles through `words`, swapping one for the next on an interval. */
export function WordRotator({
  words,
  interval = 2200,
  index,
  className,
  ...rest
}: WordRotatorProps) {
  const [internal, setInternal] = useState(0);

  useEffect(() => {
    if (index !== undefined || words.length === 0) return;
    const timer = setInterval(() => setInternal((v) => (v + 1) % words.length), interval);
    return () => clearInterval(timer);
  }, [words.length, interval, index]);

  const active = (index ?? internal) % Math.max(1, words.length);
  return (
    <span data-index={active} className={cn('inline-block', className)} {...rest}>
      {words[active] ?? ''}
    </span>
  );
}

/* ── ScrambleText ──────────────────────────────────────────────────────── */

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';

export interface ScrambleTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  /** Controlled revealed state. When omitted, de-scrambles on mount. */
  revealed?: boolean;
  /** Milliseconds per character while de-scrambling (default 50). */
  speed?: number;
}

/** Reveals `text` by de-scrambling characters left to right. */
export function ScrambleText({
  text,
  revealed,
  speed = 50,
  className,
  ...rest
}: ScrambleTextProps) {
  const mask = (src: string, keep: number) =>
    src
      .split('')
      .map((ch, i) => (ch === ' ' || i < keep ? ch : SCRAMBLE[i % SCRAMBLE.length]))
      .join('');

  const [keep, setKeep] = useState(revealed ? text.length : 0);

  useEffect(() => {
    if (revealed !== undefined) {
      setKeep(revealed ? text.length : 0);
      return;
    }
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setKeep(i);
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, revealed]);

  const display = revealed === undefined ? mask(text, keep) : revealed ? text : mask(text, 0);
  return (
    <span data-revealed={display === text ? 'true' : 'false'} className={cn(className)} {...rest}>
      {display}
    </span>
  );
}

/* ── SplitText ─────────────────────────────────────────────────────────── */

export interface SplitTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  /** Split granularity (default `char`). */
  by?: 'char' | 'word';
  /** Reveal the pieces (default true). */
  show?: boolean;
  /** Per-piece transition delay in ms (default 40). */
  stagger?: number;
}

/** Splits `text` into staggered spans for reveal/choreography animations. */
export function SplitText({
  text,
  by = 'char',
  show = true,
  stagger = 40,
  className,
  ...rest
}: SplitTextProps) {
  const parts = by === 'word' ? text.split(' ') : Array.from(text);
  return (
    <span data-show={show ? 'true' : 'false'} className={cn('inline-block', className)} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-block">
        {parts.map((part, i) => (
          <span
            key={`${i}-${part}`}
            className={cn(
              'inline-block transition-all duration-skin ease-skin',
              show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
            )}
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            {part === ' ' ? '\u00A0' : part}
            {by === 'word' && i < parts.length - 1 ? '\u00A0' : ''}
          </span>
        ))}
      </span>
    </span>
  );
}
