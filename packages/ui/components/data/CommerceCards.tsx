/** @jsxImportSource react */

import type { LucideIcon } from 'lucide-react';
import {
  Bath,
  BedDouble,
  Car,
  Coffee,
  Dumbbell,
  Gift,
  Heart,
  ImageOff,
  MapPin,
  Maximize,
  Plane,
  ShoppingCart,
  Star,
  Ticket,
  Tv,
  Utensils,
  Waves,
  Wifi,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { focusRing } from '../../lib/focus';
import { Button } from '../controls/Button';
import { Badge } from '../surface/Badge';
import { Rating } from '../surface/Rating';
import { StockIndicator, type StockLevel } from './StockIndicator';

type Tone = 'accent' | 'success' | 'warning' | 'danger';
type CoverRatio = 'video' | 'wide' | 'square' | 'poster';

/** Locale-stable currency formatting for commerce cards. */
export function formatPrice(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

/** Mask all but the last four digits, grouped in fours (e.g. `•••• •••• •••• 4242`). */
export function maskCardNumber(number: string): string {
  const digits = number.replace(/\s+/g, '');
  const last4 = digits.slice(-4).padStart(4, '•');
  return `•••• •••• •••• ${last4}`;
}

const RATIO: Record<CoverRatio, string> = {
  video: 'aspect-video',
  wide: 'aspect-[16/9]',
  square: 'aspect-square',
  poster: 'aspect-[2/3]',
};

const AMENITY_ICON: Record<string, LucideIcon> = {
  wifi: Wifi,
  breakfast: Coffee,
  parking: Car,
  gym: Dumbbell,
  pool: Waves,
  restaurant: Utensils,
  tv: Tv,
};

function Shell({
  href,
  children,
  className,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const cls = cn('group mat-card block overflow-hidden rounded-card', className);
  if (href) {
    return (
      <a href={href} className={cn(cls, focusRing())}>
        {children}
      </a>
    );
  }
  return <article className={cls}>{children}</article>;
}

function Cover({
  src,
  alt,
  ratio = 'video',
  children,
}: {
  src?: string;
  alt?: string;
  ratio?: CoverRatio;
  children?: ReactNode;
}) {
  return (
    <div className={cn('relative w-full overflow-hidden bg-surface-3', RATIO[ratio])}>
      {src ? (
        <img
          src={src}
          alt={alt ?? ''}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-skin ease-skin group-hover:scale-105"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-ink-4">
          <ImageOff className="size-8" aria-hidden="true" />
        </span>
      )}
      {children}
    </div>
  );
}

function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3', className)}>
      {children}
    </p>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" className="text-ink-4">
      ·
    </span>
  );
}

function CardTitle({ children, link }: { children: ReactNode; link?: boolean }) {
  return (
    <h3 className="text-sm font-medium text-ink">
      {link ? <span className="group-hover:underline">{children}</span> : children}
    </h3>
  );
}

function PriceRow({
  price,
  originalPrice,
  currency,
}: {
  price: number;
  originalPrice?: number;
  currency?: string;
}) {
  const discount =
    originalPrice && originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : undefined;
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-sm font-semibold text-ink">{formatPrice(price, currency)}</span>
      {originalPrice !== undefined && originalPrice > price && (
        <span className="text-xs text-ink-4 line-through">
          {formatPrice(originalPrice, currency)}
        </span>
      )}
      {discount !== undefined && <Badge tone="danger">-{discount}%</Badge>}
    </span>
  );
}

export interface ProductCardProps {
  title: string;
  image?: string;
  href?: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  badgeTone?: Tone;
  stock?: StockLevel;
  onAddToCart?: () => void;
  onWishlist?: () => void;
  className?: string;
}

