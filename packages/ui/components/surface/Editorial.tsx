/** @jsxImportSource react */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Heading } from './Primitives';

/* ── DropCap ───────────────────────────────────────────────────────────── */

export type DropCapSize = 'sm' | 'md' | 'lg';

const DROP_CAP: Record<DropCapSize, string> = {
  sm: 'first-letter:float-left first-letter:mr-2 first-letter:text-3xl first-letter:font-bold first-letter:leading-none',
  md: 'first-letter:float-left first-letter:mr-2 first-letter:text-4xl first-letter:font-bold first-letter:leading-none',
  lg: 'first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-bold first-letter:leading-none',
};

export interface DropCapProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
  size?: DropCapSize;
}

/** Paragraph whose first letter is enlarged into a drop cap. */
export function DropCap({ size = 'md', className, ...rest }: DropCapProps) {
  return <p className={cn('text-base leading-relaxed', DROP_CAP[size], className)} {...rest} />;
}

/* ── PullQuote ─────────────────────────────────────────────────────────── */

export interface PullQuoteProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Attribution shown beneath the quote. */
  cite?: ReactNode;
  align?: 'left' | 'center';
}

/** Editorial pull quote with an optional attribution line. */
export function PullQuote({ children, cite, align = 'left', className, ...rest }: PullQuoteProps) {
  return (
    <figure
      className={cn(
        'my-6',
        align === 'center' ? 'text-center' : 'border-l-2 border-accent pl-4',
        className,
      )}
      {...rest}
    >
      <blockquote className="text-xl font-medium italic text-ink">{children}</blockquote>
      {cite && <figcaption className="mt-2 text-sm text-ink-3">— {cite}</figcaption>}
    </figure>
  );
}

/* ── Footnotes / endnotes ──────────────────────────────────────────────── */

export interface FootnoteRefProps {
  /** Shared id between the ref and the note. */
  id: string;
  /** Visible marker (usually the note number). */
  index: number | string;
  className?: string;
}

/** Superscript reference linking to a footnote/endnote. */
export function FootnoteRef({ id, index, className }: FootnoteRefProps) {
  return (
    <sup id={`fnref-${id}`} className={cn('text-xs', className)}>
      <a
        href={`#fn-${id}`}
        className={cn('text-accent underline-offset-2 hover:underline', focusRing())}
      >
        [{index}]
      </a>
    </sup>
  );
}

export interface FootnoteProps {
  /** Shared id between the ref and this note. */
  id: string;
  index: number | string;
  children?: ReactNode;
  className?: string;
}

/** One footnote/endnote entry, with a back-reference to its marker. */
export function Footnote({ id, index, children, className }: FootnoteProps) {
  return (
    <li id={`fn-${id}`} className={cn('flex gap-2 text-sm text-ink-2', className)}>
      <a href={`#fnref-${id}`} className={cn('text-accent', focusRing())}>
        {index}.
      </a>
      <span>{children}</span>
    </li>
  );
}

export interface FootnoteListProps extends HTMLAttributes<HTMLOListElement> {
  children?: ReactNode;
  heading?: ReactNode;
}

/** Ordered list that groups footnotes/endnotes at the end of a document. */
export function FootnoteList({ children, heading, className, ...rest }: FootnoteListProps) {
  return (
    <section className={cn('mt-8 border-t border-line/10 pt-4', className)}>
      {heading && (
        <Heading level={4} tone="ink-3">
          {heading}
        </Heading>
      )}
      <ol className={cn('mt-2 flex flex-col gap-1', className)} {...rest}>
        {children}
      </ol>
    </section>
  );
}

/* ── Citation ──────────────────────────────────────────────────────────── */

export interface CitationProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Link to the source. */
  href?: string;
  /** Author/source shown before the title. */
  author?: ReactNode;
  /** Publication year. */
  year?: string | number;
}

/** Inline citation — optionally linked, with author and year. */
export function Citation({ children, href, author, year, className, ...rest }: CitationProps) {
  const content = (
    <>
      {author && <span>{author}</span>}
      {author && (children || year) ? ', ' : ''}
      {children}
      {year && <span className="text-ink-3"> ({year})</span>}
    </>
  );
  return (
    <cite className={cn('not-italic text-sm text-ink-2', className)} {...rest}>
      {href ? (
        <a
          href={href}
          className={cn('text-accent underline-offset-2 hover:underline', focusRing())}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </cite>
  );
}
