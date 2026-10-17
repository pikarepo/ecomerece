/** @jsxImportSource react */

import type { LucideIcon } from 'lucide-react';
import {
  Check,
  ChevronRight,
  GripVertical,
  Mail,
  MessageCircle,
  Music,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Avatar } from '../surface/Avatar';
import { Badge } from '../surface/Badge';

/* ── Chat ─────────────────────────────────────────────────────────────── */

export interface ChatMessage {
  id: string;
  name: string;
  message: string;
  time?: string;
  unread?: number;
  avatar?: string;
  active?: boolean;
}

export interface ChatListProps {
  messages: ChatMessage[];
  onSelect?: (id: string) => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — chat conversation rows with unread counts. */
export function ChatList({ messages, onSelect, className }: ChatListProps) {
  return (
    <ul className={cn('mat-card divide-y divide-line/10 overflow-hidden rounded-card', className)}>
      {messages.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            onClick={() => onSelect?.(m.id)}
            aria-label={`Open chat with ${m.name}`}
            className={cn(
              'flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors',
              m.active ? 'bg-surface-3' : 'hover:bg-surface-3/60',
              focusRing(),
            )}
          >
            <Avatar src={m.avatar} name={m.name} size="md" />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink">{m.name}</span>
                {m.time && <span className="shrink-0 text-xs text-ink-3">{m.time}</span>}
              </span>
              <span className="truncate text-xs text-ink-3">{m.message}</span>
            </span>
            {Boolean(m.unread) && (
              <span className="ml-auto shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-ink">
                {m.unread}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ── Contact ──────────────────────────────────────────────────────────── */

export interface ContactItem {
  id: string;
  name: string;
  subtitle?: string;
  email?: string;
  avatar?: string;
}

export interface ContactListProps {
  contacts: ContactItem[];
  onSelect?: (id: string) => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — contact rows with mail action. */
export function ContactList({ contacts, onSelect, className }: ContactListProps) {
  return (
    <ul className={cn('mat-card divide-y divide-line/10 overflow-hidden rounded-card', className)}>
      {contacts.map((c) => (
        <li key={c.id} className="flex min-h-11 items-center gap-3 px-4 py-3">
          <Avatar src={c.avatar} name={c.name} size="md" />
          <span className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onSelect?.(c.id)}
              className={cn('truncate text-sm font-medium text-ink', focusRing())}
            >
              {c.name}
            </button>
            {c.subtitle && <span className="block truncate text-xs text-ink-3">{c.subtitle}</span>}
          </span>
          {c.email && (
            <a
              href={`mailto:${c.email}`}
              aria-label={`Email ${c.name}`}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-chip text-ink-3 hover:bg-surface-3 hover:text-ink',
                focusRing(),
              )}
            >
              <Mail className="size-4" aria-hidden="true" />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ── Notification ─────────────────────────────────────────────────────── */

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  unread?: boolean;
  icon?: LucideIcon;
}

export interface NotificationListProps {
  items: NotificationItem[];
  onSelect?: (id: string) => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — notification rows with unread state. */
export function NotificationList({ items, onSelect, className }: NotificationListProps) {
  return (
    <ul className={cn('mat-card divide-y divide-line/10 overflow-hidden rounded-card', className)}>
      {items.map((n) => {
        const Icon = n.icon ?? MessageCircle;
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onSelect?.(n.id)}
              aria-label={n.title}
              className={cn(
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                n.unread && 'bg-accent/6',
                'hover:bg-surface-3/60',
                focusRing(),
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-ink">{n.title}</span>
                  {n.time && <span className="shrink-0 text-xs text-ink-3">{n.time}</span>}
                </span>
                {n.description && (
                  <span className="block truncate text-xs text-ink-3">{n.description}</span>
                )}
              </span>
              {n.unread && (
                <span
                  role="img"
                  aria-label="unread"
                  className="mt-1 size-2 shrink-0 rounded-full bg-accent"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Checklist ────────────────────────────────────────────────────────── */

export interface ChecklistItem {
  id: string;
  label: string;
  done?: boolean;
}

export interface ChecklistListProps {
  items: ChecklistItem[];
  onToggle?: (id: string) => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — checklist with real checkboxes. */
export function ChecklistList({ items, onToggle, className }: ChecklistListProps) {
  return (
    <ul className={cn('mat-card divide-y divide-line/10 overflow-hidden rounded-card', className)}>
      {items.map((item) => (
        <li key={item.id}>
          <label
            className={cn(
              'flex min-h-11 cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-3/60',
            )}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={item.done}
              onChange={() => onToggle?.(item.id)}
            />
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex size-5 shrink-0 items-center justify-center rounded-chip border transition-colors',
                item.done ? 'border-success bg-success text-accent-ink' : 'border-line/40',
              )}
            >
              {item.done && <Check className="size-3.5" />}
            </span>
            <span className={cn('text-sm text-ink', item.done && 'text-ink-3 line-through')}>
              {item.label}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/* ── Todo ─────────────────────────────────────────────────────────────── */

export type TodoPriority = 'low' | 'medium' | 'high';

const TODO_TONE: Record<TodoPriority, 'neutral' | 'info' | 'warning'> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
};

export interface TodoItem {
  id: string;
  label: string;
  done?: boolean;
  priority?: TodoPriority;
  due?: string;
}

export interface TodoListProps {
  items: TodoItem[];
  onToggle?: (id: string) => void;
  onAdd?: () => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — todo rows with priority & due. */
export function TodoList({ items, onToggle, onAdd, className }: TodoListProps) {
  return (
    <div className={cn('mat-card overflow-hidden rounded-card', className)}>
      <ul className="divide-y divide-line/10">
        {items.map((item) => (
          <li key={item.id} className="flex min-h-11 items-center gap-3 px-4 py-3">
            {onToggle && (
              <button
                type="button"
                aria-pressed={item.done}
                aria-label={item.done ? `Mark ${item.label} incomplete` : `Mark ${item.label} done`}
                onClick={() => onToggle(item.id)}
                className={cn(
                  'inline-flex size-5 shrink-0 items-center justify-center rounded-chip border transition-colors',
                  item.done
                    ? 'border-success bg-success text-accent-ink'
                    : 'border-line/40 text-transparent hover:border-accent',
                  focusRing(),
                )}
              >
                <Check className="size-3.5" aria-hidden="true" />
              </button>
            )}
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm text-ink',
                item.done && 'text-ink-3 line-through',
              )}
            >
              {item.label}
            </span>
            {item.priority && <Badge tone={TODO_TONE[item.priority]}>{item.priority}</Badge>}
            {item.due && <span className="shrink-0 text-xs text-ink-3">{item.due}</span>}
          </li>
        ))}
      </ul>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            'flex w-full items-center gap-2 border-t border-line/10 px-4 py-3 text-sm font-medium text-accent hover:bg-surface-3/60',
            focusRing(),
          )}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add task
        </button>
      )}
    </div>
  );
}

/* ── Playlist / queue ─────────────────────────────────────────────────── */

export interface PlaylistTrack {
  id: string;
  title: string;
  artist?: string;
  duration?: string;
  playing?: boolean;
}

export interface PlaylistListProps {
  tracks: PlaylistTrack[];
  onSelect?: (id: string) => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — playlist/queue with now-playing state. */
export function PlaylistList({ tracks, onSelect, className }: PlaylistListProps) {
  return (
    <ul className={cn('mat-card divide-y divide-line/10 overflow-hidden rounded-card', className)}>
      {tracks.map((t, i) => (
        <li key={t.id}>
          <button
            type="button"
            onClick={() => onSelect?.(t.id)}
            aria-label={`Play ${t.title}`}
            className={cn(
              'flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-3/60',
              focusRing(),
            )}
          >
            {t.playing ? (
              <Music className="size-4 shrink-0 text-accent" aria-hidden="true" />
            ) : (
              <span className="w-4 shrink-0 text-right text-xs text-ink-3">{i + 1}</span>
            )}
            <span className="min-w-0 flex-1">
              <span className={cn('block truncate text-sm text-ink', t.playing && 'font-medium')}>
                {t.title}
              </span>
              {t.artist && <span className="block truncate text-xs text-ink-3">{t.artist}</span>}
            </span>
            {t.duration && <span className="shrink-0 text-xs text-ink-3">{t.duration}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ── Search results ───────────────────────────────────────────────────── */

export interface SearchResultItem {
  id: string;
  title: string;
  snippet?: string;
  url?: string;
  type?: string;
}

export interface SearchResultsProps {
  items: SearchResultItem[];
  query?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark className="bg-accent/20 text-ink">{match}</mark>
      {after}
    </>
  );
}

/** List variant (todo/09 §F batch 87) — search results with highlighted query. */
export function SearchResults({ items, query, onSelect, className }: SearchResultsProps) {
  return (
    <ul className={cn('mat-card divide-y divide-line/10 overflow-hidden rounded-card', className)}>
      {items.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onSelect?.(r.id)}
            aria-label={r.title}
            className={cn(
              'block w-full px-4 py-3 text-left transition-colors hover:bg-surface-3/60',
              focusRing(),
            )}
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5 shrink-0 text-ink-4" aria-hidden="true" />
              <span className="truncate text-sm font-medium text-ink">
                <Highlight text={r.title} query={query} />
              </span>
              {r.type && <Badge>{r.type}</Badge>}
            </span>
            {r.snippet && (
              <span className="mt-0.5 block truncate text-xs text-ink-3">
                <Highlight text={r.snippet} query={query} />
              </span>
            )}
            {r.url && <span className="mt-0.5 block truncate text-xs text-accent">{r.url}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ── Sticky-header grouped ────────────────────────────────────────────── */

export interface StickyGroup {
  label: string;
  items: ReactNode[];
}

export interface StickyHeaderListProps {
  groups: StickyGroup[];
  className?: string;
}

/** List variant (todo/09 §F batch 87) — grouped list with sticky headers. */
export function StickyHeaderList({ groups, className }: StickyHeaderListProps) {
  return (
    <div className={cn('mat-card max-h-72 overflow-y-auto rounded-card', className)}>
      {groups.map((g) => (
        <section key={g.label}>
          <h4 className="sticky top-0 z-10 bg-surface-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-3">
            {g.label}
          </h4>
          <ul className="divide-y divide-line/10">{g.items}</ul>
        </section>
      ))}
    </div>
  );
}

/* ── Alphabet index ───────────────────────────────────────────────────── */

export interface AlphabetItem {
  id: string;
  name: string;
}

export interface AlphabetIndexListProps {
  items: AlphabetItem[];
  onSelect?: (id: string) => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — A–Z index grouped by first letter. */
export function AlphabetIndexList({ items, onSelect, className }: AlphabetIndexListProps) {
  const groups = items.reduce<Record<string, AlphabetItem[]>>((acc, item) => {
    const letter = item.name.trim().charAt(0).toUpperCase() || '#';
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(item);
    return acc;
  }, {});
  const letters = Object.keys(groups).sort();
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="mat-card min-w-0 flex-1 overflow-hidden rounded-card">
        {letters.map((letter) => (
          <section key={letter}>
            <h4
              id={`letter-${letter}`}
              className="bg-surface-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-3"
            >
              {letter}
            </h4>
            <ul className="divide-y divide-line/10">
              {groups[letter].map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(item.id)}
                    className={cn(
                      'block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-surface-3/60',
                      focusRing(),
                    )}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <nav aria-label="Jump to letter" className="flex flex-col gap-0.5 py-1">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className={cn(
              'px-1 text-[10px] font-semibold text-ink-3 hover:text-accent',
              focusRing(),
            )}
          >
            {letter}
          </a>
        ))}
      </nav>
    </div>
  );
}

/* ── Swipe ────────────────────────────────────────────────────────────── */

export interface SwipeItem {
  id: string;
  title: string;
  description?: string;
}

export interface SwipeListProps {
  items: SwipeItem[];
  completeLabel?: string;
  deleteLabel?: string;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — swipe-left to reveal actions. */
export function SwipeList({
  items,
  completeLabel = 'Complete',
  deleteLabel = 'Delete',
  onComplete,
  onDelete,
  className,
}: SwipeListProps) {
  return (
    <ul className={cn('mat-card divide-y divide-line/10 overflow-hidden rounded-card', className)}>
      {items.map((item) => (
        <li key={item.id} className="relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 flex w-32 items-stretch">
            <button
              type="button"
              aria-label={`${completeLabel} ${item.title}`}
              onClick={() => onComplete?.(item.id)}
              className="flex flex-1 items-center justify-center bg-success text-xs font-medium text-accent-ink"
            >
              <Check className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={`${deleteLabel} ${item.title}`}
              onClick={() => onDelete?.(item.id)}
              className="flex flex-1 items-center justify-center bg-danger text-xs font-medium text-accent-ink"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex min-h-11 items-center gap-3 bg-canvas px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ink">{item.title}</span>
              {item.description && (
                <span className="block truncate text-xs text-ink-3">{item.description}</span>
              )}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ── Reorderable ──────────────────────────────────────────────────────── */

export interface ReorderableItem {
  id: string;
  label: string;
  description?: string;
}

export interface ReorderableListProps {
  items: ReorderableItem[];
  onReorder?: (next: ReorderableItem[]) => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — reorderable list with keyboard buttons. */
export function ReorderableList({ items, onReorder, className }: ReorderableListProps) {
  const [order, setOrder] = useState<ReorderableItem[]>(items);
  const move = (index: number, delta: number) => {
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    onReorder?.(next);
  };
  return (
    <ul className={cn('mat-card divide-y divide-line/10 overflow-hidden rounded-card', className)}>
      {order.map((item, index) => (
        <li key={item.id} className="flex min-h-11 items-center gap-2 px-4 py-3">
          <GripVertical className="size-4 shrink-0 text-ink-4" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-ink">{item.label}</span>
            {item.description && (
              <span className="block truncate text-xs text-ink-3">{item.description}</span>
            )}
          </span>
          <button
            type="button"
            aria-label={`Move ${item.label} up`}
            disabled={index === 0}
            onClick={() => move(index, -1)}
            className={cn(
              'inline-flex size-7 items-center justify-center rounded-chip text-ink-3 hover:bg-surface-3 hover:text-ink disabled:opacity-40',
              focusRing(),
            )}
          >
            <ChevronRight className="size-4 rotate-[-90deg]" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Move ${item.label} down`}
            disabled={index === order.length - 1}
            onClick={() => move(index, 1)}
            className={cn(
              'inline-flex size-7 items-center justify-center rounded-chip text-ink-3 hover:bg-surface-3 hover:text-ink disabled:opacity-40',
              focusRing(),
            )}
          >
            <ChevronRight className="size-4 rotate-90" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ── Infinite ─────────────────────────────────────────────────────────── */

export interface InfiniteListProps {
  items: ReactNode[];
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

/** List variant (todo/09 §F batch 87) — list with a load-more sentinel. */
export function InfiniteList({
  items,
  hasMore,
  loading,
  onLoadMore,
  className,
}: InfiniteListProps) {
  return (
    <div className={cn('mat-card overflow-hidden rounded-card', className)}>
      <ul className="divide-y divide-line/10">{items}</ul>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loading}
          aria-busy={loading || undefined}
          className={cn(
            'flex w-full items-center justify-center gap-2 border-t border-line/10 px-4 py-3 text-sm font-medium text-accent hover:bg-surface-3/60 disabled:text-ink-3',
            focusRing(),
          )}
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden="true" />
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  );
}

/* ── Nested ───────────────────────────────────────────────────────────── */

export interface NestedNode {
  id: string;
  label: string;
  children?: NestedNode[];
}

export interface NestedListProps {
  nodes: NestedNode[];
  onSelect?: (id: string) => void;
  className?: string;
}

function NestedRows({
  nodes,
  depth,
  onSelect,
}: {
  nodes: NestedNode[];
  depth: number;
  onSelect?: (id: string) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <ul>
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const isOpen = open[node.id] ?? true;
        return (
          <li key={node.id}>
            <div
              className="flex min-h-11 items-center gap-2 px-4 py-2"
              style={{ paddingLeft: `${depth * 16 + 16}px` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.label}`}
                  onClick={() => setOpen((prev) => ({ ...prev, [node.id]: !isOpen }))}
                  className={cn(
                    'inline-flex size-6 shrink-0 items-center justify-center rounded-chip text-ink-3 hover:bg-surface-3 hover:text-ink',
                    focusRing(),
                  )}
                >
                  <ChevronRight
                    className={cn('size-4 transition-transform', isOpen && 'rotate-90')}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <span className="size-6 shrink-0" aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => onSelect?.(node.id)}
                className={cn('truncate text-sm text-ink', focusRing())}
              >
                {node.label}
              </button>
            </div>
            {hasChildren && isOpen && (
              <NestedRows
                nodes={node.children as NestedNode[]}
                depth={depth + 1}
                onSelect={onSelect}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** List variant (todo/09 §F batch 87) — nested/tree list with expanders. */
export function NestedList({ nodes, onSelect, className }: NestedListProps) {
  return (
    <div className={cn('mat-card overflow-hidden rounded-card', className)}>
      <NestedRows nodes={nodes} depth={0} onSelect={onSelect} />
    </div>
  );
}