/** Commerce card (todo/09 §F batch 85) — product with price, rating & stock. */
export function ProductCard({
  title,
  image,
  href,
  price,
  originalPrice,
  currency,
  rating,
  reviews,
  badge,
  badgeTone = 'accent',
  stock,
  onAddToCart,
  onWishlist,
  className,
}: ProductCardProps) {
  return (
    <Shell href={href} className={className}>
      <Cover src={image} alt={title} ratio="square">
        {badge && (
          <span className="absolute left-2 top-2">
            <Badge tone={badgeTone}>{badge}</Badge>
          </span>
        )}
        {onWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onWishlist();
            }}
            aria-label="Add to wishlist"
            className={cn(
              'absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-ground/70 text-ink backdrop-blur-sm transition-colors hover:text-danger',
              focusRing(),
            )}
          >
            <Heart className="size-4" aria-hidden="true" />
          </button>
        )}
      </Cover>
      <div className="p-4">
        <CardTitle link={Boolean(href)}>{title}</CardTitle>
        {rating !== undefined && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Rating value={rating} readOnly size="sm" />
            {reviews !== undefined && <span className="text-xs text-ink-3">({reviews})</span>}
          </div>
        )}
        <div className="mt-2">
          <PriceRow price={price} originalPrice={originalPrice} currency={currency} />
        </div>
        {stock && <StockIndicator level={stock} className="mt-2" />}
        {onAddToCart && (
          <Button size="sm" variant="primary" fullWidth className="mt-3" onClick={onAddToCart}>
            <ShoppingCart className="size-4" aria-hidden="true" />
            Add to cart
          </Button>
        )}
      </div>
    </Shell>
  );
}

export interface PropertyCardProps {
  title: string;
  image?: string;
  href?: string;
  price: number;
  currency?: string;
  priceInterval?: 'month' | 'night' | 'sqft';
  address?: string;
  beds?: number;
  baths?: number;
  area?: number;
  tag?: string;
  tagTone?: Tone;
  className?: string;
}

