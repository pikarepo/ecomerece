/** @jsxImportSource react */

import {
  Bell,
  Bookmark,
  Calendar,
  Camera,
  Check,
  Clock,
  Cloud,
  Copy,
  CreditCard,
  Download,
  Eye,
  File,
  Folder,
  Globe,
  Heart,
  Home,
  Image as ImageIcon,
  Link,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  Share2,
  ShoppingCart,
  Star,
  Sun,
  Trash2,
  Upload,
  User,
  Zap,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';

/**
 * Medium pickers (todo/09 batch 47): emoji, font, icon and gradient/shadow.
 * Presets are data-driven; previews use inline styles. `mat-*` + tokens only.
 *
 * NB: React 19's `onChange` does not fire under happy-dom synthetic events, so
 * the icon search field also binds `onInput`.
 */

type LucideIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

const PANEL = 'mat-overlay w-72 rounded-card border border-line/20 p-2 shadow-lg';
const SEARCH =
  'mb-2 w-full rounded-control bg-surface-1 px-2 py-1.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none';

export interface EmojiGroup {
  id: string;
  label: string;
  emojis: string[];
}

export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    id: 'smileys',
    label: 'Smileys',
    emojis: ['😀', '😄', '😁', '🙂', '😉', '😍', '🤔', '😎', '🥳', '😴', '😭', '😡'],
  },
  {
    id: 'people',
    label: 'People',
    emojis: ['👋', '👍', '👏', '🙏', '💪', '🧑', '👩', '👨', '👶', '🕺', '💃'],
  },
  {
    id: 'animals',
    label: 'Animals',
    emojis: ['🐶', '🐱', '🦊', '🐻', '🐼', '🦁', '🐯', '🐸', '🐵', '🦄', '🐝'],
  },
  {
    id: 'food',
    label: 'Food',
    emojis: ['🍎', '🍌', '🍕', '🍔', '🍟', '🍣', '🍩', '🍪', '☕', '🍺', '🍇'],
  },
  {
    id: 'objects',
    label: 'Objects',
    emojis: ['💡', '📱', '💻', '🎧', '📷', '🎁', '🔑', '⏰', '📚', '✏️', '🎉'],
  },
];

export interface EmojiPickerProps {
  onValueChange?: (emoji: string) => void;
  groups?: EmojiGroup[];
  className?: string;
}

