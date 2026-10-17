/** @jsxImportSource react */

/**
 * Command palette (todo/09 batch 77) — grouped commands behind a ⌘K dialog.
 * Headless UI over the palette baseline store (`useCommandPaletteStore` in
 * `packages/frontend`): quick actions pin first, recent searches show while the
 * query is empty, every group filters live, and the footer spells out the
 * keyboard hints.
 *
 * Markup contract: `mat-*` role classes + theme tokens only — never `--m-*`.
 */

import type { LucideIcon } from 'lucide-react';
import { Search, Trash2 } from 'lucide-react';
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/cn';
import { useClickAway } from '../../lib/hooks';
import { Portal } from '../../lib/Portal';
import { Kbd } from '../surface/Kbd';

export interface CommandItem {
  /** Unique across the whole palette — doubles as the option's DOM id suffix. */
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Trailing secondary text (a path, "Recent search", …). */
  hint?: string;
  /** Shortcut rendered as Kbd chips and exposed via aria-keyshortcuts. */
  shortcut?: string | string[];
  /** Extra match terms for filtering. */
  keywords?: string[];
  disabled?: boolean;
  /** Close the palette after running. Default true. */
  closeOnSelect?: boolean;
  onSelect?: () => void;
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

export interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  /** Controlled query — omit to keep internal state. */
  value?: string;
  onValueChange?: (query: string) => void;
  defaultValue?: string;
  /** Pinned group rendered before recent searches and command groups. */
  quickActions?: CommandItem[];
  groups?: CommandGroup[];
  /** Shown as its own group while the query is empty. */
  recentSearches?: string[];
  onClearRecentSearches?: () => void;
  /** Enter with no active result runs this free-text search. */
  onSubmitQuery?: (query: string) => void;
  /** Extra content at the right of the keyboard-hint footer. */
  footer?: ReactNode;
  emptyText?: string;
  /** Accessible name of the dialog. Default "Command menu". */
  label?: string;
  /** Accessible name of the search field. */
  searchLabel?: string;
  className?: string;
}

type Row =
  | { kind: 'heading'; key: string; text: string }
  | { kind: 'item'; key: string; item: CommandItem; index: number };

const KEY_NAMES: Record<string, string> = {
  '⌘': 'Meta',
  '⌥': 'Alt',
  '⇧': 'Shift',
  '⌃': 'Control',
  '⏎': 'Enter',
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  Esc: 'Escape',
};

function ariaShortcuts(shortcut: string | string[]): string {
  const joined = Array.isArray(shortcut) ? shortcut.join('+') : shortcut;
  return joined
    .split('+')
    .map((key) => (key in KEY_NAMES ? KEY_NAMES[key] : key))
    .join('+');
}

function keyChips(shortcut: string | string[]): string[] {
  return Array.isArray(shortcut) ? shortcut : shortcut.split('+');
}

function matches(item: CommandItem, needle: string): boolean {
  if (needle === '') return true;
  return [item.label, ...(item.keywords ?? [])].join(' ').toLowerCase().includes(needle);
}

/**
 * Modal command palette: quick actions → recent searches → command groups,
 * all filtered by the search field. Escape or an outside click dismiss it.
 */
