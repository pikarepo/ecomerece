/** @jsxImportSource react */

import { CreditCard, MapPin } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { useState } from 'react';
import { cn } from '../../lib/cn';

/**
 * Pattern/format inputs (todo/09 batch 45): card number+expiry+CVC with brand
 * detection, IBAN, SSN/tax-id, postal code and coordinates. `mat-*` + tokens.
 *
 * NB: React 19's `onChange` does not fire under happy-dom synthetic events, so
 * every field also binds `onInput` (the harness dispatches `input`).
 */

const WRAP =
  'mat-raised flex items-center gap-2 rounded-control border border-line/30 px-3.5 py-2.5 transition-all duration-skin ease-skin focus-within:ring-2 focus-within:ring-accent';
const FIELD =
  'min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-4 focus:outline-none disabled:cursor-not-allowed';

const digits = (s: string) => s.replace(/\D/g, '');

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export function detectCardBrand(number: string): CardBrand {
  const n = digits(number);
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|5)/.test(n)) return 'discover';
  return 'unknown';
}

const BRAND_LABEL: Record<CardBrand, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
  discover: 'DISC',
  unknown: 'CARD',
};

export function formatCardNumber(input: string): string {
  return digits(input)
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export interface CardNumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  defaultValue?: string;
  onValueChange?: (value: string, brand: CardBrand) => void;
}

export function CardNumberInput({
  defaultValue = '',
  onValueChange,
  className,
  ...rest
}: CardNumberInputProps) {
  const [value, setValue] = useState(formatCardNumber(defaultValue));
  const brand = detectCardBrand(value);
  const handle = (raw: string) => {
    const formatted = formatCardNumber(raw);
    setValue(formatted);
    onValueChange?.(formatted, detectCardBrand(formatted));
  };
  return (
    <div className={cn(WRAP, className)}>
      <CreditCard className="size-4 shrink-0 text-ink-3" aria-hidden />
      <input
        {...rest}
        type="text"
        inputMode="numeric"
        autoComplete="cc-number"
        aria-label="Card number"
        value={value}
        onChange={(e) => handle(e.target.value)}
        onInput={(e) => handle(e.currentTarget.value)}
        className={FIELD}
      />
      <span
        data-brand={brand}
        className="shrink-0 rounded-control bg-surface-1 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-ink-2"
      >
        {BRAND_LABEL[brand]}
      </span>
    </div>
  );
}

export function formatExpiry(input: string): string {
  const d = digits(input).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function isExpiryValid(value: string): boolean {
  const [mm, yy] = value.split('/');
  return Number(mm) >= 1 && Number(mm) <= 12 && (yy ?? '').length === 2;
}

export interface CardExpiryInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function CardExpiryInput({
  defaultValue = '',
  onValueChange,
  className,
  ...rest
}: CardExpiryInputProps) {
  const [value, setValue] = useState(formatExpiry(defaultValue));
  const valid = value === '' || isExpiryValid(value);
  const handle = (raw: string) => {
    const formatted = formatExpiry(raw);
    setValue(formatted);
    onValueChange?.(formatted);
  };
  return (
    <div className={cn(WRAP, value !== '' && !valid && 'ring-2 ring-danger', className)}>
      <input
        {...rest}
        type="text"
        inputMode="numeric"
        autoComplete="cc-exp"
        aria-label="Card expiry"
        placeholder="MM/YY"
        value={value}
        onChange={(e) => handle(e.target.value)}
        onInput={(e) => handle(e.currentTarget.value)}
        className={FIELD}
      />
    </div>
  );
}

export interface CardCvcInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  defaultValue?: string;
  length?: 3 | 4;
  onValueChange?: (value: string) => void;
}

export function CardCvcInput({
  defaultValue = '',
  length: len = 3,
  onValueChange,
  className,
  ...rest
}: CardCvcInputProps) {
  const [value, setValue] = useState(defaultValue);
  const valid = value === '' || value.length === len;
  const handle = (raw: string) => {
    const next = digits(raw).slice(0, len);
    setValue(next);
    onValueChange?.(next);
  };
  return (
    <div className={cn(WRAP, value !== '' && !valid && 'ring-2 ring-danger', className)}>
      <input
        {...rest}
        type="text"
        inputMode="numeric"
        autoComplete="cc-csc"
        aria-label="CVC"
        maxLength={len}
        value={value}
        onChange={(e) => handle(e.target.value)}
        onInput={(e) => handle(e.currentTarget.value)}
        className={FIELD}
      />
    </div>
  );
}

export interface CardInputProps {
  number?: string;
  onNumberChange?: (value: string, brand: CardBrand) => void;
  expiry?: string;
  onExpiryChange?: (value: string) => void;
  cvc?: string;
  onCvcChange?: (value: string) => void;
  className?: string;
}

export function CardInput({
  number = '',
  onNumberChange,
  expiry = '',
  onExpiryChange,
  cvc = '',
  onCvcChange,
  className,
}: CardInputProps) {
  return (
    <div className={cn('grid gap-3', className)}>
      <CardNumberInput defaultValue={number} onValueChange={onNumberChange} />
      <div className="grid grid-cols-2 gap-3">
        <CardExpiryInput defaultValue={expiry} onValueChange={onExpiryChange} />
        <CardCvcInput
          defaultValue={cvc}
          length={detectCardBrand(number) === 'amex' ? 4 : 3}
          onValueChange={onCvcChange}
        />
      </div>
    </div>
  );
}