export function EmojiPicker({ onValueChange, groups, className }: EmojiPickerProps) {
  const list = groups ?? EMOJI_GROUPS;
  const [active, setActive] = useState(list[0]?.id ?? '');
  const current = list.find((g) => g.id === active) ?? list[0];
  return (
    <div className={cn(PANEL, className)}>
      <div role="toolbar" aria-label="Emoji categories" className="mb-2 flex gap-1 overflow-x-auto">
        {list.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={g.id === active}
            onClick={() => setActive(g.id)}
            className={cn(
              'shrink-0 rounded-control px-2 py-1 text-xs font-medium transition-colors duration-skin ease-skin',
              g.id === active ? 'bg-accent text-accent-ink' : 'text-ink-3 hover:bg-surface-1',
              focusRing(),
            )}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="grid max-h-48 grid-cols-6 gap-1 overflow-y-auto">
        {(current?.emojis ?? []).map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-label={emoji}
            onClick={() => onValueChange?.(emoji)}
            className={cn(
              'grid size-9 place-items-center rounded-control text-xl transition-colors duration-skin ease-skin hover:bg-surface-1',
              focusRing(),
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface FontOption {
  id: string;
  label: string;
  stack: string;
}

export const DEFAULT_FONTS: FontOption[] = [
  { id: 'system', label: 'System UI', stack: 'system-ui, sans-serif' },
  { id: 'inter', label: 'Inter', stack: 'Inter, sans-serif' },
  { id: 'georgia', label: 'Georgia', stack: 'Georgia, serif' },
  { id: 'times', label: 'Times New Roman', stack: '"Times New Roman", serif' },
  { id: 'courier', label: 'Courier New', stack: '"Courier New", monospace' },
  { id: 'arial', label: 'Arial', stack: 'Arial, sans-serif' },
  { id: 'verdana', label: 'Verdana', stack: 'Verdana, sans-serif' },
];

export interface FontPickerProps {
  value?: string;
  onValueChange?: (fontId: string) => void;
  fonts?: FontOption[];
  previewText?: string;
  className?: string;
}

export function FontPicker({
  value,
  onValueChange,
  fonts,
  previewText = 'The quick brown fox',
  className,
}: FontPickerProps) {
  const list = fonts ?? DEFAULT_FONTS;
  return (
    <div
      role="listbox"
      aria-label="Font"
      className={cn(PANEL, 'flex max-h-64 flex-col gap-1 overflow-y-auto', className)}
    >
      {list.map((font) => (
        <button
          key={font.id}
          type="button"
          role="option"
          aria-selected={font.id === value}
          onClick={() => onValueChange?.(font.id)}
          className={cn(
            'flex items-center justify-between gap-2 rounded-control px-2 py-1.5 text-left transition-colors duration-skin ease-skin hover:bg-surface-1',
            font.id === value && 'bg-surface-1',
            focusRing(),
          )}
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-ink" style={{ fontFamily: font.stack }}>
              {previewText}
            </span>
            <span className="block text-[0.65rem] text-ink-3">{font.label}</span>
          </span>
          {font.id === value && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
        </button>
      ))}
    </div>
  );
}

export const DEFAULT_ICONS: Record<string, LucideIcon> = {
  home: Home,
  search: Search,
  user: User,
  settings: Settings,
  bell: Bell,
  heart: Heart,
  star: Star,
  mail: Mail,
  calendar: Calendar,
  camera: Camera,
  trash: Trash2,
  edit: Pencil,
  plus: Plus,
  download: Download,
  upload: Upload,
  lock: Lock,
  eye: Eye,
  copy: Copy,
  link: Link,
  image: ImageIcon,
  file: File,
  folder: Folder,
  globe: Globe,
  clock: Clock,
  cloud: Cloud,
  pin: MapPin,
  phone: Phone,
  chat: MessageCircle,
  cart: ShoppingCart,
  card: CreditCard,
  share: Share2,
  bookmark: Bookmark,
  play: Zap,
  sun: Sun,
  moon: Moon,
};

export interface IconPickerProps {
  value?: string;
  onValueChange?: (name: string) => void;
  icons?: Record<string, LucideIcon>;
  label?: string;
  className?: string;
}

export function IconPicker({
  value,
  onValueChange,
  icons,
  label = 'Icon',
  className,
}: IconPickerProps) {
  const map = icons ?? DEFAULT_ICONS;
  const [query, setQuery] = useState('');
  const names = Object.keys(map).filter((n) => n.includes(query.trim().toLowerCase()));
  return (
    <div className={cn(PANEL, className)}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
        placeholder="Search icons…"
        aria-label={`Search ${label}`}
        className={SEARCH}
      />
      <div
        role="listbox"
        aria-label={label}
        className="grid max-h-48 grid-cols-6 gap-1 overflow-y-auto"
      >
        {names.map((name) => {
          const Icon = map[name];
          return (
            <button
              key={name}
              type="button"
              role="option"
              aria-label={name}
              aria-selected={name === value}
              onClick={() => onValueChange?.(name)}
              className={cn(
                'grid size-9 place-items-center rounded-control text-ink-2 transition-colors duration-skin ease-skin hover:bg-surface-1',
                name === value && 'bg-accent text-accent-ink',
                focusRing(),
              )}
            >
              <Icon className="size-5" aria-hidden />
            </button>
          );
        })}
        {names.length === 0 && (
          <p className="col-span-6 px-2 py-3 text-center text-xs text-ink-3">No matches</p>
        )}
      </div>
    </div>
  );
}

export interface GradientPreset {
  id: string;
  label: string;
  css: string;
}

export const DEFAULT_GRADIENTS: GradientPreset[] = [
  { id: 'sunset', label: 'Sunset', css: 'linear-gradient(135deg, #ff7e5f, #feb47b)' },
  { id: 'ocean', label: 'Ocean', css: 'linear-gradient(135deg, #2193b0, #6dd5ed)' },
  { id: 'grape', label: 'Grape', css: 'linear-gradient(135deg, #834d9b, #d04ed6)' },
  { id: 'forest', label: 'Forest', css: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'night', label: 'Night', css: 'linear-gradient(135deg, #232526, #414345)' },
  { id: 'candy', label: 'Candy', css: 'linear-gradient(135deg, #ff9a9e, #fad0c4)' },
];

export interface GradientPickerProps {
  value?: string;
  onValueChange?: (css: string) => void;
  presets?: GradientPreset[];
  className?: string;
}

export function GradientPicker({ value, onValueChange, presets, className }: GradientPickerProps) {
  const list = presets ?? DEFAULT_GRADIENTS;
  return (
    <div className={cn(PANEL, className)}>
      <div role="listbox" aria-label="Gradient" className="grid grid-cols-3 gap-2">
        {list.map((preset) => (
          <button
            key={preset.id}
            type="button"
            role="option"
            aria-label={preset.label}
            aria-selected={preset.css === value}
            title={preset.label}
            onClick={() => onValueChange?.(preset.css)}
            className={cn(
              'h-12 rounded-control border transition-transform duration-skin ease-skin hover:scale-[1.03]',
              preset.css === value ? 'border-accent ring-2 ring-accent' : 'border-line/30',
              focusRing(),
            )}
            style={{ backgroundImage: preset.css }}
          />
        ))}
      </div>
    </div>
  );
}

export interface ShadowPreset {
  id: string;
  label: string;
  css: string;
}

export const DEFAULT_SHADOWS: ShadowPreset[] = [
  { id: 'none', label: 'None', css: 'none' },
  { id: 'sm', label: 'Small', css: '0 1px 2px rgba(0,0,0,0.08)' },
  { id: 'md', label: 'Medium', css: '0 4px 12px rgba(0,0,0,0.12)' },
  { id: 'lg', label: 'Large', css: '0 12px 32px rgba(0,0,0,0.18)' },
  { id: 'inner', label: 'Inset', css: 'inset 0 2px 6px rgba(0,0,0,0.18)' },
];

export interface ShadowPickerProps {
  value?: string;
  onValueChange?: (css: string) => void;
  presets?: ShadowPreset[];
  className?: string;
}

export function ShadowPicker({ value, onValueChange, presets, className }: ShadowPickerProps) {
  const list = presets ?? DEFAULT_SHADOWS;
  return (
    <div className={cn(PANEL, className)}>
      <div role="listbox" aria-label="Shadow" className="flex flex-wrap gap-2">
        {list.map((preset) => (
          <button
            key={preset.id}
            type="button"
            role="option"
            aria-label={preset.label}
            aria-selected={preset.css === value}
            onClick={() => onValueChange?.(preset.css)}
            className={cn(
              'grid size-12 place-items-center rounded-control bg-surface-3 text-[0.6rem] text-ink-3 transition-transform duration-skin ease-skin hover:scale-[1.03]',
              preset.css === value && 'ring-2 ring-accent',
              focusRing(),
            )}
            style={{ boxShadow: preset.css }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
