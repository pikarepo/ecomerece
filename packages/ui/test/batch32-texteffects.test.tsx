/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { GradientText, OutlineText } from '../components/surface/TextEffects';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 32 text effects', () => {
  it('GradientText clips a skin role gradient to the text', () => {
    const { container } = render(<GradientText material="primary">Gradient</GradientText>);
    const el = first(container);
    expect(el.className).toContain('bg-clip-text');
    expect(el.className).toContain('text-transparent');
    expect(el.getAttribute('data-effect')).toBe('gradient');
    expect(el.getAttribute('data-material')).toBe('primary');
    expect(el.textContent).toBe('Gradient');
  });

  it('GradientText allows an element override', () => {
    const { container } = render(
      <GradientText as="h2" material="card">
        Title
      </GradientText>,
    );
    expect(first(container).tagName.toLowerCase()).toBe('h2');
    expect(first(container).getAttribute('data-material')).toBe('card');
  });

  it('OutlineText strokes transparent text from a skin role', () => {
    const { container } = render(
      <OutlineText material="control" strokeWidth="2px">
        Outline
      </OutlineText>,
    );
    const el = first(container);
    expect(el.className).toContain('text-transparent');
    expect(el.getAttribute('data-effect')).toBe('outline');
    expect(el.getAttribute('data-material')).toBe('control');
  });
});
