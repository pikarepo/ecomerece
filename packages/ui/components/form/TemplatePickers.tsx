/** @jsxImportSource react */

import { Check, Columns2, LayoutGrid, PanelLeft, Square } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Heavy pickers, non-schedule subset (todo/09 batch 48): template, layout and
 * theme pickers. Cron + recurrence are flagged ⛔ own-task in the backlog and
 * intentionally not built here. `mat-*` + tokens only.
 */

export interface TemplateOption {
  id: string;
  label: string;
  description?: string;
  emoji?: string;
}

export const DEFAULT_TEMPLATES: TemplateOption[] = [
  { id: 'blank', label: 'Blank', description: 'Start from scratch', emoji: '📄' },
  { id: 'blog', label: 'Blog post', description: 'Long-form article', emoji: '📰' },
  { id: 'portfolio', label: 'Portfolio', description: 'Showcase your work', emoji: '🎨' },
  { id: 'store', label: 'Storefront', description: 'Sell products', emoji: '🛍️' },
  { id: 'dashboard', label: 'Dashboard', description: 'Metrics & charts', emoji: '📊' },
  { id: 'landing', label: 'Landing page', description: 'Convert visitors', emoji: '🚀' },
];

export interface TemplatePickerProps {
  value?: string;
  onValueChange?: (id: string) => void;
  templates?: TemplateOption[];
  className?: string;
}

export function TemplatePicker({
  value,
  onValueChange,
  templates,
  className,
}: TemplatePickerProps) {
  const list = templates ?? DEFAULT_TEMPLATES;
  return (
    <div
      role="listbox"
      aria-label="Template"
      className={cn('grid w-full grid-cols-2 gap-3 sm:grid-cols-3', className)}
    >
      {list.map((t) => (
        <button
          key={t.id}
          type="button"
          role="option"
          aria-selected={t.id === value}
          onClick={() => onValueChange?.(t.id)}
          className={cn(
            'mat-card flex flex-col items-start gap-1 rounded-card border p-3 text-left transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
            t.id === value
              ? 'border-accent ring-2 ring-accent'
              : 'border-line/30 hover:bg-surface-1',
            focusRing(),
          )}
        >
          <span className="text-2xl" aria-hidden>
            {t.emoji}
          </span>
          <span className="text-sm font-medium text-ink">{t.label}</span>
          {t.description && <span className="text-xs text-ink-3">{t.description}</span>}
        </button>
      ))}
    </div>
  );
}

export interface LayoutOption {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

export const DEFAULT_LAYOUTS: LayoutOption[] = [
  { id: 'single', label: 'Single column', icon: Square },
  { id: 'two-column', label: 'Two columns', icon: Columns2 },
  { id: 'sidebar', label: 'Sidebar', icon: PanelLeft },
  { id: 'grid', label: 'Grid', icon: LayoutGrid },
];

export interface LayoutPickerProps {
  value?: string;
  onValueChange?: (id: string) => void;
  layouts?: LayoutOption[];
  className?: string;
}

export function LayoutPicker({ value, onValueChange, layouts, className }: LayoutPickerProps) {
  const list = layouts ?? DEFAULT_LAYOUTS;
  return (
    <div role="toolbar" aria-label="Layout" className={cn('flex flex-wrap gap-2', className)}>
      {list.map((layout) => {
        const Icon = layout.icon;
        return (
          <button
            key={layout.id}
            type="button"
            aria-label={layout.label}
            aria-pressed={layout.id === value}
            onClick={() => onValueChange?.(layout.id)}
            className={cn(
              'mat-control grid size-12 place-items-center rounded-control border transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
              layout.id === value
                ? 'border-accent text-accent ring-2 ring-accent'
                : 'border-line/30 text-ink-2 hover:bg-surface-1',
              focusRing(),
            )}
          >
            <Icon className="size-5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

export interface ThemeOption {
  id: string;
  label: string;
  colors: string[];
}

export const DEFAULT_THEMES: ThemeOption[] = [
  { id: 'light', label: 'Daylight', colors: ['#ffffff', '#f1f5f9', '#0f172a', '#3b82f6'] },
  { id: 'dark', label: 'Midnight', colors: ['#0f172a', '#1e293b', '#f8fafc', '#60a5fa'] },
  { id: 'forest', label: 'Forest', colors: ['#f0fdf4', '#dcfce7', '#14532d', '#16a34a'] },
  { id: 'sunset', label: 'Sunset', colors: ['#fff7ed', '#ffedd5', '#7c2d12', '#f97316'] },
  { id: 'grape', label: 'Grape', colors: ['#faf5ff', '#f3e8ff', '#3b0764', '#a855f7'] },
];

export interface ThemePickerProps {
  value?: string;
  onValueChange?: (id: string) => void;
  themes?: ThemeOption[];
  className?: string;
}

export function ThemePicker({ value, onValueChange, themes, className }: ThemePickerProps) {
  const list = themes ?? DEFAULT_THEMES;
  return (
    <div
      role="listbox"
      aria-label="Theme"
      className={cn('grid w-full grid-cols-2 gap-3 sm:grid-cols-3', className)}
    >
      {list.map((theme) => (
        <button
          key={theme.id}
          type="button"
          role="option"
          aria-selected={theme.id === value}
          onClick={() => onValueChange?.(theme.id)}
          className={cn(
            'mat-card flex items-center gap-3 rounded-card border p-3 text-left transition-all duration-skin ease-skin active:scale-[var(--press-scale)]',
            theme.id === value
              ? 'border-accent ring-2 ring-accent'
              : 'border-line/30 hover:bg-surface-1',
            focusRing(),
          )}
        >
          <span className="flex shrink-0 overflow-hidden rounded-control border border-line/30">
            {theme.colors.map((color) => (
              <span key={color} className="size-4" style={{ backgroundColor: color }} />
            ))}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
            {theme.label}
          </span>
          {theme.id === value && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
        </button>
      ))}
    </div>
  );
}
