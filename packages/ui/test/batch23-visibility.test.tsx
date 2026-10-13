/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { Hide, Show, VisuallyHidden } from '../components/surface/Primitives';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 23 responsive visibility', () => {
  it('Show hides below the breakpoint and shows at it', () => {
    const { container } = render(
      <Show above="lg">
        <span>wide only</span>
      </Show>,
    );
    const el = first(container);
    expect(el.className).toContain('hidden');
    expect(el.className).toContain('lg:block');
    expect(el.textContent).toBe('wide only');
  });

  it('Hide shows below the breakpoint and hides at it', () => {
    const { container } = render(<Hide above="sm">narrow only</Hide>);
    const el = first(container);
    expect(el.className).toContain('block');
    expect(el.className).toContain('sm:hidden');
  });

  it('VisuallyHidden is screen-reader only by default', () => {
    const { container } = render(<VisuallyHidden>Label</VisuallyHidden>);
    const el = first(container);
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el.className).toContain('sr-only');
    expect(el.className).not.toContain('focus:not-sr-only');
  });

  it('VisuallyHidden can reveal itself on focus', () => {
    const { container } = render(
      <VisuallyHidden as="div" focusable>
        Skip to content
      </VisuallyHidden>,
    );
    const el = first(container);
    expect(el.tagName.toLowerCase()).toBe('div');
    expect(el.className).toContain('sr-only');
    expect(el.className).toContain('focus:not-sr-only');
  });
});
