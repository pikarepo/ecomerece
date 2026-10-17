/** @jsxImportSource react */

/**
 * Site-search overlay (todo/09 batch 79 §E, item 1). A top-anchored
 * `role="dialog"` panel — mirrored on `Modal` (`Portal` + `useOverlay` for body
 * scroll lock, focus trap and Escape) with `CommandMenu`'s listbox/keyboard
 * model — hosting a big search input, a voice button and grouped suggestions.
 *
 * Content is props-driven (trending sections while empty, filtered sections
 * once typing); keyboard: ↑/↓ cycle the active row (wrapping), ↵ runs it or
 * submits the trimmed query through `onSubmit`, Escape and the scrim close.
 *
 * Theme tokens only, `mat-overlay` surface, no `--m-*` in markup.
 */

import type { LucideIcon } from 'lucide-react';
import { Search, X } from 'lucide-react';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Portal } from '../../lib/Portal';
import { useOverlay } from '../../lib/useOverlay';
import { Kbd } from '../surface/Kbd';
import { VoiceSearchButton } from './VoiceSearch';

export interface SiteSearchItem {
  id: string;
  label: string;
  /** Secondary text on the trailing edge — a path, category or count. */
  hint?: string;
  icon?: LucideIcon;
  /** Extra search terms matched in addition to `label`. */
  keywords?: string[];
  disabled?: boolean;
  onSelect?: () => void;
}

export interface SiteSearchSection {
  id: string;
  label: string;
  items: SiteSearchItem[];
}

export interface SiteSearchProps {
  open: boolean;
  onClose: () => void;
  placeholder?: string;
  /** Controlled query. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Initial query when uncontrolled. */
  defaultValue?: string;
  /** Sections shown while the query is empty (trending, popular, recent). Falls back to `sections` when empty. */
  trending?: SiteSearchSection[];
  /** Sections filtered by the query. */
  sections?: SiteSearchSection[];
  /** Submitted for the trimmed query when ↵ is pressed with no active row. */
  onSubmit?: (query: string) => void;
  /** Show the voice input button. Default true. */
  voice?: boolean;
  /** BCP-47 language tag for voice recognition. */
  voiceLang?: string;
  /** Submit automatically when a final voice transcript arrives. Default false. */
  submitOnVoice?: boolean;
  /** Accessible dialog label. Default "Site search". */
  label?: string;
  /** Accessible label for the field. Default "Search sites". */
  searchLabel?: string;
  /** Accessible label for the close button. Default "Close search". */
  closeLabel?: string;
  /** Shown when the query matches nothing. Default "No results". */
  emptyText?: string;
  footer?: ReactNode;
  className?: string;
}

/** Case-insensitive match over `label` + `keywords`. */
function matchesQuery(item: SiteSearchItem, query: string): boolean {
  if (!query) return true;
  if (item.label.toLowerCase().includes(query)) return true;
  return (item.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(query));
}

/** Top-anchored search overlay with grouped, keyboard-navigable suggestions. */
export function SiteSearch({
  open,
  onClose,
  placeholder = 'Search products, orders, help…',
  value,
  onValueChange,
  defaultValue = '',
  trending = [],
  sections = [],
  onSubmit,
  voice = true,
  voiceLang,
  submitOnVoice = false,
  label = 'Site search',
  searchLabel = 'Search sites',
  closeLabel = 'Close search',
  emptyText = 'No results',
  footer,
  className,
}: SiteSearchProps) {
  const { containerRef } = useOverlay({ open, onClose });
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [active, setActive] = useState(0);

  const controlled = value !== undefined;
  const query = controlled ? value : internal;
  const setQuery = (next: string) => {
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-highlight the first row whenever the query changes
  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const input = inputRef.current;
    input?.focus();
    input?.select();
  }, [open]);

  const trimmed = query.trim().toLowerCase();
  const isIdle = trimmed.length === 0;
  // Idle → trending sections (fall back to the full list when none are given).
  const source = isIdle && trending.length > 0 ? trending : sections;

  let cursor = 0;
  const groups = source
    .map((section) => ({
      id: section.id,
      label: section.label,
      rows: section.items
        .filter((item) => isIdle || matchesQuery(item, trimmed))
        .map((item) => ({ item, index: cursor++ })),
    }))
    .filter((group) => group.rows.length > 0);
  const flat = groups.flatMap((group) => group.rows.map((row) => row.item));
  const activeId = flat.length > 0 ? `${listId}-${active}` : undefined;

  /** Handle ↑/↓/↵ on capture phase (React drops bubble keydown on inputs under happy-dom). */
  const onKeyDownCapture = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (flat.length === 0) return;
      event.preventDefault();
      setActive((index) =>
        event.key === 'ArrowDown'
          ? (index + 1) % flat.length
          : (index - 1 + flat.length) % flat.length,
      );
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const item = flat[active];
    if (item) {
      item.onSelect?.();
      onClose();
    } else if (query.trim()) {
      onSubmit?.(query.trim());
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Portal>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative backdrop; Escape handled by useOverlay */}
      <div
        role="presentation"
        onClick={onClose}
        className="fixed inset-0 z-modal bg-canvas/60 backdrop-blur-[2px]"
      />
      <div className="pointer-events-none fixed inset-0 z-modal flex items-start justify-center p-4 pt-[12vh]">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={cn(
            'mat-overlay pointer-events-auto w-full max-w-2xl overflow-hidden rounded-card',
            className,
          )}
        >
          <div className="flex items-center gap-3 border-b border-line/10 px-4 py-3">
            <Search className="size-5 shrink-0 text-ink-3" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeId}
              aria-label={searchLabel}
              placeholder={placeholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
              onKeyDownCapture={onKeyDownCapture}
              className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-4"
            />
            {voice && (
              <VoiceSearchButton
                lang={voiceLang}
                onResult={(text, isFinal) => {
                  setQuery(text);
                  if (isFinal && submitOnVoice && text) {
                    onSubmit?.(text);
                    onClose();
                  }
                }}
              />
            )}
            <button
              type="button"
              aria-label={closeLabel}
              title={closeLabel}
              onClick={onClose}
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-skin ease-skin hover:text-ink',
                focusRing(),
              )}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div id={listId} role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
            {groups.map((group) => (
              <div key={group.id}>
                <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-ink-4">
                  {group.label}
                </div>
                {group.rows.map(({ item, index }) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      id={`${listId}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      disabled={item.disabled}
                      onMouseEnter={() => setActive(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        item.onSelect?.();
                        onClose();
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm transition-all duration-skin ease-skin',
                        index === active ? 'bg-surface-3' : 'hover:bg-surface-3/60',
                        'disabled:pointer-events-none disabled:text-ink-4',
                        focusRing(),
                      )}
                    >
                      {Icon && <Icon className="size-4 shrink-0 text-ink-3" aria-hidden="true" />}
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.hint && (
                        <span className="shrink-0 text-xs text-ink-4">{item.hint}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {flat.length === 0 && (
              <p className="px-3 py-10 text-center text-sm text-ink-4">{emptyText}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line/10 px-4 py-2.5 text-xs text-ink-4">
            <span className="flex items-center gap-1">
              <Kbd size="sm">↑</Kbd>
              <Kbd size="sm">↓</Kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd size="sm">↵</Kbd>
              Search
            </span>
            <span className="flex items-center gap-1">
              <Kbd size="sm">Esc</Kbd>
              Close
            </span>
            {footer && <span className="ml-auto">{footer}</span>}
          </div>
        </div>
      </div>
    </Portal>
  );
}
