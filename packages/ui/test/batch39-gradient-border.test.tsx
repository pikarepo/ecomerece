/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { GradientBorderButton } from '../components/controls/GradientBorderButton';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 39 gradient border button', () => {
  it('renders a button with the gradient-border class and variant fill', () => {
    const { container } = render(<GradientBorderButton>Buy now</GradientBorderButton>);
    const btn = first(container) as HTMLButtonElement;
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.className).toContain('fx-gradbtn');
    expect(btn.className).toContain('mat-primary');
    expect(btn.textContent).toBe('Buy now');
  });

  it('drives the ring from the role glow + edge tokens', () => {
    const { container } = render(
      <GradientBorderButton variant="secondary">Ghost</GradientBorderButton>,
    );
    const btn = first(container) as HTMLButtonElement;
    expect(btn.className).toContain('mat-control');
    expect(btn.style.getPropertyValue('--m-fx-grad-a')).toBe(
      'var(--m-control-glow, var(--m-fx-grad-a-fallback))',
    );
    expect(btn.style.getPropertyValue('--m-fx-grad-b')).toBe(
      'var(--m-control-edge, var(--m-fx-grad-b-fallback))',
    );
  });

  it('honours a custom `material` role for the token source', () => {
    const { container } = render(
      <GradientBorderButton material="raised" variant="secondary">
        Raised
      </GradientBorderButton>,
    );
    const btn = first(container) as HTMLButtonElement;
    expect(btn.style.getPropertyValue('--m-fx-grad-a')).toContain('var(--m-raised-glow');
    expect(btn.style.getPropertyValue('--m-fx-grad-b')).toContain('var(--m-raised-edge');
  });

  it('forwards native props (onClick, disabled, size)', () => {
    let clicks = 0;
    const { container } = render(
      <GradientBorderButton size="lg" onClick={() => clicks++}>
        Go
      </GradientBorderButton>,
    );
    const btn = first(container) as HTMLButtonElement;
    expect(btn.className).toContain('min-h-12');
    btn.click();
    expect(clicks).toBe(1);
  });
});
