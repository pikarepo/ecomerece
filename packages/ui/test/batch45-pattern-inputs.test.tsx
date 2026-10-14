/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  CardInput,
  CardNumberInput,
  CoordinatesInput,
  detectCardBrand,
  formatCardNumber,
  formatIban,
  formatSsn,
  IbanInput,
  isValidIban,
  PostalCodeInput,
  SsnInput,
} from '../components/form/PatternInputs';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('batch 45 pattern inputs', () => {
  it('detects card brands and formats the number', () => {
    expect(detectCardBrand('4111111111111111')).toBe('visa');
    expect(detectCardBrand('5555555555554444')).toBe('mastercard');
    expect(detectCardBrand('378282246310005')).toBe('amex');
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('CardNumberInput shows the brand badge and formats as you type', () => {
    const { container, unmount } = render(<CardNumberInput />);
    const input = container.querySelector('input') as HTMLInputElement;
    act(() => type(input, '4242424242424242'));
    expect(input.value).toBe('4242 4242 4242 4242');
    expect(container.querySelector('[data-brand="visa"]')).not.toBeNull();
    unmount();
  });

  it('CardInput composes number, expiry and cvc', () => {
    const { container, unmount } = render(<CardInput />);
    expect(container.querySelectorAll('input').length).toBe(3);
    unmount();
  });

  it('validates and formats IBAN', () => {
    expect(formatIban('DE89370400440532013000')).toBe('DE89 3704 0044 0532 0130 00');
    expect(isValidIban('DE89370400440532013000')).toBe(true);
    expect(isValidIban('DE89370400440532013001')).toBe(false);
    const { unmount } = render(<IbanInput defaultValue="DE89370400440532013000" />);
    unmount();
  });

  it('formats SSN and supports masking', () => {
    expect(formatSsn('123456789')).toBe('123-45-6789');
    const { container, unmount } = render(<SsnInput defaultValue="123456789" mask />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).toContain('•');
    expect(input.value.endsWith('6789')).toBe(true);
    unmount();
  });

  it('uppercases postal codes and validates coordinates', () => {
    const seen: Array<{ latitude: number | ''; longitude: number | '' }> = [];
    const { container, unmount } = render(
      <div>
        <PostalCodeInput />
        <CoordinatesInput onValueChange={(c) => seen.push(c)} />
      </div>,
    );
    const postal = container.querySelectorAll('input')[0] as HTMLInputElement;
    act(() => type(postal, 'sw1a 1aa'));
    expect(postal.value).toBe('SW1A1AA');
    const lat = container.querySelector('[aria-label="Latitude"]') as HTMLInputElement;
    act(() => type(lat, '200'));
    expect(seen.at(-1)?.latitude).toBe(200);
    unmount();
  });
});
