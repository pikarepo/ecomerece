/** @jsxImportSource react */
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Button, IconButton } from '../controls/Button';
import { SidePanel } from './SidePanel';

export interface CartLine {
  id: string | number;
  name: ReactNode;
  /** Variant / options line, e.g. "Size M · Black". */
  meta?: ReactNode;
  price: string;
  qty: number;
  image?: ReactNode;
  maxQty?: number;
}

export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartLine[];
  subtotal: string;
  onQtyChange?: (id: string | number, qty: number) => void;
  onRemove?: (id: string | number) => void;
  onCheckout?: () => void;
  title?: ReactNode;
  footerNote?: ReactNode;
  emptyContent?: ReactNode;
  className?: string;
}

function QtyStepper({
  value,
  max,
  onChange,
  label,
}: {
  value: number;
  max?: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="mat-control inline-flex items-center rounded-control">
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={cn(
          'grid h-8 w-8 place-items-center rounded-l-control text-ink-2 transition-colors duration-skin ease-skin hover:text-ink disabled:opacity-40',
          focusRing(),
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center font-mono text-sm tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        disabled={max !== undefined && value >= max}
        onClick={() => onChange(value + 1)}
        className={cn(
          'grid h-8 w-8 place-items-center rounded-r-control text-ink-2 transition-colors duration-skin ease-skin hover:text-ink disabled:opacity-40',
          focusRing(),
        )}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function CartDrawer({
  open,
  onClose,
  items,
  subtotal,
  onQtyChange,
  onRemove,
  onCheckout,
  title = 'Your cart',
  footerNote,
  emptyContent,
  className,
}: CartDrawerProps) {
  return (
    <SidePanel open={open} onClose={onClose} title={title} className={className}>
      {items.length === 0 ? (
        <div className="grid place-items-center gap-3 py-16 text-center">
          <span className="mat-well grid size-14 place-items-center rounded-sheet text-ink-3">
            <ShoppingBag className="size-6" />
          </span>
          <p className="text-sm text-ink-2">{emptyContent ?? 'Your cart is empty.'}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4" aria-label="Cart items">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              {item.image !== undefined && (
                <span className="mat-well grid size-14 shrink-0 place-items-center overflow-hidden rounded-control text-ink-3">
                  {item.image}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                    {item.meta && <p className="mt-0.5 text-xs text-ink-3">{item.meta}</p>}
                  </div>
                  <span className="shrink-0 font-mono text-sm tabular-nums text-ink">
                    {item.price}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {onQtyChange ? (
                    <QtyStepper
                      value={item.qty}
                      max={item.maxQty}
                      label={typeof item.name === 'string' ? item.name : String(item.id)}
                      onChange={(next) => onQtyChange(item.id, next)}
                    />
                  ) : (
                    <span className="text-xs text-ink-3">Qty {item.qty}</span>
                  )}
                  {onRemove && (
                    <IconButton
                      label={`Remove ${typeof item.name === 'string' ? item.name : item.id}`}
                      onClick={() => onRemove(item.id)}
                      className="h-8 w-8 text-ink-3 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="mt-6 border-t border-line/10 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-2">Subtotal</span>
            <span className="font-mono text-base font-semibold tabular-nums text-ink">
              {subtotal}
            </span>
          </div>
          {footerNote && <p className="mt-1 text-xs text-ink-3">{footerNote}</p>}
          <Button variant="primary" fullWidth className="mt-4" onClick={onCheckout}>
            Checkout
          </Button>
        </div>
      )}
    </SidePanel>
  );
}
