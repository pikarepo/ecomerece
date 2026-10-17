/** @jsxImportSource react */

/**
 * Bottom navigation variants (todo/09 batch 75): a full-width bottom tab bar
 * with a raised centre FAB, and a floating pill bottom nav.
 *
 * Markup contract: `mat-*` role classes + theme tokens only — never `--m-*`.
 * Both shells are `fixed` by default; pass `className="static …"` to render a
 * contained preview (e.g. the design QA page).
 */

import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import type { BottomTabItem } from './BottomTabBar';

export interface BottomNavAction {
  icon: LucideIcon;
  /** Accessible name (also the tooltip). */
  label: string;
  onClick: () => void;
  badge?: number;
}

export type FabPosition = 'center' | 'start' | 'end';

/* ── shared tab button ────────────────────────────────────────────────── */

function TabButton({
  item,
  active,
  onChange,
  showLabel = true,
}: {
  item: BottomTabItem;
  active: boolean;
  onChange: (value: string) => void;
  showLabel?: boolean;
}) {
  const Icon = active ? (item.activeIcon ?? item.icon) : item.icon;
  return (
    <button
      type="button"
      onClick={() => onChange(item.value)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 transition-all duration-skin ease-skin',
        active ? 'text-accent' : 'text-ink-3 hover:text-ink',
        focusRing(),
      )}
    >
      <span className="relative">
        <Icon className="size-5" aria-hidden="true" />
        {item.badge !== undefined && item.badge > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-mono text-[10px] font-semibold text-accent-ink">
            {item.badge}
          </span>
        )}
      </span>
      {showLabel && <span className="text-[10px] font-medium">{item.label}</span>}
    </button>
  );
}

function FabButton({ action, raised }: { action: BottomNavAction; raised: boolean }) {
  return (
    <button
      type="button"
      aria-label={action.label}
      title={action.label}
      onClick={action.onClick}
      className={cn(
        'relative grid size-14 shrink-0 place-items-center rounded-full bg-accent text-accent-ink shadow-lg transition-transform duration-skin ease-skin',
        'hover:scale-105 active:scale-95',
        raised && '-mt-7',
        focusRing(),
      )}
    >
      <action.icon className="size-6" aria-hidden="true" />
      {action.badge !== undefined && action.badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-mono text-[10px] font-semibold text-accent-ink">
          {action.badge}
        </span>
      )}
    </button>
  );
}

/* ── 1. bottom tab bar with a raised FAB ──────────────────────────────── */

export interface BottomTabBarFABProps {
  items: BottomTabItem[];
  value: string;
  onChange: (value: string) => void;
  action: BottomNavAction;
  /** Where the FAB interrupts the tabs. Default "center". */
  fabPosition?: FabPosition;
  /** Lift the FAB into a notch above the bar (default true). */
  raised?: boolean;
  className?: string;
}

/**
 * Full-width bottom tab bar with a raised centre action button. Tabs keep the
 * `BottomTabBar` semantics (`aria-current="page"`); the FAB is a labelled
 * button that interrupts the row at `fabPosition`.
 */
export function BottomTabBarFAB({
  items,
  value,
  onChange,
  action,
  fabPosition = 'center',
  raised = true,
  className,
}: BottomTabBarFABProps) {
  const splitAt =
    fabPosition === 'center'
      ? Math.ceil(items.length / 2)
      : fabPosition === 'start'
        ? 0
        : items.length;
  const before = fabPosition === 'end' ? items : items.slice(0, splitAt);
  const after = fabPosition === 'end' ? [] : items.slice(splitAt);

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        'mat-chrome fixed inset-x-0 bottom-0 z-chrome flex items-center justify-around border-x-0 border-b-0 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {before.map((item) => (
        <TabButton key={item.value} item={item} active={item.value === value} onChange={onChange} />
      ))}
      <FabButton action={action} raised={raised} />
      {after.map((item) => (
        <TabButton key={item.value} item={item} active={item.value === value} onChange={onChange} />
      ))}
    </nav>
  );
}

/* ── 2. floating bottom nav (pill) ────────────────────────────────────── */

export interface FloatingBottomNavProps {
  items: BottomTabItem[];
  value: string;
  onChange: (value: string) => void;
  /** Show icons + labels; when false the pill is icon-only (labels become tooltips). */
  labels?: boolean;
  /** Optional centred FAB floating above the pill. */
  action?: BottomNavAction;
  /** Accessible name for the nav. */
  label?: string;
  className?: string;
}

/**
 * Floating bottom navigation: a centred `mat-chrome` pill that hovers above
 * the bottom edge instead of spanning the viewport. Optionally carries a FAB
 * above its centre.
 */
export function FloatingBottomNav({
  items,
  value,
  onChange,
  labels = false,
  action,
  label = 'Primary navigation',
  className,
}: FloatingBottomNavProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        'fixed inset-x-0 bottom-4 z-chrome flex justify-center px-4 pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      <div className="mat-chrome relative flex items-center gap-1 rounded-full border border-line/20 px-2 py-1.5 shadow-lg">
        {action && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2">
            <FabButton action={action} raised={false} />
          </span>
        )}
        {items.map((item) => {
          const active = item.value === value;
          const Icon = active ? (item.activeIcon ?? item.icon) : item.icon;
          return (
            <button
              key={item.value}
              type="button"
              aria-label={labels ? undefined : String(item.label)}
              title={labels ? undefined : String(item.label)}
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange(item.value)}
              className={cn(
                'relative flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 transition-all duration-skin ease-skin',
                active
                  ? 'bg-accent/15 text-accent'
                  : 'text-ink-3 hover:bg-surface-2 hover:text-ink',
                focusRing(),
              )}
            >
              <span className="relative">
                <Icon className="size-5" aria-hidden="true" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-mono text-[10px] font-semibold text-accent-ink">
                    {item.badge}
                  </span>
                )}
              </span>
              {labels && <span className="text-xs font-medium">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
