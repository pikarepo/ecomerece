/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { ReadMore } from '../components/surface/ReadMore';
import { act, fire, registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 37 read-more', () => {
  it('clamps content and toggles between Read more / Show less', () => {
    const { container } = render(
      <ReadMore lines={2}>
        <p>Long paragraph one.</p>
        <p>Long paragraph two.</p>
        <p>Long paragraph three.</p>
      </ReadMore>,
    );
    const wrap = first(container);
    const body = wrap.firstElementChild as HTMLElement;
    const btn = wrap.querySelector('button') as HTMLButtonElement;

    // collapsed by default: inline -webkit-line-clamp (no raw custom props — markup contract).
    // happy-dom's CSSOM drops vendor-prefixed props, so the clamp value itself is not
    // observable here — assert the observable inline style (overflow) + behaviour instead.
    expect(body.style.getPropertyValue('overflow')).toBe('hidden');
    expect(btn.textContent).toBe('Read more');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-controls')).toBe(body.id);

    // expand
    act(() => fire(btn, 'click'));
    const after = wrap.querySelector('button') as HTMLButtonElement;
    expect(after.textContent).toBe('Show less');
    expect(after.getAttribute('aria-expanded')).toBe('true');
    expect((wrap.firstElementChild as HTMLElement).style.getPropertyValue('overflow')).toBe('');

    // collapse again
    act(() => fire(after, 'click'));
    const back = wrap.querySelector('button') as HTMLButtonElement;
    expect(back.textContent).toBe('Read more');
    expect(back.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports custom labels, default line count and controlled mode', () => {
    const custom = render(
      <ReadMore moreLabel="Expand" lessLabel="Collapse">
        <p>text</p>
      </ReadMore>,
    );
    const wrap = first(custom.container);
    const body = wrap.firstElementChild as HTMLElement;
    expect(body.style.getPropertyValue('overflow')).toBe('hidden');
    expect(wrap.querySelector('button')?.textContent).toBe('Expand');

    // controlled: stays collapsed despite clicks; callback fires
    const reported: Array<boolean | null> = [];
    const controlled = render(
      <ReadMore expanded={false} onExpandedChange={(v) => reported.push(v)}>
        <p>text</p>
      </ReadMore>,
    );
    const wrap2 = first(controlled.container);
    act(() => fire(wrap2.querySelector('button') as HTMLButtonElement, 'click'));
    expect(reported).toEqual([true]);
    expect(wrap2.querySelector('button')?.textContent).toBe('Read more');
  });
});
