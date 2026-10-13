/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { Bleed, Cluster, Frame, Switcher } from '../components/surface/Primitives';
import { registerDom, render } from './_dom';

registerDom();

describe('batch 19 layout patterns', () => {
  it('Frame locks an aspect ratio and crops children', () => {
    const a = render(<Frame data-testid="f" />);
    const el = a.container.querySelector('[data-testid="f"]') as HTMLElement;
    expect(el.className).toContain('aspect-video');
    expect(el.className).toContain('overflow-hidden');
    expect(el.className).toContain('[&>img]:object-cover');

    const b = render(<Frame ratio="photo" />);
    expect((b.container.firstElementChild as HTMLElement).className).toContain('aspect-[4/3]');

    const c = render(<Frame ratio="none" />);
    expect((c.container.firstElementChild as HTMLElement).className).not.toContain('aspect-');
  });

  it('Bleed cancels container gutters', () => {
    const { container } = render(<Bleed data-testid="b" />);
    const el = container.querySelector('[data-testid="b"]') as HTMLElement;
    expect(el.className).toContain('-mx-4');
    expect(el.className).toContain('sm:-mx-6');
  });

  it('Cluster distributes items horizontally', () => {
    const { container } = render(
      <Cluster justify="between">
        <span>a</span>
        <span>b</span>
      </Cluster>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('flex-wrap');
    expect(el.className).toContain('justify-between');
    expect(el.textContent).toBe('ab');
  });

  it('Switcher exposes its basis recipe', () => {
    const { container } = render(
      <Switcher>
        <div>A</div>
        <div>B</div>
      </Switcher>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('[&>*]:basis-[calc((40rem-100%)*999)]');
    expect(el.className).toContain('[&>*]:grow');
    expect(el.textContent).toBe('AB');
  });
});
