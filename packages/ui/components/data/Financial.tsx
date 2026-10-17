/** @jsxImportSource react */
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Sparkline } from './Sparkline';

const moneyFmt = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a signed money amount, e.g. `formatMoney(1234.5)` → `$1,234.50`. */
export function formatMoney(value: number, currency = '$'): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}${currency}${moneyFmt.format(Math.abs(value))}`;
}

type Direction = 'up' | 'down' | 'flat';

function directionOf(change: number): Direction {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'flat';
}

/* ── Price change badge ───────────────────────────────────────────────── */

export interface PriceChangeBadgeProps {
  /** Absolute change; sign sets the direction. */
  change: number;
  /** Percentage change, rendered with a `%` suffix. */
  changePercent: number;
  /** Set false when an increase is undesirable. Default true. */
  upIsGood?: boolean;
  className?: string;
}

const CHANGE_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus } as const;

export function PriceChangeBadge({
  change,
  changePercent,
  upIsGood = true,
  className,
}: PriceChangeBadgeProps) {
  const direction = directionOf(change);
  const good = direction === 'flat' ? null : (direction === 'up') === upIsGood;
  const tone =
    good === null
      ? 'bg-ink/8 text-ink-3'
      : good
        ? 'bg-success/12 text-success'
        : 'bg-danger/12 text-danger';
  const Icon = CHANGE_ICON[direction];
  const label = `${direction} ${changePercent > 0 ? '+' : ''}${changePercent}%`;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span aria-hidden="true">
        {changePercent > 0 ? '+' : ''}
        {changePercent}%
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/* ── Quote ticker ─────────────────────────────────────────────────────── */

export interface PriceQuote {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
  spark?: number[];
}

export interface PriceTickerProps {
  quote: PriceQuote;
  className?: string;
}

export function PriceTicker({ quote, className }: PriceTickerProps) {
  const up = quote.change >= 0;
  return (
    <div className={cn('mat-card flex items-center gap-3 rounded-card px-4 py-3', className)}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{quote.symbol}</p>
        {quote.name && <p className="truncate text-xs text-ink-3">{quote.name}</p>}
      </div>
      {quote.spark && quote.spark.length > 1 && (
        <Sparkline
          data={quote.spark}
          tone={up ? 'success' : 'danger'}
          label={`${quote.symbol} price history`}
          className="h-8 w-16 shrink-0"
        />
      )}
      <div className="text-right">
        <p className="text-sm font-medium tabular-nums text-ink">
          {formatMoney(quote.price, quote.currency)}
        </p>
        <PriceChangeBadge change={quote.change} changePercent={quote.changePercent} />
      </div>
    </div>
  );
}

export interface TickerTapeProps {
  quotes: PriceQuote[];
  className?: string;
}

export function TickerTape({ quotes, className }: TickerTapeProps) {
  return (
    <ul
      className={cn(
        'flex items-center gap-5 overflow-x-auto rounded-control border border-line/10 bg-surface-2 px-4 py-2',
        className,
      )}
      aria-label="Market ticker"
    >
      {quotes.map((q) => {
        const up = q.change >= 0;
        return (
          <li key={q.symbol} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm">
            <span className="font-semibold text-ink">{q.symbol}</span>
            <span className="tabular-nums text-ink-2">{formatMoney(q.price, q.currency)}</span>
            <span
              role="img"
              className={cn('tabular-nums', up ? 'text-success' : 'text-danger')}
              aria-label={`${up ? 'up' : 'down'} ${q.changePercent}%`}
            >
              {up ? '+' : ''}
              {q.changePercent}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Order book ───────────────────────────────────────────────────────── */

export interface OrderLevel {
  price: number;
  size: number;
}

export interface OrderBookProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
  currency?: string;
  className?: string;
}

function depthWidth(size: number, max: number): string {
  return `${max > 0 ? Math.round((size / max) * 100) : 0}%`;
}

export function OrderBook({ bids, asks, currency = '$', className }: OrderBookProps) {
  const max = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size), 1);
  return (
    <div className={cn('mat-card overflow-hidden rounded-card', className)}>
      <div className="grid grid-cols-2 border-b border-line/10 text-xs font-medium uppercase tracking-wide text-ink-3">
        <div className="border-r border-line/10 px-3 py-2">Bids</div>
        <div className="px-3 py-2 text-right">Asks</div>
      </div>
      <div className="grid grid-cols-2">
        <div className="border-r border-line/10">
          {bids.map((b) => (
            <div key={b.price} className="relative flex justify-between px-3 py-1 text-sm">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 right-0 bg-success/15"
                style={{ width: depthWidth(b.size, max) }}
              />
              <span className="relative tabular-nums text-success">
                {formatMoney(b.price, currency)}
              </span>
              <span className="relative tabular-nums text-ink-3">{b.size}</span>
            </div>
          ))}
        </div>
        <div>
          {asks.map((a) => (
            <div key={a.price} className="relative flex justify-between px-3 py-1 text-sm">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 bg-danger/15"
                style={{ width: depthWidth(a.size, max) }}
              />
              <span className="relative tabular-nums text-ink-3">{a.size}</span>
              <span className="relative tabular-nums text-danger">
                {formatMoney(a.price, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Depth chart ──────────────────────────────────────────────────────── */

export interface DepthChartProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
  label?: string;
  className?: string;
}

interface DepthPoint {
  x: number;
  y: number;
}

function cumulative(levels: OrderLevel[]): OrderLevel[] {
  let running = 0;
  return levels.map((l) => {
    running += l.size;
    return { price: l.price, size: running };
  });
}

export function DepthChart({ bids, asks, label = 'Market depth', className }: DepthChartProps) {
  const bidCum = cumulative(bids);
  const askCum = cumulative(asks);
  const max = Math.max(bidCum.at(-1)?.size ?? 0, askCum.at(-1)?.size ?? 0, 1);
  const height = 40;

  const toPoints = (levels: OrderLevel[], fromX: number, toX: number): DepthPoint[] =>
    levels.map((l, i) => ({
      x: fromX + (toX - fromX) * (levels.length === 1 ? 1 : i / (levels.length - 1)),
      y: height - (l.size / max) * height,
    }));

  const bidPts = toPoints(bidCum, 0, 50);
  const askPts = toPoints(askCum, 50, 100);
  const bidPoly = [`0,${height}`, ...bidPts.map((p) => `${p.x},${p.y}`), `50,${height}`].join(' ');
  const askPoly = [`50,${height}`, ...askPts.map((p) => `${p.x},${p.y}`), `100,${height}`].join(
    ' ',
  );

  return (
    <figure className={cn('mat-card rounded-card p-3', className)}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={label}
        className="h-32 w-full"
      >
        <polygon points={bidPoly} className="fill-success/25" />
        <polyline
          points={bidPts.map((p) => `${p.x},${p.y}`).join(' ')}
          className="fill-none stroke-success"
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
        />
        <polygon points={askPoly} className="fill-danger/25" />
        <polyline
          points={askPts.map((p) => `${p.x},${p.y}`).join(' ')}
          className="fill-none stroke-danger"
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
        />
        <line x1={50} y1={0} x2={50} y2={height} className="stroke-line/40" strokeWidth={0.5} />
      </svg>
      <figcaption className="mt-2 flex justify-between text-xs text-ink-3">
        <span>Bids</span>
        <span>Price</span>
        <span>Asks</span>
      </figcaption>
    </figure>
  );
}

/* ── Portfolio breakdown ──────────────────────────────────────────────── */

export interface Holding {
  id: string;
  label: ReactNode;
  value: number;
  tone?: 'accent' | 'success' | 'warning' | 'info' | 'danger';
}

export interface PortfolioBreakdownProps {
  holdings: Holding[];
  total?: number;
  valueLabel?: ReactNode;
  className?: string;
}

const ALLOC_TONE: Record<NonNullable<Holding['tone']>, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  danger: 'bg-danger',
};

export function PortfolioBreakdown({
  holdings,
  total,
  valueLabel = 'Allocation',
  className,
}: PortfolioBreakdownProps) {
  const sum = total ?? holdings.reduce((acc, h) => acc + h.value, 0);
  return (
    <div className={cn('mat-card rounded-card p-4', className)}>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-3">{valueLabel}</p>
      <div className="flex h-3 overflow-hidden rounded-full" aria-hidden="true">
        {holdings.map((h, i) => (
          <span
            key={h.id}
            className={cn(
              ALLOC_TONE[h.tone ?? 'accent'],
              i === 0 && 'rounded-l-full',
              i === holdings.length - 1 && 'rounded-r-full',
            )}
            style={{ width: `${sum > 0 ? (h.value / sum) * 100 : 0}%` }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-col gap-2">
        {holdings.map((h) => (
          <li key={h.id} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className={cn('size-2.5 shrink-0 rounded-full', ALLOC_TONE[h.tone ?? 'accent'])}
            />
            <span className="min-w-0 flex-1 truncate text-ink">{h.label}</span>
            <span className="tabular-nums text-ink-3">
              {sum > 0 ? Math.round((h.value / sum) * 100) : 0}%
            </span>
            <span className="w-20 text-right tabular-nums font-medium text-ink">
              {formatMoney(h.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Transaction list ─────────────────────────────────────────────────── */

export interface Transaction {
  id: string;
  description: ReactNode;
  date: ReactNode;
  amount: number;
  category?: ReactNode;
  pending?: boolean;
}

export interface TransactionListProps {
  transactions: Transaction[];
  className?: string;
}

export function TransactionList({ transactions, className }: TransactionListProps) {
  return (
    <ul className={cn('mat-card divide-y divide-line/10 overflow-hidden rounded-card', className)}>
      {transactions.map((t) => {
        const incoming = t.amount >= 0;
        const Icon = incoming ? ArrowDownRight : ArrowUpRight;
        return (
          <li key={t.id} className="flex items-center gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                incoming ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger',
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{t.description}</p>
              <p className="text-xs text-ink-3">
                {t.date}
                {t.category ? ` · ${t.category}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'text-sm font-medium tabular-nums',
                  incoming ? 'text-success' : 'text-ink',
                )}
              >
                {incoming ? '+' : ''}
                {formatMoney(t.amount)}
              </p>
              {t.pending && <p className="text-xs text-warning">Pending</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Balance card ─────────────────────────────────────────────────────── */

export interface BalanceCardProps {
  label: ReactNode;
  amount: number;
  currency?: string;
  available?: number;
  pending?: number;
  /** Optional primary action label + handler. */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function BalanceCard({
  label,
  amount,
  currency = '$',
  available,
  pending,
  actionLabel,
  onAction,
  className,
}: BalanceCardProps) {
  return (
    <div className={cn('mat-primary rounded-card p-5 text-accent-ink', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm opacity-80">{label}</span>
        <Wallet className="size-5 opacity-80" aria-hidden="true" />
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{formatMoney(amount, currency)}</p>
      {(available !== undefined || pending !== undefined) && (
        <dl className="mt-3 flex gap-4 text-sm">
          {available !== undefined && (
            <div>
              <dt className="opacity-80">Available</dt>
              <dd className="font-medium tabular-nums">{formatMoney(available, currency)}</dd>
            </div>
          )}
          {pending !== undefined && (
            <div>
              <dt className="opacity-80">Pending</dt>
              <dd className="font-medium tabular-nums">{formatMoney(pending, currency)}</dd>
            </div>
          )}
        </dl>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={cn(
            'mt-4 inline-flex items-center gap-1.5 rounded-control bg-accent-ink/15 px-3 py-1.5 text-sm font-medium text-accent-ink',
            'transition-colors hover:bg-accent-ink/25',
            focusRing(),
          )}
        >
          <Plus className="size-4" aria-hidden="true" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ── Invoice / receipt ────────────────────────────────────────────────── */

export interface InvoiceLine {
  id: string;
  description: ReactNode;
  quantity?: number;
  amount: number;
}

export interface InvoiceReceiptProps {
  number: ReactNode;
  date: ReactNode;
  from?: ReactNode;
  to?: ReactNode;
  items: InvoiceLine[];
  /** Tax rate as a fraction, e.g. `0.08`. */
  taxRate?: number;
  currency?: string;
  className?: string;
}

export function InvoiceReceipt({
  number,
  date,
  from,
  to,
  items,
  taxRate = 0,
  currency = '$',
  className,
}: InvoiceReceiptProps) {
  const subtotal = items.reduce((acc, i) => acc + i.amount, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className={cn('mat-card rounded-card p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Invoice</p>
          <p className="text-xs text-ink-3">{number}</p>
        </div>
        <p className="text-xs text-ink-3">{date}</p>
      </div>
      {(from || to) && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          {from && (
            <div>
              <p className="font-medium uppercase tracking-wide text-ink-4">From</p>
              <p className="mt-0.5 text-ink-2">{from}</p>
            </div>
          )}
          {to && (
            <div>
              <p className="font-medium uppercase tracking-wide text-ink-4">To</p>
              <p className="mt-0.5 text-ink-2">{to}</p>
            </div>
          )}
        </div>
      )}
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-line/10 text-left text-xs uppercase tracking-wide text-ink-4">
            <th scope="col" className="pb-2 font-medium">
              Item
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-b border-line/10 last:border-0">
              <td className="py-2 text-ink-2">
                {i.description}
                {i.quantity !== undefined && <span className="text-ink-4"> × {i.quantity}</span>}
              </td>
              <td className="py-2 text-right tabular-nums text-ink">
                {formatMoney(i.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-3 flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-3">Subtotal</dt>
          <dd className="tabular-nums text-ink">{formatMoney(subtotal, currency)}</dd>
        </div>
        {taxRate > 0 && (
          <div className="flex justify-between">
            <dt className="text-ink-3">Tax ({Math.round(taxRate * 100)}%)</dt>
            <dd className="tabular-nums text-ink">{formatMoney(tax, currency)}</dd>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t border-line/10 pt-2 text-base font-semibold">
          <dt className="text-ink">Total</dt>
          <dd className="tabular-nums text-ink">{formatMoney(total, currency)}</dd>
        </div>
      </dl>
    </div>
  );
}

/* ── Budget bar ───────────────────────────────────────────────────────── */

export interface BudgetBarProps {
  label: ReactNode;
  spent: number;
  budget: number;
  currency?: string;
  className?: string;
}

export function BudgetBar({ label, spent, budget, currency = '$', className }: BudgetBarProps) {
  const pct = budget > 0 ? (spent / budget) * 100 : 0;
  const over = spent > budget;
  const near = !over && pct >= 80;
  const tone = over ? 'bg-danger' : near ? 'bg-warning' : 'bg-success';

  return (
    <div className={cn('mat-card rounded-card p-4', className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-xs tabular-nums text-ink-3">
          {formatMoney(spent, currency)} / {formatMoney(budget, currency)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={typeof label === 'string' ? `${label} budget` : 'Budget used'}
        aria-valuenow={Math.min(100, Math.round(pct))}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-skin ease-skin', tone)}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <p className={cn('mt-1.5 text-xs', over ? 'text-danger' : 'text-ink-3')}>
        {over
          ? `Over budget by ${formatMoney(spent - budget, currency)}`
          : `${formatMoney(budget - spent, currency)} left`}
      </p>
    </div>
  );
}
