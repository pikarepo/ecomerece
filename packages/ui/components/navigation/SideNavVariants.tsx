/** @jsxImportSource react */

import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { createContext, type ReactNode, useContext, useId, useMemo, useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/* ─────────────────────────── shared nav model ─────────────────────────── */

export interface NavLeaf {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
  disabled?: boolean;
}

export interface NavGroup extends NavLeaf {
  children: NavItem[];
}

export type NavItem = NavLeaf | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return Array.isArray((item as NavGroup).children);
}

/** Every id on the path from the root down to the active leaf. */
function ancestorsOf(items: NavItem[], target: string, trail: string[] = []): string[] {
  for (const item of items) {
    if (item.id === target) return trail;
    if (isGroup(item)) {
      const hit = ancestorsOf(item.children, target, [...trail, item.id]);
      if (hit.length > 0) return hit;
    }
  }
  return [];
}

/** Expand the groups on the way to `value` so the active item is never hidden. */
function withActivePath(expanded: string[], items: NavItem[], value: string): string[] {
  const path = ancestorsOf(items, value);
  return path.length > 0 ? [...new Set([...expanded, ...path])] : expanded;
}

function Badge({ value, active }: { value: number | string; active?: boolean }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-chip px-1.5 py-0.5 font-mono text-[10px] font-medium',
        active ? 'bg-accent/12 text-accent' : 'bg-surface-3 text-ink-3',
      )}
    >
      {value}
    </span>
  );
}

/* ────────────────────── 1. multi-level sidebar ────────────────────── */

interface MultiLevelContextValue {
  expanded: Set<string>;
  toggle: (id: string) => void;
  value: string;
  onChange: (id: string) => void;
}

const MultiLevelContext = createContext<MultiLevelContextValue | null>(null);

export interface MultiLevelSidebarProps {
  items: NavItem[];
  value: string;
  onChange: (id: string) => void;
  /** Ids of groups open on first render. The path to `value` always opens. */
  defaultExpanded?: string[];
  /** Controlled open groups (omit for uncontrolled). */
  expanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

function MultiLevelRow({ item, depth }: { item: NavItem; depth: number }) {
  const ctx = useContext(MultiLevelContext);
  if (!ctx) return null;
  const { expanded, toggle, value, onChange } = ctx;
  const group = isGroup(item);
  const open = group && expanded.has(item.id);
  const active = !group && item.id === value;
  const Icon = item.icon;

  const indent = { paddingLeft: `${0.75 + depth * 0.875}rem` };

  if (!group) {
    return (
      <li>
        <button
          type="button"
          disabled={item.disabled}
          aria-current={active ? 'page' : undefined}
          onClick={() => onChange(item.id)}
          style={indent}
          className={cn(
            'flex w-full min-h-11 items-center gap-3 rounded-control py-2 pr-3 text-left text-sm transition-all duration-skin ease-skin',
            active
              ? 'bg-surface-3 font-medium text-ink'
              : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
            item.disabled && 'pointer-events-none opacity-50',
            focusRing(),
          )}
        >
          {Icon && <Icon className="size-4 shrink-0 text-ink-3" aria-hidden="true" />}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && <Badge value={item.badge} active={active} />}
        </button>
      </li>
    );
  }