export function CommandMenu({
  open,
  onOpenChange,
  placeholder = 'Type a command or search…',
  value,
  onValueChange,
  defaultValue = '',
  quickActions,
  groups = [],
  recentSearches,
  onClearRecentSearches,
  onSubmitQuery,
  footer,
  emptyText = 'No results',
  label = 'Command menu',
  searchLabel = 'Search commands',
  className,
}: CommandMenuProps) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const listId = `${reactId}-listbox`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const [active, setActive] = useState(0);
  const query = controlled ? value : internal;

  const setQuery = (next: string) => {
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };

  const submit = useCallback(
    (search: string) => {
      onSubmitQuery?.(search);
      onOpenChange(false);
    },
    [onSubmitQuery, onOpenChange],
  );

  const recentItems = useMemo<CommandItem[]>(() => {
    if (query.trim() !== '' || !recentSearches?.length) return [];
    const items: CommandItem[] = recentSearches.map((search, index) => ({
      id: `recent-${index}`,
      label: search,
      icon: Search,
      hint: 'Recent search',
      onSelect: () => submit(search),
    }));
    if (onClearRecentSearches) {
      items.push({
        id: 'recent-clear',
        label: 'Clear recent searches',
        icon: Trash2,
        closeOnSelect: false,
        onSelect: onClearRecentSearches,
      });
    }
    return items;
  }, [query, recentSearches, onClearRecentSearches, submit]);

  const rows = useMemo<Row[]>(() => {
    const needle = query.trim().toLowerCase();
    const out: Row[] = [];
    let index = 0;
    const push = (heading: string | undefined, source: CommandItem[] | undefined) => {
      const visible = (source ?? []).filter((item) => matches(item, needle));
      if (visible.length === 0) return;
      if (heading) out.push({ kind: 'heading', key: `heading-${index}`, text: heading });
      for (const item of visible) {
        out.push({ kind: 'item', key: item.id, item, index });
        index += 1;
      }
    };
    push('Quick actions', quickActions);
    push('Recent searches', recentItems);
    for (const group of groups) push(group.label, group.items);
    return out;
  }, [query, quickActions, recentItems, groups]);

  const items = useMemo(
    () => rows.flatMap((row) => (row.kind === 'item' ? [row.item] : [])),
    [rows],
  );
  const activeItem = items[active];

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-highlight the first row whenever the query changes
  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActive((index) => (index < items.length ? index : Math.max(0, items.length - 1)));
  }, [items.length]);

  useEffect(() => {
    const item = items[active];
    if (!item) return;
    const el = document.getElementById(`${listId}-${item.id}`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [active, items, listId]);

  // Escape anywhere, or a pointer that lands outside the dialog, dismisses it.
  useClickAway(dialogRef, () => onOpenChange(false), open);

  const pick = (item: CommandItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    if (item.closeOnSelect !== false) onOpenChange(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (items.length === 0 ? 0 : (index + 1) % items.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (items.length === 0 ? 0 : (index - 1 + items.length) % items.length));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[active];
      if (item) {
        pick(item);
        return;
      }
      const search = query.trim();
      if (search !== '' && onSubmitQuery) submit(search);
    }
  };

  const handleInput = (event: FormEvent<HTMLInputElement>) => {
    setQuery((event.target as HTMLInputElement).value);
  };

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-canvas/60 p-4 pt-[12vh] backdrop-blur-[2px]">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={cn('mat-overlay w-full max-w-xl overflow-hidden rounded-card', className)}
        >
          <div className="flex items-center gap-2 border-b border-line/15 px-3">
            <Search aria-hidden="true" className="size-4 shrink-0 text-ink-3" />
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              role="combobox"
              autoComplete="off"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeItem ? `${listId}-${activeItem.id}` : undefined}
              aria-label={searchLabel}
              placeholder={placeholder}
              value={query}
              onChange={handleInput}
              onInput={handleInput}
              onKeyDownCapture={handleKeyDown}
              className="h-12 w-full min-w-0 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
            />
            <Kbd size="sm" className="hidden shrink-0 sm:inline-flex">
              Esc
            </Kbd>
          </div>

          <div id={listId} role="listbox" className="max-h-[50vh] overflow-y-auto p-1.5">
            {rows.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-ink-3">{emptyText}</div>
            ) : (
              rows.map((row) => {
                if (row.kind === 'heading') {
                  return (
                    <div
                      key={row.key}
                      className="px-3 pb-1 pt-2.5 text-[11px] font-medium uppercase tracking-wider text-ink-4"
                    >
                      {row.text}
                    </div>
                  );
                }
                const isActive = row.index === active;
                const Icon = row.item.icon;
                return (
                  <div
                    key={row.key}
                    id={`${listId}-${row.key}`}
                    role="option"
                    tabIndex={-1}
                    aria-selected={isActive}
                    aria-disabled={row.item.disabled || undefined}
                    aria-keyshortcuts={
                      row.item.shortcut ? ariaShortcuts(row.item.shortcut) : undefined
                    }
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => pick(row.item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        pick(row.item);
                      }
                    }}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-chip px-3 py-2 text-sm transition-colors duration-skin ease-skin',
                      row.item.disabled
                        ? 'cursor-not-allowed text-ink-4'
                        : isActive
                          ? 'bg-surface-3 text-ink'
                          : 'text-ink-2 hover:bg-surface-1',
                    )}
                  >
                    {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
                    <span className="flex-1 truncate">{row.item.label}</span>
                    {row.item.hint && (
                      <span className="shrink-0 text-xs text-ink-4">{row.item.hint}</span>
                    )}
                    {row.item.shortcut && (
                      <span className="flex shrink-0 items-center gap-1" aria-hidden="true">
                        {keyChips(row.item.shortcut).map((key, i) => (
                          <Kbd key={`${key}-${i}`} size="sm">
                            {key}
                          </Kbd>
                        ))}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line/15 px-3 py-2 text-xs text-ink-3">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1">
                <Kbd size="sm">↑</Kbd>
                <Kbd size="sm">↓</Kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <Kbd size="sm">↵</Kbd>
                <span>Select</span>
              </span>
              <span className="flex items-center gap-1">
                <Kbd size="sm">Esc</Kbd>
                <span>Close</span>
              </span>
            </span>
            {footer}
          </div>
        </div>
      </div>
    </Portal>
  );
}