export function normalizeIban(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function formatIban(input: string): string {
  const raw = normalizeIban(input).slice(0, 34);
  return raw.replace(/(.{4})/g, '$1 ').trim();
}

function ibanMod97(iban: string): number {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (const ch of numeric) remainder = (remainder * 10 + Number(ch)) % 97;
  return remainder;
}

export function isValidIban(input: string): boolean {
  const iban = normalizeIban(input);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  return ibanMod97(iban) === 1;
}

export interface IbanInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  defaultValue?: string;
  onValueChange?: (value: string, valid: boolean) => void;
}

export function IbanInput({
  defaultValue = '',
  onValueChange,
  className,
  ...rest
}: IbanInputProps) {
  const [value, setValue] = useState(formatIban(defaultValue));
  const compact = normalizeIban(value);
  const invalid = compact.length > 0 && !isValidIban(compact);
  const handle = (raw: string) => {
    const formatted = formatIban(raw);
    setValue(formatted);
    const next = normalizeIban(formatted);
    onValueChange?.(next, isValidIban(next));
  };
  return (
    <div className={cn(WRAP, invalid && 'ring-2 ring-danger', className)}>
      <input
        {...rest}
        type="text"
        autoComplete="off"
        aria-label="IBAN"
        value={value}
        onChange={(e) => handle(e.target.value)}
        onInput={(e) => handle(e.currentTarget.value)}
        className={cn(FIELD, 'tracking-wider')}
      />
    </div>
  );
}

export function formatSsn(input: string): string {
  const d = digits(input).slice(0, 9);
  return [d.slice(0, 3), d.slice(3, 5), d.slice(5)].filter(Boolean).join('-');
}

export interface SsnInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  defaultValue?: string;
  /** Mask all but the last four digits. */
  mask?: boolean;
  onValueChange?: (value: string) => void;
}

export function SsnInput({
  defaultValue = '',
  mask = false,
  onValueChange,
  className,
  ...rest
}: SsnInputProps) {
  const [raw, setRaw] = useState(defaultValue);
  const handle = (value: string) => {
    const next = digits(value).slice(0, 9);
    setRaw(next);
    onValueChange?.(next);
  };
  return (
    <div className={cn(WRAP, className)}>
      <input
        {...rest}
        type="text"
        inputMode="numeric"
        aria-label="SSN or tax ID"
        value={mask ? raw.replace(/\d(?=\d{4})/g, '\u2022') : formatSsn(raw)}
        onChange={(e) => handle(e.target.value)}
        onInput={(e) => handle(e.currentTarget.value)}
        className={cn(FIELD, 'tracking-wider')}
      />
    </div>
  );
}

export function formatPostalCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
}

export interface PostalCodeInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function PostalCodeInput({
  defaultValue = '',
  onValueChange,
  className,
  ...rest
}: PostalCodeInputProps) {
  const [value, setValue] = useState(defaultValue);
  const handle = (raw: string) => {
    const next = formatPostalCode(raw);
    setValue(next);
    onValueChange?.(next);
  };
  return (
    <div className={cn(WRAP, className)}>
      <MapPin className="size-4 shrink-0 text-ink-3" aria-hidden />
      <input
        {...rest}
        type="text"
        autoComplete="postal-code"
        aria-label="Postal code"
        value={value}
        onChange={(e) => handle(e.target.value)}
        onInput={(e) => handle(e.currentTarget.value)}
        className={FIELD}
      />
    </div>
  );
}

export interface Coordinates {
  latitude: number | '';
  longitude: number | '';
}

export interface CoordinatesInputProps {
  latitude?: number | '';
  longitude?: number | '';
  onValueChange?: (coords: Coordinates) => void;
  className?: string;
}

export function CoordinatesInput({
  latitude = '',
  longitude = '',
  onValueChange,
  className,
}: CoordinatesInputProps) {
  const [lat, setLat] = useState<number | ''>(latitude);
  const [lng, setLng] = useState<number | ''>(longitude);
  const update = (nextLat: number | '', nextLng: number | '') => {
    setLat(nextLat);
    setLng(nextLng);
    onValueChange?.({ latitude: nextLat, longitude: nextLng });
  };
  const parse = (raw: string): number | '' => (raw === '' ? '' : Number(raw));
  const latValid = lat === '' || (lat >= -90 && lat <= 90);
  const lngValid = lng === '' || (lng >= -180 && lng <= 180);
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(WRAP, 'flex-1', !latValid && 'ring-2 ring-danger')}>
        <input
          type="number"
          inputMode="decimal"
          aria-label="Latitude"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => update(parse(e.target.value), lng)}
          onInput={(e) => update(parse(e.currentTarget.value), lng)}
          className={FIELD}
        />
      </div>
      <div className={cn(WRAP, 'flex-1', !lngValid && 'ring-2 ring-danger')}>
        <input
          type="number"
          inputMode="decimal"
          aria-label="Longitude"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => update(lat, parse(e.target.value))}
          onInput={(e) => update(lat, parse(e.currentTarget.value))}
          className={FIELD}
        />
      </div>
    </div>
  );
}