/** Commerce card (todo/09 §F batch 85) — property/listing. */
export function PropertyCard({
  title,
  image,
  href,
  price,
  currency,
  priceInterval,
  address,
  beds,
  baths,
  area,
  tag,
  tagTone = 'accent',
  className,
}: PropertyCardProps) {
  return (
    <Shell href={href} className={className}>
      <Cover src={image} alt={title} ratio="wide">
        {tag && (
          <span className="absolute left-2 top-2">
            <Badge tone={tagTone}>{tag}</Badge>
          </span>
        )}
      </Cover>
      <div className="p-4">
        <span className="flex items-baseline gap-1">
          <span className="text-base font-semibold text-ink">{formatPrice(price, currency)}</span>
          {priceInterval && <span className="text-xs text-ink-3">/{priceInterval}</span>}
        </span>
        <div className="mt-1">
          <CardTitle link={Boolean(href)}>{title}</CardTitle>
        </div>
        {address && (
          <Meta className="mt-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{address}</span>
          </Meta>
        )}
        {(beds !== undefined || baths !== undefined || area !== undefined) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
            {beds !== undefined && (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="size-3.5" aria-hidden="true" />
                {beds} bd
              </span>
            )}
            {baths !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Bath className="size-3.5" aria-hidden="true" />
                {baths} ba
              </span>
            )}
            {area !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Maximize className="size-3.5" aria-hidden="true" />
                {area} sqft
              </span>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

export interface HotelCardProps {
  name: string;
  image?: string;
  href?: string;
  location?: string;
  stars?: number;
  rating?: number;
  reviews?: number;
  pricePerNight: number;
  currency?: string;
  amenities?: string[];
  className?: string;
}

/** Commerce card (todo/09 §F batch 85) — hotel with star class & nightly rate. */
export function HotelCard({
  name,
  image,
  href,
  location,
  stars,
  rating,
  reviews,
  pricePerNight,
  currency,
  amenities,
  className,
}: HotelCardProps) {
  return (
    <Shell href={href} className={className}>
      <Cover src={image} alt={name} ratio="wide">
        {rating !== undefined && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-chip bg-ground/80 px-1.5 py-0.5 text-xs font-semibold text-ink">
            <Star className="size-3 fill-current text-warning" aria-hidden="true" />
            {rating.toFixed(1)}
          </span>
        )}
      </Cover>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle link={Boolean(href)}>{name}</CardTitle>
          {stars !== undefined && (
            <span
              role="img"
              className="inline-flex shrink-0 gap-0.5"
              aria-label={`${stars} star hotel`}
            >
              {Array.from({ length: stars }, (_, i) => (
                <Star key={i} className="size-3 fill-current text-warning" aria-hidden="true" />
              ))}
            </span>
          )}
        </div>
        {location && (
          <Meta className="mt-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{location}</span>
            {reviews !== undefined && <Dot />}
            {reviews !== undefined && <span>{reviews} reviews</span>}
          </Meta>
        )}
        {amenities && amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-ink-3">
            {amenities.map((a) => {
              const Icon = AMENITY_ICON[a];
              return Icon ? (
                <Icon key={a} role="img" className="size-4" aria-label={a} />
              ) : (
                <Badge key={a}>{a}</Badge>
              );
            })}
          </div>
        )}
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-sm font-semibold text-ink">
            {formatPrice(pricePerNight, currency)}
          </span>
          <span className="text-xs text-ink-3">/ night</span>
        </div>
      </div>
    </Shell>
  );
}

export interface FlightCardProps {
  airline: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  duration?: string;
  stops?: number;
  price: number;
  currency?: string;
  href?: string;
  onSelect?: () => void;
  className?: string;
}

/** Commerce card (todo/09 §F batch 85) — flight itinerary with price & select. */
export function FlightCard({
  airline,
  from,
  to,
  departTime,
  arriveTime,
  duration,
  stops = 0,
  price,
  currency,
  href,
  onSelect,
  className,
}: FlightCardProps) {
  const stopsLabel = stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`;
  return (
    <Shell href={href} className={cn('p-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <Plane className="size-4 shrink-0 text-ink-3" aria-hidden="true" />
          {airline}
        </span>
        <div className="flex flex-1 items-center gap-3">
          <div className="text-center">
            <p className="text-sm font-semibold text-ink">{departTime}</p>
            <p className="text-xs text-ink-3">{from}</p>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <span className="text-[11px] text-ink-3">{duration}</span>
            <span className="my-0.5 h-px w-full bg-line/40" aria-hidden="true" />
            <span className="text-[11px] text-ink-3">{stopsLabel}</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-ink">{arriveTime}</p>
            <p className="text-xs text-ink-3">{to}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <span className="text-sm font-semibold text-ink">{formatPrice(price, currency)}</span>
          {onSelect && (
            <Button size="sm" variant="primary" onClick={onSelect}>
              Select
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}

export interface TicketCardProps {
  event: string;
  date?: ReactNode;
  venue?: string;
  section?: string;
  row?: string;
  seat?: string;
  price?: number;
  currency?: string;
  code?: string;
  href?: string;
  className?: string;
}

function Notch({ side }: { side: 'left' | 'right' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-ground',
        side === 'left' ? '-left-2' : '-right-2',
      )}
    />
  );
}

/** Commerce card (todo/09 §F batch 85) — event ticket with a stub. */
export function TicketCard({
  event,
  date,
  venue,
  section,
  row,
  seat,
  price,
  currency,
  code,
  href,
  className,
}: TicketCardProps) {
  return (
    <article className={cn('group mat-card relative flex overflow-hidden rounded-card', className)}>
      <div className="min-w-0 flex-1 p-4">
        {date && (
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">{date}</p>
        )}
        <h3 className="mt-1 text-sm font-medium text-ink">
          {href ? (
            <a href={href} className={cn('group-hover:underline', focusRing())}>
              {event}
            </a>
          ) : (
            event
          )}
        </h3>
        {venue && (
          <Meta className="mt-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{venue}</span>
          </Meta>
        )}
        {(section || row || seat) && (
          <Meta className="mt-2">
            {section && <span>Sec {section}</span>}
            {section && row && <Dot />}
            {row && <span>Row {row}</span>}
            {row && seat && <Dot />}
            {seat && <span>Seat {seat}</span>}
          </Meta>
        )}
      </div>
      <div className="relative flex w-28 shrink-0 flex-col items-center justify-center gap-1 border-l border-dashed border-line/50 p-3 text-center">
        <Notch side="left" />
        <Ticket className="size-4 text-ink-3" aria-hidden="true" />
        {price !== undefined && (
          <span className="text-sm font-semibold text-ink">{formatPrice(price, currency)}</span>
        )}
        {code && <span className="font-mono text-[11px] tracking-wide text-ink-3">{code}</span>}
      </div>
    </article>
  );
}

export interface CouponCardProps {
  discount: string;
  title?: string;
  code: string;
  expires?: ReactNode;
  tone?: Tone;
  onCopy?: () => void;
  className?: string;
}

/** Commerce card (todo/09 §F batch 85) — coupon with a dashed code stub. */
export function CouponCard({
  discount,
  title,
  code,
  expires,
  tone = 'accent',
  onCopy,
  className,
}: CouponCardProps) {
  return (
    <div
      className={cn(
        'group mat-card relative flex overflow-hidden rounded-card border border-dashed border-line/60',
        className,
      )}
    >
      <div className="flex w-28 shrink-0 flex-col items-center justify-center p-3 text-center">
        <span className="text-lg font-bold text-accent">{discount}</span>
        {title && <span className="mt-0.5 text-[11px] text-ink-3">{title}</span>}
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-1 border-l border-dashed border-line/60 p-3">
        <Notch side="left" />
        <Badge tone={tone}>{code}</Badge>
        {expires && <span className="text-[11px] text-ink-3">Expires {expires}</span>}
        {onCopy && (
          <Button size="sm" variant="ghost" className="mt-1 self-start px-0" onClick={onCopy}>
            Copy code
          </Button>
        )}
      </div>
    </div>
  );
}

type CardVisualTone = 'accent' | 'raised' | 'panel';
const CARD_MATERIAL: Record<CardVisualTone, string> = {
  accent: 'mat-primary text-accent-ink',
  raised: 'mat-raised text-ink',
  panel: 'mat-panel text-ink',
};

export interface CreditCardVisualProps {
  brand: string;
  number: string;
  holder?: string;
  expiry?: string;
  tone?: CardVisualTone;
  label?: string;
  className?: string;
}

/** Commerce card (todo/09 §F batch 85) — credit-card visual (masked number). */
export function CreditCardVisual({
  brand,
  number,
  holder,
  expiry,
  tone = 'accent',
  label,
  className,
}: CreditCardVisualProps) {
  const aria = `${label ?? 'Card'} ${brand} ending ${number.replace(/\s+/g, '').slice(-4)}`;
  return (
    // biome-ignore lint/a11y/useSemanticElements: credit-card visual is a labelled graphic, not a form group
    <div
      role="group"
      aria-label={aria}
      className={cn(
        'flex aspect-[1.586/1] w-full max-w-xs flex-col justify-between rounded-card p-4',
        CARD_MATERIAL[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold tracking-wide">{brand}</span>
        <span className="text-xs opacity-80">Credit</span>
      </div>
      <p className="font-mono text-base tracking-[0.2em]">{maskCardNumber(number)}</p>
      <div className="flex items-end justify-between text-xs">
        <span className="truncate uppercase tracking-wide">{holder ?? ''}</span>
        {expiry && <span className="font-mono">{expiry}</span>}
      </div>
    </div>
  );
}

export interface GiftCardProps {
  brand: string;
  balance: number;
  currency?: string;
  code?: string;
  expiry?: ReactNode;
  tone?: CardVisualTone;
  className?: string;
}

/** Commerce card (todo/09 §F batch 85) — prepaid gift-card visual. */
export function GiftCard({
  brand,
  balance,
  currency,
  code,
  expiry,
  tone = 'accent',
  className,
}: GiftCardProps) {
  return (
    <div
      className={cn(
        'flex aspect-[1.586/1] w-full max-w-xs flex-col justify-between rounded-card p-4',
        CARD_MATERIAL[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold tracking-wide">{brand}</span>
        <Gift className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide opacity-80">Balance</p>
        <p className="text-xl font-bold">{formatPrice(balance, currency)}</p>
      </div>
      <div className="flex items-end justify-between text-xs">
        {code && <span className="font-mono tracking-wide">{code}</span>}
        {expiry && <span>{expiry}</span>}
      </div>
    </div>
  );
}

export type ListingCardProps = PropertyCardProps;

/** Alias for {@link PropertyCard}. */
export function ListingCard(props: ListingCardProps) {
  return <PropertyCard {...props} />;
}
