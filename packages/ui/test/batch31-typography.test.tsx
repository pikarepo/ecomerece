/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { Display, Subtitle } from '../components/surface/Primitives';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 31 typography variants', () => {
  it('Display renders an oversized heading with the chosen scale', () => {
    const { container } = render(<Display size="lg">Hero</Display>);
    const el = first(container);
    expect(el.tagName.toLowerCase()).toBe('h1');
    expect(el.className).toContain('text-6xl');
    expect(el.textContent).toBe('Hero');
  });

  it('Display respects tone and element override', () => {
    const { container } = render(
      <Display as="p" size="sm" tone="ink-3">
        Caption
      </Display>,
    );
    const el = first(container);
    expect(el.tagName.toLowerCase()).toBe('p');
    expect(el.className).toContain('text-4xl');
    expect(el.className).toContain('text-ink-3');
  });

  it('Subtitle is a medium-weight supporting line', () => {
    const { container } = render(<Subtitle>Supporting copy</Subtitle>);
    const el = first(container);
    expect(el.tagName.toLowerCase()).toBe('p');
    expect(el.className).toContain('font-medium');
    expect(el.className).toContain('text-lg');
    expect(el.className).toContain('text-ink-2');
  });
});