  const panelId = `ml-panel-${item.id}`;
  return (
    <li>
      <button
        type="button"
        disabled={item.disabled}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => toggle(item.id)}
        style={indent}
        className={cn(
          'flex w-full min-h-11 items-center gap-3 rounded-control py-2 pr-3 text-left text-sm text-ink-2 transition-all duration-skin ease-skin',
          'hover:bg-surface-2 hover:text-ink',
          item.disabled && 'pointer-events-none opacity-50',
          focusRing(),
        )}
      >
        {Icon && <Icon className="size-4 shrink-0 text-ink-3" aria-hidden="true" />}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && <Badge value={item.badge} />}
        <ChevronRight
          aria-hidden="true"
          className={cn(
            'size-3.5 shrink-0 text-ink-3 transition-transform duration-skin ease-skin',
            open && 'rotate-90',
          )}
        />
      </button>
      {open && (
        <ul id={panelId} aria-label={item.label} className="mt-0.5 space-y-0.5">
          {item.children.map((child) => (
            <MultiLevelRow key={child.id} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Nested (multi-level) sidebar: groups expand in place, leaves navigate.
 * Group rows toggle with `aria-expanded`/`aria-controls`; only leaves carry
 * `aria-current="page"`. The path to the active leaf auto-opens so it is
 * never hidden.
 */
export function MultiLevelSidebar({
  items,
  value,
  onChange,
  defaultExpanded,
  expanded: expandedProp,
  onExpandedChange,
  header,
  footer,
  className,
}: MultiLevelSidebarProps) {
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultExpanded ?? []);
  const expanded = expandedProp ?? uncontrolled;

  const merged = useMemo(() => withActivePath(expanded, items, value), [expanded, items, value]);

  const toggle = (id: string) => {
    const next = merged.includes(id) ? merged.filter((x) => x !== id) : [...merged, id];
    if (expandedProp === undefined) setUncontrolled(next);
    onExpandedChange?.(next);
  };

  const ctx: MultiLevelContextValue = {
    expanded: new Set(merged),
    toggle,
    value,
    onChange,
  };

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        'mat-panel hidden w-64 shrink-0 flex-col overflow-y-auto md:tall:flex',
        className,
      )}
    >
      {header && <div className="px-4 py-4">{header}</div>}
      <nav className="flex-1 p-2">
        <MultiLevelContext.Provider value={ctx}>
          <ul className="space-y-0.5">
            {items.map((item) => (
              <MultiLevelRow key={item.id} item={item} depth={0} />
            ))}
          </ul>
        </MultiLevelContext.Provider>
      </nav>
      {footer && <div className="border-t border-line/10 p-3">{footer}</div>}
    </aside>
  );
}

/* ────────────────── 2. mini / icon-only sidebar ────────────────── */

export interface MiniSidebarProps {
  items: NavItem[];
  value: string;
  onChange: (id: string) => void;
  /** Controlled icon-only state (omit for uncontrolled). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Accessible name for the collapse/expand toggle (default "Toggle sidebar"). */
  toggleLabel?: string;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Compact sidebar that collapses to an icon-only rail (the `IconRail` idea,
 * but with a real toggle and optional labels). Collapsed rows keep their
 * `aria-label` + native `title` tooltip; expanded rows show icon + label.
 */
export function MiniSidebar({
  items,
  value,
  onChange,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  toggleLabel = 'Toggle sidebar',
  header,
  footer,
  className,
}: MiniSidebarProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? uncontrolled;

  const setCollapsed = (next: boolean) => {
    if (collapsedProp === undefined) setUncontrolled(next);
    onCollapsedChange?.(next);
  };

  return (
    <aside
      aria-label="Sidebar"
      className={cn(
        'mat-panel hidden shrink-0 flex-col overflow-y-auto md:tall:flex',
        collapsed ? 'w-[72px]' : 'w-60',
        className,
      )}
    >
      {header && <div className={cn('py-4', collapsed ? 'px-2' : 'px-4')}>{header}</div>}
      <nav className="flex-1 space-y-0.5 p-2" aria-label="Primary">
        {items.map((item) => {
          const group = isGroup(item);
          const active = !group && item.id === value;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              onClick={() => onChange(item.id)}
              className={cn(
                'flex w-full min-h-11 items-center gap-3 rounded-control px-3 py-2 text-left text-sm transition-all duration-skin ease-skin',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-surface-3 font-medium text-ink'
                  : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                item.disabled && 'pointer-events-none opacity-50',
                focusRing(),
              )}
            >
              {Icon && (
                <Icon
                  className={cn('shrink-0 text-ink-3', collapsed ? 'size-5' : 'size-4')}
                  aria-hidden="true"
                />
              )}
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && <Badge value={item.badge} active={active} />}
                </>
              )}
            </button>
          );
        })}
      </nav>
      <div className={cn('border-t border-line/10 p-2', collapsed && 'px-2')}>
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={toggleLabel}
          title={toggleLabel}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex w-full min-h-11 items-center gap-3 rounded-control px-3 py-2 text-left text-sm text-ink-2',
            'transition-all duration-skin ease-skin hover:bg-surface-2 hover:text-ink',
            collapsed && 'justify-center px-0',
            focusRing(),
          )}
        >
          <ChevronRight
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 text-ink-3 transition-transform duration-skin ease-skin',
              !collapsed && 'rotate-180',
            )}
          />
          {!collapsed && <span className="flex-1">Collapse</span>}
        </button>
        {footer && !collapsed && <div className="p-1">{footer}</div>}
      </div>
    </aside>
  );
}

