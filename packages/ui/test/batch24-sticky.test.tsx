/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { StickyCtaBar, StickySidebar, StickyToc } from '../components/surface/Sticky';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 24 sticky layout', () => {
  it('StickySidebar sticks on the vertical axis by default', () => {
    const { container } = render(<StickySidebar top="3rem" />);
    const el = first(container);
    expect(el.className).toContain('sticky');
    expect(el.className).toContain('self-start');
    expect(el.style.top).toBe('3rem');
  });

  it('StickySidebar can stick horizontally', () => {
    const { container } = render(<StickySidebar axis="x" />);
    const el = first(container);
    expect(el.className).toContain('left-0');
    expect(el.style.top).toBe('');
  });

  it('StickyToc renders links and highlights the active item', () => {
    const { container } = render(
      <StickyToc
        title="On this page"
        activeId="b"
        items={[
          { id: 'a', label: 'Alpha' },
          { id: 'b', label: 'Bravo' },
        ]}
      />,
    );
    const nav = first(container);
    const links = nav.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0]?.getAttribute('href')).toBe('#a');
    expect(links[1]?.getAttribute('aria-current')).toBe('true');
    expect(links[0]?.className).toContain('text-ink-3');
    expect(links[1]?.className).toContain('text-ink');
  });

  it('StickyCtaBar pins to the requested edge and shows the action', () => {
    const bottom = render(
      <StickyCtaBar action={<button type="button">Add</button>}>Total: $12</StickyCtaBar>,
    );
    const el = first(bottom.container);
    expect(el.getAttribute('data-position')).toBe('bottom');
    expect(el.className).toContain('bottom-0');
    expect(el.className).toContain('border-t');
    expect(el.textContent).toContain('Total: $12');
    expect(el.querySelector('button')).toBeTruthy();

    const top = render(<StickyCtaBar position="top">Msg</StickyCtaBar>);
    expect(first(top.container).className).toContain('top-0');
  });
});
