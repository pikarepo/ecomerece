/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  EffectButton,
  GlowButton,
  MagneticButton,
  RippleButton,
  ShimmerButton,
} from '../components/controls/EffectButton';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

const rect = (w: number, h: number, left = 0, top = 0) =>
  ({
    width: w,
    height: h,
    left,
    top,
    right: left + w,
    bottom: top + h,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

describe('batch 38 effect buttons', () => {
  it('RippleButton spawns a ripple on pointerdown', () => {
    const { container } = render(<RippleButton>Save</RippleButton>);
    const btn = first(container) as HTMLButtonElement;
    expect(btn.tagName).toBe('BUTTON');
    expect(container.querySelector('[data-fx-ripple]')).toBeNull();

    btn.getBoundingClientRect = () => rect(120, 40);
    act(() => fire(btn, 'pointerdown', { clientX: 30, clientY: 20 }));

    const ripple = container.querySelector('[data-fx-ripple]') as HTMLElement;
    expect(ripple).not.toBeNull();
    expect(ripple.className).toContain('fx-ripple');
  });

  it('ShimmerButton carries a role-driven sheen overlay', () => {
    const { container } = render(<ShimmerButton>Buy now</ShimmerButton>);
    const btn = first(container) as HTMLButtonElement;
    expect(btn.className).toContain('fx-btn');

    const overlay = btn.querySelector('.fx-shimmer') as HTMLElement;
    expect(overlay).not.toBeNull();
    const sheen = btn.style.getPropertyValue('--m-fx-sheen');
    expect(sheen).toContain('var(--m-primary-sheen');
  });

  it('GlowButton reads the role glow token with a token-based fallback', () => {
    const { container } = render(
      <GlowButton material="control" variant="secondary">
        Glow
      </GlowButton>,
    );
    const btn = first(container) as HTMLButtonElement;
    expect(btn.className).toContain('fx-glow');
    const glow = btn.style.getPropertyValue('--m-fx-glow-color');
    expect(glow).toBe('var(--m-control-glow, var(--m-fx-glow-fallback))');
  });

  it('MagneticButton translates toward the pointer and resets on leave', () => {
    const { container } = render(<MagneticButton>Pull</MagneticButton>);
    const btn = first(container) as HTMLButtonElement;
    btn.getBoundingClientRect = () => rect(100, 40, 0, 0);

    act(() => fire(btn, 'pointermove', { clientX: 100, clientY: 40 }));
    expect(btn.style.transform).toContain('translate3d(6px, 6px, 0)');

    act(() => fire(btn, 'pointerout'));
    expect(btn.style.transform).toContain('translate3d(0px, 0px, 0)');
  });

  it('EffectButton honours the `material` role token', () => {
    const { container } = render(
      <EffectButton effect="shimmer" material="raised" variant="secondary">
        Raised
      </EffectButton>,
    );
    const btn = first(container) as HTMLButtonElement;
    expect(btn.style.getPropertyValue('--m-fx-sheen')).toContain('var(--m-raised-sheen');
  });
});