/* ────────────────────── 3. accordion nav ────────────────────── */

export interface AccordionNavGroup {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: NavLeaf[];
}

export interface AccordionNavProps {
  groups: AccordionNavGroup[];
  value: string;
  onChange: (id: string) => void;
  /** Group ids open on first render (omit for none). */
  defaultOpen?: string[];
  /** Controlled open groups (omit for uncontrolled). */
  open?: string[];
  onOpenChange?: (ids: string[]) => void;
  /** Allow several groups open at once (default `false`). */
  allowMultiple?: boolean;
  className?: string;
}

/**
 * Accordion navigation: each group is a disclosure; its items are links.
 * Distinct from the generic `Accordion` (`list/`) — this is a `<nav>` list
 * whose rows are navigable and the group header toggles, not navigates.
 */
export function AccordionNav({
  groups,
  value,
  onChange,
  defaultOpen,
  open: openProp,
  onOpenChange,
  allowMultiple = false,
  className,
}: AccordionNavProps) {
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultOpen ?? []);
  const open = openProp ?? uncontrolled;
  const uid = useId();

  const setOpen = (next: string[]) => {
    if (openProp === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };

  const toggle = (id: string) => {
    const isOpen = open.includes(id);
    if (!isOpen) {
      setOpen(allowMultiple ? [...open, id] : [id]);
      return;
    }
    setOpen(open.filter((x) => x !== id));
  };

  return (
    <nav aria-label="Section navigation" className={cn('mat-panel rounded-card p-2', className)}>
      <ul className="space-y-0.5">
        {groups.map((group) => {
          const expanded = open.includes(group.id);
          const panelId = `${uid}-${group.id}`;
          const Icon = group.icon;
          const groupHasActive = group.items.some((item) => item.id === value);
          return (
            <li key={group.id}>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(group.id)}
                className={cn(
                  'flex w-full min-h-11 items-center gap-3 rounded-control px-3 py-2 text-left text-sm text-ink-2',
                  'transition-all duration-skin ease-skin hover:bg-surface-2 hover:text-ink',
                  groupHasActive && 'text-ink',
                  focusRing(),
                )}
              >
                {Icon && <Icon className="size-4 shrink-0 text-ink-3" aria-hidden="true" />}
                <span className="min-w-0 flex-1 truncate">{group.label}</span>
                <ChevronRight
                  aria-hidden="true"
                  className={cn(
                    'size-3.5 shrink-0 text-ink-3 transition-transform duration-skin ease-skin',
                    expanded && 'rotate-90',
                  )}
                />
              </button>
              {expanded && (
                <ul id={panelId} className="mt-0.5 space-y-0.5 pl-4">
                  {group.items.map((item) => {
                    const active = item.id === value;
                    const ItemIcon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          disabled={item.disabled}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => onChange(item.id)}
                          className={cn(
                            'flex w-full min-h-11 items-center gap-3 rounded-control px-3 py-2 text-left text-sm transition-all duration-skin ease-skin',
                            active
                              ? 'bg-surface-3 font-medium text-ink'
                              : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
                            item.disabled && 'pointer-events-none opacity-50',
                            focusRing(),
                          )}
                        >
                          {ItemIcon && (
                            <ItemIcon className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
                          )}
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.badge !== undefined && <Badge value={item.badge} active={active} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
